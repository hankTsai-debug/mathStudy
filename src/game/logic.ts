// Pure round generators and scoring, kept free of React so they can be unit-tested.

export type Rng = () => number

export const ROUNDS = 5

export const rnd = (min: number, max: number, rng: Rng = Math.random) =>
  min + Math.floor(rng() * (max - min + 1))

export const pick = <T,>(items: readonly T[], rng: Rng = Math.random): T =>
  items[Math.floor(rng() * items.length)]

export function shuffle<T>(items: T[], rng: Rng = Math.random): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[items[i], items[j]] = [items[j], items[i]]
  }
  return items
}

/** Three answer choices: the answer plus near neighbours, all inside [min, max]. */
export function options(answer: number, min: number, max: number, rng: Rng = Math.random): number[] {
  const set = new Set([answer])
  for (const d of [-1, 1, -2, 2, 3, -3]) {
    const v = answer + d
    if (set.size < 3 && v >= min && v <= max) set.add(v)
  }
  return shuffle([...set], rng)
}

/** A level ends after ROUNDS answers right on the first try, or after this many rounds at most. */
export const MAX_ROUNDS = 8

/** Stars needed on every level of an island to open the islands that follow it. */
export const UNLOCK_STARS = 2

/** Where a level's practice stands: its difficulty step, the rounds played, and the rounds that took more than one try. */
export interface Run { step: number; rounds: number; misses: number }

/**
 * After a round: an answer right on the first try moves up a step; a miss stays on the same step
 * for another try at that difficulty. Done after ROUNDS steps or MAX_ROUNDS rounds.
 */
export function afterRound(run: Run, firstTry: boolean): Run & { done: boolean } {
  const next = { step: run.step + (firstTry ? 1 : 0), rounds: run.rounds + 1, misses: run.misses + (firstTry ? 0 : 1) }
  return { ...next, done: next.step >= ROUNDS || next.rounds >= MAX_ROUNDS }
}

/** Stars come from rounds that needed more than one try: none → 3, up to 2 → 2, more → 1. */
export function starsFor(misses: number): 1 | 2 | 3 {
  return misses === 0 ? 3 : misses <= 2 ? 2 : 1
}

const FRUITS = ['🍎', '🍓', '🍐', '🍊', '🍄'] as const

/** 數一數: 3 objects at first, up to 9 by the last round. */
export function countRound(round: number, rng: Rng = Math.random) {
  return { n: rnd(3, Math.min(10, 5 + round), rng), fruit: pick(FRUITS, rng) }
}

/** 青蛙跳數線: rounds 1–2 locate a number from 0, rounds 3–5 hop forward from a start. */
export function lineRound(round: number, rng: Rng = Math.random) {
  if (round < 2) return { start: 0, hop: null, target: rnd(3, 10, rng) }
  const start = rnd(1, 5, rng)
  const hop = rnd(1, Math.min(5, 10 - start), rng)
  return { start, hop, target: start + hop }
}

/** 十格框快看: small amounts first, then 4–10 to use the "5 and some more" structure. */
export function flashRound(round: number, rng: Rng = Math.random) {
  return { n: round < 2 ? rnd(1, 5, rng) : rnd(4, 10, rng) }
}

/** 湊十: n shells are on the frame, how many more make 10. */
export function makeTenRound(round: number, rng: Rng = Math.random) {
  const n = round < 2 ? rnd(5, 9, rng) : rnd(1, 9, rng)
  return { n, answer: 10 - n }
}

/** 十和幾: one full ten-frame plus k more. */
export function teenRound(round: number, rng: Rng = Math.random) {
  const k = round < 2 ? rnd(1, 5, rng) : rnd(1, 9, rng)
  return { k, answer: 10 + k }
}
