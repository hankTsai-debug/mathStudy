// 十的海灣's animated, wordless lessons: each beat plays a short scene on the ten-frames (dots popping in,
// flying across, a ten lighting up) with counting notes, so the idea is shown, not told.
// Beat i is narrated by t.teach[kind][i] when the voice is on, but the motion carries the meaning.
import type { ReactNode } from 'react'
import { sfx } from '../../sound'
import { GuideFrames, type FrameCell } from '../visuals'
import { counts, type AnimBeat, type Helps, type Lessons } from './kit'

const cells = (n: number, f: (i: number) => FrameCell) => Array.from({ length: n }, (_, i) => f(i))
/** Red for what was there, blue for what was added: the same colours as the dots. */
const red = (x: ReactNode) => <b className="eq-a">{x}</b>
const blue = (x: ReactNode) => <b className="eq-b">{x}</b>

const makeTen: AnimBeat[] = [
  // 7 shells pop in one by one.
  {
    ms: 3600,
    show: <GuideFrames cells={cells(10, i => i < 7 ? { dot: 'a', anim: 'pop', delay: i * 250 } : {})} />,
    sounds: counts(1, 7, 0, 250),
  },
  // The empty boxes are counted 1, 2, 3, then filled.
  {
    ms: 4600,
    show: <GuideFrames cells={cells(10, i => i < 7 ? { dot: 'a' }
      : { dot: 'b', anim: 'arrive', delay: 2000 + (i - 7) * 400, badge: String(i - 6), badgeDelay: (i - 7) * 600 })} />,
    sounds: [...counts(1, 3, 0, 600), [2000, sfx.pop], [2400, sfx.pop], [2800, sfx.pop]],
  },
  // Full: the frame lights up, 7 + 3 = 10.
  {
    ms: 4200,
    show: <GuideFrames glow={[0]} glowDelay={200} cells={cells(10, i => ({ dot: i < 7 ? 'a' : 'b' }))} />,
    eq: <>{red(7)} + {blue(3)} = 10</>,
    sounds: [[200, sfx.chime]],
  },
]

const teen: AnimBeat[] = [
  // A full frame fills quickly and lights up: that's 10.
  {
    ms: 3400,
    show: <GuideFrames glow={[0]} glowDelay={1400} labels={['10']}
      cells={cells(20, i => i < 10 ? { dot: 'a', anim: 'pop', delay: i * 120 } : {})} />,
    sounds: [...counts(1, 10, 0, 120), [1400, sfx.chime]],
  },
  // Count on from 10: 11, 12, 13.
  {
    ms: 4000,
    show: <GuideFrames labels={['10']} cells={cells(20, i => i < 10 ? { dot: 'a' }
      : i < 13 ? { dot: 'b', anim: 'pop', delay: 300 + (i - 10) * 700, badge: String(i + 1), badgeDelay: 300 + (i - 10) * 700 } : {})} />,
    sounds: counts(11, 3, 300, 700),
  },
  // One ten and three ones: the 1 is red like the full frame, the 3 blue like the dots.
  {
    ms: 4600,
    show: <GuideFrames labels={['10', '3']} cells={cells(20, i => i < 10 ? { dot: 'a' } : i < 13 ? { dot: 'b' } : {})} />,
    eq: <>{red(10)} + {blue(3)} = {red(1)}{blue(3)}</>,
    sounds: [[200, sfx.right]],
  },
]

const add20: AnimBeat[] = [
  // 8 red in the first frame, 5 blue in the second; the 2 gaps blink.
  {
    ms: 4200,
    show: <GuideFrames cells={cells(20, i => i < 8 ? { dot: 'a', anim: 'pop', delay: i * 150 }
      : i < 10 ? { mark: 'miss' }
        : i < 15 ? { dot: 'b', anim: 'pop', delay: 1400 + (i - 10) * 150 } : {})} />,
    eq: <>{red(8)} + {blue(5)} = ?</>,
    sounds: [...counts(1, 8, 0, 150), ...counts(1, 5, 1400, 150)],
  },
  // 2 blue dots fly up to fill the first frame; it lights up.
  {
    ms: 4600,
    show: <GuideFrames glow={[0]} glowDelay={1900} cells={cells(20, i => i < 8 ? { dot: 'a' }
      : i < 10 ? { dot: 'b', anim: 'arrive', delay: 400 + (i - 8) * 700, badge: String(i + 1), badgeDelay: 400 + (i - 8) * 700 }
        : i < 13 ? { dot: 'b' }
          : i < 15 ? { dot: 'b', anim: 'leave', delay: 400 + (i - 13) * 700 } : {})} />,
    eq: <>{red(8)} + {blue(5)} = ?</>,
    sounds: [...counts(9, 2, 400, 700), [1900, sfx.chime]],
  },
  // 10 and 3 left: 13.
  {
    ms: 4600,
    show: <GuideFrames labels={['10', '3']} cells={cells(20, i => i < 8 ? { dot: 'a' } : i < 13 ? { dot: 'b' } : {})} />,
    eq: <>{red(8)} + {blue(5)} = 10 + 3 = 13</>,
    sounds: [[200, sfx.right]],
  },
  // Taking away works the same way: 13 − 5 takes 3 to reach 10, then 2 more.
  {
    ms: 5000,
    show: <GuideFrames cells={cells(20, i => i < 8 ? { dot: 'a' }
      : i < 10 ? { dot: 'a', anim: 'leave', delay: 2200 + (i - 8) * 500 }
        : i < 13 ? { dot: 'a', anim: 'leave', delay: 300 + (i - 10) * 500 } : {})} />,
    eq: <>13 − {blue(3)} − {blue(2)} = 8</>,
    sounds: [[300, sfx.pop], [800, sfx.pop], [1300, sfx.pop], [1800, sfx.chime], [2200, sfx.pop], [2700, sfx.pop]],
  },
]

export const lessons: Lessons = { makeTen, teen, add20 }
// 十的海灣's practice levels show their own help (see BayLevels).
export const help: Helps = {}
