// Round generators for the choice-based levels. Each returns the data a visual needs,
// the answer, and choices whose distractors are the mistakes children typically make.
import { pick, rnd, shuffle, type Rng } from './logic'

export type Answer = number | string
export interface Quiz<D> { data: D; answer: Answer; choices: Answer[] }

const quiz = <D,>(data: D, answer: Answer, choices: Answer[], rng: Rng): Quiz<D> =>
  ({ data, answer, choices: shuffle([...new Set(choices)], rng) })

/** The answer, then `likely` mistakes in order, padded with near numbers; `count` distinct values in [min, max]. */
export function numberChoices(answer: number, likely: number[], min: number, max: number, count = 3): number[] {
  const set = new Set([answer])
  const add = (v: number) => { if (set.size < count && Number.isInteger(v) && v >= min && v <= max) set.add(v) }
  likely.forEach(add)
  for (let d = 1; set.size < count && d <= max - min; d++) { add(answer + d); add(answer - d) }
  return [...set]
}

/** Text choices: the answer plus distinct distractors, padded from `spare`. */
function textChoices(answer: string, likely: string[], spare: string[], count = 3): string[] {
  const set = new Set([answer])
  for (const v of [...likely, ...spare]) if (set.size < count) set.add(v)
  return [...set]
}

const distinctDigits = (count: number, rng: Rng) => shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], rng).slice(0, count)

/* ---------- 十的海灣 ---------- */

export interface Add20 { a: number; b: number; op: '+' | '-' }
/** Within 10, then crossing ten (8 + 5), then subtracting across ten (13 − 5). */
export function add20(round: number, rng: Rng = Math.random): Quiz<Add20> {
  let a: number, b: number, op: '+' | '-'
  if (round < 2) { a = rnd(1, 9, rng); b = rnd(1, 10 - a, rng); op = '+' }
  else if (round < 4) { a = rnd(6, 9, rng); b = rnd(11 - a, 9, rng); op = '+' }
  else { a = rnd(11, 18, rng); b = rnd(a - 9, 9, rng); op = '-' }
  const answer = op === '+' ? a + b : a - b
  return quiz({ a, b, op }, answer, numberChoices(answer, [answer + 10, answer - 10, answer + 1, answer - 1], 0, 20), rng)
}

/* ---------- 位值山谷 ---------- */

export interface Blocks { n: number }
/** Read hundreds flats, tens rods and ones cubes. Distractors swap the digits or miscount a rod. */
export function blocks(round: number, rng: Rng = Math.random): Quiz<Blocks> {
  const n = round < 2 ? rnd(11, 99, rng) : rnd(101, 999, rng)
  const reversed = Number(String(n).split('').reverse().join(''))
  return quiz({ n }, n, numberChoices(n, [reversed, n + 10, n - 10, n + 100], 1, 999), rng)
}

export interface DigitValue { n: number; digit: number; place: number }
/** What a digit is worth, given its place (0 = ones). Digits are distinct so the question is unambiguous. */
export function digitValue(round: number, rng: Rng = Math.random, length = 3): Quiz<DigitValue> {
  const ds = distinctDigits(length, rng)
  const n = Number(ds.join(''))
  const place = round < 2 ? rnd(0, Math.min(1, length - 1), rng) : rnd(0, length - 1, rng)
  const digit = ds[length - 1 - place]
  const answer = digit * 10 ** place
  const others = [place + 1, place - 1, place + 2, place - 2].filter(p => p >= 0 && p < length).map(p => digit * 10 ** p)
  return quiz({ n, digit, place }, answer, [answer, ...others.slice(0, 2)], rng)
}

