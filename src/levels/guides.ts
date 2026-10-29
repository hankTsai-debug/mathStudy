// "Let's do one together": after the lesson, the child solves one problem step by step,
// tapping and choosing while the fox leads. Not scored. Only 十的海灣 has guides so far.
import { options, rnd, shuffle, type Rng } from '../game/logic'
import { numberChoices, type Answer } from '../game/quizzes'
import type { Strings } from '../i18n'
import type { LevelKind } from '../islands'

export type GuideStep =
  | { kind: 'choose'; say: string; choices: Answer[]; answer: Answer; hint: string; done: string }
  /** Tap `taps` cells in the picture; `count(n)` is read aloud after the n-th tap. */
  | { kind: 'tap'; say: string; taps: number; count: (n: number) => string; done: string }

/** One ten-frame cell: a red (a) or blue (b) dot, a count badge, and whether it can be tapped now. */
export interface GuideCell { dot?: 'a' | 'b'; badge?: string; tap?: boolean }

export interface Guide<D> {
  make: (rng?: Rng) => D
  steps: (t: Strings, d: D) => GuideStep[]
  /** Cells (10 or 20) for step `s`, given the cells tapped so far, and an equation to show. */
  picture: (d: D, s: number, tapped: number[], finished: boolean) => { cells: GuideCell[]; eq?: string }
}

const cells = (n: number, f: (i: number) => GuideCell) => Array.from({ length: n }, (_, i) => f(i))
const order = (tapped: number[], i: number) => tapped.indexOf(i) + 1

interface MakeTen { n: number; choices: number[] }
const makeTen: Guide<MakeTen> = {
  make: rng => {
    const n = rnd(3, 7, rng)
    return { n, choices: options(10 - n, 1, 9, rng) }
  },
  steps: (t, { n, choices }) => {
    const g = t.guide.makeTen
    return [
      { kind: 'tap', say: g.tap(n), taps: 10 - n, count: String, done: g.full },
      { kind: 'choose', say: g.ask, choices, answer: 10 - n, hint: g.askHint, done: g.done(n, 10 - n) },
    ]
  },
  picture: ({ n }, s, tapped) => ({
    cells: cells(10, i => i < n ? { dot: 'a' }
      : tapped.includes(i) ? { dot: 'b', badge: String(order(tapped, i)) }
        : { tap: s === 0 }),
  }),
}

interface Teen { k: number; full: number[]; total: number[] }
const teen: Guide<Teen> = {
  make: rng => {
    const k = rnd(2, 8, rng)
    return { k, full: shuffle([10, 5, 9], rng), total: shuffle(numberChoices(10 + k, [k, 11 + k, 9 + k], 1, 20), rng) }
  },
  steps: (t, { k, full, total }) => {
    const g = t.guide.teen
    return [
      { kind: 'choose', say: g.askFull, choices: full, answer: 10, hint: g.askFullHint, done: g.fullDone },
      { kind: 'tap', say: g.tap, taps: k, count: n => String(10 + n), done: g.counted },
      { kind: 'choose', say: g.askTotal, choices: total, answer: 10 + k, hint: g.askTotalHint, done: g.done(k) },
    ]
  },
  picture: ({ k }, s, tapped) => ({
    cells: cells(20, i => i < 10 ? { dot: 'a' }
      : i < 10 + k ? { dot: 'b', badge: tapped.includes(i) ? String(10 + order(tapped, i)) : undefined, tap: s === 1 && !tapped.includes(i) }
        : {}),
  }),
}

interface Add20 { a: number; b: number; need: number[]; rest: number[]; sum: number[] }
const add20: Guide<Add20> = {
  make: rng => {
    const a = rnd(6, 9, rng)
    const b = rnd(11 - a, 9, rng)
    const rest = b - (10 - a)
    return {
      a, b,
      need: options(10 - a, 1, 9, rng),
      rest: options(rest, 0, 9, rng),
      sum: shuffle(numberChoices(10 + rest, [rest, 11 + rest, 9 + rest], 0, 20), rng),
    }
  },
  steps: (t, d) => {
    const g = t.guide.add20
    const need = 10 - d.a
    const rest = d.b - need
    return [
      { kind: 'choose', say: g.askNeed(d.a, d.b), choices: d.need, answer: need, hint: g.askNeedHint, done: g.needDone(need) },
      { kind: 'tap', say: g.tap(need), taps: need, count: n => String(d.a + n), done: g.moved },
      { kind: 'choose', say: g.askRest(d.b, need), choices: d.rest, answer: rest, hint: g.askRestHint, done: g.restDone(rest) },
      { kind: 'choose', say: g.askSum(rest), choices: d.sum, answer: 10 + rest, hint: g.askSumHint, done: g.done(d.a, d.b) },
    ]
  },
  // Tapped blue dots leave the second frame and fill up the first.
  picture: ({ a, b }, s, tapped, finished) => ({
    eq: `${a} + ${b} = ${finished ? a + b : '?'}`,
    cells: cells(20, i => i < a ? { dot: 'a' }
      : i < a + tapped.length ? { dot: 'b', badge: String(i + 1) }
        : i < 10 ? {}
          : i < 10 + b && !tapped.includes(i) ? { dot: 'b', tap: s === 1 }
            : {}),
  }),
}

// Each entry keeps its own data type; the registry only needs make → steps/picture to agree.
const erase = <D,>(g: Guide<D>) => g as unknown as Guide<unknown>

export const GUIDES: Partial<Record<LevelKind, Guide<unknown>>> = {
  makeTen: erase(makeTen),
  teen: erase(teen),
  add20: erase(add20),
}
