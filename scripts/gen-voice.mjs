#!/usr/bin/env node
// Records an AI voice clip for every sentence the app can say whose words are known ahead of time
// (src/voice/lines.ts), in the same voices as SpeakEnglishStory: English by OpenAI (coral), Chinese by
// Gemini (Leda). Each clip is transcribed back and remade if it doesn't match its text.
//
//   npm run gen:voice -- --count      # how many clips are needed and missing; costs nothing
//   npm run gen:voice                 # make the missing clips
//   npm run gen:voice -- --limit 20   # make at most 20 (a pilot)
//   npm run gen:voice -- --prune      # delete clips no line uses any more
//
// Keys: OPENAI_API_KEY and GOOGLE_API_KEY, from .env here or the file named by ENV_FILE.
// Clips are named by a hash of the voice settings and the words, so changing a sentence remakes only it.

import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdir, readdir, rm, stat, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pinyin } from 'pinyin-pro'
import { createServer } from 'vite'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
try { process.loadEnvFile(process.env.ENV_FILE ?? join(root, '.env')) } catch { /* keys may come from the environment */ }

const VOICES = {
  en: { model: 'gpt-4o-mini-tts', voice: 'coral', style: 'Speak like a warm, cheerful teacher talking to a young child: slightly slow, clear and kind.' },
  zh: { model: 'gemini-3.8-flash-tts', voice: 'Leda', style: 'gentle Taiwanese Mandarin (台灣國語) teacher talking to a young child, slightly slow, warm and clear' },
}
const PIPELINE = 'v1' // bump to remake every clip after changing how they are made
const ATTEMPTS = 3
const PASS = 0.85
const voiceDir = join(root, 'public', 'voice')
const manifestFile = join(voiceDir, 'clips.json')
const args = process.argv.slice(2)
const flag = name => args.includes(name)
const limit = flag('--limit') ? Number(args[args.indexOf('--limit') + 1]) : Infinity

// The sentence list lives in the app's TypeScript, so load it through Vite.
const server = await createServer({ root, server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
const { spokenLines } = await server.ssrLoadModule('/src/voice/lines.ts')
const { clipKey } = await server.ssrLoadModule('/src/voice/key.ts')
const jobs = ['zh', 'en'].flatMap(lang => spokenLines(lang).map(text => ({ lang, text })))
await server.close()

await mkdir(voiceDir, { recursive: true })
const manifest = {}
const todo = []
for (const job of jobs) {
  const v = VOICES[job.lang]
  const hash = createHash('sha1').update(JSON.stringify([PIPELINE, v.model, v.voice, v.style, job.text])).digest('hex').slice(0, 16)
  const file = `${hash}.mp3`
  const exists = await stat(join(voiceDir, file)).then(s => s.size > 0, () => false)
  if (exists) manifest[clipKey(job.lang, job.text)] = file
  else todo.push({ ...job, file })
}

if (flag('--count')) {
  for (const lang of ['zh', 'en']) {
    const all = jobs.filter(j => j.lang === lang)
    const missing = todo.filter(j => j.lang === lang)
    console.log(`${lang}: ${all.length} clips, ${missing.length} missing, ${missing.reduce((n, j) => n + j.text.length, 0)} characters to make`)
  }
  process.exit(0)
}

function requireKey(name) {
  if (!process.env[name]) { console.error(`Missing ${name}: add it to .env, or point ENV_FILE at a file that has it.`); process.exit(1) }
  return process.env[name]
}

async function call(url, init) {
  for (let attempt = 1; ; attempt++) {
    let res
    try { res = await fetch(url, init) } catch (err) {
      if (attempt >= 4) throw err
      await new Promise(r => setTimeout(r, 3000 * attempt)); continue
    }
    if (res.ok) return res
    const body = (await res.text()).slice(0, 400)
    if (!(res.status === 429 || res.status >= 500) || attempt >= 4) throw new Error(`${url} ${res.status}: ${body}`)
    await new Promise(r => setTimeout(r, 2000 * attempt))
  }
}
const openai = (path, init) => call(`https://api.openai.com/v1/${path}`, { ...init, headers: { Authorization: `Bearer ${requireKey('OPENAI_API_KEY')}`, ...init.headers } })
const gemini = (path, body) => call(`https://generativelanguage.googleapis.com/v1beta/${path}`, {
  method: 'POST', headers: { 'x-goog-api-key': requireKey('GOOGLE_API_KEY'), 'Content-Type': 'application/json' }, body: JSON.stringify(body),
})

/** Trims silence at both ends and re-encodes small (mono, 64 kbps). */
function tidy(buf) {
  const trim = 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08'
  return new Promise((resolve, reject) => {
    const p = execFile('ffmpeg', ['-v', 'error', '-i', 'pipe:0', '-af', `${trim},areverse,${trim},areverse,apad=pad_dur=0.12`,
      '-ac', '1', '-ar', '24000', '-b:a', '64k', '-f', 'mp3', 'pipe:1'], { encoding: 'buffer', maxBuffer: 50 * 1024 * 1024 },
    (err, out) => (err ? reject(err) : resolve(out)))
    p.stdin.end(buf)
  })
}

async function speak({ lang, text }) {
  const v = VOICES[lang]
  if (lang === 'zh') {
    const res = await gemini('interactions', {
      model: v.model,
      input: [{ type: 'user_input', content: [{ type: 'text', text, annotations: [{ type: 'speech_metadata', style: v.style }] }] }],
      response_format: { type: 'audio' },
      generation_config: { speech_config: [{ voice: v.voice }] },
    })
    const json = await res.json()
    const audio = json.steps?.filter(s => s.type === 'model_output').flatMap(s => s.content ?? []).filter(c => c.data).at(-1)
    if (!audio) throw new Error(`Gemini returned no audio: ${JSON.stringify(json).slice(0, 300)}`)
    return tidy(Buffer.from(audio.data, 'base64'))
  }
  const res = await openai('audio/speech', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: v.model, voice: v.voice, input: text, instructions: v.style, response_format: 'mp3' }),
  })
  return tidy(Buffer.from(await res.arrayBuffer()))
}

