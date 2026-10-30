// 位值山谷's pictures: blocks in place columns, a number with its blocks under each digit, and a
// column sum worked one column at a time; plus the help each practice level shows after a miss.
import type { ReactNode } from 'react'
import type { Blocks, Column, DigitValue } from '../../game/quizzes'
import { sfx } from '../../sound'
import { counts, delay, useSounds, type HelpProps } from './kit'
import { ITEM, ORDER, PLACE_OF, WORTH, columnParts, countTimes, litSounds, split, type Place } from './placeMath'
import './place.css'

/** Numbers that replace each other in one slot, each popping in at its time (no state needed). */
export function Ticker({ values, at }: { values: ReactNode[]; at: number[] }) {
  return <>{values.map((v, i) => <span key={i} className="a-pop" style={delay(at[i])}>{v}</span>)}</>
}

/** Blocks sorted into place columns. `lit` lights blocks up at those times; `slots` go under each column. */
export function PV({ n, places, lit, slots }: {
  n: Record<Place, number>
  places: Place[]
  lit?: Record<Place, number[]>
  slots?: Partial<Record<Place, ReactNode>>
}) {
  return (
    <div className="pv">
      {places.map(p => (
        <div key={p} className={`pv-col ${p}`}>
          <div className="pv-items">
            {Array.from({ length: n[p] }, (_, i) => (
              <i key={i} className={`${ITEM[p]}${lit ? ' a-hi' : ''}`} style={lit ? delay(lit[p][i]) : undefined} />
            ))}
          </div>
          {slots && <div className="pv-slot">{slots[p]}</div>}
        </div>
      ))}
    </div>
  )
}

/** "200 + 30 + 4 = 234", each part in its place's colour. */
export function PlaceSum({ n, places, at = 0 }: { n: number; places: Place[]; at?: number }) {
  const d = split(n)
  const parts = places.filter(p => d[p] > 0 || p === 'o')
  return (
    <div className="pv-eq a-pop" style={delay(at)}>
      {parts.map((p, i) => <span key={p}>{i > 0 && ' + '}<span className={`c-${p}`}>{d[p] * WORTH[p]}</span></span>)} = {n}
    </div>
  )
}

/* ---------- 積木合體 ---------- */

export function BlocksHelp({ data: { n }, mode, chose }: HelpProps<Blocks>) {
  const d = split(n)
  const big = n >= 100 || (typeof chose === 'number' && chose >= 100)
  const places: Place[] = big ? ORDER : ['t', 'o']
  const quick = mode === 'solved'
  const { at, end } = countTimes(d, places, quick ? 0 : 300, quick ? 0 : 380)
  // Under each column: its running count (100, 200… / 10, 20… / 1, 2…).
  const tickers: Partial<Record<Place, ReactNode>> = {}
  for (const p of places) {
    tickers[p] = d[p] === 0
      ? <Ticker values={['0']} at={[at[p][0] ?? 0]} />
      : <Ticker values={at[p].map((_, i) => (i + 1) * WORTH[p])} at={at[p]} />
  }
  useSounds(mode === 'wrong' ? []
    : quick ? [[150, sfx.chime]]
      : [...litSounds(at, places), ...(mode === 'reveal' ? [[end, sfx.chime] as [number, () => void]] : [])])

  if (mode === 'wrong') {
    // The chosen number's digits under the blocks they claim to count: wrong ones shake.
    const c = split(chose as number)
    const slots: Partial<Record<Place, ReactNode>> = {}
    for (const p of places) slots[p] = <span className={c[p] === d[p] ? 'ok' : 'bad'}>{c[p]}</span>
    return <div className="pv-wrap"><PV n={d} places={places} slots={slots} /></div>
  }
  return (
    <div className="pv-wrap">
      <PV n={d} places={places} lit={at} slots={tickers} />
      {mode !== 'strategy' && <PlaceSum n={n} places={places} at={quick ? 0 : end} />}
    </div>
  )
}

/* ---------- 數字住哪裡 ---------- */

/**
 * A number in place columns. `hi` highlights one digit; `blocks` shows that digit's blocks popping in;
 * `under` writes a value lined up by place underneath (so 50 sits under the tens and ones).
 */
export function Places({ n, hi, blocks, under }: {
  n: number
  hi?: { place: number; at: number }
  blocks?: { place: number; at: number; gap: number }[]
  under?: { text: string; cls: string; at: number }
}) {
  const ds = String(n).split('')
  const u = under ? under.text.padStart(ds.length, ' ').slice(-ds.length).split('') : []
  return (
    <div className="places">
      {ds.map((ch, i) => {
        const place = ds.length - 1 - i
        const b = blocks?.find(x => x.place === place)
        return (
          <div key={i} className="place">
            <span className={`digit c-${PLACE_OF(place)}${hi?.place === place ? ' a-hi' : ''}`} style={hi?.place === place ? delay(hi.at) : undefined}>{ch}</span>
            <div className="pv-items">
              {b && Array.from({ length: Number(ch) }, (_, k) => (
                <i key={k} className={`${ITEM[PLACE_OF(place)]} a-pop`} style={delay(b.at + k * b.gap)} />
              ))}
            </div>
            {under && <span className={`under ${under.cls} a-pop`} style={delay(under.at + i * 150)}>{u[i].trim()}</span>}
          </div>
        )
      })}
    </div>
  )
}

