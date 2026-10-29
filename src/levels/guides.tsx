// "Let's do one together": after the lesson, the child solves one problem step by step,
// tapping and choosing while the fox leads. Not scored. Every level has one.
import type { ReactNode } from 'react'
import { options, pick, rnd, shuffle, type Rng } from '../game/logic'
import { frac, formatTime, numberChoices, type Answer, type Shape, type SymShape } from '../game/quizzes'
import type { Strings } from '../i18n'
import type { LevelKind } from '../islands'
import { TenFrame } from './shared'
import * as V from './visuals'

export type GuideStep =
  | {
    kind: 'choose'; say: string; choices: Answer[]; answer: Answer; hint: string
    /** Said after the right answer; a short "that's right" when omitted. */
    done?: string
    /** Choice label when the value is a key (place index, shape, yes/no). */
    label?: (v: Answer) => ReactNode
  }
  /** Tap `taps` times in the picture; `count(n)` is read aloud after the n-th tap. */
  | { kind: 'tap'; say: string; taps: number; count: (n: number) => string; done?: string }

/** Where the guide is. `s` is the step that can be acted on now (-1 between steps and at the end); `step` is the current step. */
export interface GuideState { s: number; step: number; taps: number; finished: boolean; tap: () => void; t: Strings }

export interface Guide<D> {
  make: (rng?: Rng) => D
  steps: (t: Strings, d: D) => GuideStep[]
  show: (d: D, at: GuideState) => { show: ReactNode; eq?: string }
}

/** Shuffled number choices: the answer, likely mistakes, then near numbers. */
const nums = (answer: number, likely: number[], min: number, max: number, rng?: Rng) =>
  shuffle(numberChoices(answer, likely, min, max), rng)
/** Distinct text choices, shuffled, padded with `spare` if the likely ones collide. */
const texts = (answer: string, likely: string[], spare: string[], rng?: Rng) =>
  shuffle([...new Set([answer, ...likely, ...spare])].slice(0, 3), rng)

const choose = (say: string, choices: Answer[], answer: Answer, hint: string, done?: string, label?: (v: Answer) => ReactNode): GuideStep =>
  ({ kind: 'choose', say, choices, answer, hint, done, label })

/* ---------- 數數森林 ---------- */

interface Count { n: number; emoji: string; choices: number[] }
const count: Guide<Count> = {
  make: rng => {
    const n = rnd(4, 8, rng)
    return { n, emoji: pick(['🍎', '🍓', '🍐'], rng), choices: options(n, 1, 10, rng) }
  },
  steps: (t, { n, choices }) => {
    const g = t.guide.count
    return [
      { kind: 'tap', say: g.tap, taps: n, count: String, done: g.tapped },
      choose(g.ask, choices, n, g.askHint, g.done(n)),
    ]
  },
  show: ({ n, emoji }, { s, taps, tap }) => ({
    show: <V.TapItems n={n} emoji={emoji} tapped={taps} active={s === 0} onTap={tap} />,
  }),
}

interface Line { start: number; hop: number; choices: number[] }
const line: Guide<Line> = {
  make: rng => {
    const start = rnd(0, 4, rng)
    const hop = rnd(2, 5, rng)
    return { start, hop, choices: options(start + hop, 0, 10, rng) }
  },
  steps: (t, { start, hop, choices }) => {
    const g = t.guide.line
    return [
      { kind: 'tap', say: g.tap(start, hop), taps: hop, count: n => String(start + n), done: g.landed },
      choose(g.ask(start, hop), choices, start + hop, g.askHint, g.done(start, hop)),
    ]
  },
  show: ({ start, hop }, { s, taps, tap, finished }) => ({
    show: <V.TapLine start={start} hops={hop} tapped={taps} active={s === 0} onTap={tap} />,
    eq: finished ? `${start} + ${hop} = ${start + hop}` : undefined,
  }),
}

