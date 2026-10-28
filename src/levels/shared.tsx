import { useState, type ReactNode } from 'react'
import type { Answer } from '../game/quizzes'
import type { Strings } from '../i18n'

export interface LevelContext {
  t: Strings
  /** Show text in the mascot bubble and read it aloud. */
  prompt: (text: string) => void
  /** Read aloud without changing the bubble (e.g. counting). */
  say: (text: string) => void
  correct: () => void
  wrong: () => void
}

export interface LevelProps { round: number; ctx: LevelContext }

/** Fractions like "3/4" render stacked; numbers get thousands separators. */
function defaultLabel(v: Answer): ReactNode {
  if (typeof v === 'number') return v.toLocaleString('en-US')
  const m = /^(\d+)\/(\d+)$/.exec(v)
  return m ? <span className="frac"><span>{m[1]}</span><span>{m[2]}</span></span> : v
}

export function Choices({ values, answer, onCorrect, onWrong, label = defaultLabel }: {
  values: Answer[]
  answer: Answer
  onCorrect: () => void
  onWrong: () => void
  label?: (v: Answer) => ReactNode
}) {
  const [missed, setMissed] = useState<Answer[]>([])
  const [done, setDone] = useState(false)
  return (
    <div className="choices">
      {values.map(v => {
        const text = label(v)
        return (
          <button
            key={String(v)}
            className={`btn choice${typeof text === 'string' && text.length > 3 ? ' wordy' : ''}${done && v === answer ? ' ok' : ''}${missed.includes(v) ? ' no' : ''}`}
            disabled={done || missed.includes(v)}
            onClick={() => {
              if (v === answer) { setDone(true); onCorrect() }
              else { setMissed(m => [...m, v]); onWrong() }
            }}
          >
            {text}
          </button>
        )
      })}
    </div>
  )
}

/** A 2×5 ten-frame, filled row by row. `extra` cells after `filled` are drawn in a second colour. */
export function TenFrame({ filled, extra = 0, hidden = false }: { filled: number; extra?: number; hidden?: boolean }) {
  return (
    <div className={`frame${hidden ? ' hidden' : ''}`}>
      {Array.from({ length: 10 }, (_, i) => (
        <div className="cell" key={i}>
          {i < filled && <i className="dot" />}
          {i >= filled && i < filled + extra && <i className="dot extra" />}
        </div>
      ))}
    </div>
  )
}
