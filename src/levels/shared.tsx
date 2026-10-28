import { useState } from 'react'
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

export function Choices({ values, answer, onCorrect, onWrong }: {
  values: number[]
  answer: number
  onCorrect: () => void
  onWrong: () => void
}) {
  const [missed, setMissed] = useState<number[]>([])
  const [done, setDone] = useState(false)
  return (
    <div className="choices">
      {values.map(v => (
        <button
          key={v}
          className={`btn choice${done && v === answer ? ' ok' : ''}${missed.includes(v) ? ' no' : ''}`}
          disabled={done || missed.includes(v)}
          onClick={() => {
            if (v === answer) { setDone(true); onCorrect() }
            else { setMissed(m => [...m, v]); onWrong() }
          }}
        >
          {v}
        </button>
      ))}
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
