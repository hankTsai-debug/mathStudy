// 大數港口's wordless pictures and the help shown after a miss (see port.tsx).
import type { CSSProperties, ReactNode } from 'react'
import type { Area, Decimal, DigitValue } from '../../game/quizzes'
import { sfx } from '../../sound'
import { counts, delay, useSounds, type HelpProps, type Sounds } from './kit'
import './port.css'

const red = (x: ReactNode) => <b className="eq-a">{x}</b>
const blue = (x: ReactNode) => <b className="eq-b">{x}</b>

/** A number tag centred above whatever it sits in (which must be position: relative). */
function Tag({ at = 0, className = '', children }: { at?: number; className?: string; children: ReactNode }) {
  return <span className="pt-tag"><span className={`tag-n ${className}`} style={delay(at, { position: 'static' })}>{children}</span></span>
}

function Eq({ children, at = 0, wrong = false }: { children: ReactNode; at?: number; wrong?: boolean }) {
  return <div className={`eq-row ${wrong ? 'a-shake' : 'a-fade'}`} style={delay(at)}>{children}</div>
}

/* ---------- big numbers: place values ---------- */

interface Row { value: number; at: number; gap: number; wrong?: boolean }

/**
 * The number's digits in columns. `tagsAt` pops each column's place value (1, 10, 100…) right to
 * left; `row` writes a value under the columns, its first digit then each zero, so a digit's value
 * reads as "the digit, then zeros up to its column".
 */
export function PlaceNum({ n, place, tagsAt, tagGap = 350, hiAt, row }: {
  n: number; place: number; tagsAt?: number; tagGap?: number; hiAt?: number; row?: Row
}) {
  const ds = String(n).split('')
  const len = ds.length
  const rowDs = row ? String(row.value).padStart(len, ' ').split('') : []
  const firstRow = rowDs.findIndex(c => c !== ' ')
  const rowAt = (i: number) => row!.at + (i - firstRow) * row!.gap
  const cols: { i: number; comma: boolean }[] = []
  ds.forEach((_, i) => {
    cols.push({ i, comma: false })
    const p = len - 1 - i
    if (p > 0 && p % 3 === 0) cols.push({ i, comma: true })
  })
  const cell = (c: number, r: number, body: ReactNode, className = '', style?: CSSProperties) =>
    <span key={`${r}-${c}`} className={className} style={{ gridColumn: c + 1, gridRow: r, ...style }}>{body}</span>
  return (
    <div className="pt-place" style={{ gridTemplateColumns: cols.map(c => (c.comma ? '12px' : '46px')).join(' ') }}>
      {cols.map(({ i, comma }, c) => {
        const p = len - 1 - i
        if (comma) {
          const out = [cell(c, 1, ',', 'pt-digit')]
          if (row && firstRow >= 0 && firstRow <= i) out.push(cell(c, 3, ',', `pt-digit pt-row a-pop${row.wrong ? ' wrong' : ''}`, delay(rowAt(i + 1))))
          return out
        }
        const picked = p === place
        const out = [cell(c, 1, ds[i], `pt-digit${picked ? ' pick' : ''}${picked && row?.wrong ? ' a-blink' : ''}`)]
        if (tagsAt !== undefined) {
          out.push(cell(c, 2, <span className={`pt-pv a-pop${picked && hiAt !== undefined ? ' on' : ''}`} style={delay(tagsAt + p * tagGap)}>
            <span className={picked && hiAt !== undefined ? 'a-hi' : ''} style={hiAt !== undefined ? delay(hiAt) : undefined}>{10 ** p}</span>
          </span>))
        }
        if (row && rowDs[i] !== ' ') {
          out.push(cell(c, 3, rowDs[i], `pt-digit pt-row a-pop${row.wrong && i === firstRow ? ' wrong-pick' : ''}${row.wrong ? ' wrong' : ''}`, delay(rowAt(i))))
        }
        return out
      })}
    </div>
  )
}

