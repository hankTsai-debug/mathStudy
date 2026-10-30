// 十的海灣 practice with wordless feedback. A wrong answer is first shown, not told:
// rings mark what the chosen number covers, gaps blink, extra rings spill over.
// A second miss plays the strategy (count the gaps, make the ten, take away to ten);
// a third also counts it out and pulses the right choice.
import { useState, type ReactNode } from 'react'
import { makeTenRound, options, teenRound } from '../game/logic'
import { add20 } from '../game/quizzes'
import { sfx } from '../sound'
import { useFeedback, useOnMount } from './hooks'
import { Choices, type LevelProps } from './shared'
import { GuideFrames, type FrameCell } from './visuals'

const cells = (n: number, f: (i: number) => FrameCell) => Array.from({ length: n }, (_, i) => f(i))

/**
 * Marks for "you chose `chose`": rings on the first `chose` of `order` (the cells to count, in
 * counting order), blinking gaps for what was left out, and the extra spilling past the frames.
 */
function markChoice(base: FrameCell[], order: number[], chose: number) {
  const out = base.map(c => ({ ...c }))
  order.forEach((cell, j) => { out[cell].mark = j < chose ? 'ring' : 'miss' })
  return { cells: out, overflow: Math.max(0, chose - order.length) }
}

const stagger = (items: number[], start: number, gap: number, f: (cell: number, j: number, at: number) => void) =>
  items.forEach((cell, j) => f(cell, j, start + j * gap))

function Stage({ answer, run, children }: { answer: number; run: number; children: ReactNode }) {
  return (
    // data-answer exists only in dev builds, for the end-to-end check.
    <div className="stage quiz bay" key={run} data-answer={import.meta.env.DEV ? String(answer) : undefined}>{children}</div>
  )
}

/** 湊十: how many more fill the frame. */
export function BayMakeTen({ round, ctx }: LevelProps) {
  const [spec] = useState(() => makeTenRound(round))
  const [choices] = useState(() => options(spec.answer, 1, 9))
  const f = useFeedback()
  const gaps = Array.from({ length: spec.answer }, (_, j) => spec.n + j)

  useOnMount(() => ctx.prompt(ctx.t.makeTen(spec.n)))

  const base = cells(10, i => (i < spec.n ? { dot: 'a' } : {}))
  let picture = <GuideFrames cells={base} />
  if (f.fb.mode === 'wrong') {
    const { cells: c, overflow } = markChoice(base, gaps, f.fb.chose as number)
    picture = <GuideFrames cells={c} overflow={overflow} />
  } else if (f.fb.mode === 'strategy' || f.fb.mode === 'reveal') {
    // Count the gaps one by one.
    const c = base.map(x => ({ ...x }))
    stagger(gaps, 200, 500, (cell, j, at) => { c[cell] = { badge: String(j + 1), badgeDelay: at } })
    picture = <GuideFrames cells={c} />
  } else if (f.fb.mode === 'solved') {
    const c = base.map(x => ({ ...x }))
    stagger(gaps, 0, 150, (cell, _j, at) => { c[cell] = { dot: 'b', anim: 'arrive', delay: at } })
    picture = <GuideFrames cells={c} glow={[0]} glowDelay={gaps.length * 150 + 200} />
  }

  return (
    <>
      <Stage answer={spec.answer} run={f.run}>{picture}</Stage>
      <Choices
        values={choices}
        answer={spec.answer}
        pulse={f.pulse ? spec.answer : undefined}
        onCorrect={() => {
          f.solve()
          f.later(sfx.chime, gaps.length * 150 + 200)
          ctx.correct()
        }}
        onWrong={v => {
          ctx.wrong()
          ctx.prompt(ctx.t.makeTenHint)
          if (f.miss(v as number) > 1) gaps.forEach((_, j) => f.later(() => sfx.count(j + 1), 200 + j * 500))
        }}
      />
    </>
  )
}

/** 十和幾: a full frame and k more. */
export function BayTeen({ round, ctx }: LevelProps) {
  const [spec] = useState(() => teenRound(round))
  const [choices] = useState(() => options(spec.answer, 11, 19))
  const f = useFeedback()
  const ones = Array.from({ length: spec.k }, (_, j) => 10 + j)

  useOnMount(() => ctx.prompt(ctx.t.teen))

  const base = cells(20, i => (i < 10 ? { dot: 'a' } : i < 10 + spec.k ? { dot: 'b' } : {}))
  let picture = <GuideFrames cells={base} />
  if (f.fb.mode === 'wrong') {
    const { cells: c, overflow } = markChoice(base, [...Array(10).keys(), ...ones], f.fb.chose as number)
    picture = <GuideFrames cells={c} overflow={overflow} />
  } else if (f.fb.mode === 'strategy') {
    picture = <GuideFrames cells={base} glow={[0]} glowDelay={100} labels={['10']} />
  } else if (f.fb.mode === 'reveal' || f.fb.mode === 'solved') {
    // A full frame is 10; count on along the second frame.
    const c = base.map(x => ({ ...x }))
    stagger(ones, 900, 500, (cell, j, at) => { c[cell] = { dot: 'b', badge: String(11 + j), badgeDelay: at } })
    picture = <GuideFrames cells={c} glow={[0]} glowDelay={100} labels={['10']} />
  }

  const countOn = () => ones.forEach((_, j) => f.later(() => sfx.count(11 + j), 900 + j * 500))
  return (
    <>
      <Stage answer={spec.answer} run={f.run}>{picture}</Stage>
      <Choices
        values={choices}
        answer={spec.answer}
        pulse={f.pulse ? spec.answer : undefined}
        onCorrect={() => { f.solve(); countOn(); ctx.correct() }}
        onWrong={v => {
          ctx.wrong()
          ctx.prompt(ctx.t.teenHint)
          const help = f.miss(v as number)
          if (help > 1) f.later(sfx.chime, 100)
          if (help > 2) countOn()
        }}
      />
    </>
  )
}

