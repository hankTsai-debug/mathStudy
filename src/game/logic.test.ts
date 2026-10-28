import { describe, expect, it } from 'vitest'
import {
  ROUNDS, countRound, flashRound, lineRound, makeTenRound, options, starsFor, teenRound,
} from './logic'

const repeat = (fn: () => void) => { for (let i = 0; i < 500; i++) fn() }

describe('options', () => {
  it('returns three distinct values that include the answer and stay in range', () => {
    repeat(() => {
      for (let answer = 1; answer <= 10; answer++) {
        const o = options(answer, 1, 10)
        expect(o).toHaveLength(3)
        expect(new Set(o).size).toBe(3)
        expect(o).toContain(answer)
        for (const v of o) expect(v >= 1 && v <= 10).toBe(true)
      }
    })
  })
})

describe('starsFor', () => {
  it('maps first-try answers to 1–3 stars', () => {
    expect(starsFor(ROUNDS)).toBe(3)
    expect(starsFor(4)).toBe(2)
    expect(starsFor(3)).toBe(2)
    expect(starsFor(2)).toBe(1)
    expect(starsFor(0)).toBe(1)
  })
})

describe('round generators', () => {
  it('keep every round inside its range', () => {
    repeat(() => {
      for (let r = 0; r < ROUNDS; r++) {
        const c = countRound(r)
        expect(c.n).toBeGreaterThanOrEqual(3)
        expect(c.n).toBeLessThanOrEqual(Math.min(10, 5 + r))

        const l = lineRound(r)
        expect(l.target).toBeGreaterThanOrEqual(1)
        expect(l.target).toBeLessThanOrEqual(10)
        if (l.hop !== null) expect(l.start + l.hop).toBe(l.target)

        const f = flashRound(r)
        expect(f.n).toBeGreaterThanOrEqual(1)
        expect(f.n).toBeLessThanOrEqual(10)

        const m = makeTenRound(r)
        expect(m.n + m.answer).toBe(10)
        expect(m.answer).toBeGreaterThanOrEqual(1)

        const t = teenRound(r)
        expect(t.answer).toBeGreaterThanOrEqual(11)
        expect(t.answer).toBeLessThanOrEqual(19)
      }
    })
  })
})
