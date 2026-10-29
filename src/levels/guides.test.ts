import { describe, expect, it } from 'vitest'
import { STRINGS } from '../i18n'
import { GUIDES } from './guides'

/** Plays a guide the way a child would: tap the offered cells, pick the right choice. */
describe.each(Object.entries(GUIDES))('%s guide', (_kind, guide) => {
  it('every step is doable and every choice set holds its answer', () => {
    for (let run = 0; run < 300; run++) {
      const data = guide!.make()
      const steps = guide!.steps(STRINGS.zh, data)
      const tapped: number[] = []
      steps.forEach((step, s) => {
        if (step.kind === 'choose') {
          expect(step.choices).toContain(step.answer)
          expect(new Set(step.choices).size).toBe(step.choices.length)
        } else {
          for (let n = 0; n < step.taps; n++) {
            const open = guide!.picture(data, s, tapped, false).cells.findIndex(c => c.tap)
            expect(open, `step ${s} offers a cell for tap ${n + 1}`).toBeGreaterThanOrEqual(0)
            tapped.push(open)
          }
        }
      })
      // Nothing is left to tap once the guide is done.
      expect(guide!.picture(data, steps.length, tapped, true).cells.some(c => c.tap)).toBe(false)
    }
  })

  it('has the same number of steps in both languages', () => {
    const data = guide!.make()
    expect(guide!.steps(STRINGS.en, data).length).toBe(guide!.steps(STRINGS.zh, data).length)
  })
})
