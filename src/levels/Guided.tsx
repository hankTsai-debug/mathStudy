import { useState } from 'react'
import type { Strings } from '../i18n'
import type { LevelKind } from '../islands'
import { GUIDES } from './guides'
import { useLater, useOnMount } from './hooks'
import { Choices } from './shared'

const NEXT_STEP_MS = 1600

/** "Let's do one together": the child does each step of one problem while the fox leads. Not scored. */
export function Guided({ kind, t, prompt, say, onDone }: {
  kind: LevelKind
  t: Strings
  prompt: (text: string) => void
  say: (text: string) => void
  onDone: () => void
}) {
  const guide = GUIDES[kind]
  const [data] = useState(() => guide.make())
  const [s, setS] = useState(0)
  const [taps, setTaps] = useState(0)
  const [busy, setBusy] = useState(false)
  const [finished, setFinished] = useState(false)
  const later = useLater()
  const steps = guide.steps(t, data)
  const step = steps[s]

  useOnMount(() => prompt(steps[0].say))

  const advance = () => {
    prompt(step.done ?? t.guideRight)
    if (s === steps.length - 1) { setFinished(true); return }
    setBusy(true)
    later(() => { setBusy(false); setS(s + 1); prompt(steps[s + 1].say) }, NEXT_STEP_MS)
  }

  // Only one step per guide is a tap step, so the running tap count is that step's count.
  const tap = () => {
    if (step.kind !== 'tap' || busy || taps >= step.taps) return
    setTaps(taps + 1)
    const spoken = step.count(taps + 1)
    if (spoken) say(spoken)
    if (taps + 1 === step.taps) advance()
  }

  const { show, eq } = guide.show(data, { s: busy || finished ? -1 : s, step: s, taps, finished, tap, t })
  return (
    <>
      {/* data-answer (as the choice reads) exists only in dev builds, for the end-to-end check. */}
      <div className="stage quiz guide" data-answer={import.meta.env.DEV && step.kind === 'choose' && !finished ? String(step.label?.(step.answer) ?? step.answer) : undefined}>
        {show}
        {eq && <div className="equation">{eq}</div>}
      </div>
      <div className="progress steps">
        {steps.map((_, j) => <i key={j} className={j < s || finished ? 'done' : ''} />)}
      </div>
      {step.kind === 'choose' && (
        <Choices
          key={s}
          values={step.choices}
          answer={step.answer}
          label={step.label}
          onCorrect={advance}
          onWrong={() => prompt(step.hint)}
        />
      )}
      {finished && <div className="choices"><button className="btn primary" onClick={onDone}>{t.startPractice}</button></div>}
    </>
  )
}
