// 形狀工坊 pictures for the wordless lessons and help (see shapes.tsx).
import { useId, type ReactNode } from 'react'
import type { Measure, Shape, ShapeName, Symmetry, SymShape } from '../../game/quizzes'
import { sfx } from '../../sound'
import { counts, delay, useSounds, type HelpProps, type Sounds } from './kit'
import './shapes.css'

/* ---------- shapes whose sides can be counted ---------- */

type Pt = [number, number]

const regular = (sides: number, r: number, dy = 0): Pt[] =>
  Array.from({ length: sides }, (_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / sides
    return [100 + r * Math.cos(a), 100 + r * Math.sin(a) + dy]
  })

// The same outlines as the practice pictures (visuals.tsx), as corner lists.
const CORNERS: Record<Exclude<Shape, 'circle'>, Pt[]> = {
  triangle: regular(3, 78, 12),
  square: [[45, 45], [155, 45], [155, 155], [45, 155]],
  rectangle: [[25, 60], [175, 60], [175, 140], [25, 140]],
  pentagon: regular(5, 70),
  hexagon: regular(6, 70),
}

const turn = ([x, y]: Pt, deg: number): Pt => {
  const a = (deg * Math.PI) / 180
  return [100 + (x - 100) * Math.cos(a) - (y - 100) * Math.sin(a), 100 + (x - 100) * Math.sin(a) + (y - 100) * Math.cos(a)]
}

/** A number in a circle, popping in `at` ms. */
function SvgTag({ x, y, n, at }: { x: number; y: number; n: ReactNode; at: number }) {
  return (
    <g className="a-pop" style={delay(at)}>
      <circle className="svg-tag" cx={x} cy={y} r="13" />
      <text className="svg-tag-n" x={x} y={y}>{n}</text>
    </g>
  )
}

/**
 * The shape (turned `rotate` degrees), its first `sides` sides traced one by one from `start` ms,
 * `gap` ms apart, each numbered. Long sides are red, shorter ones blue, so a square (all red) and a
 * rectangle (red and blue) look different. A circle is traced round once: no sides, no corners.
 */
export function SidesPic({ shape, rotate = 0, sides = 99, start = 0, gap = 600, spin = false, small = false }: {
  shape: Shape; rotate?: number; sides?: number; start?: number; gap?: number; spin?: boolean; small?: boolean
}) {
  const cls = `shape wl-svg${small ? ' small' : ''}${spin ? ' spin-in' : ''}`
  if (shape === 'circle') {
    return (
      <svg className={cls} viewBox="-20 -20 240 240">
        <circle cx="100" cy="100" r="70" />
        {sides > 0 && <circle className="side long trace" cx="100" cy="100" r="70" pathLength={1} style={delay(start, { animationDuration: '1.2s' })} />}
      </svg>
    )
  }
  const pts = CORNERS[shape].map(p => turn(p, rotate))
  const lens = pts.map((p, i) => Math.hypot(pts[(i + 1) % pts.length][0] - p[0], pts[(i + 1) % pts.length][1] - p[1]))
  const longest = Math.max(...lens)
  return (
    <svg className={cls} viewBox="-20 -20 240 240">
      <polygon points={pts.map(p => p.join(',')).join(' ')} />
      {pts.slice(0, sides).map((p, i) => {
        const q = pts[(i + 1) % pts.length]
        const [mx, my] = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]
        const d = Math.hypot(mx - 100, my - 100) || 1
        const at = start + i * gap
        return (
          <g key={i}>
            <line className={`side ${lens[i] > longest * 0.95 ? 'long' : 'short'} trace`} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} pathLength={1} style={delay(at)} />
            <SvgTag x={mx + ((mx - 100) / d) * 22} y={my + ((my - 100) / d) * 22} n={i + 1} at={at + 300} />
          </g>
        )
      })}
    </svg>
  )
}

const sideCount = (shape: Shape) => (shape === 'circle' ? 0 : CORNERS[shape].length)
const sideSounds = (n: number, start: number, gap: number): Sounds => counts(1, n, start + 300, gap)


