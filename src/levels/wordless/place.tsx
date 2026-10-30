// 位值山谷's wordless lessons and help: blocks sorted into hundreds, tens and ones that light up
// as they are counted, digits that show their blocks, and column sums worked a column at a time.
import type { ReactNode } from 'react'
import type { Blocks, Column, DigitValue } from '../../game/quizzes'
import { sfx } from '../../sound'
import { counts, delay, helpOf, type AnimBeat, type Helps, type Lessons } from './kit'
import { BlocksHelp, ColSum, ColumnHelp, DigitHelp, PV, PlaceSum, Places, Ticker } from './PlacePictures'
import { ORDER, WORTH, countTimes, litSounds, split, type Place } from './placeMath'

/* ---------- lessons ---------- */

const eq = (x: ReactNode, at: number) => <div className="pv-eq a-pop" style={delay(at)}>{x}</div>

const blocks: AnimBeat[] = [
  // One cube.
  {
    ms: 2600,
    show: <div className="join big"><i className="cube a-pop" style={delay(200)} /></div>,
    eq: '1',
    sounds: [[200, () => sfx.count(1)]],
  },
  // 10 cubes stack up… and are a rod.
  {
    ms: 4400,
    show: (
      <div className="pv-wrap">
        <div className="join big">
          <div className="stack">{Array.from({ length: 10 }, (_, i) => <i key={i} className="cube a-pop" style={delay(i * 180)} />)}</div>
          <span className="a-pop" style={delay(2100)}>=</span>
          <i className="rod a-pop a-glow" style={delay(2300)} />
        </div>
        {eq('10', 2600)}
      </div>
    ),
    sounds: [...counts(1, 10, 0, 180), [2300, sfx.chime]],
  },
  // 10 rods side by side… and are a flat.
  {
    ms: 4400,
    show: (
      <div className="pv-wrap">
        <div className="join">
          <div className="row-rods">{Array.from({ length: 10 }, (_, i) => <i key={i} className="rod a-pop" style={delay(i * 180)} />)}</div>
          <span className="a-pop" style={delay(2100)}>=</span>
          <i className="flat a-pop" style={delay(2300)} />
        </div>
        {eq('100', 2600)}
      </div>
    ),
    sounds: [...counts(1, 10, 0, 180), [2300, sfx.chime]],
  },
  // 2 flats, 3 rods, 4 cubes, counted place by place: 200 + 30 + 4 = 234.
  (() => {
    const d = split(234)
    const { at, end } = countTimes(d, ORDER, 300, 420)
    const slots: Partial<Record<Place, ReactNode>> = {}
    for (const p of ORDER) slots[p] = <Ticker values={at[p].map((_, i) => (i + 1) * WORTH[p])} at={at[p]} />
    return {
      ms: end + 2400,
      show: <div className="pv-wrap"><PV n={d} places={ORDER} lit={at} slots={slots} /><PlaceSum n={234} places={ORDER} at={end} /></div>,
      sounds: [...litSounds(at, ORDER), [end, sfx.chime]],
    }
  })(),
]

const digit: AnimBeat[] = [
  // The ones digit: 2 cubes, worth 2.
  {
    ms: 3400,
    show: <Places n={352} hi={{ place: 0, at: 200 }} blocks={[{ place: 0, at: 700, gap: 300 }]} under={{ text: '2', cls: 'c-o', at: 1500 }} />,
    sounds: counts(1, 2, 700, 300),
  },
  // The tens digit: 5 rods, worth 50.
  {
    ms: 4000,
    show: <Places n={352} hi={{ place: 1, at: 200 }} blocks={[{ place: 1, at: 700, gap: 300 }]} under={{ text: '50', cls: 'c-t', at: 2400 }} />,
    sounds: counts(1, 5, 700, 300),
  },
  // The hundreds digit: 3 flats, worth 300.
  {
    ms: 3800,
    show: <Places n={352} hi={{ place: 2, at: 200 }} blocks={[{ place: 2, at: 700, gap: 350 }]} under={{ text: '300', cls: 'c-h', at: 2000 }} />,
    sounds: counts(1, 3, 700, 350),
  },
  // 352 = 300 + 50 + 2.
  {
    ms: 4200,
    show: (
      <div className="pv-wrap">
        <Places n={352} blocks={[0, 1, 2].map(place => ({ place, at: 0, gap: 0 }))} />
        <PlaceSum n={352} places={ORDER} at={500} />
      </div>
    ),
    sounds: [[500, sfx.chime]],
  },
]

const column: AnimBeat[] = [
  // Ones under ones, tens under tens; start with the ones.
  {
    ms: 3200,
    show: <ColSum a={27} b={15} op="+" bands={[{ col: 'o', at: 900 }]} />,
    sounds: [[900, sfx.pop]],
  },
  // 7 + 5 = 12: write 2, carry 1.
  {
    ms: 4200,
    show: <ColSum a={27} b={15} op="+" bands={[{ col: 'o', at: 0 }]} res={{ o: { v: '2', at: 900 } }} carry={1700} />,
    eq: <><span className="c-o">7 + 5</span> = 1<span className="c-o">2</span></>,
    sounds: [[900, sfx.pop], [1700, sfx.pop]],
  },
  // 2 + 1 + the carried 1 = 4: 42.
  {
    ms: 4000,
    show: <ColSum a={27} b={15} op="+" bands={[{ col: 't', at: 0 }]} res={{ o: { v: '2', at: 0 }, t: { v: '4', at: 1000 } }} carry={0} />,
    eq: <><span className="c-t">2 + 1</span> + <span className="eq-a">1</span> = 4</>,
    sounds: [[1000, sfx.chime]],
  },
  // 42 − 15: borrow a ten, 12 − 5 = 7.
  {
    ms: 4600,
    show: <ColSum a={42} b={15} op="-" bands={[{ col: 'o', at: 0 }]} borrow={900} res={{ o: { v: '7', at: 2100 } }} />,
    eq: <><span className="eq-a">1</span><span className="c-o">2 − 5</span> = 7</>,
    sounds: [[900, sfx.pop], [1300, sfx.pop], [2100, sfx.pop]],
  },
  // 3 − 1 = 2: 27.
  {
    ms: 4000,
    show: <ColSum a={42} b={15} op="-" bands={[{ col: 't', at: 0 }]} borrow={0} res={{ o: { v: '7', at: 0 }, t: { v: '2', at: 1000 } }} />,
    eq: <><span className="eq-a">3</span><span className="c-t"> − 1</span> = 2</>,
    sounds: [[1000, sfx.chime]],
  },
]

export const lessons: Lessons = { blocks, digit, column }
export const help: Helps = { blocks: helpOf<Blocks>(BlocksHelp), digit: helpOf<DigitValue>(DigitHelp), column: helpOf<Column>(ColumnHelp) }
