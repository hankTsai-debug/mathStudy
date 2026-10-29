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

/** One ten-frame cell in an animated or guided picture. */
export interface FrameCell {
  /** A red (a: already there) or blue (b: added) dot. */
  dot?: 'a' | 'b'
  badge?: string
  tap?: boolean
  /** How the dot appears or goes, starting `delay` ms in: pop in, fly in from below, fly out, or crossed out. */
  anim?: 'pop' | 'arrive' | 'leave' | 'gone'
  delay?: number
  /** Crossed out (to be taken away); stays crossed while it leaves. */
  crossed?: boolean
  /** When the badge pops in, in ms. */
  badgeDelay?: number
  /** Wordless feedback: ring = "you counted this", over = counted past what is there, miss = "you left this out". */
  mark?: 'ring' | 'over' | 'miss'
}

/**
 * Ten-frames for animated lessons, guided problems and wordless feedback.
 * Tappable cells are buttons, and a pointing hand shows the first one.
 * `glow` lists frames that light up (a ten is complete) after `glowDelay` ms;
 * `labels` names a frame ("10"); `overflow` draws rings that don't fit in the frame.
 */
export function GuideFrames({ cells, onTap, glow = [], glowDelay = 0, labels = [], overflow = 0 }: {
  cells: FrameCell[]
  onTap?: () => void
  glow?: number[]
  glowDelay?: number
  labels?: (string | undefined)[]
  overflow?: number
}) {
  const firstTap = cells.findIndex(c => c.tap)
  return (
    <div className="frames">
      {Array.from({ length: cells.length / 10 }, (_, f) => (
        <div className="frame-row" key={f}>
          <div className={`frame${glow.includes(f) ? ' glow' : ''}`} style={glow.includes(f) ? { animationDelay: `${glowDelay}ms` } : undefined}>
            {cells.slice(f * 10, f * 10 + 10).map((c, j) => {
              const i = f * 10 + j
              const dot = c.dot && (
                <i
                  className={`dot${c.dot === 'b' ? ' extra' : ''}${c.crossed ? ' crossed' : ''}${c.anim ? ` ${c.anim}` : ''}`}
                  style={c.delay ? { animationDelay: `${c.delay}ms` } : undefined}
                />
              )
              const badge = c.badge && (
                <span className="badge" style={c.badgeDelay ? { animationDelay: `${c.badgeDelay}ms` } : undefined}>{c.badge}</span>
              )
              const mark = c.mark && <span className={`mark ${c.mark}`} />
              return c.tap
                ? <button key={i} className="cell tap" onClick={onTap} aria-label={`cell ${i}`}>{dot}{i === firstTap && <span className="hand">👆</span>}</button>
                : <div key={i} className="cell">{dot}{badge}{mark}</div>
            })}
          </div>
          {/* Every row keeps the label's space so labelled and unlabelled frames line up. */}
          {labels.length > 0 && <span className="frame-label" style={{ animationDelay: `${glowDelay}ms` }}>{labels[f]}</span>}
        </div>
      ))}
      {overflow > 0 && (
        <div className="overflow">{Array.from({ length: overflow }, (_, i) => <span key={i} className="mark over" />)}</div>
      )}
    </div>
  )
}

/* ---------- guided-problem pictures: tappable parts carry the `tap` class ---------- */

interface Tappable { tapped: number; active: boolean; onTap: () => void }

/** Items to count; the first `tapped` carry their number, the rest are tappable. */
export function TapItems({ n, emoji, tapped, active, onTap }: Tappable & { n: number; emoji: string }) {
  return (
    <div className="field">
      {Array.from({ length: n }, (_, i) => i < tapped
        ? <span key={i} className="item tapped">{emoji}<span className="badge">{i + 1}</span></span>
        : <button key={i} className="item tap" disabled={!active} onClick={onTap}>{emoji}</button>)}
    </div>
  )
}

/** The frog has hopped `tapped` pads from `start`; only the next pad can be tapped. */
export function TapLine({ start, tapped, hops, active, onTap }: Tappable & { start: number; hops: number }) {
  const frog = start + tapped
  return (
    <div className="line">
      {Array.from({ length: 11 }, (_, i) => {
        const next = active && i === frog + 1 && tapped < hops
        const body = <><span className="lily" /><b>{i}</b></>
        return next
          ? <button key={i} className="pad tap" onClick={onTap} aria-label={String(i)}>{body}</button>
          : <span key={i} className={`pad${i > start && i <= frog ? ' trail' : ''}`}>{body}</span>
      })}
      <div className="frog" style={{ left: `${((frog + 0.5) / 11) * 100}%` }}>🐸</div>
    </div>
  )
}

