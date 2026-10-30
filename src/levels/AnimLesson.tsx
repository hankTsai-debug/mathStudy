import { useEffect, useState } from 'react'
import type { Strings } from '../i18n'
import type { LevelKind } from '../islands'
import type { AnimBeat } from './wordless/kit'

/** Plays an animated lesson beat by beat, on its own; ◀ ▶ step through it, 🔁 replays it. */
export function AnimLesson({ kind, beats, t, prompt, onDone }: {
  kind: LevelKind
  beats: AnimBeat[]
  t: Strings
  prompt: (text: string) => void
  onDone: () => void
}) {
  const [i, setI] = useState(0)
  // Bumped on replay so the same beat remounts and its animations start over.
  const [run, setRun] = useState(0)
  const beat = beats[i]
  const last = i === beats.length - 1
  const line = t.teach[kind][i]

  useEffect(() => prompt(line), [prompt, line, run])

  useEffect(() => {
    const timers = (beat.sounds ?? []).map(([ms, play]) => window.setTimeout(play, ms))
    if (!last) timers.push(window.setTimeout(() => setI(i + 1), beat.ms))
    return () => timers.forEach(clearTimeout)
  }, [beat, last, i, run])

  return (
    <>
      <div className="stage quiz lesson" key={`${i}-${run}`}>
        {beat.show}
        {beat.eq && <div className="equation">{beat.eq}</div>}
      </div>
      <div className="progress steps">
        {beats.map((_, j) => <i key={j} className={j <= i ? 'done' : ''} />)}
      </div>
      <div className="choices">
        {i > 0 && <button className="btn icon" aria-label={t.prevStep} onClick={() => setI(i - 1)}>◀</button>}
        {last
          ? <>
            <button className="btn icon" aria-label={t.replay} onClick={() => { setI(0); setRun(run + 1) }}>🔁</button>
            <button className="btn primary icon" aria-label={t.tryIt} onClick={onDone}>🙋</button>
          </>
          : <button className="btn primary icon" aria-label={t.nextStep} onClick={() => setI(i + 1)}>▶</button>}
      </div>
    </>
  )
}
