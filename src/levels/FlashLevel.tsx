import { useState } from 'react'
import { flashRound, options } from '../game/logic'
import { useLater, useOnMount } from './hooks'
import { Choices, TenFrame, type LevelProps } from './shared'

const SHOW_MS = 1800

/** 十格框快看: dots flash on a ten-frame, then hide, so the child reads the 5-and-n structure. */
export function FlashLevel({ round, ctx }: LevelProps) {
  const [spec] = useState(() => flashRound(round))
  const [choices] = useState(() => options(spec.n, 1, 10))
  const [hidden, setHidden] = useState(false)
  const [asking, setAsking] = useState(false)
  const later = useLater()

  useOnMount(() => {
    ctx.prompt(ctx.t.look)
    later(() => { setHidden(true); setAsking(true); ctx.prompt(ctx.t.howManyDots) }, SHOW_MS)
  })

  return (
    <>
      <div className="stage"><TenFrame filled={spec.n} hidden={hidden} /></div>
      {asking && (
        <Choices
          values={choices}
          answer={spec.n}
          onCorrect={() => { setHidden(false); ctx.correct() }}
          onWrong={() => { ctx.wrong(); setHidden(false); ctx.prompt(ctx.t.frameHint(spec.n)) }}
        />
      )}
    </>
  )
}
