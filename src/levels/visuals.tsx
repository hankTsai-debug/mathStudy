// One visual per choice-based level. Each receives its round's data and whether the round
// is solved, so it can reveal the worked answer (e.g. carrots handed out) after a correct choice.
import type { ReactNode } from 'react'
import type {
  Add20, Area, ArrayQ, Balance, Blocks, Change, Clock, Coins, Column, Decimal, DigitValue, FracEqual, Fraction, Legs,
  Measure, Pattern, Share, Shape, ShapeName, Symmetry, SymShape, Times,
} from '../game/quizzes'

export interface VisualProps<D> { data: D; solved: boolean }

type Cell = 'a' | 'b' | 'gone' | null

function Frames({ cells }: { cells: Cell[] }) {
  const frames = Array.from({ length: Math.ceil(cells.length / 10) }, (_, f) => cells.slice(f * 10, f * 10 + 10))
  return (
    <>
      {frames.map((frame, f) => (
        <div className="frame" key={f}>
          {frame.map((c, i) => (
            <div className="cell" key={i}>
              {c && <i className={`dot${c === 'b' ? ' extra' : c === 'gone' ? ' gone' : ''}`} />}
            </div>
          ))}
        </div>
      ))}
    </>
  )
}

/** Two ten-frames: a red then b blue, or a red with the last b crossed out. */
export function Add20Visual({ data: { a, b, op } }: VisualProps<Add20>) {
  const cells: Cell[] = Array.from({ length: 20 }, (_, i) =>
    op === '+' ? (i < a ? 'a' : i < a + b ? 'b' : null) : (i < a - b ? 'a' : i < a ? 'gone' : null))
  return (
    <div className="frames">
      <div className="equation">{a} {op === '+' ? '+' : '−'} {b} = ?</div>
      <Frames cells={cells} />
    </div>
  )
}

export function BlocksVisual({ data: { n } }: VisualProps<Blocks>) {
  const [h, t, o] = [Math.floor(n / 100), Math.floor(n / 10) % 10, n % 10]
  return (
    <div className="blocks">
      {Array.from({ length: h }, (_, i) => <i key={`h${i}`} className="flat" />)}
      {Array.from({ length: t }, (_, i) => <i key={`t${i}`} className="rod" />)}
      <span className="ones">{Array.from({ length: o }, (_, i) => <i key={i} className="cube" />)}</span>
    </div>
  )
}

/** The number with the asked digit highlighted; works for 3–5 digits with thousands separators. */
export function DigitVisual({ data: { n, place } }: VisualProps<DigitValue>) {
  const digits = String(n).split('')
  return (
    <div className="bignum">
      {digits.map((ch, i) => {
        const p = digits.length - 1 - i
        return (
          <span key={i}>
            <span className={p === place ? 'pick' : ''}>{ch}</span>
            {p > 0 && p % 3 === 0 && ','}
          </span>
        )
      })}
    </div>
  )
}

const digits3 = (n: number) => String(n).padStart(3, ' ').split('').map(c => c.trim())

/** Column arithmetic laid out hundreds / tens / ones; the answer row shows ? until solved. */
export function ColumnVisual({ data: { a, b, op }, solved }: VisualProps<Column>) {
  const answer = op === '+' ? a + b : a - b
  const result = solved ? digits3(answer) : ['', '?', '?']
  return (
    <div className="column">
      {['', ...digits3(a), op === '+' ? '+' : '−', ...digits3(b)].map((c, i) => <span key={i}>{c}</span>)}
      <hr />
      {['', ...result].map((c, i) => <span key={`r${i}`} className="ans">{c}</span>)}
    </div>
  )
}

const polygon = (sides: number, r = 70) =>
  Array.from({ length: sides }, (_, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / sides
    return `${100 + r * Math.cos(angle)},${100 + r * Math.sin(angle)}`
  }).join(' ')

const SHAPE_SVG: Record<Shape, ReactNode> = {
  circle: <circle cx="100" cy="100" r="70" />,
  triangle: <polygon points={polygon(3, 78)} transform="translate(0 12)" />,
  square: <rect x="45" y="45" width="110" height="110" />,
  rectangle: <rect x="25" y="60" width="150" height="80" />,
  pentagon: <polygon points={polygon(5)} />,
  hexagon: <polygon points={polygon(6)} />,
}

export function ShapeVisual({ data: { shape, rotate } }: VisualProps<ShapeName>) {
  return (
    <svg className="shape" viewBox="0 0 200 200">
      <g transform={`rotate(${rotate} 100 100)`}>{SHAPE_SVG[shape]}</g>
    </svg>
  )
}

