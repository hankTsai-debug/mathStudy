// 分數廚房, shown without words: orange tags count all the equal parts (the bottom number),
// blue tags count the shaded ones (the top number); equal bars are compared with a guide line.
// A registry module: its components are private to the lessons and help it exports.
/* oxlint-disable react/only-export-components */
import type { ReactNode } from 'react'
import type { FracEqual, Fraction } from '../../game/quizzes'
import { sfx } from '../../sound'
import { counts, delay, helpOf, useSounds, type AnimBeat, type HelpProps, type Helps, type Lessons, type Sounds } from './kit'
import './kitchen.css'

/** A tag on part i: orange for counting every part, blue for counting the shaded ones. */
interface PartTag { i: number; text: string; at: number; tone: 'all' | 'on' }

const GAP = 450
/** Orange tags 1..n, then (from `onAt`) blue tags 1..k over the shaded parts. */
function partTags(n: number, k: number, allAt: number | null, onAt: number | null, gap = GAP): PartTag[] {
  const all = allAt === null ? [] : Array.from({ length: n }, (_, i) => ({ i, text: String(i + 1), at: allAt + i * gap, tone: 'all' as const }))
  const on = onAt === null ? [] : Array.from({ length: k }, (_, i) => ({ i, text: String(i + 1), at: onAt + i * gap, tone: 'on' as const }))
  return [...all, ...on]
}

/** k/d stacked, top in blue (shaded parts), bottom in orange (all parts). */
function Frac({ top, bot, at = 0 }: { top: ReactNode; bot: ReactNode; at?: number }) {
  return (
    <span className="frac kt-frac a-pop" style={delay(at)}>
      <span className="kt-on">{top}</span><span className="kt-all">{bot}</span>
    </span>
  )
}

const Row = ({ children }: { children: ReactNode }) => <div className="eq-row kt-row">{children}</div>

const parseFrac = (v: unknown) => String(v).split('/').map(Number) as [number, number]

/* ---------- pie ---------- */

/** A pie cut into d slices, the first `on` shaded (from `fillAt`, `fillGap` apart), `out` slices lifted out. */
function Pie({ d, on, fillAt, fillGap = 0, tags = [], out = [], ghost, small }: {
  d: number; on: number; fillAt?: number; fillGap?: number; tags?: PartTag[]; out?: number[]; ghost?: boolean; small?: boolean
}) {
  const point = (i: number, r = 80) => {
    const a = (i / d) * 2 * Math.PI - Math.PI / 2
    return [100 + r * Math.cos(a), 100 + r * Math.sin(a)]
  }
  const mid = (i: number, r: number) => point(i + 0.5, r)
  return (
    <svg className={`shape pie${ghost ? ' kt-ghost' : ''}${small ? ' kt-small' : ''}`} viewBox="-10 -10 220 220">
      {Array.from({ length: d }, (_, i) => {
        const [x1, y1] = point(i)
        const [x2, y2] = point(i + 1)
        const [dx, dy] = mid(i, 14).map(v => v - 100)
        return (
          <path
            key={i}
            className={`${i < on ? 'on' : ''}${i < on && fillAt !== undefined ? ' kt-fill' : ''}`}
            style={i < on && fillAt !== undefined ? delay(fillAt + i * fillGap) : undefined}
            transform={out.includes(i) ? `translate(${dx} ${dy})` : undefined}
            d={`M100 100 L${x1} ${y1} A80 80 0 0 1 ${x2} ${y2} Z`}
          />
        )
      })}
      {tags.map((t, j) => {
        const [x, y] = mid(t.i, d > 6 ? 58 : 50)
        return (
          <g key={j} className={`kt-tag ${t.tone}`} style={delay(t.at)}>
            <circle cx={x} cy={y} r="14" /><text x={x} y={y + 5}>{t.text}</text>
          </g>
        )
      })}
    </svg>
  )
}

