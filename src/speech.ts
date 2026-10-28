import type { Lang } from './i18n'

const LOCALE: Record<Lang, string> = { zh: 'zh-TW', en: 'en-US' }

// Browser text-to-speech for now; recorded voice lines replace this later.
export function say(text: string, lang: Lang) {
  if (typeof speechSynthesis === 'undefined') return
  speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text.replace(/\p{Extended_Pictographic}/gu, ''))
  u.lang = LOCALE[lang]
  const voice = speechSynthesis.getVoices().find(v => v.lang.replace('_', '-') === u.lang)
  if (voice) u.voice = voice
  u.rate = 0.95
  speechSynthesis.speak(u)
}

export function hush() {
  if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel()
}
