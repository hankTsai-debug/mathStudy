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

/** Stars come from rounds answered right on the first try. */
export function starsFor(firstTry: number): 1 | 2 | 3 {
  return firstTry >= ROUNDS ? 3 : firstTry >= 3 ? 2 : 1
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
