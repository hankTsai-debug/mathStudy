import { useState } from 'react'
import { countRound, options, rnd } from '../game/logic'
import { useLater, useOnMount } from './hooks'
import { Choices, type LevelProps } from './shared'

/** 數一數: tap each object once (one-to-one), then say the total (cardinality). */
export function CountLevel({ round, ctx }: LevelProps) {
  const [spec] = useState(() => countRound(round))
  const [margins] = useState(() => Array.from({ length: spec.n }, () => `${rnd(0, 18)}px ${rnd(2, 14)}px`))
  const [choices] = useState(() => options(spec.n, 1, 10))
  const [labels, setLabels] = useState<(number | null)[]>(() => Array(spec.n).fill(null))
  const [asking, setAsking] = useState(false)
  const [flash, setFlash] = useState(0)
  const later = useLater()

  useOnMount(() => ctx.prompt(ctx.t.countTap(spec.fruit)))

  const tap = (i: number) => {
    if (labels[i] !== null) return
    const c = labels.filter(l => l !== null).length + 1
    setLabels(ls => ls.map((l, j) => (j === i ? c : l)))
    ctx.say(String(c))
    if (c === spec.n) later(() => { setAsking(true); ctx.prompt(ctx.t.howMany) }, 700)
  }

  return (
    <>
      <div className="stage">
        <div className={`field${flash ? ' flash' : ''}`} key={flash}>
          {labels.map((label, i) => (
            <button key={i} className={`item${label ? ' tapped' : ''}`} style={{ margin: margins[i] }} onClick={() => tap(i)}>
              {spec.fruit}
              {label && <span className="badge">{label}</span>}
            </button>
          ))}
        </div>
      </div>
      {asking && (
        <Choices
          values={choices}
          answer={spec.n}
          onCorrect={ctx.correct}
          onWrong={() => { ctx.wrong(); ctx.prompt(ctx.t.countHint); setFlash(f => f + 1) }}
        />
      )}
    </>
  )
}
