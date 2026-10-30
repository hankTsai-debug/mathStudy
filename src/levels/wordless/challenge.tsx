// 挑戰島, wordless: the change between terms tagged on arcs, a balance that tilts when the
// guess is wrong and levels when it is right, and chickens turning into rabbits two legs at a time.
import type { ReactNode } from 'react'
import type { Balance, Legs, Pattern } from '../../game/quizzes'
import { sfx } from '../../sound'
import { helpOf, type AnimBeat, type Helps, type Lessons, type Sounds } from './kit'
import { BalanceHelp, BalancePic, Barn, LegsHelp, PatternHelp, PatternRow, type Animal } from './ChallengePictures'

const red = (x: ReactNode) => <b className="eq-a">{x}</b>
const blue = (x: ReactNode) => <b className="eq-b">{x}</b>
const chime = (at: number): Sounds => [[at, sfx.chime]]
const gapNotes = (n: number, at: number, gap: number): Sounds => Array.from({ length: n }, (_, i) => [at + i * gap, () => sfx.count(i + 1)])
const chickens = (n: number, at: number, gap: number): Animal[] =>
  Array.from({ length: n }, (_, i) => ({ kind: 'chicken', tag: true, at: at + i * gap }))

const pattern: AnimBeat[] = [
  // 2, 5, 8, 11: +3 each time.
  {
    ms: 4400,
    show: <PatternRow terms={[2, 5, 8, 11]} popAt={0} gaps={{ at: 1400, gap: 700, count: 3, lastGap: 3 }} />,
    eq: <>{blue('+3')}  {blue('+3')}  {blue('+3')}</>,
    sounds: gapNotes(3, 1400, 700),
  },
  // +3 again: 14.
  {
    ms: 4000,
    show: <PatternRow terms={[2, 5, 8, 11]} gaps={{ at: 0, gap: 0, count: 4, lastGap: 3 }} last={{ value: 14, at: 1200 }} />,
    eq: <>11 {blue('+ 3')} = 14</>,
    sounds: [[0, () => sfx.count(4)], ...chime(1200)],
  },
  // +1, +2, +3, so +4 next: 11.
  {
    ms: 5200,
    show: <PatternRow terms={[1, 2, 4, 7]} popAt={0} gaps={{ at: 1400, gap: 700, count: 4, lastGap: 4 }} last={{ value: 11, at: 4000 }} />,
    eq: <>7 {blue('+ 4')} = 11</>,
    sounds: [...gapNotes(4, 1400, 700), ...chime(4000)],
  },
]

const balance: AnimBeat[] = [
  // The beam swings level: 3 apples weigh 12.
  {
    ms: 3800,
    show: <BalancePic fruit="🍎" copies={3} extra={0} total={12} settle />,
    eq: <>🍎🍎🍎 = 12</>,
    sounds: chime(1300),
  },
  // 12 split into 3: each apple is 4.
  {
    ms: 4400,
    show: <BalancePic fruit="🍎" copies={3} extra={0} total={12} piles={{ text: '4', at: 600, gap: 700 }} />,
    eq: <>12 ÷ {red(3)} = {blue(4)}</>,
    sounds: [[600, () => sfx.count(1)], [1300, () => sfx.count(2)], [2000, () => sfx.count(3)], ...chime(2400)],
  },
  // Take 4 off both sides; 2 apples weigh 10, so one is 5.
  {
    ms: 5400,
    show: <BalancePic fruit="🍎" copies={2} extra={4} total={14} take={700} piles={{ text: '5', at: 2000, gap: 700 }} />,
    eq: <>14 − 4 = 10, 10 ÷ {red(2)} = {blue(5)}</>,
    sounds: [[700, sfx.pop], [2000, () => sfx.count(1)], [2700, () => sfx.count(2)], ...chime(3100)],
  },
]

const legsLesson: AnimBeat[] = [
  // 5 heads, 14 legs; a chicken has 2 legs, a rabbit 4.
  {
    ms: 4200,
    show: <Barn heads={5} legs={14} countsAt={0} animals={[{ kind: 'chicken', tag: true, at: 1400 }, { kind: 'rabbit', tag: true, at: 2200 }]} />,
    sounds: [[1400, () => sfx.count(2)], [2200, () => sfx.count(4)]],
  },
  // All chickens: 5 × 2 = 10 legs; 4 legs are left over.
  {
    ms: 5000,
    show: <Barn heads={5} legs={14} animals={chickens(5, 200, 400)} feet={{ pairs: 2, at: 2800 }} />,
    eq: <>5 × 2 = 10, 14 − 10 = {blue(4)}</>,
    sounds: [...Array.from({ length: 5 }, (_, i): [number, () => void] => [200 + i * 400, () => sfx.count(i + 1)]), [2800, sfx.pop]],
  },
  // Each pair of legs turns a chicken into a rabbit: 2 rabbits, 3 chickens.
  {
    ms: 5000,
    show: <Barn heads={5} legs={14} animals={chickens(5, 0, 0).map((a, i) => (i < 2 ? { ...a, swap: 900 + i * 900 } : a))} feet={{ pairs: 2, at: 0, leave: 400, gap: 900 }} />,
    eq: <>4 ÷ 2 = {blue(2)}</>,
    sounds: [[900, () => sfx.count(1)], [1800, () => sfx.count(2)], ...chime(2400)],
  },
]

export const lessons: Lessons = { pattern, balance, legs: legsLesson }
export const help: Helps = {
  pattern: helpOf<Pattern>(PatternHelp),
  balance: helpOf<Balance>(BalanceHelp),
  legs: helpOf<Legs>(LegsHelp),
}