interface Flash { n: number; top: number[]; bottom: number[]; total: number[] }
const flash: Guide<Flash> = {
  make: rng => {
    const n = rnd(6, 9, rng)
    return { n, top: options(5, 1, 9, rng), bottom: options(n - 5, 1, 9, rng), total: options(n, 1, 10, rng) }
  },
  steps: (t, { n, top, bottom, total }) => {
    const g = t.guide.flash
    return [
      choose(g.top, top, 5, g.topHint),
      choose(g.bottom, bottom, n - 5, g.bottomHint),
      choose(g.total(n - 5), total, n, g.totalHint, g.done(n)),
    ]
  },
  show: ({ n }, { step: s, finished }) => ({
    show: <TenFrame filled={n} />,
    eq: s >= 2 || finished ? `5 + ${n - 5} = ${finished ? n : '?'}` : undefined,
  }),
}

/* ---------- 十的海灣 ---------- */

const cells = (n: number, f: (i: number) => V.FrameCell) => Array.from({ length: n }, (_, i) => f(i))

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
      choose(g.ask, choices, 10 - n, g.askHint, g.done(n, 10 - n)),
    ]
  },
  // Empty cells fill from the first gap, so any tapped box counts as "the next one".
  show: ({ n }, { s, taps, tap }) => ({
    show: <V.GuideFrames onTap={tap} cells={cells(10, i => i < n ? { dot: 'a' }
      : i < n + taps ? { dot: 'b', badge: String(i - n + 1) }
        : { tap: s === 0 })} />,
  }),
}

interface Teen { k: number; full: number[]; total: number[] }
const teen: Guide<Teen> = {
  make: rng => {
    const k = rnd(2, 8, rng)
    return { k, full: shuffle([10, 5, 9], rng), total: nums(10 + k, [k, 11 + k, 9 + k], 1, 20, rng) }
  },
  steps: (t, { k, full, total }) => {
    const g = t.guide.teen
    return [
      choose(g.askFull, full, 10, g.askFullHint, g.fullDone),
      { kind: 'tap', say: g.tap, taps: k, count: n => String(10 + n), done: g.counted },
      choose(g.askTotal, total, 10 + k, g.askTotalHint, g.done(k)),
    ]
  },
  show: ({ k }, { s, taps, tap }) => ({
    show: <V.GuideFrames onTap={tap} cells={cells(20, i => i < 10 ? { dot: 'a' }
      : i < 10 + taps ? { dot: 'b', badge: String(i + 1) }
        : i < 10 + k ? { dot: 'b', tap: s === 1 }
          : {})} />,
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
      sum: nums(10 + rest, [rest, 11 + rest, 9 + rest], 0, 20, rng),
    }
  },
  steps: (t, { a, b, need, rest, sum }) => {
    const g = t.guide.add20
    const n = 10 - a
    const r = b - n
    return [
      choose(g.askNeed(a, b), need, n, g.askNeedHint, g.needDone(n)),
      { kind: 'tap', say: g.tap(n), taps: n, count: k => String(a + k), done: g.moved },
      choose(g.askRest(b, n), rest, r, g.askRestHint, g.restDone(r)),
      choose(g.askSum(r), sum, 10 + r, g.askSumHint, g.done(a, b)),
    ]
  },
  // Tapped blue dots leave the end of the second frame and fill up the first.
  show: ({ a, b }, { s, taps, tap, finished }) => ({
    eq: `${a} + ${b} = ${finished ? a + b : '?'}`,
    show: <V.GuideFrames onTap={tap} cells={cells(20, i => i < a ? { dot: 'a' }
      : i < a + taps ? { dot: 'b', badge: String(i + 1) }
        : i < 10 ? {}
          : i < 10 + b - taps ? { dot: 'b', tap: s === 1 }
            : {})} />,
  }),
}

/* ---------- 位值山谷 ---------- */