export function ShapeNameHelp({ data: { shape, rotate }, mode, chose }: HelpProps<ShapeName>) {
  const n = sideCount(shape)
  const gap = mode === 'solved' ? 150 : 600
  const sounds: Sounds = mode === 'wrong'
    ? [...sideSounds(n, 0, 300), ...sideSounds(sideCount(chose as Shape), 1600, 300)]
    : [...sideSounds(n, 300, gap), ...(mode === 'solved' ? [[300 + n * gap + 300, sfx.chime] as [number, () => void]] : [])]
  useSounds(sounds)
  // 1st miss: its sides beside the chosen shape's sides: 3 is not 4, red-and-blue is not all red.
  if (mode === 'wrong') {
    return (
      <div className="wl-pair">
        <SidesPic shape={shape} rotate={rotate} start={0} gap={300} />
        <div className="wrong-pick"><SidesPic shape={chose as Shape} small start={1600} gap={300} /></div>
      </div>
    )
  }
  // Count the sides slowly; at the 3rd miss the upright shape with that name joins it.
  return (
    <div className="wl-pair">
      <SidesPic shape={shape} rotate={rotate} start={300} gap={gap} />
      {mode === 'reveal' && <div className="a-pop" style={delay(600 + n * gap)}><SidesPic shape={shape} small start={600 + n * gap} gap={150} /></div>}
    </div>
  )
}

/* ---------- folding along a line ---------- */

const SYM: Record<SymShape, ReactNode> = {
  rectangle: <rect x="30" y="60" width="140" height="80" />,
  square: <rect x="40" y="40" width="120" height="120" />,
  isosceles: <polygon points="100,30 170,170 30,170" />,
  rightTriangle: <polygon points="40,30 40,170 170,170" />,
  heart: <path d="M100 170 C 20 110, 30 40, 100 70 C 170 40, 180 110, 100 170 Z" />,
  lShape: <polygon points="50,30 90,30 90,130 160,130 160,170 50,170" />,
  circle: <circle cx="100" cy="100" r="70" />,
  parallelogram: <polygon points="60,60 180,60 140,140 20,140" />,
}

/**
 * The shape and its fold line (every line passes through the middle). From `at` ms one half
 * flips over the line, in blue: where it covers the other half exactly, the line is a line of symmetry.
 * `mark` (✓ or ✗) pops up once folded.
 */
export function FoldPic({ shape, line, at = 600, mark, pick }: {
  shape: SymShape; line: Symmetry['line']; at?: number; mark?: 'yes' | 'no'; pick?: 'yes' | 'no'
}) {
  const id = useId()
  const [x1, y1, x2, y2] = line
  // Turn the picture so the line is upright, flip it across x = 100, turn it back.
  const a = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI - 90
  const done = at + 1400
  return (
    <svg className="shape wl-svg fold-pic" viewBox="-10 -10 220 220">
      <defs><clipPath id={id}><rect x="-200" y="-200" width="300" height="600" /></clipPath></defs>
      {SYM[shape]}
      <g transform={`rotate(${a} 100 100)`}>
        <g className="fold-flip" style={delay(at)}>
          <g clipPath={`url(#${id})`}>
            <g className="ghost" transform={`rotate(${-a} 100 100)`}>{SYM[shape]}</g>
          </g>
        </g>
      </g>
      <line className="axis" x1={x1} y1={y1} x2={x2} y2={y2} />
      {mark && <text className={`fold-mark ${mark} a-pop`} x="186" y="30" style={delay(done)}>{mark === 'yes' ? '✓' : '✗'}</text>}
      {pick && (
        <g className="a-pop" style={delay(done)}>
          <g className="a-shake" style={delay(done + 350)}>
            <rect className="pick-box" x="160" y="-4" width="52" height="48" rx="8" />
            <text className={`fold-mark ${pick}`} x="186" y="34">{pick === 'yes' ? '✓' : '✗'}</text>
          </g>
        </g>
      )}
    </svg>
  )
}


const SYMMETRIC: [SymShape, string][] = [
  ['rectangle', '100,12,100,188'], ['rectangle', '12,100,188,100'], ['square', '40,40,160,160'], ['square', '100,12,100,188'],
  ['isosceles', '100,12,100,188'], ['heart', '100,12,100,188'], ['circle', '30,30,170,170'],
]
const isSymmetric = (shape: SymShape, line: Symmetry['line']) => SYMMETRIC.some(([s, l]) => s === shape && l === line.join(','))