export interface Column { a: number; b: number; op: '+' | '-' }
/** Two-digit column sums: no carrying, then carrying, then borrowing. */
export function column(round: number, rng: Rng = Math.random): Quiz<Column> {
  const tens = () => { const a1 = rnd(1, 7, rng); return [a1, rnd(1, 8 - a1, rng)] }
  let a: number, b: number, op: '+' | '-'
  if (round < 2) {
    const [a1, b1] = tens(); const a0 = rnd(0, 8, rng); const b0 = rnd(0, 9 - a0, rng)
    a = a1 * 10 + a0; b = b1 * 10 + b0; op = '+'
  } else if (round < 4) {
    const [a1, b1] = tens(); const a0 = rnd(2, 9, rng); const b0 = rnd(10 - a0, 9, rng)
    a = a1 * 10 + a0; b = b1 * 10 + b0; op = '+'
  } else {
    const a1 = rnd(3, 9, rng); const b1 = rnd(1, a1 - 1, rng); const a0 = rnd(0, 8, rng); const b0 = rnd(a0 + 1, 9, rng)
    a = a1 * 10 + a0; b = b1 * 10 + b0; op = '-'
  }
  const answer = op === '+' ? a + b : a - b
  // Forgetting the carry gives answer − 10; forgetting the borrow gives answer + 10.
  return quiz({ a, b, op }, answer, numberChoices(answer, [op === '+' ? answer - 10 : answer + 10, answer + 1, answer - 1], 0, 99), rng)
}

/* ---------- 形狀工坊 ---------- */

export const SHAPES = ['circle', 'triangle', 'square', 'rectangle', 'pentagon', 'hexagon'] as const
export type Shape = (typeof SHAPES)[number]
export interface ShapeName { shape: Shape; rotate: number }
/** Name the shape; later rounds tilt it, since a tilted square is still a square. */
export function shapeName(round: number, rng: Rng = Math.random): Quiz<ShapeName> {
  const shape = pick(round < 2 ? SHAPES.slice(0, 4) : SHAPES, rng)
  const rotate = round >= 3 && shape !== 'circle' ? pick([20, 45], rng) : 0
  const others = shuffle(SHAPES.filter(s => s !== shape), rng).slice(0, 2)
  return quiz({ shape, rotate }, shape, [shape, ...others], rng)
}

export type SymShape = 'rectangle' | 'square' | 'isosceles' | 'rightTriangle' | 'heart' | 'lShape' | 'circle' | 'parallelogram'
export interface Symmetry { shape: SymShape; line: [number, number, number, number] }
const V: Symmetry['line'] = [100, 12, 100, 188]
const H: Symmetry['line'] = [12, 100, 188, 100]
const SYMMETRY_CASES: [SymShape, Symmetry['line'], boolean][] = [
  ['rectangle', V, true], ['rectangle', H, true], ['rectangle', [30, 60, 170, 140], false],
  ['square', [40, 40, 160, 160], true], ['square', V, true],
  ['isosceles', V, true], ['isosceles', H, false],
  ['rightTriangle', V, false],
  ['heart', V, true], ['heart', H, false],
  ['lShape', V, false],
  ['circle', [30, 30, 170, 170], true],
  ['parallelogram', V, false],
]
/** Is the dashed line a line of symmetry? Answers are 'yes' / 'no'. */
export function symmetry(_round: number, rng: Rng = Math.random): Quiz<Symmetry> {
  const [shape, line, yes] = pick(SYMMETRY_CASES, rng)
  return { data: { shape, line }, answer: yes ? 'yes' : 'no', choices: ['yes', 'no'] }
}

export interface Measure { start: number; length: number }
/** Measure a pencil on a 0–12 cm ruler; later it doesn't start at 0, so reading the end is wrong. */
export function measure(round: number, rng: Rng = Math.random): Quiz<Measure> {
  const length = rnd(2, 9, rng)
  const start = round < 2 ? 0 : rnd(1, Math.min(3, 12 - length), rng)
  return quiz({ start, length }, length, numberChoices(length, [start + length, length + 1, length - 1], 1, 12), rng)
}

/* ---------- 乘法農場 ---------- */

export interface ArrayQ { rows: number; cols: number }
export function array(round: number, rng: Rng = Math.random): Quiz<ArrayQ> {
  const rows = rnd(2, round < 2 ? 3 : 5, rng)
  const cols = rnd(2, round < 2 ? 4 : 6, rng)
  const answer = rows * cols
  return quiz({ rows, cols }, answer, numberChoices(answer, [rows + cols, answer + cols, answer - cols], 1, 40), rng)
}

