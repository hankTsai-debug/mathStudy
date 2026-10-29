import type { Lang } from './i18n'

export interface Progress {
  lang: Lang
  voice: boolean
  /** Sound effects (counting notes, chimes); on even when the voice is off, for wordless play. */
  sfx: boolean
  /** Best stars per level id. */
  stars: Record<string, number>
}

const KEY = 'math-study:v1'

export function loadProgress(): Progress {
  const fallback: Progress = { lang: 'zh', voice: true, sfx: true, stars: {} }
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Partial<Progress> | null
    if (saved) return { ...fallback, ...saved, stars: saved.stars ?? {} }
  } catch {
    // Private mode or blocked storage: play without saving.
  }
  return fallback
}

export function saveProgress(p: Progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p))
  } catch {
    // Same as above.
  }
}
