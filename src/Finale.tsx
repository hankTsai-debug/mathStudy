import { useState } from 'react'
import { ADVENTURE, FINALE_ANSWERS } from './adventure'
import { shuffle } from './game/logic'
import type { Lang } from './i18n'
import type { IslandId } from './islands'
import { sfx } from './sound'

/** The island's last step, solved by the child from the clues before the mystery's answer is shown. */
export function Finale({ island, lang, prompt, rank }: {
  island: IslandId
  lang: Lang
  prompt: (text: string) => void
  rank: string
}) {
  const a = ADVENTURE[lang]
  const m = a.mystery[island]
  const right = m.finale.choices[FINALE_ANSWERS[island]]
  const [order] = useState(() => shuffle([...m.finale.choices]))
  const [wrong, setWrong] = useState<string[]>([])
  const [solved, setSolved] = useState(false)

  const pick = (c: string) => {
    if (c === right) {
      setSolved(true)
      sfx.right()
      prompt(`${a.solvedTitle} ${m.solved} ${a.newPower(m.power)}`)
    } else {
      setWrong([...wrong, c])
      sfx.miss()
      prompt(a.finaleTry)
    }
  }

  if (solved) return (
    <div className="solved a-pop">
      <p><b>{a.solvedTitle}</b> {m.solved}</p>
      <p>✨ {a.newPower(m.power)}</p>
      <p>🏅 {a.nowRank(rank)}</p>
    </div>
  )
  return (
    <div className="finale">
      <p><b>{a.finaleTitle}</b></p>
      <ol>{m.clues.map(c => <li key={c}>{c}</li>)}</ol>
      <p className="q">{m.finale.q}</p>
      <div className="choices">
        {order.map(c => (
          <button key={c} className="btn ponder-choice" disabled={wrong.includes(c)} onClick={() => pick(c)}>{c}</button>
        ))}
      </div>
    </div>
  )
}