export function DigitHelp({ data: { n, digit, place }, mode, chose }: HelpProps<DigitValue>) {
  const answer = digit * 10 ** place
  const quick = mode === 'solved'
  const blocksAt = quick ? 0 : 700
  const gap = quick ? 0 : 350
  const underAt = blocksAt + digit * gap + 400
  useSounds(mode === 'wrong' ? []
    : quick ? [[150, sfx.chime]]
      : [...counts(1, digit, blocksAt, gap), ...(mode === 'reveal' ? [[underAt, sfx.chime] as [number, () => void]] : [])])
  if (mode === 'wrong') {
    // The chosen value lined up under the number: its first digit lands in the wrong place.
    return <div className="pv-wrap"><Places n={n} hi={{ place, at: 0 }} under={{ text: String(chose), cls: 'bad a-shake', at: 200 }} /></div>
  }
  return (
    <div className="pv-wrap">
      <Places
        n={n}
        hi={{ place, at: quick ? 0 : 200 }}
        blocks={[{ place, at: blocksAt, gap }]}
        under={mode === 'strategy' ? undefined : { text: String(answer), cls: 'good', at: quick ? 0 : underAt }}
      />
    </div>
  )
}

/* ---------- 直式加減 ---------- */

export interface Digit { v: string; at: number; cls?: string }

/**
 * A two-digit column sum: sign | tens | ones. `bands` light a column at a time; `carry` puts the
 * carried 1 over the tens; `borrow` crosses out a ten and lends it to the ones; `res` fills the answer row.
 */
export function ColSum({ a, b, op, bands = [], carry, borrow, res = {}, missTop }: {
  a: number; b: number; op: '+' | '-'
  bands?: { col: 't' | 'o'; at: number }[]
  carry?: number
  borrow?: number
  res?: { t?: Digit; o?: Digit }
  /** The forgotten carry or borrow: the spot over the tens blinks. */
  missTop?: boolean
}) {
  const band = (col: 't' | 'o') => {
    const x = bands.filter(y => y.col === col)
    return x.length ? { className: 'band', style: delay(x[0].at) } : {}
  }
  const bandAt = (col: 't' | 'o', extra = '') => {
    const p = band(col)
    return { className: `${p.className ?? ''} ${extra}`.trim(), style: p.style }
  }
  const [a1, a0, b1, b0] = [Math.floor(a / 10), a % 10, Math.floor(b / 10), b % 10]
  const top = carry !== undefined ? <span className="a-arrive" style={delay(carry)}>1</span>
    : borrow !== undefined ? <span className="a-pop" style={delay(borrow)}>{a1 - 1}</span>
      : null
  const cell = (d?: Digit) => d && <span className={`a-pop ${d.cls ?? ''}`} style={delay(d.at)}>{d.v}</span>
  return (
    <div className="colsum">
      <span className="mini" />
      <span className={`mini${missTop ? ' miss' : ''}`}>{top}</span>
      <span className="mini" />

      <span />
      <span {...bandAt('t')}>{a1 || ''}{borrow !== undefined && <i className="slash a-pop" style={delay(borrow)} />}</span>
      <span {...bandAt('o')}>{borrow !== undefined && <span className="lend a-pop" style={delay(borrow + 400)}>1</span>}{a0}</span>

      <span>{op === '+' ? '+' : '−'}</span>
      <span {...bandAt('t')}>{b1 || ''}</span>
      <span {...bandAt('o')}>{b0}</span>

      <hr />
      <span />
      <span {...bandAt('t', 'res')}>{cell(res.t)}</span>
      <span {...bandAt('o', 'res')}>{cell(res.o)}</span>
    </div>
  )
}

export function ColumnHelp({ data: { a, b, op }, mode, chose }: HelpProps<Column>) {
  const w = columnParts(a, b, op)
  const tensText = w.tens ? String(w.tens) : ''
  const quick = mode === 'solved'
  const t = quick ? { band: 0, ones: 0, mark: 0, tensBand: 0, tens: 0 } : { band: 200, ones: 1000, mark: 1700, tensBand: 2500, tens: 3300 }
  useSounds(mode === 'wrong' ? [] : quick ? [[150, sfx.chime]] : [
    [t.ones, sfx.pop],
    ...(w.carry || w.borrow ? [[t.mark, sfx.pop] as [number, () => void]] : []),
    ...(mode === 'reveal' ? [[t.tens, sfx.chime] as [number, () => void]] : []),
  ])
  if (mode === 'wrong') {
    const c = chose as number
    const [c1, c0] = [Math.floor(c / 10), c % 10]
    const onesWrong = c0 !== w.ones
    return (
      <div className="pv-wrap">
        <ColSum
          a={a} b={b} op={op}
          res={{ t: { v: c1 ? String(c1) : '', at: 0, cls: c1 !== w.tens ? 'pick' : '' }, o: { v: String(c0), at: 0, cls: onesWrong ? 'pick' : '' } }}
          // Ones right but tens wrong: usually the carry or borrow was forgotten, so its spot blinks.
          missTop={!onesWrong && (w.carry || w.borrow)}
        />
      </div>
    )
  }
  return (
    <div className="pv-wrap">
      <ColSum
        a={a} b={b} op={op}
        bands={[{ col: 'o', at: t.band }, { col: 't', at: t.tensBand }]}
        carry={w.carry ? t.mark : undefined}
        borrow={w.borrow ? t.mark : undefined}
        res={{ o: { v: String(w.ones), at: t.ones }, t: mode === 'strategy' ? { v: '?', at: t.tensBand } : { v: tensText, at: t.tens } }}
      />
    </div>
  )
}

