import { describe, expect, it } from 'vitest'
import { ROUNDS } from './logic'
import * as Q from './quizzes'
import type { Answer, Quiz } from './quizzes'

const GENERATORS: Record<string, (round: number) => Quiz<unknown>> = {
  add20: Q.add20, blocks: Q.blocks, digit: r => Q.digitValue(r), column: Q.column,
  shapeName: Q.shapeName, symmetry: Q.symmetry, measure: Q.measure,
  array: Q.array, times: Q.times, share: Q.share,
  clock: Q.clock, coins: Q.coins, change: Q.change,
  fracName: Q.fracName, fracLine: Q.fracLine, fracEqual: Q.fracEqual,
  bigPlace: r => Q.bigPlace(r), area: Q.area, decimal: Q.decimal,
  pattern: Q.pattern, balance: Q.balance, legs: Q.legs,
}

const value = (f: Answer) => { const [k, d] = String(f).split('/').map(Number); return k / d }

describe.each(Object.entries(GENERATORS))('%s', (_name, make) => {
  it('always offers distinct choices that include the answer', () => {
    for (let i = 0; i < 400; i++) {
      for (let r = 0; r < ROUNDS; r++) {
        const q = make(r)
        expect(q.choices).toContain(q.answer)
        expect(new Set(q.choices).size).toBe(q.choices.length)
        expect(q.choices.length).toBeGreaterThanOrEqual(2)
        expect(q.choices.length).toBeLessThanOrEqual(3)
      }
    }
  })
})

describe('answers are mathematically right', () => {
  it('checks each generator against its own data', () => {
    for (let i = 0; i < 400; i++) {
      for (let r = 0; r < ROUNDS; r++) {
        const a = Q.add20(r); expect(a.answer).toBe(a.data.op === '+' ? a.data.a + a.data.b : a.data.a - a.data.b)
        expect(a.answer).toBeGreaterThanOrEqual(0); expect(a.answer).toBeLessThanOrEqual(20)

        const c = Q.column(r); const sum = c.data.op === '+' ? c.data.a + c.data.b : c.data.a - c.data.b
        expect(c.answer).toBe(sum); expect(sum).toBeGreaterThan(0); expect(sum).toBeLessThan(100)
        if (r >= 2 && r < 4) expect((c.data.a % 10) + (c.data.b % 10)).toBeGreaterThanOrEqual(10)
        if (r === 4) expect(c.data.a % 10).toBeLessThan(c.data.b % 10)

        const d = Q.digitValue(r); expect(String(d.data.n)[2 - d.data.place]).toBe(String(d.data.digit))
        expect(d.answer).toBe(d.data.digit * 10 ** d.data.place)

        const bp = Q.bigPlace(r); const s = String(bp.data.n)
        expect(s[s.length - 1 - bp.data.place]).toBe(String(bp.data.digit))

        const m = Q.measure(r); expect(m.data.start + m.data.length).toBeLessThanOrEqual(12)

        const sh = Q.share(r); expect(sh.data.total % sh.data.groups).toBe(0); expect(sh.answer).toBe(sh.data.total / sh.data.groups)

        const cl = Q.clock(r); expect(cl.answer).toBe(Q.formatTime(cl.data.h, cl.data.m))
        expect(cl.data.m % 5).toBe(0)

        const co = Q.coins(r); expect(co.answer).toBe(co.data.coins.reduce((x, y) => x + y, 0))

        const ch = Q.change(r); expect(ch.answer).toBe(ch.data.paid - ch.data.price); expect(ch.answer).toBeGreaterThan(0)

        const fe = Q.fracEqual(r)
        expect(value(fe.answer)).toBeCloseTo(fe.data.k / fe.data.d)
        for (const f of fe.choices) if (f !== fe.answer) expect(value(f)).not.toBeCloseTo(fe.data.k / fe.data.d)

        const fn = Q.fracName(r); expect(fn.answer).toBe(`${fn.data.k}/${fn.data.d}`)

        const ar = Q.area(r); expect(ar.answer).toBe(ar.data.ask === 'area' ? ar.data.w * ar.data.h : 2 * (ar.data.w + ar.data.h))

        const de = Q.decimal(r); expect(Number(de.answer)).toBeCloseTo(de.data.whole + de.data.k / 10)

        const p = Q.pattern(r); const t = p.data.terms
        const gaps = [t[1] - t[0], t[2] - t[1], t[3] - t[2]]
        expect(p.answer).toBe(t[3] + gaps[2] + (gaps[2] - gaps[1]))

        const b = Q.balance(r); expect(b.data.copies * (b.answer as number) + b.data.extra).toBe(b.data.total)

        const l = Q.legs(r); expect(2 * (l.data.heads - (l.answer as number)) + 4 * (l.answer as number)).toBe(l.data.legs)
      }
    }
  })
})