interface Blocks { h: number; t: number; o: number; c: number[][] }
const blocks: Guide<Blocks> = {
  make: rng => {
    const h = rnd(1, 3, rng), t = rnd(1, 5, rng), o = rnd(1, 6, rng)
    const n = h * 100 + t * 10 + o
    return {
      h, t, o, c: [
        nums(h * 100, [h, h * 10, h * 100 + 100], 1, 999, rng),
        nums(t * 10, [t, t * 100, t * 10 + 10], 1, 999, rng),
        options(o, 1, 9, rng),
        nums(n, [o * 100 + t * 10 + h, n + 10, n - 10], 1, 999, rng),
      ],
    }
  },
  steps: (tr, { h, t, o, c }) => {
    const g = tr.guide.blocks
    const n = h * 100 + t * 10 + o
    return [
      choose(g.flats(h), c[0], h * 100, g.flatsHint),
      choose(g.rods(t), c[1], t * 10, g.rodsHint),
      choose(g.cubes, c[2], o, g.cubesHint),
      choose(g.total(h * 100, t * 10, o), c[3], n, g.totalHint, g.done(n)),
    ]
  },
  show: ({ h, t, o }, { step: s, finished }) => {
    const parts = [h * 100, t * 10, o].slice(0, finished ? 3 : Math.max(0, s))
    return {
      show: <V.BlocksVisual data={{ n: h * 100 + t * 10 + o }} solved={false} />,
      eq: parts.length ? parts.join(' + ') + (finished ? ` = ${h * 100 + t * 10 + o}` : '') : undefined,
    }
  },
}

interface Digit { n: number; place: number; digit: number; c: number[][] }
/** What a digit is worth, in three moves: which place, what a 1 there is worth, so what this digit is worth. */
const digitGuide = (length: number, places: number[]): Guide<Digit> => ({
  make: rng => {
    const ds = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], rng).slice(0, length)
    const place = pick(places, rng)
    const digit = ds[length - 1 - place]
    const near = [place - 1, place, place + 1].filter(p => p >= 0 && p < length)
    while (near.length < 3) near.push(near.at(-1)! + 1 < length ? near.at(-1)! + 1 : near[0] - 1)
    return {
      n: Number(ds.join('')), place, digit,
      c: [shuffle(near, rng), shuffle(near.map(p => 10 ** p), rng), shuffle(near.map(p => digit * 10 ** p), rng)],
    }
  },
  steps: (t, { place, digit, c }) => {
    const g = t.guide.digit
    const name = (v: Answer) => g.places[v as number]
    return [
      choose(g.where(digit), c[0], place, g.whereHint, undefined, name),
      choose(g.unit(g.places[place]), c[1], 10 ** place, g.unitHint),
      choose(g.value(digit, g.places[place]), c[2], digit * 10 ** place, g.valueHint, g.done(digit, digit * 10 ** place)),
    ]
  },
  show: ({ n, place, digit }, { finished }) => ({
    show: <V.DigitVisual data={{ n, place, digit }} solved={false} />,
    eq: finished ? (digit * 10 ** place).toLocaleString('en-US') : undefined,
  }),
})

interface Column { a: number; b: number; c: number[][] }
const column: Guide<Column> = {
  make: rng => {
    const a0 = rnd(5, 9, rng), b0 = rnd(10 - a0 + 1, 9, rng)
    const a1 = rnd(1, 4, rng), b1 = rnd(1, 4, rng)
    const ones = a0 + b0
    return {
      a: a1 * 10 + a0, b: b1 * 10 + b0, c: [
        options(ones, 2, 18, rng),
        nums(ones - 10, [ones, 1, ones - 9], 0, 9, rng),
        nums(a1 + b1 + 1, [a1 + b1, a1 + b1 + 2], 2, 9, rng),
      ],
    }
  },
  steps: (t, { a, b, c }) => {
    const g = t.guide.column
    const ones = (a % 10) + (b % 10)
    const tens = Math.floor(a / 10) + Math.floor(b / 10)
    return [
      choose(g.ones(a % 10, b % 10), c[0], ones, g.onesHint),
      choose(g.write(ones), c[1], ones - 10, g.writeHint, g.carried),
      choose(g.tens(Math.floor(a / 10), Math.floor(b / 10)), c[2], tens + 1, g.tensHint, g.done(a, b, a + b)),
    ]
  },
  show: ({ a, b }, { step: s, finished }) => ({
    show: <V.ColumnVisual data={{ a, b, op: '+' }} solved={finished} />,
    eq: s === 1 ? `${a % 10} + ${b % 10} = ${(a % 10) + (b % 10)}` : undefined,
  }),
}

