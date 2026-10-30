import { useState } from 'react'
import { flashRound, options } from '../game/logic'
import { sfx } from '../sound'
import { useFeedback, useLater, useOnMount } from './hooks'
import { Choices, TenFrame, type LevelProps } from './shared'
import { GuideFrames, type FrameCell } from './visuals'

const SHOW_MS = 1800

/**
 * 十格框快看: dots flash on a ten-frame, then hide, so the child reads the 5-and-n structure.
 * A miss uncovers the frame and marks the chosen number on it; a second miss shows the full top row
 * as 5 and counts on from there (or, below 5, blinks the gaps a full row would fill).
 */
export function FlashLevel({ round, ctx }: LevelProps) {
  const [spec] = useState(() => flashRound(round))
  const [choices] = useState(() => options(spec.n, 1, 10))
  const [hidden, setHidden] = useState(false)
  const [asking, setAsking] = useState(false)
  const later = useLater()
  const f = useFeedback()
  const { n } = spec

  useOnMount(() => {
    ctx.prompt(ctx.t.look)
    later(() => { setHidden(true); setAsking(true); ctx.prompt(ctx.t.howManyDots) }, SHOW_MS)
  })

  // Red top row (5), blue below: the picture of "5 and some more".
  const base = Array.from({ length: 10 }, (_, i): FrameCell => (i < n ? { dot: i < 5 ? 'a' : 'b' } : {}))
  let picture = <TenFrame filled={n} hidden={hidden} />
  const { mode } = f.fb
  if (mode === 'wrong') {
    // Rings on the dots the chosen number covers; dashed on those it left out or the empty boxes it added.
    const chose = f.fb.chose as number
    picture = <GuideFrames cells={base.map((c, i) => ({ ...c, mark: i < n ? (i < chose ? 'ring' : 'miss') : i < chose ? 'over' : undefined }))} />
  } else if (mode !== 'idle') {
    const quick = mode === 'solved'
    const counted = mode !== 'strategy'
    picture = <GuideFrames cells={base.map((c, i) => {
      if (n >= 5) {
        // The top row lights up as 5, then count on: 6, 7…
        if (i === 4) return { ...c, badge: '5', badgeDelay: quick ? 0 : 300 }
        if (i >= 5 && i < n && counted) return { ...c, badge: String(i + 1), badgeDelay: quick ? 0 : 900 + (i - 5) * 500 }
        return c
      }
      // Below 5: the gaps to a full row blink; then count the dots.
      if (i >= n && i < 5 && !quick) return { mark: 'miss' }
      if (i < n && counted) return { ...c, badge: String(i + 1), badgeDelay: quick ? 0 : 900 + i * 400 }
      return c
    })} glow={n >= 5 ? [0] : []} glowDelay={quick ? 0 : 300} />
  }

  const sounds = (counted: boolean) => {
    if (n >= 5) {
      f.later(sfx.chime, 300)
      if (counted) for (let i = 5; i < n; i++) f.later(() => sfx.count(i + 1), 900 + (i - 5) * 500)
    } else if (counted) for (let i = 0; i < n; i++) f.later(() => sfx.count(i + 1), 900 + i * 400)
  }

  return (
    <>
      <div className="stage" key={f.run}>{picture}</div>
      {asking && (
        <Choices
          values={choices}
          answer={n}
          pulse={f.pulse ? n : undefined}
          onCorrect={() => { setHidden(false); f.solve(); sfx.right(); ctx.correct() }}
          onWrong={v => {
            ctx.wrong()
            setHidden(false)
            ctx.prompt(ctx.t.frameHint(n))
            const help = f.miss(v)
            if (help > 1) sounds(help > 2)
          }}
        />
      )}
    </>
  )
}