export interface Times { a: number; b: number }
/** a groups of b; tables 2–5 first, then up to 9. */
export function times(round: number, rng: Rng = Math.random): Quiz<Times> {
  const max = round < 2 ? 5 : 9
  const a = rnd(2, max, rng)
  const b = rnd(2, max, rng)
  const answer = a * b
  return quiz({ a, b }, answer, numberChoices(answer, [answer + b, answer - b, a + b], 1, 90), rng)
}

export interface Share { total: number; groups: number }
/** Share equally (partitive division). */
export function share(round: number, rng: Rng = Math.random): Quiz<Share> {
  const groups = rnd(2, round < 2 ? 3 : 5, rng)
  const each = rnd(2, round < 2 ? 4 : 6, rng)
  return quiz({ total: groups * each, groups }, each, numberChoices(each, [groups, each + 1, each - 1], 1, 12), rng)
}

/* ---------- 時間錢幣市集 ---------- */

export const formatTime = (h: number, m: number) => `${h}:${String(m).padStart(2, '0')}`
export interface Clock { h: number; m: number }
/** Read an analog clock: o'clock and half past first, then any 5 minutes. */
export function clock(round: number, rng: Rng = Math.random): Quiz<Clock> {
  const h = rnd(1, 12, rng)
  const m = round < 2 ? pick([0, 30], rng) : rnd(0, 11, rng) * 5
  const answer = formatTime(h, m)
  const likely = [
    formatTime((h % 12) + 1, m), // reads the hour hand as already past the next number
    formatTime(h, m > 0 && m / 5 !== m ? m / 5 : (m + 30) % 60), // reads the minute number as minutes
  ]
  return quiz({ h, m }, answer, textChoices(answer, likely, [formatTime(h, (m + 15) % 60), formatTime(h === 1 ? 12 : h - 1, m)]), rng)
}

export interface Coins { coins: number[] }
/** Count NT$ coins, largest first. */
export function coins(round: number, rng: Rng = Math.random): Quiz<Coins> {
  const values = round < 2 ? [1, 5, 10] : [1, 5, 10, 50]
  const list = Array.from({ length: rnd(3, round < 2 ? 4 : 6, rng) }, () => pick(values, rng)).sort((x, y) => y - x)
  const total = list.reduce((s, v) => s + v, 0)
  return quiz({ coins: list }, total, numberChoices(total, [total + 5, total - 5, total + 1, total - 1], 1, 300), rng)
}

export interface Change { price: number; paid: number }
/** Change from 10, then 50, then 100. */
export function change(round: number, rng: Rng = Math.random): Quiz<Change> {
  const [paid, price] = round < 2 ? [10, rnd(1, 9, rng)] : round < 4 ? [50, rnd(11, 48, rng)] : [100, rnd(51, 98, rng)]
  const answer = paid - price
  return quiz({ price, paid }, answer, numberChoices(answer, [answer + 10, answer - 10, answer + 1, answer - 1], 1, 99), rng)
}

/* ---------- 分數廚房 ---------- */

export const frac = (k: number, d: number) => `${k}/${d}`
export interface Fraction { k: number; d: number }
/** Name the shaded part. Distractors: the unshaded part, and counting pieces instead of equal parts. */
export function fracName(round: number, rng: Rng = Math.random): Quiz<Fraction> {
  const d = rnd(2, round < 2 ? 4 : 8, rng)
  const k = rnd(1, d - 1, rng)
  const answer = frac(k, d)
  return quiz({ k, d }, answer, textChoices(answer, [frac(d - k, d), frac(k, d + 1)], [frac(k, d + 2)]), rng)
}

/** A point on the 0–1 number line. Counting tick marks instead of gaps gives k/(d+1). */
export function fracLine(round: number, rng: Rng = Math.random): Quiz<Fraction> {
  const d = rnd(2, round < 2 ? 4 : 8, rng)
  const k = rnd(1, d - 1, rng)
  const answer = frac(k, d)
  return quiz({ k, d }, answer, textChoices(answer, [frac(k, d + 1), frac(k + 1, d)], [frac(k, d + 2)]), rng)
}