/* ---------- 形狀工坊 ---------- */

const SIDES: Partial<Record<Shape, number>> = { triangle: 3, square: 4, pentagon: 5, hexagon: 6 }
interface ShapeName { shape: Shape; rotate: number; names: Shape[] }
const shapeName: Guide<ShapeName> = {
  make: rng => {
    const shape = pick(['triangle', 'square', 'pentagon', 'hexagon'] as Shape[], rng)
    const others = (['triangle', 'square', 'rectangle', 'pentagon', 'hexagon'] as Shape[]).filter(s => s !== shape)
    return { shape, rotate: pick([0, 20, 45, 180], rng), names: shuffle([shape, ...shuffle(others, rng).slice(0, 2)], rng) }
  },
  steps: (t, { shape, names }) => {
    const g = t.guide.shapeName
    const sides = SIDES[shape]!
    return [
      { kind: 'tap', say: g.tap, taps: sides, count: String, done: g.counted(sides) },
      choose(g.ask(sides), names, shape, shape === 'square' ? g.squareHint : g.askHint(sides), g.done(t.shapes[shape]), v => t.shapes[v as Shape]),
    ]
  },
  show: ({ shape, rotate }, { s, taps, tap }) => ({
    show: <V.TapShape shape={shape} rotate={rotate} tapped={taps} active={s === 0} onTap={tap} />,
  }),
}

const FOLDS: [SymShape, 'v' | 'h', boolean][] = [
  ['rectangle', 'v', true], ['rectangle', 'h', true], ['square', 'v', true], ['isosceles', 'v', true], ['isosceles', 'h', false],
  ['heart', 'v', true], ['heart', 'h', false], ['rightTriangle', 'v', false], ['lShape', 'v', false], ['parallelogram', 'v', false],
]
interface Fold { shape: SymShape; line: 'v' | 'h'; yes: boolean }
const symmetry: Guide<Fold> = {
  make: rng => {
    const [shape, line, yes] = pick(FOLDS, rng)
    return { shape, line, yes }
  },
  steps: (t, { yes }) => {
    const g = t.guide.symmetry
    return [
      { kind: 'tap', say: g.tap, taps: 1, count: () => '', done: g.folded },
      choose(g.ask, ['yes', 'no'], yes ? 'yes' : 'no', g.askHint, yes ? g.doneYes : g.doneNo, v => (v === 'yes' ? t.yes : t.no)),
    ]
  },
  show: ({ shape, line }, { s, taps, tap, t }) => ({
    show: <V.FoldVisual shape={shape} line={line} folded={taps > 0} active={s === 0} onTap={tap} label={t.guide.symmetry.foldBtn} />,
  }),
}

interface Measure { start: number; length: number; c: number[][] }
const measure: Guide<Measure> = {
  make: rng => {
    const length = rnd(2, 7, rng)
    const start = rnd(1, Math.min(3, 12 - length), rng)
    return {
      start, length, c: [
        options(start, 0, 12, rng),
        options(start + length, 1, 12, rng),
        nums(length, [start + length, length + 1], 1, 12, rng),
      ],
    }
  },
  steps: (t, { start, length, c }) => {
    const g = t.guide.measure
    return [
      choose(g.head, c[0], start, g.headHint),
      choose(g.tail, c[1], start + length, g.tailHint),
      choose(g.sub(start, start + length), c[2], length, g.subHint, g.done(length)),
    ]
  },
  show: ({ start, length }, { step: s, finished }) => ({
    show: <V.MeasureVisual data={{ start, length }} solved={false} />,
    eq: s === 2 || finished ? `${start + length} − ${start} = ${finished ? length : '?'}` : undefined,
  }),
}

/* ---------- 乘法農場 ---------- */

