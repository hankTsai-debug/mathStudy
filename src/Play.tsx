import { useMemo, useRef, useState, type ComponentType } from 'react'
import { ROUNDS, pick } from './game/logic'
import type { Strings } from './i18n'
import type { Level, LevelKind } from './islands'
import { CountLevel } from './levels/CountLevel'
import { FlashLevel } from './levels/FlashLevel'
import { LineLevel } from './levels/LineLevel'
import { MakeTenLevel } from './levels/MakeTenLevel'
import { TeenLevel } from './levels/TeenLevel'
import { QuizLevel } from './levels/QuizLevel'
import { useLater } from './levels/hooks'
import type { QuizKind } from './levels/quizConfig'
import type { LevelContext, LevelProps } from './levels/shared'

const CUSTOM: Partial<Record<LevelKind, ComponentType<LevelProps>>> = {
  count: CountLevel,
  line: LineLevel,
  flash: FlashLevel,
  makeTen: MakeTenLevel,
  teen: TeenLevel,
}

const NEXT_ROUND_MS = 1800

/** Runs ROUNDS rounds of one level and reports how many were right on the first try. */
export function Play({ level, t, prompt, say, onExit, onDone }: {
  level: Level
  t: Strings
  prompt: (text: string) => void
  say: (text: string) => void
  onExit: () => void
  onDone: (firstTry: number) => void
}) {
  const [round, setRound] = useState(0)
  const tries = useRef(0)
  const firstTry = useRef(0)
  const later = useLater()

  const ctx: LevelContext = useMemo(() => ({
    t, prompt, say,
    wrong: () => { tries.current++ },
    correct: () => {
      if (tries.current === 0) firstTry.current++
      prompt(pick(t.praise))
      later(() => {
        tries.current = 0
        if (round + 1 >= ROUNDS) onDone(firstTry.current)
        else setRound(round + 1)
      }, NEXT_ROUND_MS)
    },
  }), [t, prompt, say, later, round, onDone])

  const Custom = CUSTOM[level.kind]
  return (
    <section>
      <div className="topbar">
        <button className="btn" onClick={onExit} aria-label="back">←</button>
        <div className="progress">
          {Array.from({ length: ROUNDS }, (_, i) => <i key={i} className={i < round ? 'done' : ''} />)}
        </div>
      </div>
      {Custom
        ? <Custom key={round} round={round} ctx={ctx} />
        : <QuizLevel key={round} kind={level.kind as QuizKind} round={round} ctx={ctx} />}
    </section>
  )
}
