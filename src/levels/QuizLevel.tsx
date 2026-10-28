import { useState } from 'react'
import { useOnMount } from './hooks'
import { QUIZZES, type QuizKind } from './quizConfig'
import { Choices, type LevelProps } from './shared'

/** A choice-based round: the level's visual, a spoken prompt, choices, and a strategy hint on a miss. */
export function QuizLevel({ kind, round, ctx }: LevelProps & { kind: QuizKind }) {
  const { make, Visual, text, label } = QUIZZES[kind]
  const [quiz] = useState(() => make(round))
  const [solved, setSolved] = useState(false)
  const words = text(ctx.t)

  useOnMount(() => ctx.prompt(words.prompt(quiz.data)))

  return (
    <>
      {/* data-answer exists only in dev builds, for the end-to-end check. */}
      <div className="stage quiz" data-answer={import.meta.env.DEV ? String(quiz.answer) : undefined}>
        <Visual data={quiz.data} solved={solved} />
      </div>
      <Choices
        values={quiz.choices}
        answer={quiz.answer}
        label={label && (v => label(v, ctx.t))}
        onCorrect={() => { setSolved(true); ctx.correct() }}
        onWrong={() => { ctx.wrong(); ctx.prompt(words.hint(quiz.data)) }}
      />
    </>
  )
}
