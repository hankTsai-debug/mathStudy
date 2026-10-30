// 大數港口, wordless: place values tagged under big numbers, area counted in rows and perimeter
// traced around the sides, tenths tagged along a bar. A wrong answer is drawn in the level's own
// units (the chosen value's digits under their columns, cells or edge marks, outlined bar parts).
import type { ReactNode } from 'react'
import type { Area, Decimal, DigitValue } from '../../game/quizzes'
import { sfx } from '../../sound'
import { counts, helpOf, type AnimBeat, type Helps, type Lessons, type Sounds } from './kit'
import { AreaHelp, AreaPic, Bars, BigPlaceHelp, DecimalHelp, PlaceNum } from './PortPictures'

const red = (x: ReactNode) => <b className="eq-a">{x}</b>
const blue = (x: ReactNode) => <b className="eq-b">{x}</b>
const zeroSounds = (value: number, at: number, gap: number): Sounds => [
  ...String(value).split('').map((_, j): [number, () => void] => [at + j * gap, sfx.pop]),
  [at + String(value).length * gap, sfx.chime],
]
const tenths = (k: number) => Array.from({ length: k }, (_, i) => `0.${i + 1}`)

const bigPlace: AnimBeat[] = [
  // Places right to left: 1, 10, 100, 1000, 10000.
  {
    ms: 4200,
    show: <PlaceNum n={45231} place={-1} tagsAt={300} tagGap={500} />,
    sounds: counts(1, 5, 300, 500),
  },
  // The 5 is in the thousands: 5, then zeros up to its column, 5,000.
  {
    ms: 4400,
    show: <PlaceNum n={45231} place={3} tagsAt={0} tagGap={0} hiAt={200} row={{ value: 5000, at: 900, gap: 450 }} />,
    eq: blue('5,000'),
    sounds: zeroSounds(5000, 900, 450),
  },
  {
    ms: 4400,
    show: <PlaceNum n={45231} place={4} tagsAt={0} tagGap={0} hiAt={200} row={{ value: 40000, at: 900, gap: 450 }} />,
    eq: blue('40,000'),
    sounds: zeroSounds(40000, 900, 450),
  },
]

const area: AnimBeat[] = [
  // One square is 1; the inside fills square by square: 12.
  {
    ms: 4400,
    show: <AreaPic w={4} h={3} show={{ cells: { n: 12, at: 300, gap: 250, nums: true } }} />,
    eq: blue(12),
    sounds: [...counts(1, 12, 300, 250), [3400, sfx.chime]],
  },
  // 3 rows of 4: 4, 8, 12.
  {
    ms: 4400,
    show: <AreaPic w={4} h={3} show={{ cells: { n: 12, at: 0, gap: 0 }, rows: { at: 300, gap: 800 }, rowTotals: { at: 300, gap: 800 } }} />,
    eq: <>{red(3)} × {blue(4)} = 12</>,
    sounds: [...counts(4, 3, 300, 800), [2800, sfx.chime]],
  },
  // Around the outside: 4, 7, 11, 14.
  {
    ms: 5000,
    show: <AreaPic w={4} h={3} show={{ sides: { at: 300, gap: 800, running: true } }} />,
    eq: <>4 + 3 + 4 + 3 = 14</>,
    sounds: [...counts(1, 4, 300, 800), [3600, sfx.chime]],
  },
]

const decimal: AnimBeat[] = [
  {
    ms: 3800,
    show: <Bars bars={[{ on: 10, at: 200, gap: 120, label: { text: '1', at: 1600 } }]} />,
    eq: red(1),
    sounds: [...counts(1, 10, 200, 120), [1600, sfx.chime]],
  },
  // Cut into 10; one part is 0.1.
  {
    ms: 4000,
    show: <Bars bars={[{ on: 1, at: 800, tags: { texts: ['0.1'], at: 1200, gap: 0 } }]} />,
    eq: blue('0.1'),
    sounds: [[800, sfx.pop], [1200, () => sfx.count(1)]],
  },
  // A whole bar and 3 parts: 1.3.
  {
    ms: 4600,
    show: <Bars bars={[{ on: 10, label: { text: '1', at: 200 } }, { on: 3, at: 800, gap: 600, tags: { texts: tenths(3), at: 800, gap: 600 } }]} />,
    eq: <>{red(1)}.{blue(3)}</>,
    sounds: [[200, () => sfx.count(1)], ...counts(1, 3, 800, 600), [2800, sfx.chime]],
  },
]

export const lessons: Lessons = { bigPlace, area, decimal }
export const help: Helps = {
  bigPlace: helpOf<DigitValue>(BigPlaceHelp),
  area: helpOf<Area>(AreaHelp),
  decimal: helpOf<Decimal>(DecimalHelp),
}