function FracNameHelp({ data: { k, d }, mode, chose }: HelpProps<Fraction>) {
  const onAt = d * GAP + 600
  const end = onAt + k * GAP
  useSounds(mode === 'wrong' ? [[0, sfx.pop]]
    : mode === 'solved' ? [[300, sfx.chime]]
      : [...counts(1, d, 0, GAP), ...(mode === 'reveal' ? [...counts(1, k, onAt, GAP), [end + 200, sfx.right] as Sounds[number]] : [])])

  if (mode === 'wrong') {
    // The chosen fraction on its own pie, next to the real one.
    const [a, b] = parseFrac(chose)
    return (
      <div className="kt-pair">
        <div className="kt-col"><Pie d={d} on={k} small /><Frac top="?" bot="?" /></div>
        <div className="kt-col wrong-pick"><Pie d={b} on={a} ghost small /><Frac top={a} bot={b} /></div>
      </div>
    )
  }
  if (mode === 'solved') {
    return <div className="kt-col"><Pie d={d} on={k} tags={partTags(d, k, null, 0, 120)} /><Frac top={k} bot={d} at={300} /></div>
  }
  // Count every slice (the bottom), then the shaded ones (the top).
  return (
    <div className="kt-col">
      <Pie d={d} on={k} tags={partTags(d, k, 0, mode === 'reveal' ? onAt : null)} />
      <Frac top={mode === 'reveal' ? <span className="a-pop" style={delay(end)}>{k}</span> : '?'} bot={d} at={d * GAP} />
    </div>
  )
}

const fracName: AnimBeat[] = [
  // Cut into 4 equal slices: 1, 2, 3, 4.
  {
    ms: 3400,
    show: <Pie d={4} on={0} tags={partTags(4, 0, 300, null, 500)} />,
    eq: <Frac top="" bot={4} at={2400} />,
    sounds: counts(1, 4, 300, 500),
  },
  // Take 1 slice: 1/4.
  {
    ms: 4400,
    show: <Pie d={4} on={1} fillAt={300} out={[0]} tags={[...partTags(4, 0, 0, null, 0), { i: 0, text: '1', at: 900, tone: 'on' }]} />,
    eq: <Frac top={1} bot={4} at={1500} />,
    sounds: [[300, sfx.pop], [900, () => sfx.count(1)], [1500, sfx.chime]],
  },
  // 3 slices shaded: 3/4.
  {
    ms: 4200,
    show: <Pie d={4} on={3} fillAt={300} fillGap={600} tags={partTags(4, 3, null, 300, 600)} />,
    eq: <Frac top={3} bot={4} at={2200} />,
    sounds: [...counts(1, 3, 300, 600), [2200, sfx.chime]],
  },
]

/* ---------- number line ---------- */

const lx = (i: number, d: number) => 30 + (i / d) * 340

/** 0 to 1 cut into d parts: tags sit under the parts (not the ticks); `blue` parts are painted. */
function Line({ d, star, starAt = 0, tags = [], blue = 0, blueAt = 0, blueGap = GAP, blinkTicks, ghost }: {
  d: number; star?: number; starAt?: number; tags?: PartTag[]; blue?: number; blueAt?: number; blueGap?: number; blinkTicks?: number; ghost?: boolean
}) {
  const x = (i: number) => lx(i, d)
  return (
    <svg className={`ruler kt-line${ghost ? ' kt-ghost' : ''}`} viewBox="0 0 400 130">
      <line className="track" x1="30" y1="60" x2="370" y2="60" />
      {Array.from({ length: blue }, (_, i) => (
        <line key={i} className="kt-seg a-fade" style={delay(blueAt + i * blueGap)} x1={x(i)} y1="60" x2={x(i + 1)} y2="60" />
      ))}
      {Array.from({ length: d + 1 }, (_, i) => (
        <line key={i} className={`tick${blinkTicks !== undefined ? ' a-blink' : ''}`} style={blinkTicks !== undefined ? delay(blinkTicks) : undefined}
          x1={x(i)} y1="48" x2={x(i)} y2="72" />
      ))}
      <text className="end" x={x(0)} y="104">0</text>
      <text className="end" x={x(d)} y="104">1</text>
      {star !== undefined && <text x={x(star)} y="40" className="star kt-star" style={delay(starAt)}>⭐</text>}
      {tags.map((t, j) => {
        const cx = (x(t.i) + x(t.i + 1)) / 2
        return (
          <g key={j} className={`kt-tag ${t.tone}`} style={delay(t.at)}>
            <circle cx={cx} cy="96" r="15" /><text x={cx} y="102">{t.text}</text>
          </g>
        )
      })}
    </svg>
  )
}

