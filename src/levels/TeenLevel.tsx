import { useState } from 'react'
import { options, teenRound } from '../game/logic'
import { useOnMount } from './hooks'
import { Choices, TenFrame, type LevelProps } from './shared'

/** 十和幾: a full ten-frame plus k more, read as 1 ten and k ones (11–19). */
export function TeenLevel({ round, ctx }: LevelProps) {
  const [spec] = useState(() => teenRound(round))
  const [choices] = useState(() => options(spec.answer, 11, 19))

  useOnMount(() => ctx.prompt(ctx.t.teen))

  return (
    <>
      <div className="stage frames">
        <TenFrame filled={10} />
        <TenFrame filled={spec.k} />
      </div>
      <Choices
        values={choices}
        answer={spec.answer}
        onCorrect={ctx.correct}
        onWrong={() => { ctx.wrong(); ctx.prompt(ctx.t.teenHint) }}
      />
    </>
  )
}
