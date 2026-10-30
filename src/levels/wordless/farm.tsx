// 乘法農場 without words: rows and groups light up one at a time with running totals (skip
// counting), and carrots are dealt one round at a time until every rabbit has the same.
import type { ReactNode } from 'react'
import type { ArrayQ, Share, Times } from '../../game/quizzes'
import { sfx } from '../../sound'
import { helpOf, type AnimBeat, type Helps, type Lessons, type Sounds } from './kit'
import { ArrayHelp, Deal, Groups, Rows, ShareHelp, TimesHelp } from './FarmPictures'

const ab = (a: ReactNode, b: ReactNode, rest: ReactNode, op = '×') =>
  <><span className="eq-a">{a}</span> {op} <span className="eq-b">{b}</span> = {rest}</>
const chime = (at: number): [number, () => void] => [at, sfx.chime]
const steps = (n: number, start: number, gap: number): Sounds =>
  Array.from({ length: n }, (_, j) => [start + j * gap, () => sfx.count(j + 1)])
const pops = (n: number, start: number, gap: number): Sounds => Array.from({ length: n }, (_, k) => [start + k * gap, sfx.pop])
const timesEq = (a: number, b: number, answer: ReactNode) => <div className="equation">{ab(a, b, answer)}</div>

const array: AnimBeat[] = [
  // 3 rows of 4 grow, row by row.
  { ms: 3400, show: <Rows rows={3} cols={4} popAt={0} />, sounds: [[0, sfx.pop], [600, sfx.pop], [1200, sfx.pop]] },
  // Count row by row: 4, 8, 12.
  { ms: 4000, show: <Rows rows={3} cols={4} litAt={400} />, sounds: steps(3, 400, 900) },
  { ms: 4200, show: <Rows rows={3} cols={4} litAt={0} gap={0} />, eq: ab(3, 4, 12), sounds: [chime(300)] },
]

const times: AnimBeat[] = [
  // 3 groups of 5.
  {
    ms: 3400,
    show: <div className="frames">{timesEq(3, 5, '?')}<Groups a={3} b={5} popAt={0} /></div>,
    sounds: [[0, sfx.pop], [600, sfx.pop], [1200, sfx.pop]],
  },
  // Count group by group: 5, 10, 15.
  { ms: 4000, show: <div className="frames">{timesEq(3, 5, '?')}<Groups a={3} b={5} litAt={400} /></div>, sounds: steps(3, 400, 900) },
  { ms: 4200, show: <div className="frames">{timesEq(3, 5, 15)}<Groups a={3} b={5} litAt={0} gap={0} /></div>, sounds: [chime(300)] },
]

const share: AnimBeat[] = [
  // 12 carrots, 3 rabbits.
  { ms: 3000, show: <Deal total={12} groups={3} rounds={0} popAt={200} />, sounds: [[200, sfx.pop]] },
  // Deal one each, round after round, until they're gone.
  { ms: 5000, show: <Deal total={12} groups={3} rounds={4} start={300} gap={300} />, sounds: pops(12, 300, 300) },
  {
    ms: 4400,
    show: <Deal total={12} groups={3} rounds={4} start={0} gap={0} tags />,
    eq: ab(12, 3, 4, '÷'),
    sounds: [chime(300)],
  },
]

export const lessons: Lessons = { array, times, share }
export const help: Helps = {
  array: helpOf<ArrayQ>(ArrayHelp),
  times: helpOf<Times>(TimesHelp),
  share: helpOf<Share>(ShareHelp),
}
