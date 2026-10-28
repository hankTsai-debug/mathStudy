import { useState } from 'react'
import { makeTenRound, options } from '../game/logic'
import { useOnMount } from './hooks'
import { Choices, TenFrame, type LevelProps } from './shared'

/** 湊十: how many more fill the ten-frame. On success the missing shells appear in a second colour. */
export function MakeTenLevel({ round, ctx }: LevelProps) {
  const [spec] = useState(() => makeTenRound(round))
  const [choices] = useState(() => options(spec.answer, 1, 9))
  const [solved, setSolved] = useState(false)

  useOnMount(() => ctx.prompt(ctx.t.makeTen(spec.n)))

  return (
    <>
      <div className="stage"><TenFrame filled={spec.n} extra={solved ? spec.answer : 0} /></div>
      <Choices
        values={choices}
        answer={spec.answer}
        onCorrect={() => { setSolved(true); ctx.correct() }}
        onWrong={() => { ctx.wrong(); ctx.prompt(ctx.t.makeTenHint) }}
      />
    </>
  )
}
