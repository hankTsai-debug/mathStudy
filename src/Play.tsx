import { useMemo, useRef, useState, type ComponentType } from 'react'
import { ROUNDS, pick } from './game/logic'
import type { Strings } from './i18n'
import type { Level, LevelKind } from './islands'
import { AnimLesson } from './levels/AnimLesson'
import { ANIM_LESSONS } from './levels/animLessons'
import { BayAdd20, BayMakeTen, BayTeen } from './levels/BayLevels'
import { CountLevel } from './levels/CountLevel'
import { FlashLevel } from './levels/FlashLevel'
import { LineLevel } from './levels/LineLevel'
import { QuizLevel } from './levels/QuizLevel'
import { useLater } from './levels/hooks'
import { Guided } from './levels/Guided'
import { Lesson } from './levels/Lesson'
import type { QuizKind } from './levels/quizConfig'
import type { LevelContext, LevelProps } from './levels/shared'

const CUSTOM: Partial<Record<LevelKind, ComponentType<LevelProps>>> = {
  count: CountLevel,
  line: LineLevel,
  flash: FlashLevel,
  // 十的海灣: wordless feedback (see BayLevels).
  makeTen: BayMakeTen,
  teen: BayTeen,
  add20: BayAdd20,
}

const NEXT_ROUND_MS = 1800

/**
 * Teaches the level (first visit, or on request): a worked example, then one problem done together
 * where the level has one. Then runs ROUNDS rounds and reports how many were right on the first try.
 */
export function Play({ level, firstVisit, t, prompt, say, onExit, onDone }: {
  level: Level
  firstVisit: boolean
  t: Strings
  prompt: (text: string) => void
  say: (text: string) => void
  onExit: () => void
  onDone: (firstTry: number) => void
}) {
  const [round, setRound] = useState(0)
  const [phase, setPhase] = useState<'learn' | 'guide' | 'practice'>(firstVisit ? 'learn' : 'practice')
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
        {phase !== 'practice'
          ? <h2>{phase === 'learn' ? t.learnTitle : t.guideTitle}</h2>
          : <>
            <div className="progress">
              {Array.from({ length: ROUNDS }, (_, i) => <i key={i} className={i < round ? 'done' : ''} />)}
            </div>
            <button className="btn" onClick={() => setPhase('learn')} aria-label="lesson">📖</button>
          </>}
      </div>
      {phase === 'learn' && (ANIM_LESSONS[level.kind]
        ? <AnimLesson kind={level.kind} beats={ANIM_LESSONS[level.kind]!} t={t} prompt={prompt} onDone={() => setPhase('guide')} />
        : <Lesson kind={level.kind} t={t} prompt={prompt} onDone={() => setPhase('guide')} />)}
      {phase === 'guide' && <Guided kind={level.kind} t={t} prompt={prompt} say={say} onDone={() => setPhase('practice')} />}
      {phase === 'practice' && (Custom
        ? <Custom key={round} round={round} ctx={ctx} />
        : <QuizLevel key={round} kind={level.kind as QuizKind} round={round} ctx={ctx} />)}
    </section>
  )
}