const zeroSounds = (value: number, at: number, gap: number): Sounds => [
  ...String(value).split('').map((_, j): [number, () => void] => [at + j * gap, sfx.pop]),
  [at + String(value).length * gap, sfx.chime],
]

export function BigPlaceHelp({ data: { n, digit, place }, mode, chose }: HelpProps<DigitValue>) {
  const len = String(n).length
  const answer = digit * 10 ** place
  const tagsDone = 200 + len * 350
  const wrong = mode === 'wrong'
  useSounds(wrong ? [[300, sfx.pop]]
    : mode === 'solved' ? [[200, sfx.chime]]
      : [...counts(1, len, 200, 350), [tagsDone, sfx.chime], ...(mode === 'reveal' ? zeroSounds(answer, tagsDone + 500, 350) : [])])
  if (wrong) return <PlaceNum n={n} place={place} row={{ value: Number(chose), at: 200, gap: 0, wrong: true }} />
  if (mode === 'solved') return <PlaceNum n={n} place={place} tagsAt={0} tagGap={0} hiAt={0} row={{ value: answer, at: 0, gap: 0 }} />
  return (
    <PlaceNum n={n} place={place} tagsAt={200} hiAt={tagsDone}
      row={mode === 'reveal' ? { value: answer, at: tagsDone + 500, gap: 350 } : undefined} />
  )
}

/* ---------- area and perimeter ---------- */

interface AreaShow {
  /** Fill the first n cells row by row (more than fit spill over below; fewer leave gaps blinking when `wrong`). */
  cells?: { n: number; at: number; gap: number; nums?: boolean; wrong?: boolean }
  /** Light the rows one by one. */
  rows?: { at: number; gap: number }
  /** Tag the end of each row with the running total w, 2w, 3w… */
  rowTotals?: { at: number; gap: number }
  /** Light the sides (top, right, bottom, left), tagged with their length or the running total. */
  sides?: { at: number; gap: number; running: boolean }
  /** Number the unit edges all the way around (more than fit spill over; fewer leave gaps blinking). */
  units?: { n: number; at: number; gap: number }
}

const SIDE_ORDER = ['top', 'right', 'bottom', 'left'] as const

