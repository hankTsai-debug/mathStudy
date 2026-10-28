import { useEffect, useRef, useState } from 'react'
import { lineRound } from '../game/logic'
import { useOnMount } from './hooks'
import { type LevelProps } from './shared'

const STEP_MS = 550
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

/** 青蛙跳數線: a linear 0–10 board (Siegler & Ramani). The frog hops one step at a time, counting aloud. */
export function LineLevel({ round, ctx }: LevelProps) {
  const [spec] = useState(() => lineRound(round))
  const [pos, setPos] = useState(spec.start)
  const posRef = useRef(spec.start)
  const busy = useRef(false)
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true
    return () => { alive.current = false }
  }, [])

  useOnMount(() =>
    ctx.prompt(spec.hop === null ? ctx.t.jumpTo(spec.target) : ctx.t.hopFwd(spec.start, spec.hop)))

  async function hop(to: number) {
    const step = to > posRef.current ? 1 : -1
    while (posRef.current !== to && alive.current) {
      posRef.current += step
      setPos(posRef.current)
      ctx.say(String(posRef.current))
      await sleep(STEP_MS)
    }
  }

  async function tap(i: number) {
    if (busy.current) return
    busy.current = true
    await hop(i)
    if (!alive.current) return
    if (i === spec.target) {
      ctx.correct() // stays busy: the round is over
      return
    }
    ctx.wrong()
    ctx.prompt(i < spec.target ? ctx.t.tooSmall(i) : ctx.t.tooBig(i))
    await sleep(1800)
    if (!alive.current) return
    await hop(spec.start)
    busy.current = false
  }

  return (
    <div className="stage">
      <div className="line">
        {Array.from({ length: 11 }, (_, i) => (
          <button key={i} className="pad" onClick={() => tap(i)} aria-label={String(i)}>
            <span className="lily" />
            <b>{i}</b>
          </button>
        ))}
        <div className="frog" style={{ left: `${((pos + 0.5) / 11) * 100}%` }}>🐸</div>
      </div>
    </div>
  )
}