function FracLineHelp({ data: { k, d }, mode, chose }: HelpProps<Fraction>) {
  const onAt = d * GAP + 600
  const end = onAt + k * GAP
  useSounds(mode === 'wrong' ? [[0, sfx.pop]]
    : mode === 'solved' ? [[300, sfx.chime]]
      : [...counts(1, d, 0, GAP), ...(mode === 'reveal' ? [...counts(1, k, onAt, GAP), [end + 200, sfx.right] as Sounds[number]] : [])])

  if (mode === 'wrong') {
    // Where the chosen fraction would put the star, on a line cut its way, under the real one.
    const [a, b] = parseFrac(chose)
    return (
      <div className="kt-col">
        <div className="kt-cmp">
          <Line d={d} star={k} />
          <div className="wrong-pick"><Line d={b} star={a} ghost /></div>
          <div className="kt-guide" style={{ left: `${(lx(k, d) / 400) * 100}%` }} />
        </div>
        <Frac top={a} bot={b} />
      </div>
    )
  }
  if (mode === 'solved') {
    return <div className="kt-col"><Line d={d} star={k} blue={k} blueGap={120} tags={partTags(d, k, null, 0, 120)} /><Frac top={k} bot={d} at={300} /></div>
  }
  // Count the parts 0 to 1 (the bottom), then the parts up to the star (the top).
  const reveal = mode === 'reveal'
  return (
    <div className="kt-col">
      <Line d={d} star={k} tags={partTags(d, k, 0, reveal ? onAt : null)} blue={reveal ? k : 0} blueAt={onAt} />
      <Frac top={reveal ? <span className="a-pop" style={delay(end)}>{k}</span> : '?'} bot={d} at={d * GAP} />
    </div>
  )
}

const fracLine: AnimBeat[] = [
  // 0 to 1 cut into 4 equal parts: 1, 2, 3, 4.
  {
    ms: 3400,
    show: <Line d={4} tags={partTags(4, 0, 300, null, 500)} />,
    eq: <Frac top="" bot={4} at={2400} />,
    sounds: counts(1, 4, 300, 500),
  },
  // The star has gone 1 part: 1/4.
  {
    ms: 3800,
    show: <Line d={4} star={1} starAt={300} blue={1} blueAt={800} tags={partTags(4, 1, null, 800)} />,
    eq: <Frac top={1} bot={4} at={1500} />,
    sounds: [[300, sfx.pop], [800, () => sfx.count(1)], [1500, sfx.chime]],
  },
  // 3 parts is 3/4: the ticks blink (don't count those), the parts get counted.
  {
    ms: 5000,
    show: <Line d={4} star={3} starAt={2900} blinkTicks={200} blue={3} blueAt={1500} blueGap={500} tags={partTags(4, 3, null, 1500, 500)} />,
    eq: <Frac top={3} bot={4} at={3300} />,
    sounds: [[200, sfx.miss], ...counts(1, 3, 1500, 500), [3300, sfx.chime]],
  },
]

/* ---------- equal fractions ---------- */

/**
 * A bar of `parts`, the first `on` shaded. With `cut` > 1 the parts start as groups of `cut`
 * and the cuts inside each group appear at `cutAt`. Tags sit in a row above.
 */
function Bar({ parts, on, cut = 1, cutAt = 0, fillAt, tags = [], ghost }: {
  parts: number; on: number; cut?: number; cutAt?: number; fillAt?: number; tags?: PartTag[]; ghost?: boolean
}) {
  return (
    <div className={`kt-bar${ghost ? ' kt-ghost' : ''}`}>
      <div className={`kt-tags${parts > 8 ? ' dense' : ''}`}>
        {Array.from({ length: parts }, (_, i) => (
          <span key={i}>
            {tags.filter(t => t.i === i).map((t, j) => <b key={j} className={`kt-chip ${t.tone}`} style={delay(t.at)}>{t.text}</b>)}
          </span>
        ))}
      </div>
      <div className="bar">
        {Array.from({ length: parts }, (_, i) => {
          const newCut = cut > 1 && (i + 1) % cut !== 0
          const fill = i < on && fillAt !== undefined
          return (
            <i key={i}
              className={`${i < on ? 'on' : ''}${newCut ? ' kt-cut' : ''}${fill ? ' kt-fill' : ''}`}
              style={newCut ? delay(cutAt) : fill ? delay(fillAt) : undefined} />
          )
        })}
      </div>
    </div>
  )
}

