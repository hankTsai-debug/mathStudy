import { useEffect, useState } from 'react'
import { ADVENTURE, PONDER_PICS } from './adventure'
import type { Lang } from './i18n'
import type { LevelId } from './islands'
import { sfx } from './sound'
import { picRows } from './stories'

/** "Think first": an open question before the lesson. Any answer is welcome; nothing is marked right or wrong. */
export function Ponder({ level, lang, prompt, onDone }: {
  level: LevelId
  lang: Lang
  prompt: (text: string) => void
  onDone: () => void
}) {
  const a = ADVENTURE[lang]
  const { q, choices } = a.ponder[level]
  const [chose, setChose] = useState<string | null>(null)

  useEffect(() => prompt(q), [prompt, q])

  const pick = (c: string | null) => {
    setChose(c ?? a.dunno)
    sfx.pop()
    prompt(c === null ? a.ponderDunno : a.ponderAck(c))
  }

  let n = 0
  return (
    <>
      <div className="stage story ponder">
        {picRows(PONDER_PICS[level]).map((row, r) => (
          <div className="row" key={r}>
            {row.map((item, j) => <span key={j} className="a-pop" style={{ animationDelay: `${n++ * 60}ms` }}>{item}</span>)}
          </div>
        ))}
      </div>
      <div className="choices">
        {[...choices, null].map(c => (
          <button
            key={c ?? '?'}
            className={`btn ponder-choice${chose === (c ?? a.dunno) ? ' picked' : ''}`}
            disabled={chose !== null}
            onClick={() => pick(c)}
          >{c ?? a.dunno}</button>
        ))}
      </div>
      {chose !== null && (
        <div className="choices">
          <button className="btn primary" onClick={onDone}>{a.letsSee} ▶</button>
        </div>
      )}
    </>
  )
}
