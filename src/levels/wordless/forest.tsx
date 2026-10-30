// 數數森林's wordless lessons: apples tagged as they are counted, a frog hopping along the
// number line, and a ten-frame whose full top row is 5 at a glance.
// (The practice levels show their own help: see CountLevel, LineLevel, FlashLevel.)
import type { ReactNode } from 'react'
import { sfx } from '../../sound'
import { GuideFrames, type FrameCell } from '../visuals'
import { Fruits, HopLine } from './ForestPictures'
import { counts, delay, type AnimBeat, type Helps, type Lessons } from './kit'

/* ---------- 數一數 ---------- */

const count: AnimBeat[] = [
  // Four apples, one at a time.
  { ms: 2800, show: <Fruits n={4} popAt={[200, 600, 1000, 1400]} />, sounds: [200, 600, 1000, 1400].map(ms => [ms, sfx.pop]) },
  // Touch and count: 1, 2.
  { ms: 2600, show: <Fruits n={4} tagAt={[300, 1100]} />, sounds: counts(1, 2, 300, 800) },
  // …3, 4: every apple has a number.
  { ms: 3000, show: <Fruits n={4} tagAt={[0, 0, 300, 1100]} />, sounds: [...counts(3, 2, 300, 800), [1700, sfx.chime]] },
  // The last number is how many.
  {
    ms: 3200,
    show: <div className="lesson-col"><Fruits n={4} tagAt={[0, 0, 0, 0]} glow={300} /><div className="big-n a-pop" style={delay(900)}>4</div></div>,
    sounds: [[300, () => sfx.count(4)], [900, sfx.right]],
  },
]

/* ---------- 青蛙跳數線 ---------- */

const line: AnimBeat[] = [
  // The pads appear left to right, each note higher: further right is bigger.
  { ms: 3200, show: <HopLine padsAt={0} />, sounds: counts(0, 11, 0, 180) },
  // The frog is on 2; the 3 pads ahead blink.
  {
    ms: 3200,
    show: <HopLine from={2} frogAt={200} want={[3, 4, 5]} />,
    eq: <><b className="eq-a">2</b> + <b className="eq-b">3</b></>,
    sounds: [[200, sfx.pop]],
  },
  // Hop, hop, hop: 3, 4, 5.
  {
    ms: 3200,
    show: <HopLine from={2} to={5} hopAt={400} gap={650} trail={[3, 4, 5]} tags={{ 3: { n: 1, at: 400 }, 4: { n: 2, at: 1050 }, 5: { n: 3, at: 1700 } }} />,
    sounds: counts(3, 3, 400, 650),
  },
  // Landed on 5: 2 + 3 = 5.
  {
    ms: 3200,
    show: <HopLine from={5} trail={[3, 4, 5]} />,
    eq: <><b className="eq-a">2</b> + <b className="eq-b">3</b> = 5</>,
    sounds: [[200, sfx.chime]],
  },
]

/* ---------- 十格框快看 ---------- */

const cells = (f: (i: number) => FrameCell) => Array.from({ length: 10 }, (_, i) => f(i))
const frame = (c: FrameCell[], extra?: ReactNode) => <div className="frames"><GuideFrames cells={c} />{extra}</div>

const flash: AnimBeat[] = [
  // A full top row pops in: that's 5.
  {
    ms: 3600,
    show: frame(cells(i => i < 5 ? { dot: 'a', anim: 'pop', delay: i * 250, badge: i === 4 ? '5' : undefined, badgeDelay: 1600 } : {})),
    sounds: [...counts(1, 5, 0, 250), [1600, sfx.chime]],
  },
  // 5 and 2 more below: 7.
  {
    ms: 3600,
    show: frame(cells(i => i < 5 ? { dot: 'a', badge: i === 4 ? '5' : undefined }
      : i < 7 ? { dot: 'b', anim: 'pop', delay: 400 + (i - 5) * 500, badge: String(i + 1), badgeDelay: 400 + (i - 5) * 500 } : {})),
    eq: <><b className="eq-a">5</b> + <b className="eq-b">2</b> = 7</>,
    sounds: counts(6, 2, 400, 500),
  },
  // One gap in the top row: 5 − 1 = 4.
  {
    ms: 3800,
    show: frame(cells(i => i < 4 ? { dot: 'a', badge: i === 3 ? '4' : undefined, badgeDelay: 1800 } : i === 4 ? { mark: 'miss' } : {})),
    eq: <><b className="eq-a">5</b> − 1 = 4</>,
    sounds: [[1800, sfx.right]],
  },
]

export const lessons: Lessons = { count, line, flash }
export const help: Helps = {}