export function AreaPic({ w, h, show }: { w: number; h: number; show: AreaShow }) {
  const { cells, rows, rowTotals, sides, units } = show
  const area = w * h
  const perimeter = 2 * (w + h)
  // Unit edges clockwise from the top-left corner, as fractions of the grid.
  const edges: [number, number][] = [
    ...Array.from({ length: w }, (_, j): [number, number] => [(j + 0.5) / w, 0]),
    ...Array.from({ length: h }, (_, k): [number, number] => [1, (k + 0.5) / h]),
    ...Array.from({ length: w }, (_, j): [number, number] => [(w - j - 0.5) / w, 1]),
    ...Array.from({ length: h }, (_, k): [number, number] => [0, (h - k - 0.5) / h]),
  ]
  const lengths = [w, h, w, h]
  const sideTag = (s: number) => (sides!.running ? lengths.slice(0, s + 1).reduce((a, b) => a + b, 0) : lengths[s])
  return (
    <div className="pt-area">
      <div className="pt-side-n">{w}</div>
      <div className="pt-area-row">
        <div className="pt-side-n">{h}</div>
        <div className="pt-grid" style={{ gridTemplateColumns: `repeat(${w}, 32px)` }}>
          {Array.from({ length: area }, (_, i) => {
            const on = cells && i < cells.n
            return (
              <i key={i} className={on ? 'on a-pop' : cells?.wrong ? 'gap a-blink' : ''} style={on ? delay(cells.at + i * cells.gap) : cells?.wrong ? delay(cells.at + cells.n * cells.gap) : undefined}>
                {on && cells.nums && i + 1}
              </i>
            )
          })}
          {rows && Array.from({ length: h }, (_, r) => (
            <span key={`r${r}`} className="pt-rowhi a-fade" style={delay(rows.at + r * rows.gap, { top: `${(r / h) * 100}%`, height: `${100 / h}%` })} />
          ))}
          {rowTotals && Array.from({ length: h }, (_, r) => (
            <span key={`t${r}`} className="pt-rowtag tag-n" style={delay(rowTotals.at + r * rowTotals.gap, { top: `${((r + 0.5) / h) * 100}%` })}>{(r + 1) * w}</span>
          ))}
          {sides && SIDE_ORDER.map((side, s) => (
            <span key={side} className={`pt-edge ${side} a-fade`} style={delay(sides.at + s * sides.gap)}>
              <span className="tag-n" style={delay(sides.at + s * sides.gap, { position: 'static' })}>{sideTag(s)}</span>
            </span>
          ))}
          {units && edges.map(([x, y], i) => (
            <span key={`u${i}`} className={`pt-unit ${i < units.n ? 'on a-pop' : 'gap a-blink'}`}
              style={delay(units.at + Math.min(i, units.n) * units.gap, { left: `${x * 100}%`, top: `${y * 100}%` })}>
              {i < units.n && i + 1}
            </span>
          ))}
        </div>
      </div>
      {cells && cells.n > area && (
        <div className="pt-spill">{Array.from({ length: cells.n - area }, (_, i) => <i key={i} className="a-shake" style={delay(cells.at + area * cells.gap)} />)}</div>
      )}
      {units && units.n > perimeter && (
        <div className="pt-spill">{Array.from({ length: units.n - perimeter }, (_, i) => <span key={i} className="pt-unit over a-shake" style={delay(units.at + perimeter * units.gap)} />)}</div>
      )}
    </div>
  )
}

export function AreaHelp({ data: { w, h, ask }, mode, chose }: HelpProps<Area>) {
  const isArea = ask === 'area'
  const answer = isArea ? w * h : 2 * (w + h)
  const c = Number(chose)
  const solved = mode === 'solved'
  // Area: the first row counted, then each row lit, then (reveal) the running totals down the rows.
  // Perimeter: the four sides lit one by one with their lengths (reveal: the running total instead).
  const rowsAt = 300 + w * 250
  const totalsAt = rowsAt + h * 400 + 200
  const done = isArea ? totalsAt + h * 400 : 300 + 4 * 700
  useSounds(mode === 'wrong' ? [[200 + Math.min(c, 40) * 60, sfx.pop]]
    : solved ? [[200, sfx.chime]]
      : [...(isArea ? counts(1, w, 300, 250) : counts(1, 4, 300, 700)),
        ...(mode === 'reveal' ? [...(isArea ? counts(w, h, totalsAt, 400) : []), [done, sfx.chime] as [number, () => void]] : [])])

  let show: AreaShow
  let eq: ReactNode = null
  if (mode === 'wrong') {
    // The chosen number, counted in this question's own units: squares inside, or edges around.
    show = isArea ? { cells: { n: c, at: 200, gap: 60, nums: true, wrong: true } } : { units: { n: c, at: 200, gap: 60 } }
    eq = <Eq wrong><span className="wrong-pick">{c}</span></Eq>
  } else if (isArea) {
    show = {
      cells: { n: w, at: solved ? 0 : 300, gap: solved ? 0 : 250, nums: !solved },
      rows: { at: solved ? 0 : rowsAt, gap: solved ? 0 : 400 },
      ...(mode !== 'strategy' ? { rowTotals: { at: solved ? 0 : totalsAt, gap: solved ? 0 : 400 } } : {}),
    }
    if (mode !== 'strategy') eq = <Eq at={solved ? 0 : done}>{red(h)} × {blue(w)} = {answer}</Eq>
  } else {
    show = { sides: { at: solved ? 0 : 300, gap: solved ? 0 : 700, running: mode !== 'strategy' } }
    if (mode !== 'strategy') eq = <Eq at={solved ? 0 : done}>{w} + {h} + {w} + {h} = {answer}</Eq>
  }
  return <div className="pt-col"><AreaPic w={w} h={h} show={show} />{eq}</div>
}

