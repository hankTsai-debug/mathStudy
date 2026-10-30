import { useState } from 'react'
import { countRound, options, rnd } from '../game/logic'
import { sfx } from '../sound'
import { useFeedback, useLater, useOnMount } from './hooks'
import { Choices, type LevelProps } from './shared'
import { delay } from './wordless/kit'

/**
 * 數一數: tap each object once (one-to-one), then say the total (cardinality).
 * A wrong total is shown, not told: rings mark what the chosen number covers and dashed rings what it
 * leaves out or adds; a second miss recounts the tags with counting notes and lights up the last one.
 */
export function CountLevel({ round, ctx }: LevelProps) {
  const [spec] = useState(() => countRound(round))
  const [margins] = useState(() => Array.from({ length: spec.n }, () => `${rnd(0, 18)}px ${rnd(2, 14)}px`))
  const [choices] = useState(() => options(spec.n, 1, 10))
  const [labels, setLabels] = useState<(number | null)[]>(() => Array(spec.n).fill(null))
  const [asking, setAsking] = useState(false)
  const later = useLater()
  const f = useFeedback()

  useOnMount(() => ctx.prompt(ctx.t.countTap(spec.fruit)))

  const tap = (i: number) => {
    if (labels[i] !== null) return
    const c = labels.filter(l => l !== null).length + 1
    setLabels(ls => ls.map((l, j) => (j === i ? c : l)))
    ctx.say(String(c))
    sfx.count(c)
    if (c === spec.n) later(() => { setAsking(true); ctx.prompt(ctx.t.howMany) }, 700)
  }

  const { mode } = f.fb
  const chose = f.fb.mode === 'wrong' ? f.fb.chose as number : 0
  const recount = mode === 'strategy' || mode === 'reveal'
  const GAP = 450
  return (
    <>
      <div className="stage">
        <div className="field" key={f.run}>
          {labels.map((label, i) => {
            const lastAt = (spec.n - 1) * GAP + 200
            const lit = (recount || mode === 'solved') && label === spec.n
            return (
              <button
                key={i}
                className={`item${label ? ' tapped' : ''}${lit ? ' a-hi' : ''}`}
                style={{ margin: margins[i], ...(lit ? delay(recount ? lastAt + 300 : 0) : {}) }}
                onClick={() => tap(i)}
              >
                {spec.fruit}
                {label && <span className={`badge${recount ? ' a-pop' : ''}`} style={recount ? delay((label - 1) * GAP + 200) : undefined}>{label}</span>}
                {mode === 'wrong' && label && <span className={`mark ${label <= chose ? 'ring' : 'miss'}`} />}
              </button>
            )
          })}
          {mode === 'wrong' && Array.from({ length: Math.max(0, chose - spec.n) }, (_, j) => (
            <span key={`x${j}`} className="extra-ring"><span className="mark over" /></span>
          ))}
        </div>
      </div>
      {asking && (
        <Choices
          values={choices}
          answer={spec.n}
          pulse={f.pulse ? spec.n : undefined}
          onCorrect={() => { f.solve(); sfx.right(); ctx.correct() }}
          onWrong={v => {
            ctx.wrong()
            ctx.prompt(ctx.t.countHint)
            if (f.miss(v) > 1) for (let c = 1; c <= spec.n; c++) f.later(() => sfx.count(c), (c - 1) * GAP + 200)
          }}
        />
      )}
    </>
  )
}