interface Groups { groups: number; size: number; choices: number[] }
const groupsGuide = (layout: 'rows' | 'groups', emoji: string, kind: 'array' | 'times'): Guide<Groups> => ({
  make: rng => {
    const groups = rnd(2, 4, rng), size = rnd(3, 5, rng)
    return { groups, size, choices: nums(groups * size, [groups + size, groups * size + size], 1, 30, rng) }
  },
  steps: (t, { groups, size, choices }) => {
    const g = t.guide[kind]
    return [
      { kind: 'tap', say: g.tap(size), taps: groups, count: n => String(n * size), done: g.counted },
      choose(g.ask(groups, size), choices, groups * size, g.askHint, g.done(groups, size)),
    ]
  },
  show: ({ groups, size }, { s, taps, tap, finished }) => ({
    show: <V.TapGroups groups={groups} size={size} emoji={emoji} layout={layout} tapped={taps} active={s === 0} onTap={tap} />,
    eq: finished ? `${groups} × ${size} = ${groups * size}` : undefined,
  }),
})

interface Share { groups: number; each: number; choices: number[] }
const share: Guide<Share> = {
  make: rng => {
    const groups = rnd(2, 4, rng), each = rnd(2, 4, rng)
    return { groups, each, choices: nums(each, [groups, each + 1, each - 1], 1, 12, rng) }
  },
  steps: (t, { groups, each, choices }) => {
    const g = t.guide.share
    return [
      { kind: 'tap', say: g.tap(groups * each, groups), taps: each, count: g.round, done: g.allGone },
      choose(g.ask, choices, each, g.askHint, g.done(groups * each, groups, each)),
    ]
  },
  show: ({ groups, each }, { s, taps, tap, finished }) => ({
    show: <V.ShareDeal groups={groups} each={each} tapped={taps} active={s === 0} onTap={tap} />,
    eq: finished ? `${groups * each} ÷ ${groups} = ${each}` : undefined,
  }),
}

/* ---------- 時間錢幣市集 ---------- */

interface Clock { h: number; m: number; c: number[][] }
const clock: Guide<Clock> = {
  make: rng => {
    const h = rnd(1, 11, rng), m = rnd(1, 11, rng) * 5
    return {
      h, m, c: [
        nums(h, [h + 1, m / 5], 1, 12, rng),
        nums(m / 5, [h, m / 5 + 1], 1, 11, rng),
        nums(m, [m / 5, m + 5], 1, 59, rng),
      ],
    }
  },
  steps: (t, { h, m, c }) => {
    const g = t.guide.clock
    return [
      choose(g.hour, c[0], h, g.hourHint),
      choose(g.minuteNum, c[1], m / 5, g.minuteNumHint),
      choose(g.minutes(m / 5), c[2], m, g.minutesHint, g.done(formatTime(h, m))),
    ]
  },
  show: ({ h, m }, { finished }) => ({
    show: <V.ClockVisual data={{ h, m }} solved={false} />,
    eq: finished ? formatTime(h, m) : undefined,
  }),
}

interface Coins { coins: number[]; choices: number[] }
const coins: Guide<Coins> = {
  make: rng => {
    const coins = [
      ...Array(rnd(0, 1, rng)).fill(50), ...Array(rnd(1, 3, rng)).fill(10),
      ...Array(rnd(0, 1, rng)).fill(5), ...Array(rnd(1, 3, rng)).fill(1),
    ]
    const total = coins.reduce((s, v) => s + v, 0)
    return { coins, choices: nums(total, [coins.length, total + 10, total - 1], 1, 99, rng) }
  },
  steps: (t, { coins, choices }) => {
    const g = t.guide.coins
    const total = coins.reduce((s, v) => s + v, 0)
    return [
      { kind: 'tap', say: g.tap, taps: coins.length, count: n => String(coins.slice(0, n).reduce((s, v) => s + v, 0)), done: g.counted },
      choose(g.ask, choices, total, g.askHint, g.done(total)),
    ]
  },
  show: ({ coins }, { s, taps, tap }) => ({
    show: <V.TapCoins coins={coins} tapped={taps} active={s === 0} onTap={tap} />,
  }),
}

