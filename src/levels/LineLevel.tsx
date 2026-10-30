import { useEffect, useRef, useState } from 'react'
import { lineRound } from '../game/logic'
import { sfx } from '../sound'
import { useFeedback, useOnMount } from './hooks'
import { type LevelProps } from './shared'
import { delay } from './wordless/kit'

const STEP_MS = 550
const ROUTE_MS = 400
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

/**
 * 青蛙跳數線: a linear 0–10 board (Siegler & Ramani). The frog hops one step at a time, counting aloud,
 * with a note per pad. A wrong pad shows itself (too far, not far enough); from the second miss the
 * route lights up, pad by pad, with each hop numbered.
 */
export function LineLevel({ round, ctx }: LevelProps) {
  const [spec] = useState(() => lineRound(round))
  const [pos, setPos] = useState(spec.start)
  const posRef = useRef(spec.start)
  const busy = useRef(false)
  const alive = useRef(true)
  const f = useFeedback()
  const [route, setRoute] = useState(false)

  useEffect(() => {
    alive.current = true
    return () => { alive.current = false }
  }, [])

  useOnMount(() =>
    ctx.prompt(spec.hop === null ? ctx.t.jumpTo(spec.target) : ctx.t.hopFwd(spec.start, spec.hop)))

  async function hop(to: number, notes = true) {
    const step = to > posRef.current ? 1 : -1
    while (posRef.current !== to && alive.current) {
      posRef.current += step
      setPos(posRef.current)
      ctx.say(String(posRef.current))
      if (notes) sfx.count(posRef.current)
      await sleep(STEP_MS)
    }
  }

  async function tap(i: number) {
    if (busy.current) return
    busy.current = true
    await hop(i)
    if (!alive.current) return
    if (i === spec.target) {
      sfx.right()
      ctx.correct() // stays busy: the round is over
      return
    }
    ctx.wrong()
    ctx.prompt(i < spec.target ? ctx.t.tooSmall(i) : ctx.t.tooBig(i))
    const help = f.miss(i)
    await sleep(1800)
    if (!alive.current) return
    await hop(spec.start, false)
    if (help > 1) {
      setRoute(true)
      for (let k = 1; k <= spec.target - spec.start; k++) f.later(() => sfx.count(spec.start + k), 200 + (k - 1) * ROUTE_MS)
    }
    busy.current = false
  }

  return (
    <div className="stage">
      <div className="line" key={f.run}>
        {Array.from({ length: 11 }, (_, i) => {
          const k = i - spec.start
          const onRoute = route && k > 0 && i <= spec.target
          return (
            <button key={i} className={`pad${onRoute ? ' trail route' : ''}`} onClick={() => tap(i)} aria-label={String(i)}>
              <span className="lily" style={onRoute ? delay(200 + (k - 1) * ROUTE_MS) : undefined} />
              <b>{i}</b>
              {onRoute && <span className="tag-n" style={delay(200 + (k - 1) * ROUTE_MS)}>{k}</span>}
            </button>
          )
        })}
        <div className="frog" style={{ left: `${((pos + 0.5) / 11) * 100}%` }}>🐸</div>
      </div>
    </div>
  )
}
