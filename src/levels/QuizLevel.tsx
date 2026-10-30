import { useState } from 'react'
import { useFeedback, useOnMount } from './hooks'
import { QUIZZES, type QuizKind } from './quizConfig'
import { Choices, type LevelProps } from './shared'
import { HELP } from './wordless'

/**
 * A choice-based round: the level's visual, a spoken prompt, and choices. A miss shows a hint and,
 * where the level has wordless help, a picture that gives more help with each miss.
 */
export function QuizLevel({ kind, round, ctx }: LevelProps & { kind: QuizKind }) {
  const { make, Visual, text, label } = QUIZZES[kind]
  const Help = HELP[kind]
  const [quiz] = useState(() => make(round))
  const f = useFeedback()
  const words = text(ctx.t)

  useOnMount(() => ctx.prompt(words.prompt(quiz.data)))

  return (
    <>
      {/* data-answer exists only in dev builds, for the end-to-end check. */}
      <div className="stage quiz" key={f.run} data-answer={import.meta.env.DEV ? String(quiz.answer) : undefined}>
        {Help && f.fb.mode !== 'idle'
          ? <Help data={quiz.data} mode={f.fb.mode} chose={f.fb.chose} />
          : <Visual data={quiz.data} solved={f.fb.mode === 'solved'} />}
      </div>
      <Choices
        values={quiz.choices}
        answer={quiz.answer}
        label={label && (v => label(v, ctx.t))}
        pulse={f.pulse ? quiz.answer : undefined}
        onCorrect={() => { f.solve(); ctx.correct() }}
        onWrong={v => { ctx.wrong(); ctx.prompt(words.hint(quiz.data)); f.miss(v) }}
      />
    </>
  )
}