interface Change { price: number; paid: number; c: number[][] }
const change: Guide<Change> = {
  make: rng => {
    const paid = pick([50, 100], rng)
    let price = rnd(11, paid - 11, rng)
    if (price % 10 === 0) price -= rnd(1, 9, rng)
    const up = Math.ceil(price / 10) * 10
    return {
      price, paid, c: [
        options(up - price, 1, 9, rng),
        nums(paid - up, [paid - up + 10, paid - up - 10], 0, 100, rng),
        nums(paid - price, [paid - price + 10, paid - price - 10], 1, 100, rng),
      ],
    }
  },
  steps: (t, { price, paid, c }) => {
    const g = t.guide.change
    const up = Math.ceil(price / 10) * 10
    return [
      choose(g.toTen(price, up), c[0], up - price, g.toTenHint),
      choose(g.toPaid(up, paid), c[1], paid - up, g.toPaidHint),
      choose(g.sum(up - price, paid - up), c[2], paid - price, g.sumHint, g.done(paid - price)),
    ]
  },
  show: ({ price, paid }, { step: s, finished }) => {
    const up = Math.ceil(price / 10) * 10
    const eq = [`${up} − ${price} = ${up - price}`, `${paid} − ${up} = ${paid - up}`].slice(0, finished ? 2 : Math.max(0, s))
    return { show: <V.ChangeVisual data={{ price, paid }} solved={false} />, eq: eq.length ? eq.join(',  ') : undefined }
  },
}

/* ---------- 分數廚房 ---------- */

interface Frac { k: number; d: number; c: Answer[][] }
const fracName: Guide<Frac> = {
  make: rng => {
    const d = pick([2, 3, 4, 6, 8], rng), k = rnd(1, d - 1, rng)
    return {
      k, d, c: [
        options(d, 2, 10, rng),
        options(k, 1, 9, rng),
        texts(frac(k, d), [frac(d, k), frac(k, d - k)], [frac(k, d + 1), frac(k + 1, d)], rng),
      ],
    }
  },
  steps: (t, { k, d, c }) => {
    const g = t.guide.fracName
    return [
      choose(g.parts, c[0], d, g.partsHint),
      choose(g.shaded, c[1], k, g.shadedHint),
      choose(g.name(k, d), c[2], frac(k, d), g.nameHint, g.done(k, d)),
    ]
  },
  show: ({ k, d }) => ({ show: <V.PieVisual data={{ k, d }} solved={false} /> }),
}

const fracLine: Guide<Frac> = {
  make: rng => {
    const d = pick([3, 4, 5, 6], rng), k = rnd(1, d - 1, rng)
    return {
      k, d, c: [
        nums(d, [d + 1, d - 1], 2, 10, rng),
        options(k, 1, 9, rng),
        texts(frac(k, d), [frac(k, d + 1), frac(k + 1, d)], [frac(d, k), frac(k, d - 1)], rng),
      ],
    }
  },
  steps: (t, { k, d, c }) => {
    const g = t.guide.fracLine
    return [
      choose(g.parts, c[0], d, g.partsHint),
      choose(g.star, c[1], k, g.starHint),
      choose(g.name(k, d), c[2], frac(k, d), g.nameHint, g.done(k, d)),
    ]
  },
  show: ({ k, d }) => ({ show: <V.FracLineVisual data={{ k, d }} solved={false} /> }),
}

interface FracEqual { k: number; d: number; m: number; c: Answer[][] }
const fracEqual: Guide<FracEqual> = {
  make: rng => {
    const d = pick([2, 3, 4], rng), k = rnd(1, d - 1, rng), m = rnd(2, 3, rng)
    return {
      k, d, m, c: [
        texts(frac(k, d), [frac(d, k), frac(k, d + 1)], [frac(k + 1, d), frac(k, d + 2)], rng),
        nums(d * m, [d + m, d], 2, 20, rng),
        nums(k * m, [k + m, k], 1, 20, rng),
      ],
    }
  },
  steps: (t, { k, d, m, c }) => {
    const g = t.guide.fracEqual
    return [
      choose(g.first, c[0], frac(k, d), g.firstHint),
      { kind: 'tap', say: g.cut(m), taps: 1, count: () => '', done: g.cutDone },
      choose(g.parts, c[1], d * m, g.partsHint),
      choose(g.shaded, c[2], k * m, g.shadedHint, g.done(k, d, k * m, d * m)),
    ]
  },
  show: ({ k, d, m }, { s, taps, tap, finished }) => ({
    show: (
      <div className="fold">
        <V.FracEqualVisual data={{ k, d, m }} solved={taps > 0} />
        {s === 1 && <button className="btn tap" onClick={tap}>✂️ × {m}</button>}
      </div>
    ),
    eq: finished ? `${frac(k, d)} = ${frac(k * m, d * m)}` : undefined,
  }),
}

