import { useEffect, useState } from 'react'
import type { Strings } from '../i18n'
import type { LevelKind } from '../islands'
import { LESSONS } from './lessons'

/** "Watch me": a worked example, one narrated step at a time, before the child tries. */
export function Lesson({ kind, t, prompt, onDone }: {
  kind: LevelKind
  t: Strings
  prompt: (text: string) => void
  onDone: () => void
}) {
  const steps = LESSONS[kind]
  const [i, setI] = useState(0)
  const line = t.teach[kind][i]
  const last = i === steps.length - 1

  useEffect(() => prompt(line), [prompt, line])

  return (
    <>
      <div className="stage quiz lesson">
        {steps[i].show}
        {steps[i].eq && <div className="equation">{steps[i].eq}</div>}
      </div>
      <div className="progress steps">
        {steps.map((_, j) => <i key={j} className={j <= i ? 'done' : ''} />)}
      </div>
      <div className="choices">
        {i > 0 && <button className="btn icon" aria-label={t.prevStep} onClick={() => setI(i - 1)}>◀</button>}
        {last
          ? <button className="btn primary icon" aria-label={t.tryIt} onClick={onDone}>🙋</button>
          : <button className="btn primary icon" aria-label={t.nextStep} onClick={() => setI(i + 1)}>▶</button>}
      </div>
    </>
  )
}
