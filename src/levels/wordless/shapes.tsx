// 形狀工坊 without words: sides are traced and counted one by one (long sides red, short blue),
// a fold flips one half over the line, and a ruler's centimetres are hopped and counted.
import type { Measure, ShapeName, Symmetry } from '../../game/quizzes'
import { sfx } from '../../sound'
import { counts, helpOf, type AnimBeat, type Helps, type Lessons, type Sounds } from './kit'
import { FoldPic, Hops, MeasureHelp, Ruler, ShapeNameHelp, SidesPic, Spot, SymmetryHelp } from './ShapesPictures'

const sideSounds = (n: number, start: number, gap: number): Sounds => counts(1, n, start + 300, gap)

const shapeName: AnimBeat[] = [
  // A triangle: 3 sides counted.
  { ms: 3800, show: <SidesPic shape="triangle" start={300} gap={700} />, eq: '3', sounds: sideSounds(3, 300, 700) },
  // A square (4 red sides, all the same) beside a rectangle (2 red long, 2 blue short).
  {
    ms: 5600,
    show: <div className="wl-pair"><SidesPic shape="square" small start={200} gap={500} /><SidesPic shape="rectangle" small start={2600} gap={500} /></div>,
    sounds: [...sideSounds(4, 200, 500), ...sideSounds(4, 2600, 500)],
  },
  // A pentagon (5) and a hexagon (6).
  {
    ms: 6400,
    show: <div className="wl-pair"><SidesPic shape="pentagon" small start={200} gap={450} /><SidesPic shape="hexagon" small start={2800} gap={450} /></div>,
    sounds: [...sideSounds(5, 200, 450), ...sideSounds(6, 2800, 450)],
  },
  // The triangle spins upside down, and still has 3 sides.
  { ms: 4800, show: <SidesPic shape="triangle" rotate={180} spin start={1500} gap={600} />, eq: '3', sounds: sideSounds(3, 1500, 600) },
]

const symmetry: AnimBeat[] = [
  { ms: 4000, show: <FoldPic shape="heart" line={[100, 12, 100, 188]} mark="yes" />, sounds: [[600, sfx.pop], [2000, sfx.chime]] },
  { ms: 4000, show: <FoldPic shape="heart" line={[12, 100, 188, 100]} mark="no" />, sounds: [[600, sfx.pop], [2000, sfx.miss]] },
  { ms: 4000, show: <FoldPic shape="rectangle" line={[30, 60, 170, 140]} mark="no" />, sounds: [[600, sfx.pop], [2000, sfx.miss]] },
]

const measure: AnimBeat[] = [
  // Start at 0, read the end: 5.
  {
    ms: 3800,
    show: <Ruler start={0} length={5} pencilAt={0}><Spot cm={0} at={800} /><Spot cm={5} end at={1600} /></Ruler>,
    eq: '5',
    sounds: [[800, sfx.pop], [1600, sfx.right]],
  },
  // Now from 2 to 7.
  {
    ms: 3400,
    show: <Ruler start={2} length={5} pencilAt={0}><Spot cm={2} at={800} /><Spot cm={7} end at={1600} /></Ruler>,
    sounds: [[800, sfx.pop], [1600, sfx.pop]],
  },
  // Count the spaces from 2 to 7: 5.
  {
    ms: 5000,
    show: <Ruler start={2} length={5}><Spot cm={2} at={0} /><Spot cm={7} end at={0} /><Hops from={2} n={5} start={400} gap={600} tags /></Ruler>,
    eq: <><span className="eq-b">7</span> − <span className="eq-a">2</span> = 5</>,
    sounds: [...counts(1, 5, 600, 600), [3800, sfx.chime]],
  },
]

export const lessons: Lessons = { shapeName, symmetry, measure }
export const help: Helps = {
  shapeName: helpOf<ShapeName>(ShapeNameHelp),
  symmetry: helpOf<Symmetry>(SymmetryHelp),
  measure: helpOf<Measure>(MeasureHelp),
}
