// 挑戰島's wordless pictures and the help shown after a miss (see challenge.tsx).
import type { ReactNode } from 'react'
import type { Balance, Legs, Pattern } from '../../game/quizzes'
import { sfx } from '../../sound'
import { delay, useSounds, type HelpProps, type Sounds } from './kit'
import './challenge.css'

const red = (x: ReactNode) => <b className="eq-a">{x}</b>
const blue = (x: ReactNode) => <b className="eq-b">{x}</b>
const signed = (n: number) => (n < 0 ? `−${-n}` : `+${n}`)
const chime = (at: number): Sounds => [[at, sfx.chime]]

/** A number tag centred above whatever it sits in (which must be position: relative). */
function Tag({ at = 0, className = '', children }: { at?: number; className?: string; children: ReactNode }) {
  return <span className="ch-tag"><span className={`tag-n ${className}`} style={delay(at, { position: 'static' })}>{children}</span></span>
}

function Eq({ children, at = 0, wrong = false }: { children: ReactNode; at?: number; wrong?: boolean }) {
  return <div className={`eq-row ${wrong ? 'a-shake' : 'a-fade'}`} style={delay(at)}>{children}</div>
}

/* ---------- 找規律 ---------- */

/** The term after `terms`, continuing how the change itself changes. */
const nextTerm = (terms: number[]) => {
  const gaps = terms.slice(1).map((t, i) => t - terms[i])
  return terms[3] + (gaps[2] - gaps[1]) + gaps[2]
}

/**
 * Four terms and a last bubble. Arcs above carry the change between neighbours (popping in from
 * `gaps.at`); the last arc leads to the last bubble, which holds `last` (or ? until then).
 */
export function PatternRow({ terms, popAt, gaps, last }: {
  terms: number[]
  popAt?: number
  gaps?: { at: number; gap: number; count: 3 | 4; lastGap: number; wrong?: boolean }
  last?: { value: number; at: number; wrong?: boolean }
}) {
  const all = [...terms, last?.value]
  return (
    <div className="ch-pattern">
      {all.map((t, i) => (
        <span key={`b${i}`} className="ch-term" style={{ gridColumn: i * 2 + 1 }}>
          {i < 4
            ? <span className={`bubble-num${popAt !== undefined ? ' a-pop' : ''}`} style={popAt !== undefined ? delay(popAt + i * 300) : undefined}>{t}</span>
            : <span className="bubble-num ask">
              {last
                ? <><span className="ch-out ch-ask" style={delay(last.at)}>?</span><span className={`ch-in a-pop${last.wrong ? ' wrong-pick' : ''}`} style={delay(last.at)}>{last.value}</span></>
                : '?'}
            </span>}
        </span>
      ))}
      {gaps && Array.from({ length: gaps.count }, (_, i) => {
        const value = i < 3 ? terms[i + 1] - terms[i] : gaps.lastGap
        const isLast = i === 3
        return (
          <span key={`g${i}`} className={`ch-gap a-pop${isLast ? (gaps.wrong ? ' wrong a-shake' : ' next') : ''}`}
            style={delay(gaps.at + i * gaps.gap, { gridColumn: `${i * 2 + 1} / span 3` })}>
            {signed(value)}
          </span>
        )
      })}
    </div>
  )
}

const gapNotes = (n: number, at: number, gap: number): Sounds => Array.from({ length: n }, (_, i) => [at + i * gap, () => sfx.count(i + 1)])

export function PatternHelp({ data: { terms }, mode, chose }: HelpProps<Pattern>) {
  const next = nextTerm(terms)
  const lastGap = next - terms[3]
  const shown = 300 + 3 * 600
  useSounds(mode === 'wrong' ? []
    : mode === 'solved' ? chime(200)
      : [...gapNotes(4, 300, 600), ...(mode === 'reveal' ? chime(shown + 900) : [])])
  if (mode === 'wrong') {
    // The choice in the last bubble: its change doesn't follow the others.
    const c = Number(chose)
    return <PatternRow terms={terms} gaps={{ at: 200, gap: 250, count: 4, lastGap: c - terms[3], wrong: true }} last={{ value: c, at: 0, wrong: true }} />
  }
  const solved = mode === 'solved'
  return (
    <div className="ch-col">
      <PatternRow terms={terms} gaps={{ at: solved ? 0 : 300, gap: solved ? 0 : 600, count: 4, lastGap }}
        last={mode === 'strategy' ? undefined : { value: next, at: solved ? 0 : shown + 900 }} />
      {mode !== 'strategy' && <Eq at={solved ? 0 : shown + 900}>{terms[3]} {blue(signed(lastGap).replace(/^([+−])/, '$1 '))} = {next}</Eq>}
    </div>
  )
}

/* ---------- 天平推理 ---------- */