/** Bars stacked, with a dashed guide at `guide` (0–1) to compare shaded lengths. */
function Compare({ children, guide, guideAt = 0 }: { children: ReactNode; guide?: number; guideAt?: number }) {
  return (
    <div className="bars kt-cmp">
      {children}
      {guide !== undefined && <div className="kt-guide a-fade" style={delay(guideAt, { left: `${guide * 100}%` })} />}
    </div>
  )
}

function FracEqualHelp({ data: { k, d, m }, mode, chose }: HelpProps<FracEqual>) {
  const n = d * m
  const on = k * m
  const allAt = 900
  const onAt = allAt + n * GAP + 400
  const end = onAt + on * GAP
  useSounds(mode === 'wrong' ? [[0, sfx.pop]]
    : mode === 'solved' ? [[300, sfx.chime]]
      : [[300, sfx.pop], ...counts(1, n, allAt, GAP), ...(mode === 'reveal' ? [...counts(1, on, onAt, GAP), [end + 200, sfx.right] as Sounds[number]] : [])])

  if (mode === 'wrong') {
    // The chosen fraction as a bar under the real one: the shaded lengths don't line up.
    const [a, b] = parseFrac(chose)
    return (
      <div className="kt-col">
        <Compare guide={k / d}>
          <Bar parts={d} on={k} />
          <div className="wrong-pick"><Bar parts={b} on={a} ghost /></div>
        </Compare>
        <Row><Frac top={k} bot={d} /> ≠ <Frac top={a} bot={b} /></Row>
      </div>
    )
  }
  if (mode === 'solved') {
    return (
      <div className="kt-col">
        <Compare guide={k / d} guideAt={200}><Bar parts={d} on={k} /><Bar parts={n} on={on} tags={partTags(n, on, null, 0, 100)} /></Compare>
        <Row><Frac top={k} bot={d} /> = <Frac top={on} bot={n} at={300} /></Row>
      </div>
    )
  }
  // Cut every part into m pieces, then count all the pieces (bottom) and the shaded ones (top).
  const reveal = mode === 'reveal'
  return (
    <div className="kt-col">
      <Compare guide={reveal ? k / d : undefined} guideAt={end}>
        <Bar parts={d} on={k} />
        <Bar parts={n} on={on} cut={m} cutAt={300} tags={partTags(n, on, allAt, reveal ? onAt : null)} />
      </Compare>
      <Row><Frac top={k} bot={d} /> = <Frac top={reveal ? <span className="a-pop" style={delay(end)}>{on}</span> : '?'} bot={n} at={allAt + n * GAP} /></Row>
    </div>
  )
}

const fracEqual: AnimBeat[] = [
  // 2 parts, 1 shaded: 1/2.
  {
    ms: 3600,
    show: <Compare><Bar parts={2} on={1} fillAt={1300} tags={partTags(2, 1, 300, 1300, 500)} /></Compare>,
    eq: <Frac top={1} bot={2} at={2000} />,
    sounds: [...counts(1, 2, 300, 500), [1300, () => sfx.count(1)], [2000, sfx.chime]],
  },
  // Cut each part in 2: 4 parts, 2 shaded: 2/4.
  {
    ms: 5200,
    show: (
      <Compare>
        <Bar parts={2} on={1} />
        <Bar parts={4} on={2} cut={2} cutAt={500} tags={partTags(4, 2, 1100, 3300)} />
      </Compare>
    ),
    eq: <Frac top={2} bot={4} at={4300} />,
    sounds: [[500, sfx.pop], ...counts(1, 4, 1100, GAP), ...counts(1, 2, 3300, GAP), [4300, sfx.chime]],
  },
  // Same shaded length: 1/2 = 2/4.
  {
    ms: 4400,
    show: <Compare guide={1 / 2} guideAt={400}><Bar parts={2} on={1} /><Bar parts={4} on={2} /></Compare>,
    eq: <span className="kt-row a-pop" style={delay(1200)}><Frac top={1} bot={2} /> = <Frac top={2} bot={4} /></span>,
    sounds: [[400, sfx.pop], [1200, sfx.chime]],
  },
]

export const lessons: Lessons = { fracName, fracLine, fracEqual }
export const help: Helps = { fracName: helpOf(FracNameHelp), fracLine: helpOf(FracLineHelp), fracEqual: helpOf(FracEqualHelp) }