/* ---------- 大數港口 ---------- */

interface Area { w: number; h: number; c: number[][] }
const area: Guide<Area> = {
  make: rng => {
    const w = rnd(3, 6, rng), h = rnd(2, 4, rng)
    return {
      w, h, c: [
        options(w, 1, 9, rng),
        options(h, 1, 9, rng),
        nums(w * h, [w + h, 2 * (w + h)], 1, 40, rng),
        nums(2 * (w + h), [w * h, w + h], 1, 40, rng),
      ],
    }
  },
  steps: (t, { w, h, c }) => {
    const g = t.guide.area
    return [
      choose(g.row, c[0], w, g.rowHint),
      choose(g.rows, c[1], h, g.rowsHint),
      choose(g.area(h, w), c[2], w * h, g.areaHint, g.areaDone(w * h)),
      choose(g.perimeter(w, h), c[3], 2 * (w + h), g.perimeterHint, g.done(2 * (w + h))),
    ]
  },
  show: ({ w, h }, { step: s, finished }) => ({
    show: <V.AreaVisual data={{ w, h, ask: s >= 3 || finished ? 'perimeter' : 'area' }} solved={false} />,
    eq: s === 2 ? `${h} × ${w} = ?` : s === 3 || finished ? `${w} + ${h} + ${w} + ${h} = ${finished ? 2 * (w + h) : '?'}` : undefined,
  }),
}

interface Decimal { whole: number; k: number; c: Answer[][] }
const decimal: Guide<Decimal> = {
  make: rng => {
    const whole = rnd(0, 2, rng), k = rnd(1, 9, rng)
    return {
      whole, k, c: [
        options(whole, 0, 3, rng),
        options(k, 1, 9, rng),
        texts(`${whole}.${k}`, [`${k}.${whole}`, `${whole * 10 + k}`], [`${whole}.${k === 9 ? 1 : k + 1}`, `${whole + 1}.${k}`], rng),
      ],
    }
  },
  steps: (t, { whole, k, c }) => {
    const g = t.guide.decimal
    return [
      choose(g.whole, c[0], whole, g.wholeHint),
      choose(g.parts, c[1], k, g.partsHint),
      choose(g.write(whole, k), c[2], `${whole}.${k}`, g.writeHint, g.done(`${whole}.${k}`)),
    ]
  },
  show: ({ whole, k }) => ({ show: <V.DecimalVisual data={{ whole, k }} solved={false} /> }),
}

/* ---------- 挑戰島 ---------- */

interface Pattern { start: number; step: number; c: number[][] }
const pattern: Guide<Pattern> = {
  make: rng => {
    const start = rnd(1, 9, rng), step = rnd(2, 5, rng)
    const last = start + 3 * step
    return { start, step, c: [options(step, 1, 9, rng), nums(last + step, [last + 1, last + step + 1, last - step], 1, 60, rng)] }
  },
  steps: (t, { start, step, c }) => {
    const g = t.guide.pattern
    const last = start + 3 * step
    return [
      choose(g.gap(start, start + step), c[0], step, g.gapHint, g.gapDone(step)),
      choose(g.next(last, step), c[1], last + step, g.nextHint, g.done(last + step)),
    ]
  },
  show: ({ start, step }, { step: s, finished }) => ({
    show: <V.PatternVisual data={{ terms: [0, 1, 2, 3].map(i => start + i * step) }} solved={finished} />,
    eq: s >= 1 || finished ? `+${step}  +${step}  +${step}` : undefined,
  }),
}