/* ---------- decimals ---------- */

interface BarShow {
  /** Parts filled; they pop in from `at`, `gap` apart. */
  on: number; at?: number; gap?: number
  /** Tags over the filled parts. */
  tags?: { texts: string[]; at: number; gap: number }
  /** The first `mark` parts outlined: the child's choice. */
  mark?: number
  /** A bar that isn't in the picture, only in the child's choice. */
  ghost?: boolean
  /** A tag beside the bar (a whole bar is 1). */
  label?: { text: string; at: number }
}

export function Bars({ bars }: { bars: BarShow[] }) {
  return (
    <div className="pt-bars">
      {bars.map((b, j) => (
        <div className="pt-bar-row" key={j}>
          <div className={`pt-bar${b.ghost ? ' ghost' : ''}`}>
            {Array.from({ length: 10 }, (_, i) => (
              <i key={i} className={i < b.on ? 'on a-pop' : ''} style={i < b.on ? delay((b.at ?? 0) + i * (b.gap ?? 0)) : undefined}>
                {b.mark !== undefined && i < b.mark && <span className={`pt-mark${i < b.on ? '' : ' miss'}`} />}
                {b.tags && i < b.tags.texts.length && <Tag at={b.tags.at + i * b.tags.gap}>{b.tags.texts[i]}</Tag>}
              </i>
            ))}
          </div>
          <span className="pt-bar-label">{b.label && <span className="tag-n" style={delay(b.label.at, { position: 'static' })}>{b.label.text}</span>}</span>
        </div>
      ))}
    </div>
  )
}

const tenths = (k: number) => Array.from({ length: k }, (_, i) => `0.${i + 1}`)

export function DecimalHelp({ data: { whole, k }, mode, chose }: HelpProps<Decimal>) {
  const [cw, ck] = String(chose ?? '0.0').split('.').map(Number)
  const wholeTags = whole * 300
  const partsAt = 300 + wholeTags
  useSounds(mode === 'wrong' ? [[300, sfx.pop]]
    : mode === 'solved' ? [[200, sfx.chime]]
      : [...counts(1, k, partsAt, 500), ...(mode === 'reveal' ? [[partsAt + k * 500 + 300, sfx.chime] as [number, () => void]] : [])])
  const answer = <>{whole > 0 && <>{red(whole)} + </>}{blue(`0.${k}`)}{whole > 0 && <> = {whole}.{k}</>}</>

  if (mode === 'wrong') {
    // The choice outlined on the bars: whole bars, then parts (a dashed bar if it needs one more).
    const n = Math.max(whole, cw) + 1
    const bars: BarShow[] = Array.from({ length: n }, (_, b) => ({
      on: b < whole ? 10 : b === whole ? k : 0,
      ghost: b > whole,
      mark: b < cw ? 10 : b === cw ? ck : 0,
    }))
    return <div className="pt-col"><Bars bars={bars} /><Eq wrong><span className="wrong-pick">{String(chose)}</span></Eq></div>
  }
  const solved = mode === 'solved'
  const bars: BarShow[] = [
    ...Array.from({ length: whole }, (_, b): BarShow => ({ on: 10, label: { text: '1', at: solved ? 0 : 300 + b * 300 } })),
    {
      on: k,
      // The strategy counts the parts 1, 2, 3; the reveal names them 0.1, 0.2, 0.3.
      tags: { texts: mode === 'strategy' ? Array.from({ length: k }, (_, i) => String(i + 1)) : tenths(k), at: solved ? 0 : partsAt, gap: solved ? 0 : 500 },
    },
  ]
  return <div className="pt-col"><Bars bars={bars} />{mode !== 'strategy' && <Eq>{answer}</Eq>}</div>
}
