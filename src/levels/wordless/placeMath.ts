// 位值山谷: place values, block timings and worked column sums, shared by its lessons and help.
import { sfx } from '../../sound'
import type { Sounds } from './kit'

export type Place = 'h' | 't' | 'o'
export const ITEM: Record<Place, string> = { h: 'flat', t: 'rod', o: 'cube' }
export const WORTH: Record<Place, number> = { h: 100, t: 10, o: 1 }
export const ORDER: Place[] = ['h', 't', 'o']
export const split = (n: number): Record<Place, number> => ({ h: Math.floor(n / 100) % 10, t: Math.floor(n / 10) % 10, o: n % 10 })

/** When each block lights up as it is counted: hundreds, then tens, then ones. */
export function countTimes(n: Record<Place, number>, places: Place[], start: number, gap: number) {
  const at: Record<Place, number[]> = { h: [], t: [], o: [] }
  let ms = start
  for (const p of places) {
    at[p] = Array.from({ length: n[p] }, (_, i) => ms + i * gap)
    ms += Math.max(1, n[p]) * gap + 300
  }
  return { at, end: ms }
}

/** Counting sounds for the lit blocks: each place's notes rise from 1, a pop between places. */
export const litSounds = (at: Record<Place, number[]>, places: Place[]): Sounds =>
  places.flatMap(p => at[p].map((ms, i): [number, () => void] => [ms, () => sfx.count(i + 1)]))

export const PLACE_OF = (p: number): Place => (p === 2 ? 'h' : p === 1 ? 't' : 'o')

/** The worked column sum: ones digit, carry or borrow, tens digit. */
export function columnParts(a: number, b: number, op: '+' | '-') {
  const [a1, a0, b1, b0] = [Math.floor(a / 10), a % 10, Math.floor(b / 10), b % 10]
  if (op === '+') {
    const ones = a0 + b0
    return { ones: ones % 10, tens: a1 + b1 + (ones >= 10 ? 1 : 0), carry: ones >= 10, borrow: false }
  }
  const borrow = a0 < b0
  return { ones: (borrow ? a0 + 10 : a0) - b0, tens: a1 - (borrow ? 1 : 0) - b1, carry: false, borrow }
}