const SYM_SVG: Record<SymShape, ReactNode> = {
  rectangle: <rect x="30" y="60" width="140" height="80" />,
  square: <rect x="40" y="40" width="120" height="120" />,
  isosceles: <polygon points="100,30 170,170 30,170" />,
  rightTriangle: <polygon points="40,30 40,170 170,170" />,
  heart: <path d="M100 170 C 20 110, 30 40, 100 70 C 170 40, 180 110, 100 170 Z" />,
  lShape: <polygon points="50,30 90,30 90,130 160,130 160,170 50,170" />,
  circle: <circle cx="100" cy="100" r="70" />,
  parallelogram: <polygon points="60,60 180,60 140,140 20,140" />,
}

export function SymmetryVisual({ data: { shape, line } }: VisualProps<Symmetry>) {
  const [x1, y1, x2, y2] = line
  return (
    <svg className="shape" viewBox="0 0 200 200">
      {SYM_SVG[shape]}
      <line className="axis" x1={x1} y1={y1} x2={x2} y2={y2} />
    </svg>
  )
}

/** A 0–12 cm ruler with a pencil from `start` to `start + length`. */
export function MeasureVisual({ data: { start, length } }: VisualProps<Measure>) {
  const x = (cm: number) => 20 + cm * 30
  return (
    <svg className="ruler" viewBox="0 0 400 130">
      <rect className="pencil" x={x(start)} y="20" width={length * 30 - 14} height="26" rx="4" />
      <polygon className="tip" points={`${x(start + length) - 14},20 ${x(start + length)},33 ${x(start + length) - 14},46`} />
      <rect className="rule" x="8" y="60" width="384" height="56" rx="6" />
      {Array.from({ length: 13 }, (_, cm) => (
        <g key={cm}>
          <line x1={x(cm)} y1="60" x2={x(cm)} y2="80" />
          <text x={x(cm)} y="102">{cm}</text>
        </g>
      ))}
    </svg>
  )
}

export function ArrayVisual({ data: { rows, cols } }: VisualProps<ArrayQ>) {
  return (
    <div className="grid-emoji" style={{ gridTemplateColumns: `repeat(${cols}, auto)` }}>
      {Array.from({ length: rows * cols }, (_, i) => <span key={i}>🥬</span>)}
    </div>
  )
}

export function TimesVisual({ data: { a, b } }: VisualProps<Times>) {
  return (
    <div className="frames">
      <div className="equation">{a} × {b} = ?</div>
      <div className="groups">
        {Array.from({ length: a }, (_, g) => (
          <div className="group" key={g}>{Array.from({ length: b }, (_, i) => <i key={i} className="dot small" />)}</div>
        ))}
      </div>
    </div>
  )
}

/** Carrots in a pile; once solved, dealt out under each rabbit. */
export function ShareVisual({ data: { total, groups }, solved }: VisualProps<Share>) {
  const each = total / groups
  return (
    <div className="share">
      <div className="rabbits">
        {Array.from({ length: groups }, (_, g) => (
          <div key={g} className="rabbit">
            <span>🐰</span>
            {solved && <div className="pile">{'🥕'.repeat(each)}</div>}
          </div>
        ))}
      </div>
      {!solved && <div className="pile">{'🥕'.repeat(total)}</div>}
    </div>
  )
}

export function ClockVisual({ data: { h, m } }: VisualProps<Clock>) {
  const hourAngle = ((h % 12) + m / 60) * 30
  const minuteAngle = m * 6
  return (
    <svg className="clock" viewBox="0 0 200 200">
      <circle cx="100" cy="100" r="92" />
      {Array.from({ length: 12 }, (_, i) => {
        const n = i + 1
        const a = (n * 30 * Math.PI) / 180
        return <text key={n} x={100 + 72 * Math.sin(a)} y={100 - 72 * Math.cos(a) + 7}>{n}</text>
      })}
      <line className="hour" x1="100" y1="100" x2="100" y2="52" transform={`rotate(${hourAngle} 100 100)`} />
      <line className="minute" x1="100" y1="100" x2="100" y2="28" transform={`rotate(${minuteAngle} 100 100)`} />
      <circle className="pin" cx="100" cy="100" r="5" />
    </svg>
  )
}

export function CoinsVisual({ data: { coins } }: VisualProps<Coins>) {
  return (
    <div className="coins">
      {coins.map((v, i) => <span key={i} className={`coin c${v}`}>{v}</span>)}
    </div>
  )
}

export function ChangeVisual({ data: { price, paid } }: VisualProps<Change>) {
  return (
    <div className="change">
      <div><span className="tag">🏷️ {price}</span></div>
      <div className="arrow">→</div>
      <div><span className="coin c50 wide">{paid}</span></div>
    </div>
  )
}