/**
 * A balance: `copies` fruits (each optionally tagged) plus a weight on the left, weights on the right.
 * `tilt` (degrees, positive = right side down) leans the beam; `settle` swings it level instead.
 * `take` removes `extra` from both pans at `take` ms; `piles` shows one fruit = value per copy.
 */
export function BalancePic({ fruit, copies, extra, total, tilt = 0, settle = false, fruitTag, take, piles }: {
  fruit: string; copies: number; extra: number; total: number
  tilt?: number
  settle?: boolean
  fruitTag?: { text: string; at: number; gap: number }
  take?: number
  piles?: { text: string; at: number; gap: number }
}) {
  return (
    <div className="balance ch-balance">
      <div className={`ch-scale${settle ? ' settle' : tilt ? ' tilting' : ''}`} style={{ transform: `rotate(${tilt}deg)` }}>
        <div className="pans">
          <div className="pan">
            {Array.from({ length: copies }, (_, i) => (
              <span key={i} className="ch-fruit">{fruit}{fruitTag && <Tag at={fruitTag.at + i * fruitTag.gap}>{fruitTag.text}</Tag>}</span>
            ))}
            {extra > 0 && <span className={`weight${take !== undefined ? ' a-leave' : ''}`} style={take !== undefined ? delay(take) : undefined}>{extra}</span>}
          </div>
          <div className="pan">
            {take !== undefined && extra > 0
              ? <><span className="weight">{total - extra}</span><span className="weight a-leave" style={delay(take)}>{extra}</span></>
              : <span className="weight">{total}</span>}
          </div>
        </div>
        <div className="beam" />
      </div>
      <div className="fulcrum">▲</div>
      {piles && (
        <div className="ch-piles">
          {Array.from({ length: copies }, (_, i) => (
            <span key={i} className="ch-pile a-pop" style={delay(piles.at + i * piles.gap)}>{fruit} = <span className="weight">{piles.text}</span></span>
          ))}
        </div>
      )}
    </div>
  )
}

export function BalanceHelp({ data: { fruit, copies, extra, total }, mode, chose }: HelpProps<Balance>) {
  const value = (total - extra) / copies
  const pilesAt = extra > 0 ? 1400 : 400
  useSounds(mode === 'wrong' ? [[200, sfx.pop]]
    : mode === 'solved' ? chime(200)
      : [...(extra > 0 ? [[500, sfx.pop] as [number, () => void]] : []),
        ...Array.from({ length: copies }, (_, i): [number, () => void] => [pilesAt + i * 500, () => sfx.count(i + 1)]),
        ...(mode === 'reveal' ? chime(pilesAt + copies * 500 + 200) : [])])
  const pic = { fruit, copies, extra, total }
  const working = extra > 0
    ? <>{total} − {extra} = {total - extra}, {total - extra} ÷ {red(copies)} = {blue(value)}</>
    : <>{total} ÷ {red(copies)} = {blue(value)}</>

  if (mode === 'wrong') {
    // Each fruit weighs the choice: the beam leans to the heavier side.
    const c = Number(chose)
    const left = c * copies + extra
    return (
      <div className="ch-col">
        <BalancePic {...pic} tilt={left > total ? -9 : 9} fruitTag={{ text: String(c), at: 0, gap: 0 }} />
        <Eq wrong>{[copies > 3 ? `${copies} × ${c}` : Array(copies).fill(c).join(' + '), ...(extra ? [extra] : [])].join(' + ')} = {red(left)} ≠ {total}</Eq>
      </div>
    )
  }
  if (mode === 'solved') {
    return (
      <div className="ch-col">
        <BalancePic {...pic} fruitTag={{ text: String(value), at: 0, gap: 0 }} piles={{ text: String(value), at: 0, gap: 0 }} take={extra > 0 ? 0 : undefined} />
        <Eq>{working}</Eq>
      </div>
    )
  }
  // Take the extra off both sides, then share what's left between the fruits.
  const reveal = mode === 'reveal'
  return (
    <div className="ch-col">
      <BalancePic {...pic} take={extra > 0 ? 500 : undefined} piles={{ text: reveal ? String(value) : '?', at: pilesAt, gap: 500 }} />
      {reveal && <Eq at={pilesAt + copies * 500 + 200}>{working}</Eq>}
    </div>
  )
}

/* ---------- 雞兔同籠 ---------- */

export interface Animal {
  kind: 'chicken' | 'rabbit' | 'unknown'
  at?: number
  /** Show the animal's legs (2 or 4) as a tag. */
  tag?: boolean
  /** A chicken that becomes a rabbit at this time. */
  swap?: number
}