export interface FracEqual { k: number; d: number; m: number }
/** Which fraction equals k/d. The additive mistake (k+m)/(d+m) is the main distractor. */
export function fracEqual(round: number, rng: Rng = Math.random): Quiz<FracEqual> {
  const [k, d] = round < 2 ? [1, 2] : pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4]] as const, rng)
  const m = round < 2 ? 2 : rnd(2, 3, rng)
  const answer = frac(k * m, d * m)
  return quiz({ k, d, m }, answer, textChoices(answer, [frac(k + m, d + m), frac(k * m + 1, d * m)], [frac(k, d * m)]), rng)
}

/* ---------- 大數港口 ---------- */

/** Digit value in a 4- or 5-digit number. */
export const bigPlace = (round: number, rng: Rng = Math.random) => digitValue(round + 2, rng, round < 2 ? 4 : 5)

export interface Area { w: number; h: number; ask: 'area' | 'perimeter' }
/** Alternates area and perimeter so the two are told apart. */
export function area(round: number, rng: Rng = Math.random): Quiz<Area> {
  const w = rnd(2, 8, rng)
  const h = rnd(2, 6, rng)
  const ask = round % 2 === 0 ? 'area' : 'perimeter'
  const a = w * h
  const p = 2 * (w + h)
  const answer = ask === 'area' ? a : p
  return quiz({ w, h, ask }, answer, numberChoices(answer, [ask === 'area' ? p : a, w + h, answer + 2], 1, 60), rng)
}

export interface Decimal { whole: number; k: number }
/** Tenths on a 10-part strip; later rounds add a whole strip. */
export function decimal(round: number, rng: Rng = Math.random): Quiz<Decimal> {
  const whole = round < 3 ? 0 : 1
  const k = rnd(1, 9, rng)
  const answer = `${whole}.${k}`
  return quiz({ whole, k }, answer, textChoices(answer, [`${whole}.${10 - k}`, `${whole + 1}.${k}`], [`${whole}.${k === 9 ? 8 : k + 1}`]), rng)
}

/* ---------- 挑戰島 ---------- */

export interface Pattern { terms: number[] }
/** Next term: add a constant, then subtract, then growing steps (+1, +2, +3…). */
export function pattern(round: number, rng: Rng = Math.random): Quiz<Pattern> {
  let terms: number[], next: number, step: number
  if (round < 2) {
    const s = rnd(1, 10, rng); step = rnd(1, 3, rng)
    terms = [0, 1, 2, 3].map(i => s + i * step); next = s + 4 * step
  } else if (round < 4) {
    const s = rnd(20, 40, rng); step = -rnd(2, 5, rng)
    terms = [0, 1, 2, 3].map(i => s + i * step); next = s + 4 * step
  } else {
    const s = rnd(1, 5, rng)
    terms = [s, s + 1, s + 3, s + 6]; next = s + 10; step = 3 // last gap; the next gap is 4
  }
  return quiz({ terms }, next, numberChoices(next, [next + 1, next - 1, terms[3] + step], 0, 60), rng)
}

export interface Balance { fruit: string; copies: number; extra: number; total: number }
/** Equal weights on a balance: n × 🍎 (+ extra) = total. */
export function balance(round: number, rng: Rng = Math.random): Quiz<Balance> {
  const value = rnd(2, 9, rng)
  const copies = rnd(2, round < 2 ? 3 : 4, rng)
  const extra = round < 3 ? 0 : rnd(1, 9, rng)
  const total = copies * value + extra
  return quiz({ fruit: pick(['🍎', '🍐', '🍊'], rng), copies, extra, total }, value, numberChoices(value, [value + 1, value - 1, value + 2], 1, 20), rng)
}

export interface Legs { heads: number; legs: number; rabbits: number }
/** 雞兔同籠: heads and legs given, how many rabbits. */
export function legs(round: number, rng: Rng = Math.random): Quiz<Legs> {
  const heads = rnd(2, round < 2 ? 4 : 8, rng)
  const rabbits = rnd(1, heads - 1, rng)
  return quiz(
    { heads, legs: heads * 2 + rabbits * 2, rabbits },
    rabbits,
    numberChoices(rabbits, [heads - rabbits, rabbits + 1, rabbits - 1], 0, heads),
    rng,
  )
}
