import type { Lang } from './i18n'
import { clipKey, sentences, spoken } from './voice/key'

const LOCALE: Record<Lang, string> = { zh: 'zh-TW', en: 'en-US' }
const BASE = `${import.meta.env.BASE_URL}voice/`

// Recorded AI voice clips, one per sentence (made by scripts/gen-voice.mjs). Sentences without one,
// such as practice prompts built from a round's numbers, use the browser's voice.
let clips: Record<string, string> = {}
fetch(`${BASE}clips.json`).then(r => r.json()).then(c => { clips = c }).catch(() => {})

// One audio element, reused: iPad Safari lets an element that has played once play again later.
const player = typeof Audio === 'undefined' ? null : new Audio()
let turn = 0

function browserVoice(text: string, lang: Lang, then: () => void) {
  if (typeof speechSynthesis === 'undefined') return then()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = LOCALE[lang]
  const voice = speechSynthesis.getVoices().find(v => v.lang.replace('_', '-') === u.lang)
  if (voice) u.voice = voice
  u.rate = 0.95
  u.onend = then
  speechSynthesis.speak(u)
}

export function say(text: string, lang: Lang) {
  hush()
  const mine = turn
  const parts = sentences(text)
  // Nothing recorded: one smooth browser utterance, as before.
  if (!player || !parts.some(p => clips[clipKey(lang, p)])) return browserVoice(spoken(text), lang, () => {})
  const next = (i: number) => {
    if (mine !== turn || i >= parts.length) return
    const file = clips[clipKey(lang, parts[i])]
    if (!file) return browserVoice(parts[i], lang, () => next(i + 1))
    player.src = BASE + file
    player.onended = () => next(i + 1)
    player.play().catch(() => browserVoice(parts[i], lang, () => next(i + 1)))
  }
  next(0)
}

export function hush() {
  turn++
  if (player) { player.onended = null; player.pause() }
  if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel()
}
