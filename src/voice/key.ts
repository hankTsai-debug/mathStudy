import type { Lang } from '../i18n'

/** Emoji are shown, never read; spacing is tidied so the same words always find the same clip. */
export const spoken = (text: string) => text.replace(/\p{Extended_Pictographic}|️|⃣/gu, '').replace(/\s+/g, ' ').trim()

/** Splits a line into sentences, the unit voice clips are made for, keeping each one's end mark. */
export function sentences(text: string): string[] {
  return spoken(text).split(/(?<=[。！？])|(?<=[.!?])\s+(?=[A-Z"“])/u).map(s => s.trim()).filter(s => /[\p{L}\p{N}]/u.test(s))
}

/** The manifest key for one sentence: language and its exact words. */
export const clipKey = (lang: Lang, sentence: string) => `${lang}:${sentence}`