interface Balance { fruit: string; copies: number; extra: number; value: number; c: number[][] }
const balance: Guide<Balance> = {
  make: rng => {
    const copies = rnd(2, 3, rng), extra = rnd(1, 6, rng), value = rnd(2, 6, rng)
    const total = copies * value + extra
    return {
      fruit: pick(['🍎', '🍐', '🍊'], rng), copies, extra, value, c: [
        nums(total - extra, [total + extra, total], 1, 40, rng),
        nums(value, [value + 1, total - extra - copies], 1, 20, rng),
      ],
    }
  },
  steps: (t, { copies, extra, value, c }) => {
    const g = t.guide.balance
    const total = copies * value + extra
    return [
      choose(g.remove(extra, total), c[0], total - extra, g.removeHint, g.removed(copies, total - extra)),
      choose(g.split(copies, total - extra), c[1], value, g.splitHint, g.done(value)),
    ]
  },
  // Once both sides lose `extra`, the balance shows what is left.
  show: ({ fruit, copies, extra, value }, { step: s, finished }) => {
    const total = copies * value + extra
    const off = s >= 1 || finished
    return {
      show: <V.BalanceVisual data={{ fruit, copies, extra: off ? 0 : extra, total: off ? total - extra : total }} solved={false} />,
      eq: off ? `${total} − ${extra} = ${total - extra}` : undefined,
    }
  },
}

interface Legs { heads: number; rabbits: number; c: number[][] }
const legs: Guide<Legs> = {
  make: rng => {
    const heads = rnd(3, 6, rng), rabbits = rnd(1, heads - 1, rng)
    const extra = rabbits * 2
    return {
      heads, rabbits, c: [
        nums(heads * 2, [heads * 4, heads + 2], 1, 40, rng),
        nums(extra, [extra + 2, heads * 2 + extra], 1, 40, rng),
        nums(rabbits, [extra, heads - rabbits], 0, 20, rng),
      ],
    }
  },
  steps: (t, { heads, rabbits, c }) => {
    const g = t.guide.legs
    const legs = heads * 2 + rabbits * 2
    return [
      choose(g.allChickens(heads, legs), c[0], heads * 2, g.allChickensHint),
      choose(g.extra(legs, heads * 2), c[1], rabbits * 2, g.extraHint),
      choose(g.rabbits(rabbits * 2), c[2], rabbits, g.rabbitsHint, g.done(rabbits, heads - rabbits)),
    ]
  },
  show: ({ heads, rabbits }, { step: s, finished }) => ({
    show: <V.LegsVisual data={{ heads, legs: heads * 2 + rabbits * 2, rabbits }} solved={finished} />,
    eq: s === 1 ? `${heads} × 2 = ${heads * 2}` : s === 2 ? `${heads * 2 + rabbits * 2} − ${heads * 2} = ${rabbits * 2}` : undefined,
  }),
}

// Each entry keeps its own data type; the registry only needs make → steps/show to agree.
const erase = <D,>(g: Guide<D>) => g as unknown as Guide<unknown>

export const GUIDES: Record<LevelKind, Guide<unknown>> = {
  count: erase(count), line: erase(line), flash: erase(flash),
  makeTen: erase(makeTen), teen: erase(teen), add20: erase(add20),
  blocks: erase(blocks), digit: erase(digitGuide(3, [1, 2])), column: erase(column),
  shapeName: erase(shapeName), symmetry: erase(symmetry), measure: erase(measure),
  array: erase(groupsGuide('rows', '🥬', 'array')), times: erase(groupsGuide('groups', '🔴', 'times')), share: erase(share),
  clock: erase(clock), coins: erase(coins), change: erase(change),
  fracName: erase(fracName), fracLine: erase(fracLine), fracEqual: erase(fracEqual),
  bigPlace: erase(digitGuide(5, [3, 4])), area: erase(area), decimal: erase(decimal),
  pattern: erase(pattern), balance: erase(balance), legs: erase(legs),
}
