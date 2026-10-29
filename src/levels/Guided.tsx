import { useState } from 'react'
import type { Strings } from '../i18n'
import type { LevelKind } from '../islands'
import { GUIDES } from './guides'
import { useLater, useOnMount } from './hooks'
import { Choices } from './shared'
import { GuideFrames } from './visuals'

const NEXT_STEP_MS = 1600

/** "Let's do one together": the child does each step of one problem while the fox leads. Not scored. */
export function Guided({ kind, t, prompt, say, onDone }: {
  kind: LevelKind
  t: Strings
  prompt: (text: string) => void
  say: (text: string) => void
  onDone: () => void
}) {
  const guide = GUIDES[kind]!
  const [data] = useState(() => guide.make())
  const [s, setS] = useState(0)
  const [tapped, setTapped] = useState<number[]>([])
  const [busy, setBusy] = useState(false)
  const [finished, setFinished] = useState(false)
  const later = useLater()
  const steps = guide.steps(t, data)
  const step = steps[s]

  useOnMount(() => prompt(steps[0].say))

  const advance = () => {
    prompt(step.done)
    if (s === steps.length - 1) { setFinished(true); return }
    setBusy(true)
    later(() => { setBusy(false); setS(s + 1); prompt(steps[s + 1].say) }, NEXT_STEP_MS)
  }

  const tapsBefore = steps.slice(0, s).reduce((sum, st) => sum + (st.kind === 'tap' ? st.taps : 0), 0)
  const tap = (i: number) => {
    if (step.kind !== 'tap' || busy) return
    const next = [...tapped, i]
    setTapped(next)
    say(step.count(next.length - tapsBefore))
    if (next.length - tapsBefore === step.taps) advance()
  }

  const { cells, eq } = guide.picture(data, busy ? -1 : s, tapped, finished)
  return (
    <>
      {/* data-answer exists only in dev builds, for the end-to-end check. */}
      <div className="stage quiz guide" data-answer={import.meta.env.DEV && step.kind === 'choose' && !finished ? String(step.answer) : undefined}>
        {eq && <div className="equation">{eq}</div>}
        <GuideFrames cells={cells} onTap={tap} />
      </div>
      <div className="progress steps">
        {steps.map((_, j) => <i key={j} className={j < s || finished ? 'done' : ''} />)}
      </div>
      {step.kind === 'choose' && (
        <Choices key={s} values={step.choices} answer={step.answer} onCorrect={advance} onWrong={() => prompt(step.hint)} />
      )}
      {finished && <div className="choices"><button className="btn primary" onClick={onDone}>{t.startPractice}</button></div>}
    </>
  )
}