function AnimalSpan({ a }: { a: Animal }) {
  const emoji = { chicken: '🐔', rabbit: '🐰', unknown: '❓' }[a.kind]
  return (
    <span className="ch-animal a-pop" style={delay(a.at ?? 0)}>
      {a.swap === undefined
        ? <>{emoji}{a.tag && <Tag at={a.at}>{a.kind === 'rabbit' ? 4 : 2}</Tag>}</>
        : <>
          <span className="ch-out" style={delay(a.swap)}>🐔{a.tag && <Tag at={a.at}>2</Tag>}</span>
          <span className="ch-in a-pop" style={delay(a.swap)}>🐰<Tag at={a.swap}>4</Tag></span>
        </>}
    </span>
  )
}

/** Heads and legs counts, the animals, and spare legs in pairs (each pair can fly off at `leave`). */
export function Barn({ heads, legs, animals, countsAt, feet }: {
  heads: number; legs: number; animals: Animal[]; countsAt?: number
  feet?: { pairs: number; at: number; leave?: number; gap?: number }
}) {
  return (
    <div className="legs ch-legs">
      <div className="counts">
        <span className={countsAt !== undefined ? 'a-pop' : ''} style={countsAt !== undefined ? delay(countsAt) : undefined}>🙂 × {heads}</span>
        <span className={countsAt !== undefined ? 'a-pop' : ''} style={countsAt !== undefined ? delay(countsAt + 400) : undefined}>🦶 × {legs}</span>
      </div>
      <div className="ch-animals">{animals.map((a, i) => <AnimalSpan key={i} a={a} />)}</div>
      {feet && feet.pairs > 0 && (
        <div className="ch-feet">
          {Array.from({ length: feet.pairs }, (_, i) => (
            <span key={i} className={`ch-pair a-pop${feet.leave !== undefined ? ' leaving' : ' a-blink'}`}
              style={delay(feet.at, feet.leave !== undefined ? { animationDelay: `${feet.at}ms, ${feet.leave + i * (feet.gap ?? 0)}ms` } : undefined)}>🦶🦶</span>
          ))}
        </div>
      )}
    </div>
  )
}

const chickens = (n: number, at: number, gap: number): Animal[] =>
  Array.from({ length: n }, (_, i) => ({ kind: 'chicken', tag: true, at: at + i * gap }))

export function LegsHelp({ data: { heads, legs, rabbits }, mode, chose }: HelpProps<Legs>) {
  const spare = legs - 2 * heads
  const pairs = spare / 2
  const allIn = 200 + heads * 300
  const swapAt = allIn + 1000
  useSounds(mode === 'wrong' ? [[200, sfx.pop]]
    : mode === 'solved' ? chime(200)
      : [...Array.from({ length: heads }, (_, i): [number, () => void] => [200 + i * 300, () => sfx.count(i + 1)]),
        [allIn + 200, sfx.pop],
        ...(mode === 'reveal' ? [...Array.from({ length: pairs }, (_, i): [number, () => void] => [swapAt + i * 700, () => sfx.count(i + 1)]), ...chime(swapAt + pairs * 700)] : [])])

  if (mode === 'wrong') {
    // That many rabbits, the rest chickens: their legs don't add up to the count.
    const c = Number(chose)
    const total = 4 * c + 2 * (heads - c)
    const animals: Animal[] = Array.from({ length: heads }, (_, i) => ({ kind: i < c ? 'rabbit' : 'chicken', tag: true, at: i * 150 }))
    return (
      <div className="ch-col">
        <Barn heads={heads} legs={legs} animals={animals} />
        <Eq wrong>🦶 × {red(total)} ≠ {legs}</Eq>
      </div>
    )
  }
  if (mode === 'solved') {
    const animals: Animal[] = Array.from({ length: heads }, (_, i) => ({ kind: i < rabbits ? 'rabbit' : 'chicken', tag: true }))
    return (
      <div className="ch-col">
        <Barn heads={heads} legs={legs} animals={animals} />
        <Eq>🐰 × {blue(rabbits)}, 🐔 × {heads - rabbits}</Eq>
      </div>
    )
  }
  // All chickens first; the spare legs, two at a time, turn chickens into rabbits.
  const reveal = mode === 'reveal'
  const animals = chickens(heads, 200, 300).map((a, i) => (reveal && i < pairs ? { ...a, swap: swapAt + i * 700 } : a))
  return (
    <div className="ch-col">
      <Barn heads={heads} legs={legs} animals={animals} feet={{ pairs, at: allIn + 200, ...(reveal ? { leave: swapAt - 300, gap: 700 } : {}) }} />
      <Eq at={allIn}>{heads} × 2 = {2 * heads}, {legs} − {2 * heads} = {spare}</Eq>
      {reveal && <Eq at={swapAt + pairs * 700}>{spare} ÷ 2 = {blue(rabbits)}</Eq>}
    </div>
  )
}
