// Shared pieces for wordless teaching: animated lesson beats, and the help a level shows
// (instead of a sentence) after a wrong answer. Each island's module fills in both.
import { useEffect, type ComponentType, type CSSProperties, type ReactNode } from 'react'
import type { Answer } from '../../game/quizzes'
import type { LevelKind } from '../../islands'
import { sfx } from '../../sound'
import type { QuizKind } from '../quizConfig'

export type Sounds = [number, () => void][]

/** One scene of an animated lesson, narrated by the matching line of t.teach[kind] when the voice is on. */
export interface AnimBeat {
  /** How long the beat plays before moving on. */
  ms: number
  show: ReactNode
  eq?: ReactNode
  /** Sounds to play, at ms from the start of the beat. */
  sounds?: Sounds
}

/**
 * What the picture shows after a choice:
 * - wrong: the first miss. Draw what the chosen answer would mean, so the child sees it doesn't fit.
 * - strategy: the second miss. Animate the way to work it out, stopping just short of the answer.
 * - reveal: the third miss. The strategy, then counted out to the answer (the right choice pulses).
 * - solved: after the right answer, the worked answer.
 */
export type HelpMode = 'wrong' | 'strategy' | 'reveal' | 'solved'

export interface HelpProps<D> {
  data: D
  mode: HelpMode
  /** The wrong choice, in 'wrong' mode. */
  chose: Answer | null
}

export type Lessons = Partial<Record<LevelKind, AnimBeat[]>>
export type Helps = Partial<Record<QuizKind, ComponentType<HelpProps<unknown>>>>

/** Keeps a help component's data type, then erases it for the registry. */
export const helpOf = <D,>(c: ComponentType<HelpProps<D>>) => c as unknown as ComponentType<HelpProps<unknown>>

/** Plays sounds once, `ms` after the picture appears (pictures remount for every new help). */
export function useSounds(sounds: Sounds) {
  useEffect(() => {
    const timers = sounds.map(([ms, play]) => window.setTimeout(play, ms))
    return () => timers.forEach(clearTimeout)
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

/** Starts a CSS animation `ms` in (use with the a-* classes in index.css). */
export const delay = (ms: number, extra?: CSSProperties): CSSProperties => ({ animationDelay: `${ms}ms`, ...extra })

/** Counting notes for from, from+1, … (n of them), `gap` ms apart starting at `start`. */
export const counts = (from: number, n: number, start: number, gap: number): Sounds =>
  Array.from({ length: n }, (_, j) => [start + j * gap, () => sfx.count(from + j)])
