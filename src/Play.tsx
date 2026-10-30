import { useMemo, useRef, useState, type ComponentType } from 'react'
import { ROUNDS, afterRound, pick, type Run } from './game/logic'
import { ADVENTURE } from './adventure'
import type { Lang, Strings } from './i18n'
import type { Level, LevelKind } from './islands'
import { AnimLesson } from './levels/AnimLesson'
import { ANIM_LESSONS } from './levels/wordless'
import { BayAdd20, BayMakeTen, BayTeen } from './levels/BayLevels'
import { CountLevel } from './levels/CountLevel'
import { FlashLevel } from './levels/FlashLevel'
import { LineLevel } from './levels/LineLevel'
import { QuizLevel } from './levels/QuizLevel'
import { Ponder, Recap } from './Ponder'
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
 * Teaches the level (first visit, or on request): on a first visit a question to think about first, then a worked example, then one problem done together
 * where the level has one. Then practice adapts: a first-try answer moves up a step in difficulty, a miss
 * repeats the step (see afterRound). Once, partway through, a round from an earlier island comes back for review.
 */
export function Play({ level, review, firstVisit, lang, t, prompt, say, onExit, onDone }: {
  level: Level
  /** A level from an earlier island to bring back for one round, if any. */
  review?: Level
  firstVisit: boolean
  lang: Lang
  t: Strings
  prompt: (text: string) => void
  say: (text: string) => void
  onExit: () => void
  onDone: (firstTry: number, misses: number) => void
}) {
  const [run, setRun] = useState<Run>({ step: 0, rounds: 0, misses: 0 })
  const [reviewing, setReviewing] = useState<'later' | 'now' | 'done'>(review ? 'later' : 'done')
  const [phase, setPhase] = useState<'ponder' | 'learn' | 'recap' | 'guide' | 'practice'>(firstVisit ? 'ponder' : 'practice')
  // The "think first" guess, checked after the lesson; undefined when the question wasn't asked.
  const [guess, setGuess] = useState<string | null | undefined>(undefined)
  const tries = useRef(0)
  const firstTry = useRef(0)
  const later = useLater()

  const ctx: LevelContext = useMemo(() => ({
    t, prompt, say,
    wrong: () => { tries.current++ },
    correct: () => {
      prompt(pick(t.praise))
      const ok = tries.current === 0
      tries.current = 0
      // A review round is practice only: it doesn't move the level on or count against it.
      if (reviewing === 'now') return later(() => setReviewing('done'), NEXT_ROUND_MS)
      if (ok) firstTry.current++
      const next = afterRound(run, ok)
      later(() => {
        if (next.done) return onDone(firstTry.current, next.misses)
        setRun(next)
        if (reviewing === 'later' && next.step === 2) setReviewing('now')
      }, NEXT_ROUND_MS)
    },
  }), [t, prompt, say, later, run, reviewing, onDone])

  const afterLesson = () => setPhase(guess === undefined ? 'guide' : 'recap')
  return (
    <section>
      <div className="topbar">
        <button className="btn" onClick={onExit} aria-label="back">←</button>
        {phase !== 'practice'
          ? <h2>{{ ponder: ADVENTURE[lang].ponderTitle, learn: t.learnTitle, recap: ADVENTURE[lang].recapTitle, guide: t.guideTitle }[phase]}</h2>
          : <>
            <div className="progress">
              {Array.from({ length: ROUNDS }, (_, i) => <i key={i} className={i < run.step ? 'done' : ''} />)}
            </div>
            <button className="btn" onClick={() => setPhase('learn')} aria-label="lesson">📖</button>
          </>}
      </div>
      {phase === 'ponder' && <Ponder level={level.id} lang={lang} prompt={prompt} onDone={g => { setGuess(g); setPhase('learn') }} />}
      {phase === 'learn' && (ANIM_LESSONS[level.kind]
        ? <AnimLesson kind={level.kind} beats={ANIM_LESSONS[level.kind]!} t={t} prompt={prompt} onDone={afterLesson} />
        : <Lesson kind={level.kind} t={t} prompt={prompt} onDone={afterLesson} />)}
      {phase === 'recap' && <Recap level={level.id} lang={lang} guess={guess ?? null} prompt={prompt} onDone={() => { setGuess(undefined); setPhase('guide') }} />}
      {phase === 'guide' && <Guided kind={level.kind} t={t} prompt={prompt} say={say} onDone={() => setPhase('practice')} />}
      {phase === 'practice' && (review && reviewing === 'now'
        ? <>
          <p className="review-tag">🔁 {t.reviewTag} {t.levels[review.id].name}</p>
          <Round key="review" kind={review.kind} round={2} ctx={ctx} />
        </>
        : <Round key={run.rounds} kind={level.kind} round={Math.min(run.step, ROUNDS - 1)} ctx={ctx} />)}
    </section>
  )
}

/** One round of a level of any kind. */
function Round({ kind, round, ctx }: { kind: LevelKind; round: number; ctx: LevelContext }) {
  const Custom = CUSTOM[kind]
  return Custom ? <Custom round={round} ctx={ctx} /> : <QuizLevel kind={kind as QuizKind} round={round} ctx={ctx} />
}
