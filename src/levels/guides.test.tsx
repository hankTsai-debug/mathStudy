import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { STRINGS } from '../i18n'
import { GUIDES, type GuideState } from './guides'

/** Elements a child can tap right now: a `tap` class and not disabled. */
function tappable(html: string) {
  return [...html.matchAll(/<(button|circle)\b[^>]*>/g)].map(m => m[0])
    .filter(tag => /class="[^"]*\btap\b/.test(tag) && !/\bdisabled\b/.test(tag)).length
}

const noop = () => {}

/** Plays a guide the way a child would: tap whatever is offered, pick the right choice. */
describe.each(Object.entries(GUIDES))('%s guide', (_kind, guide) => {
  it('every step can be done, and every choice set holds its answer', () => {
    for (let run = 0; run < 200; run++) {
      const data = guide.make()
      const steps = guide.steps(STRINGS.zh, data)
      const at = (s: number, taps: number, finished = false): GuideState => ({ s, step: s, taps, finished, tap: noop, t: STRINGS.zh })
      let taps = 0
      steps.forEach((step, s) => {
        expect(step.say.length).toBeGreaterThan(0)
        if (step.kind === 'choose') {
          expect(step.choices).toContain(step.answer)
          expect(new Set(step.choices).size).toBe(step.choices.length)
          expect(step.choices.length).toBeGreaterThanOrEqual(2)
          expect(tappable(renderToStaticMarkup(<>{guide.show(data, at(s, taps)).show}</>)), `nothing to tap in step ${s}`).toBe(0)
        } else {
          for (let n = 0; n < step.taps; n++) {
            const html = renderToStaticMarkup(<>{guide.show(data, at(s, taps)).show}</>)
            expect(tappable(html), `step ${s} offers something for tap ${n + 1}`).toBeGreaterThan(0)
            taps++
          }
        }
      })
      const end = renderToStaticMarkup(<>{guide.show(data, { ...at(-1, taps, true), step: steps.length - 1 }).show}</>)
      expect(tappable(end), 'nothing is left to tap at the end').toBe(0)
    }
  })

  it('has the same steps in both languages', () => {
    const data = guide.make()
    const zh = guide.steps(STRINGS.zh, data), en = guide.steps(STRINGS.en, data)
    expect(en.map(s => s.kind)).toEqual(zh.map(s => s.kind))
  })
})