/** A pie cut into d equal slices with k shaded. */
export function PieVisual({ data: { k, d } }: VisualProps<Fraction>) {
  const point = (i: number) => {
    const a = (i / d) * 2 * Math.PI - Math.PI / 2
    return `${100 + 80 * Math.cos(a)} ${100 + 80 * Math.sin(a)}`
  }
  return (
    <svg className="shape pie" viewBox="0 0 200 200">
      {Array.from({ length: d }, (_, i) => (
        <path key={i} className={i < k ? 'on' : ''} d={`M100 100 L${point(i)} A80 80 0 0 1 ${point(i + 1)} Z`} />
      ))}
    </svg>
  )
}

export function FracLineVisual({ data: { k, d } }: VisualProps<Fraction>) {
  const x = (i: number) => 30 + (i / d) * 340
  return (
    <svg className="ruler" viewBox="0 0 400 110">
      <line className="track" x1="30" y1="60" x2="370" y2="60" />
      {Array.from({ length: d + 1 }, (_, i) => <line key={i} className="tick" x1={x(i)} y1="48" x2={x(i)} y2="72" />)}
      <text className="end" x={x(0)} y="102">0</text>
      <text className="end" x={x(d)} y="102">1</text>
      <text x={x(k)} y="40" className="star">⭐</text>
    </svg>
  )
}

function Bar({ parts, on }: { parts: number; on: number }) {
  return (
    <div className="bar">
      {Array.from({ length: parts }, (_, i) => <i key={i} className={i < on ? 'on' : ''} />)}
    </div>
  )
}

export function FracEqualVisual({ data: { k, d, m }, solved }: VisualProps<FracEqual>) {
  return (
    <div className="bars">
      <Bar parts={d} on={k} />
      {solved && <Bar parts={d * m} on={k * m} />}
    </div>
  )
}

export function AreaVisual({ data: { w, h, ask } }: VisualProps<Area>) {
  return (
    <div className={`area ${ask}`}>
      <div className="side top">{w}</div>
      <div className="area-row">
        <div className="side">{h}</div>
        <div className="area-grid" style={{ gridTemplateColumns: `repeat(${w}, auto)` }}>
          {Array.from({ length: w * h }, (_, i) => <i key={i} />)}
        </div>
      </div>
    </div>
  )
}

export function DecimalVisual({ data: { whole, k } }: VisualProps<Decimal>) {
  return (
    <div className="bars">
      {Array.from({ length: whole }, (_, i) => <Bar key={i} parts={10} on={10} />)}
      <Bar parts={10} on={k} />
    </div>
  )
}

export function PatternVisual({ data: { terms }, solved }: VisualProps<Pattern>) {
  const gaps = terms.slice(1).map((t, i) => t - terms[i])
  const next = terms[3] + (gaps[2] - gaps[1]) + gaps[2]
  return (
    <div className="pattern">
      {terms.map((t, i) => <span key={i} className="bubble-num">{t}</span>)}
      <span className="bubble-num ask">{solved ? next : '?'}</span>
    </div>
  )
}

export function BalanceVisual({ data: { fruit, copies, extra, total } }: VisualProps<Balance>) {
  return (
    <div className="balance">
      <div className="pans">
        <div className="pan">{fruit.repeat(copies)}{extra > 0 && <span className="weight">{extra}</span>}</div>
        <div className="pan"><span className="weight">{total}</span></div>
      </div>
      <div className="beam" />
      <div className="fulcrum">▲</div>
    </div>
  )
}

export function LegsVisual({ data: { heads, legs, rabbits }, solved }: VisualProps<Legs>) {
  return (
    <div className="legs">
      <div className="counts"><span>🙂 × {heads}</span><span>🦶 × {legs}</span></div>
      <div className="animals">
        {solved
          ? <>{'🐰'.repeat(rabbits)}{'🐔'.repeat(heads - rabbits)}</>
          : '❓'.repeat(heads)}
      </div>
    </div>
  )
}

/* ---------- lesson-only pictures ---------- */

/** Apples with the first `counted` numbered, as a child would tap them. */
export function Apples({ n, counted }: { n: number; counted: number }) {
  return (
    <div className="field">
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className={`item${i < counted ? ' tapped' : ''}`}>
          🍎{i < counted && <span className="badge">{i + 1}</span>}
        </span>
      ))}
    </div>
  )
}

/** The 0–10 lily-pad line with the frog on `frog`; pads in `trail` are marked as hopped over. */
export function NumberLine({ frog, trail = [] }: { frog: number; trail?: number[] }) {
  return (
    <div className="line">
      {Array.from({ length: 11 }, (_, i) => (
        <span key={i} className={`pad${trail.includes(i) ? ' trail' : ''}`}>
          <span className="lily" />
          <b>{i}</b>
        </span>
      ))}
      <div className="frog" style={{ left: `${((frog + 0.5) / 11) * 100}%` }}>🐸</div>
    </div>
  )
}
