import { useEffect, useState } from 'react'
import { ADVENTURE, PONDER_ANSWERS, PONDER_PICS } from './adventure'
import { shuffle } from './game/logic'
import type { Lang } from './i18n'
import type { LevelId } from './islands'
import { sfx } from './sound'
import { picRows } from './stories'

function Picture({ level }: { level: LevelId }) {
  let n = 0
  return (
    <div className="stage story ponder">
      {picRows(PONDER_PICS[level]).map((row, r) => (
        <div className="row" key={r}>
          {row.map((item, j) => <span key={j} className="a-pop" style={{ animationDelay: `${n++ * 60}ms` }}>{item}</span>)}
        </div>
      ))}
    </div>
  )
}

/**
 * "Think first": an open question before the lesson. Any answer is taken without marking it;
 * the child holds on to their idea and checks it after the lesson (see Recap).
 */
export function Ponder({ level, lang, prompt, onDone }: {
  level: LevelId
  lang: Lang
  prompt: (text: string) => void
  /** The child's guess, or null for "not sure yet". */
  onDone: (guess: string | null) => void
}) {
  const a = ADVENTURE[lang]
  const { q, choices } = a.ponder[level]
  const [order] = useState(() => shuffle([...choices.keys()]))
  const [chose, setChose] = useState<string | null | undefined>(undefined)

  useEffect(() => prompt(q), [prompt, q])

  const pick = (c: string | null) => {
    setChose(c)
    sfx.pop()
    prompt(c === null ? a.ponderDunno : a.ponderAck(c))
  }

  return (
    <>
      <Picture level={level} />
      <div className="choices">
        {[...order.map(i => choices[i]), null].map(c => (
          <button
            key={c ?? '?'}
            className={`btn ponder-choice${chose !== undefined && chose === c ? ' picked' : ''}`}
            disabled={chose !== undefined}
            onClick={() => pick(c)}
          >{c ?? a.dunno}</button>
        ))}
      </div>
      {chose !== undefined && (
        <div className="choices">
          <button className="btn primary" onClick={() => onDone(chose)}>{a.letsSee} ▶</button>
        </div>
      )}
    </>
  )
}

/** After the lesson: back to the "think first" question, with its answer and the child's guess side by side. */
export function Recap({ level, lang, guess, prompt, onDone }: {
  level: LevelId
  lang: Lang
  guess: string | null
  prompt: (text: string) => void
  onDone: () => void
}) {
  const a = ADVENTURE[lang]
  const { choices } = a.ponder[level]
  const answer = choices[PONDER_ANSWERS[level]]
  const text = a.recap(answer, guess)

  useEffect(() => {
    prompt(text)
    sfx.chime()
  }, [prompt, text])

  return (
    <>
      <Picture level={level} />
      <div className="choices">
        {choices.map(c => (
          <span key={c} className={`btn ponder-choice${c === answer ? ' answer' : c === guess ? ' guessed' : ' dim'}`}>
            {c === answer && '✅ '}{c}
          </span>
        ))}
      </div>
      <div className="choices">
        <button className="btn primary" onClick={onDone}>{a.together} ▶</button>
      </div>
    </>
  )
}