async function transcribe(lang, buf) {
  const form = new FormData()
  form.append('model', 'gpt-4o-transcribe')
  form.append('language', lang)
  form.append('file', new Blob([buf], { type: 'audio/mpeg' }), 'clip.mp3')
  return (await (await openai('audio/transcriptions', { method: 'POST', body: form })).json()).text
}

// Chinese is compared by sound, a character at a time, so Simplified for Traditional or a homophone
// isn't an error; digits count as their own tokens in both languages.
// A digit read aloud is transcribed as a word (1 → 一 / one), so digits are compared as their spoken form.
const ZH_DIGITS = '零一二三四五六七八九'
const EN_NUMBERS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
  'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty']
const zhTokens = s => [...s.replace(/\d/g, d => ZH_DIGITS[d]).replace(/[^\p{Script=Han}]/gu, '')]
  .map(ch => new Set(pinyin(ch, { toneType: 'none', type: 'array', multiple: true })))
const enTokens = s => s.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9' ]+/g, ' ').trim().split(/\s+/)
  .map(w => new Set([EN_NUMBERS[Number(w)] ?? w]))
function score(lang, text, heard) {
  const x = lang === 'zh' ? zhTokens(text) : enTokens(text)
  const y = lang === 'zh' ? zhTokens(heard) : enTokens(heard)
  const same = (a, b) => [...a].some(r => b.has(r))
  const d = Array.from({ length: x.length + 1 }, (_, i) => [i, ...Array(y.length).fill(0)])
  for (let j = 1; j <= y.length; j++) d[0][j] = j
  for (let i = 1; i <= x.length; i++) for (let j = 1; j <= y.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (same(x[i - 1], y[j - 1]) ? 0 : 1))
  return 1 - d[x.length][y.length] / Math.max(x.length, y.length, 1)
}

async function pool(items, n, fn) {
  let next = 0
  await Promise.all(Array.from({ length: n }, async () => { while (next < items.length) await fn(items[next++]) }))
}

// A limited run (a pilot) takes both languages in turn.
const byLang = ['zh', 'en'].map(lang => todo.filter(j => j.lang === lang))
const batch = byLang[0].flatMap((j, i) => [j, byLang[1][i]]).concat(byLang[1].slice(byLang[0].length)).filter(Boolean).slice(0, limit)
console.log(`${jobs.length} clips needed, ${todo.length} missing, making ${batch.length}.`)
const doubtful = []
const failures = []
let done = 0
await pool(batch, 4, async job => {
  try {
    let best = null
    for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
      const buf = await speak(job)
      const heard = await transcribe(job.lang, buf)
      const s = score(job.lang, job.text, heard)
      if (!best || s > best.s) best = { buf, heard, s }
      if (s >= PASS) break
    }
    await writeFile(join(voiceDir, job.file), best.buf)
    manifest[clipKey(job.lang, job.text)] = job.file
    if (best.s < PASS) doubtful.push(`${job.text}  (heard "${best.heard}")  public/voice/${job.file}`)
    if (++done % 25 === 0 || done === batch.length) console.log(`  ${done}/${batch.length}`)
  } catch (err) {
    failures.push(`${job.text}: ${err.message}`)
  }
})

const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)))
await writeFile(manifestFile, JSON.stringify(sorted, null, 1) + '\n')
if (flag('--prune')) {
  const used = new Set(Object.values(manifest))
  for (const f of await readdir(voiceDir)) if (f.endsWith('.mp3') && !used.has(f)) { await rm(join(voiceDir, f)); console.log(`  pruned ${f}`) }
}
if (doubtful.length) console.warn(`\n${doubtful.length} clips never matched their text; kept the closest. Please listen:\n${doubtful.join('\n')}`)
if (failures.length) { console.error(`\n${failures.length} clips failed:\n${failures.join('\n')}`); process.exit(1) }
console.log(`Manifest -> public/voice/clips.json (${Object.keys(sorted).length} clips)`)