/** 開船加減: within 10, then crossing ten by making ten, then taking away to ten. */
export function BayAdd20({ round, ctx }: LevelProps) {
  const [quiz] = useState(() => add20(round))
  const { a, b, op } = quiz.data
  const answer = quiz.answer as number
  const f = useFeedback()

  useOnMount(() => ctx.prompt(ctx.t.quiz.add20.prompt(quiz.data)))

  // Where the dots sit. Adding: red in the first frame, blue after them (spilling into the second
  // frame only when the sum passes 10). Taking away: a dots, the last b of them crossed out.
  const crosses = op === '+' && a + b > 10
  const blue = op === '+' ? Array.from({ length: b }, (_, j) => (crosses ? 10 + j : a + j)) : []
  const all = op === '+' ? [...Array(a).keys(), ...blue] : [...Array(a).keys()]
  const kept = op === '+' ? all : all.slice(0, a - b)
  const taken = op === '+' ? [] : all.slice(a - b)
  const base = cells(20, i => i < a ? { dot: 'a' } : blue.includes(i) ? { dot: 'b' } : {})
  taken.forEach(i => { base[i] = { dot: 'a', crossed: true } })

  const strategy = () => {
    const c = base.map(x => ({ ...x }))
    let glow = 0
    if (crosses) {
      // Make ten: the last blue dots fly up into the first frame's gaps.
      const need = 10 - a
      stagger(blue.slice(b - need).reverse(), 300, 600, (cell, _j, at) => { c[cell] = { dot: 'b', anim: 'leave', delay: at } })
      stagger(Array.from({ length: need }, (_, j) => a + j), 300, 600, (cell, j, at) => {
        c[cell] = { dot: 'b', anim: 'arrive', delay: at, badge: String(a + j + 1), badgeDelay: at }
      })
      glow = 300 + need * 600
    } else if (op === '-') {
      // Take away to ten first: the crossed dots in the second frame go, then those in the first.
      stagger([...taken].reverse(), 300, 500, (cell, _j, at) => { c[cell] = { dot: 'a', crossed: true, anim: 'leave', delay: at } })
    } else {
      // Within ten: count on from the red dots along the blue ones.
      stagger(blue, 300, 500, (cell, j, at) => { c[cell] = { dot: 'b', badge: String(a + j + 1), badgeDelay: at } })
    }
    return { c, glow }
  }

  let picture = <GuideFrames cells={base} />
  if (f.fb.mode === 'wrong') {
    const { cells: c, overflow } = markChoice(base, kept, f.fb.chose as number)
    picture = <GuideFrames cells={c} overflow={overflow} />
  } else if (f.fb.mode !== 'idle') {
    const { c, glow } = strategy()
    if (f.fb.mode === 'reveal' || f.fb.mode === 'solved') {
      // Then count what is there, 1, 2, 3… (or on from 10 after making ten).
      const settled = crosses ? [...Array(10).keys(), ...blue.slice(0, b - (10 - a))] : kept
      const start = crosses ? 10 : 0
      // (Within ten, the strategy already counted on.)
      if (crosses || op === '-') stagger(settled.slice(start), 300 + Math.max(glow, taken.length * 500) + 300, 400, (cell, j, at) => {
        c[cell] = { ...c[cell], badge: String(start + j + 1), badgeDelay: at }
      })
    }
    picture = <GuideFrames cells={c} glow={glow ? [0] : []} glowDelay={glow} labels={crosses ? ['10'] : []} />
  }

  const sounds = () => {
    if (crosses) {
      Array.from({ length: 10 - a }, (_, j) => f.later(() => sfx.count(a + j + 1), 300 + j * 600))
      f.later(sfx.chime, 300 + (10 - a) * 600)
    } else if (op === '-') taken.forEach((_, j) => f.later(sfx.pop, 300 + j * 500))
    else blue.forEach((_, j) => f.later(() => sfx.count(a + j + 1), 300 + j * 500))
  }
  return (
    <>
      <Stage answer={answer} run={f.run}>
        <div className="equation">{a} {op === '+' ? '+' : '−'} {b} = {f.fb.mode === 'solved' ? answer : '?'}</div>
        {picture}
      </Stage>
      <Choices
        values={quiz.choices}
        answer={answer}
        pulse={f.pulse ? answer : undefined}
        onCorrect={() => { f.solve(); sounds(); ctx.correct() }}
        onWrong={v => {
          ctx.wrong()
          ctx.prompt(ctx.t.quiz.add20.hint(quiz.data))
          if (f.miss(v as number) > 1) sounds()
        }}
      />
    </>
  )
}