const corners = (shape: Shape): [number, number][] => {
  if (shape === 'square') return [[45, 45], [155, 45], [155, 155], [45, 155]]
  const sides = { triangle: 3, pentagon: 5, hexagon: 6 }[shape as 'triangle' | 'pentagon' | 'hexagon']
  return polygon(sides, sides === 3 ? 78 : 70).split(' ')
    .map(p => p.split(',').map(Number) as [number, number])
    .map(([x, y]) => [x, sides === 3 ? y + 12 : y])
}

/** A shape whose corners are tapped one by one and numbered. */
export function TapShape({ shape, rotate, tapped, active, onTap }: Tappable & { shape: Shape; rotate: number }) {
  return (
    <svg className="shape" viewBox="0 0 200 200">
      <g transform={`rotate(${rotate} 100 100)`}>
        {SHAPE_SVG[shape]}
        {corners(shape).map(([x, y], i) => i < tapped
          ? <g key={i}><circle className="corner on" cx={x} cy={y} r="13" /><text className="corner-n" x={x} y={y + 5} transform={`rotate(${-rotate} ${x} ${y})`}>{i + 1}</text></g>
          : <circle key={i} className={`corner${active ? ' tap' : ''}`} cx={x} cy={y} r="13" onClick={active ? onTap : undefined} />)}
      </g>
    </svg>
  )
}

/** The shape with its fold line; once folded, the mirror image is drawn over it. */
export function FoldVisual({ shape, line, folded, active, onTap, label }: {
  shape: SymShape; line: 'v' | 'h'; folded: boolean; active: boolean; onTap: () => void; label: string
}) {
  const coords: [number, number, number, number] = line === 'v' ? [100, 12, 100, 188] : [12, 100, 188, 100]
  const mirror = line === 'v' ? 'translate(200 0) scale(-1 1)' : 'translate(0 200) scale(1 -1)'
  return (
    <div className="fold">
      <svg className="shape" viewBox="0 0 200 200">
        {SYM_SVG[shape]}
        {folded && <g className="ghost" transform={mirror}>{SYM_SVG[shape]}</g>}
        <line className="axis" x1={coords[0]} y1={coords[1]} x2={coords[2]} y2={coords[3]} />
      </svg>
      {active && <button className="btn tap" onClick={onTap}>{label}</button>}
    </div>
  )
}

/** Rows (or groups) of the same size; tapping counts one whole row at a time. */
export function TapGroups({ groups, size, emoji, layout, tapped, active, onTap }: Tappable & {
  groups: number; size: number; emoji: string; layout: 'rows' | 'groups'
}) {
  return (
    <div className={`tap-groups ${layout}`}>
      {Array.from({ length: groups }, (_, g) => {
        const items = Array.from({ length: size }, (_, i) => <span key={i}>{emoji}</span>)
        return g < tapped
          ? <div key={g} className="tgroup counted">{items}<span className="badge">{(g + 1) * size}</span></div>
          : <button key={g} className="tgroup tap" disabled={!active} onClick={onTap}>{items}</button>
      })}
    </div>
  )
}

/** Carrots dealt one round at a time: each rabbit gets one per tap on the pile. */
export function ShareDeal({ groups, each, tapped, active, onTap }: Tappable & { groups: number; each: number }) {
  const left = (each - tapped) * groups
  return (
    <div className="share">
      <div className="rabbits">
        {Array.from({ length: groups }, (_, g) => (
          <div key={g} className="rabbit"><span>🐰</span><div className="pile">{'🥕'.repeat(tapped)}</div></div>
        ))}
      </div>
      {left > 0 && <button className="pile tap" disabled={!active} onClick={onTap}>{'🥕'.repeat(left)}</button>}
    </div>
  )
}

/** Coins, biggest first; only the next coin can be tapped, and each tapped coin shows the running total. */
export function TapCoins({ coins, tapped, active, onTap }: Tappable & { coins: number[] }) {
  const totals = coins.map((_, i) => coins.slice(0, i + 1).reduce((sum, v) => sum + v, 0))
  return (
    <div className="coins">
      {coins.map((v, i) => {
        return i < tapped
          ? <span key={i} className={`coin c${v} counted`}>{v}<span className="badge">{totals[i]}</span></span>
          : <button key={i} className={`coin c${v}${i === tapped && active ? ' tap' : ''}`} disabled={!(i === tapped && active)} onClick={onTap}>{v}</button>
      })}
    </div>
  )
}