export function SymmetryHelp({ data: { shape, line }, mode, chose }: HelpProps<Symmetry>) {
  const yes = isSymmetric(shape, line)
  const end: [number, () => void] = [2000, mode === 'wrong' ? sfx.miss : yes ? sfx.chime : sfx.right]
  useSounds([[600, sfx.pop], end])
  // 1st miss: fold it, then the child's ✓ or ✗ shakes next to what the fold shows.
  if (mode === 'wrong') return <FoldPic shape={shape} line={line} pick={chose as 'yes' | 'no'} />
  return <FoldPic shape={shape} line={line} mark={mode === 'strategy' ? undefined : yes ? 'yes' : 'no'} />
}

/* ---------- the ruler ---------- */

const x = (cm: number) => 20 + cm * 30

/** A 0–12 cm ruler with a pencil from `start` to `start + length`; `children` draw on top. */
export function Ruler({ start, length, pencilAt, children }: { start: number; length: number; pencilAt?: number; children?: ReactNode }) {
  return (
    <svg className="ruler wl-svg" viewBox="0 0 400 165">
      <g className={pencilAt === undefined ? undefined : 'a-arrive'} style={pencilAt === undefined ? undefined : delay(pencilAt)}>
        <rect className="pencil" x={x(start)} y="20" width={length * 30 - 14} height="26" rx="4" />
        <polygon className="tip" points={`${x(start + length) - 14},20 ${x(start + length)},33 ${x(start + length) - 14},46`} />
      </g>
      <rect className="rule" x="8" y="60" width="384" height="56" rx="6" />
      {Array.from({ length: 13 }, (_, cm) => (
        <g key={cm}>
          <line x1={x(cm)} y1="60" x2={x(cm)} y2="80" />
          <text x={x(cm)} y="102">{cm}</text>
        </g>
      ))}
      {children}
    </svg>
  )
}

/** A dot on the ruler at `cm`: green where the pencil starts, orange where it ends. */
export const Spot = ({ cm, end, at }: { cm: number; end?: boolean; at: number }) =>
  <circle className={`spot${end ? ' end' : ''} a-pop`} cx={x(cm)} cy="70" r="9" style={delay(at)} />

/** Hops of 1 cm under the ruler from `from`, `gap` ms apart; numbered 1, 2, 3… when `tags`. */
export function Hops({ from, n, start, gap, tags }: { from: number; n: number; start: number; gap: number; tags: boolean }) {
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const at = start + i * gap
        return (
          <g key={i}>
            <path className="hop trace" pathLength={1} d={`M${x(from + i)} 120 Q${x(from + i) + 15} 150 ${x(from + i + 1)} 120`} style={delay(at)} />
            {tags && <SvgTag x={x(from + i) + 15} y={150} n={i + 1} at={at + 200} />}
          </g>
        )
      })}
    </>
  )
}


export function MeasureHelp({ data: { start, length }, mode, chose }: HelpProps<Measure>) {
  const gap = mode === 'solved' ? 150 : 600
  useSounds(mode === 'wrong' ? [[0, sfx.pop]]
    : mode === 'strategy' ? Array.from({ length }, (_, i) => [600 + i * gap, sfx.pop] as [number, () => void])
      : [...counts(1, length, 600, gap), ...(mode === 'solved' ? [[600 + length * gap, sfx.chime] as [number, () => void]] : [])])
  // 1st miss: the chosen length laid along the pencil from its start, too long or too short.
  if (mode === 'wrong') {
    const c = Math.min(chose as number, 12 - start)
    return (
      <Ruler start={start} length={length}>
        <g className="a-shake">
          <rect className="pick-bar" x={x(start)} y="6" width={c * 30} height="8" rx="4" />
          <SvgTag x={x(start + c)} y={10} n={chose as number} at={300} />
        </g>
      </Ruler>
    )
  }
  // Mark where it starts and ends, then hop the centimetres between (numbered from the 3rd miss).
  return (
    <Ruler start={start} length={length}>
      <Spot cm={start} at={0} />
      <Spot cm={start + length} end at={200} />
      <Hops from={start} n={length} start={600} gap={gap} tags={mode !== 'strategy'} />
    </Ruler>
  )
}
