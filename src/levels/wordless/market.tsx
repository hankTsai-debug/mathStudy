// 時間錢幣市集, shown without words: the minute hand sweeps and tags 5, 10, 15…; coins light up
// biggest first with a running total; change is counted up from the price in hops, coin by coin.
// A registry module: its components are private to the lessons and help it exports.
/* oxlint-disable react/only-export-components */
import type { CSSProperties, ReactNode } from 'react'
import { formatTime, type Change, type Clock, type Coins } from '../../game/quizzes'
import { sfx } from '../../sound'
import { counts, delay, helpOf, useSounds, type AnimBeat, type HelpProps, type Helps, type Lessons, type Sounds } from './kit'
import './market.css'

/* ---------- clock ---------- */

/** One number on the face the minute hand passes, in ms from the start. */
const STEP = 500
const hourAngle = (h: number, m: number) => ((h % 12) + m / 60) * 30
const onFace = (k: number, r: number) => [100 + r * Math.sin((k * Math.PI) / 6), 100 - r * Math.cos((k * Math.PI) / 6)]

interface ClockTag { k: number; text: string; at: number }

/**
 * A clock whose hands turn from `from` minutes to `m` (one number every STEP ms, starting `start` ms in).
 * Tags sit on the numbers the minute hand has passed; `ring` circles the hour; `hi` lights up one hand.
 */
function ClockFace({ h, m, from = m, start = 0, tags = [], ring, ringAt = 0, hi, ghost, small }: {
  h: number; m: number; from?: number; start?: number; tags?: ClockTag[]
  ring?: number; ringAt?: number; hi?: 'hour' | 'minute'; ghost?: boolean; small?: boolean
}) {
  const ms = ((m - from) / 5) * STEP
  const hand = (cls: string, a0: number, a1: number, y2: number) => (
    <line
      className={`${cls}${hi && cls === hi ? ' mk-hi' : ''}`} x1="100" y1="100" x2="100" y2={y2}
      style={{
        transformOrigin: '100px 100px', transform: `rotate(${a1}deg)`,
        ...(a0 !== a1 && { animation: `mk-turn ${ms}ms linear ${start}ms backwards`, '--from': `${a0}deg`, '--to': `${a1}deg` }),
      } as CSSProperties}
    />
  )
  return (
    <svg className={`clock${ghost ? ' mk-ghost' : ''}${small ? ' mk-small' : ''}`} viewBox="0 0 200 200">
      <circle cx="100" cy="100" r="92" />
      {Array.from({ length: 12 }, (_, i) => {
        const [x, y] = onFace(i + 1, 72)
        return <text key={i} x={x} y={y + 7}>{i + 1}</text>
      })}
      {ring !== undefined && (() => {
        const [x, y] = onFace(ring, 72)
        return <circle className="mk-ring" cx={x} cy={y} r="16" style={delay(ringAt)} />
      })()}
      {tags.map(({ k, text, at }) => {
        const [x, y] = onFace(k, 72)
        return (
          <g key={k} className="mk-tag" style={delay(at)}>
            <circle cx={x} cy={y} r="15" />
            <text x={x} y={y + 5}>{text}</text>
          </g>
        )
      })}
      {hand('hour', hourAngle(h, from), hourAngle(h, m), 52)}
      {hand('minute', from * 6, m * 6, 28)}
      <circle className="pin" cx="100" cy="100" r="5" />
    </svg>
  )
}

/** Tags 5, 10, 15… on the numbers the minute hand passes from `from` to `m`; the last can be `last`. */
const minuteTags = (from: number, m: number, start: number, last?: string): ClockTag[] =>
  Array.from({ length: (m - from) / 5 }, (_, j) => {
    const k = from / 5 + j + 1
    return { k, text: k === m / 5 && last ? last : String(k * 5), at: start + (j + 1) * STEP }
  })

const Eq = ({ children, at = 0 }: { children: ReactNode; at?: number }) =>
  <div className="eq-row a-pop" style={delay(at)}>{children}</div>

function ClockHelp({ data: { h, m }, mode, chose }: HelpProps<Clock>) {
  const steps = m / 5
  const sweep = 900
  const end = sweep + steps * STEP
  const sounds: Sounds = mode === 'wrong' ? [[0, sfx.pop]]
    : mode === 'solved' ? [[200, sfx.chime]]
      : [[0, sfx.pop], ...counts(1, steps, sweep + STEP, STEP), ...(mode === 'reveal' ? [[end + 300, sfx.right] as Sounds[number]] : [])]
  useSounds(sounds)

  if (mode === 'wrong') {
    const [ch, cm] = String(chose).split(':').map(Number)
    return (
      <div className="mk-col">
        <div className="mk-pair">
          <div className="mk-col"><ClockFace h={h} m={m} small /><b className="mk-cap">?</b></div>
          <div className="mk-col wrong-pick"><ClockFace h={ch} m={cm} ghost small /><b className="mk-cap">{String(chose)}</b></div>
        </div>
      </div>
    )
  }
  // The hour first (the short hand's number lights up), then the long hand sweeps from 12 counting by fives.
  const solved = mode === 'solved'
  const last = mode === 'strategy' ? '?' : undefined
  const tags = m === 0
    ? [{ k: 12, text: mode === 'strategy' ? '?' : '00', at: sweep }]
    : minuteTags(0, m, solved ? -STEP : sweep, last).map((t, j) => (solved ? { ...t, at: j * 120 } : t))
  return (
    <div className="mk-col">
      <ClockFace h={h} m={m} from={solved ? m : 0} start={sweep} tags={tags} ring={h} hi="hour" />
      {mode !== 'strategy' && <Eq at={solved ? 200 : end + 300}>{formatTime(h, m)}</Eq>}
    </div>
  )
}

const clock: AnimBeat[] = [
  // The short hand points at 3, the long hand at 12: 3 o'clock.
  {
    ms: 4200,
    show: <ClockFace h={3} m={0} ring={3} ringAt={300} hi="hour" />,
    eq: <span className="a-pop" style={delay(1600)}>3:00</span>,
    sounds: [[300, sfx.pop], [1600, sfx.chime]],
  },
  // The long hand sweeps to 3, tagging 5, 10, 15.
  {
    ms: 4400,
    show: <ClockFace h={3} m={15} from={0} start={500} tags={minuteTags(0, 15, 500)} hi="minute" />,
    eq: <span className="a-pop" style={delay(2400)}>3 × 5 = 15 → 3:15</span>,
    sounds: [...counts(1, 3, 1000, STEP), [2400, sfx.chime]],
  },
  // On to 6 (30 minutes); the short hand creeps halfway to 4.
  {
    ms: 5200,
    show: <ClockFace h={3} m={30} from={15} start={500} tags={[...minuteTags(0, 15, -1000).map(t => ({ ...t, at: 0 })), ...minuteTags(15, 30, 500)]} hi="hour" />,
    eq: <span className="a-pop" style={delay(2400)}>3:30</span>,
    sounds: [...counts(4, 3, 1000, STEP), [2400, sfx.chime]],
  },
]

/* ---------- coins ---------- */

const COIN_VALUES = [50, 10, 5, 1]
/** The fewest coins for n dollars, biggest first. */
const coinsFor = (n: number) => COIN_VALUES.flatMap(v => {
  const k = Math.floor(n / v)
  n -= k * v
  return Array(k).fill(v) as number[]
})
const runningTotals = (coins: number[]) => coins.map((_, i) => coins.slice(0, i + 1).reduce((s, v) => s + v, 0))

/** Coins with optional running-total tags, each lighting up at its time. */
function CoinRow({ coins, tags = [], hiAt = [], marks = [], popAt }: {
  coins: number[]; tags?: { text: string; at: number }[]; hiAt?: number[]
  /** Wordless comparison: 'miss' blinks (left out), 'over' shakes (extra). */
  marks?: ('miss' | 'over' | undefined)[]
  /** Pop each coin in at this time. */
  popAt?: (i: number) => number
}) {
  return (
    <div className="coins">
      {coins.map((v, i) => (
        <span
          key={i}
          className={`coin c${v}${hiAt[i] !== undefined ? ' a-hi' : ''}${popAt ? ' a-pop' : ''}${marks[i] ? ` mk-${marks[i]}` : ''}`}
          style={popAt ? delay(popAt(i)) : hiAt[i] !== undefined ? delay(hiAt[i]) : undefined}
        >
          {v}
          {tags[i] && <span className="tag-n" style={delay(tags[i].at)}>{tags[i].text}</span>}
        </span>
      ))}
    </div>
  )
}

/** For each coin, whether the other row has a coin of the same value to pair it with. */
function unmatched(row: number[], other: number[]) {
  const pool = [...other]
  return row.map(v => {
    const j = pool.indexOf(v)
    if (j < 0) return true
    pool.splice(j, 1)
    return false
  })
}

const COIN_GAP = 700

function CoinsHelp({ data: { coins }, mode, chose }: HelpProps<Coins>) {
  const totals = runningTotals(coins)
  const total = totals[totals.length - 1]
  const end = (coins.length - 1) * COIN_GAP
  useSounds(mode === 'wrong' ? [[0, sfx.pop]]
    : mode === 'solved' ? [[300, sfx.chime]]
      : [...counts(1, coins.length, 0, COIN_GAP), ...(mode === 'reveal' ? [[end + 600, sfx.right] as Sounds[number]] : [])])

  if (mode === 'wrong') {
    // The chosen amount as coins, under the real ones: unpaired coins blink (left out) or shake (extra).
    const mine = coinsFor(Number(chose))
    const missing = unmatched(coins, mine)
    const extra = unmatched(mine, coins)
    return (
      <div className="mk-col">
        <CoinRow coins={coins} marks={missing.map(x => (x ? 'miss' : undefined))} />
        <div className="mk-vs">≠</div>
        <div className="wrong-pick mk-col">
          <CoinRow coins={mine} marks={extra.map(x => (x ? 'over' : undefined))} />
          <b className="mk-cap">{String(chose)}</b>
        </div>
      </div>
    )
  }
  const quick = mode === 'solved'
  const at = (i: number) => (quick ? i * 120 : i * COIN_GAP)
  const tags = totals.map((t, i) => ({ text: mode === 'strategy' && i === coins.length - 1 ? '?' : String(t), at: at(i) }))
  return (
    <div className="mk-col">
      <CoinRow coins={coins} tags={tags} hiAt={coins.map((_, i) => at(i))} />
      {mode !== 'strategy' && <Eq at={quick ? 300 : end + 600}>{total}</Eq>}
    </div>
  )
}

const LESSON_COINS = [50, 10, 10, 5, 1, 1]
const LESSON_TOTALS = runningTotals(LESSON_COINS)

const coinsLesson: AnimBeat[] = [
  // The four coins, smallest to biggest.
  {
    ms: 3400,
    show: <CoinRow coins={[1, 5, 10, 50]} popAt={i => 300 + i * 500} />,
    sounds: [0, 1, 2, 3].map(i => [300 + i * 500, sfx.pop]),
  },
  // Biggest first: 50, then the tens: 60, 70.
  {
    ms: 3800,
    show: <CoinRow coins={LESSON_COINS} hiAt={[300, 1000, 1700]} tags={[0, 1, 2].map(i => ({ text: String(LESSON_TOTALS[i]), at: 300 + i * 700 }))} />,
    eq: <span className="a-pop" style={delay(2200)}>50, 60, 70</span>,
    sounds: counts(1, 3, 300, 700),
  },
  // Then the 5 and the ones: 75, 76, 77.
  {
    ms: 4600,
    show: <CoinRow coins={LESSON_COINS} hiAt={[0, 0, 0, 300, 1000, 1700]}
      tags={LESSON_TOTALS.map((t, i) => ({ text: String(t), at: i < 3 ? 0 : 300 + (i - 3) * 700 }))} />,
    eq: <span className="a-pop" style={delay(2300)}>75, 76, 77 → <b className="eq-b">77</b></span>,
    sounds: [...counts(4, 3, 300, 700), [2300, sfx.chime]],
  },
]

/* ---------- change ---------- */

/** The stops when counting up from the price to what was paid: the next ten, then tens. */
function stops(price: number, paid: number) {
  const out = [price]
  let x = Math.ceil(price / 10) * 10
  if (x > price) out.push(x)
  while (x < paid) { x += 10; out.push(x) }
  return out
}

const HOP_GAP = 900

/**
 * Count up as hops of equal width: price → next ten → … → paid, each hop labelled "+3", "+10" and
 * paying out its coins underneath. Hops before `from` are already there; the rest come every HOP_GAP ms.
 */
function Hops({ pts, upto = pts.length - 1, from = 0, start = 0 }: { pts: number[]; upto?: number; from?: number; start?: number }) {
  const n = pts.length - 1
  const x = (i: number) => 24 + (i * 312) / n
  const at = (i: number) => (i < from ? 0 : start + (i - from) * HOP_GAP)
  const hops = Array.from({ length: upto }, (_, i) => i)
  return (
    <div className="mk-col">
      <svg className="mk-hops" viewBox="0 0 360 130">
        <line className="mk-track" x1="12" y1="96" x2="348" y2="96" />
        {pts.map((p, i) => (
          <g key={i}>
            <line className="mk-tick" x1={x(i)} y1="86" x2={x(i)} y2="106" />
            <text className={i === 0 ? 'mk-price' : i === n ? 'mk-paid' : ''} x={x(i)} y="126">{p}</text>
          </g>
        ))}
        {hops.map(i => {
          const mid = (x(i) + x(i + 1)) / 2
          return (
            <g key={i}>
              <path className={`mk-arc${i < from ? '' : ' mk-draw'}`} pathLength={1} style={delay(at(i))}
                d={`M${x(i)} 92 Q${mid} 30 ${x(i + 1)} 92`} />
              <text className="mk-plus a-pop" style={delay(at(i) + 400)} x={mid} y="50">+{pts[i + 1] - pts[i]}</text>
            </g>
          )
        })}
      </svg>
      <div className="coins">
        {hops.flatMap(i => coinsFor(pts[i + 1] - pts[i]).map((v, j) => (
          <span key={`${i}-${j}`} className={`coin c${v} a-arrive`} style={delay(at(i) + 400 + j * 120)}>{v}</span>
        )))}
      </div>
    </div>
  )
}

/** "3 + 10 = 13" (or "= ?"), the hops added up; one hop reads "5 + 5 = 10" (or "5 + ? = 10"). */
const hopSum = (pts: number[], total: ReactNode) => pts.length === 2
  ? <>{pts[0]} + <b className="eq-b">{total}</b> = {pts[1]}</>
  : <>{pts.slice(1).map((p, i) => p - pts[i]).join(' + ')} = <b className="eq-b">{total}</b></>

function ChangeHelp({ data: { price, paid }, mode, chose }: HelpProps<Change>) {
  const pts = stops(price, paid)
  const end = (pts.length - 1) * HOP_GAP + 400
  useSounds(mode === 'wrong' ? [[600, sfx.miss]]
    : mode === 'solved' ? [[300, sfx.chime]]
      : [...pts.slice(1).map((_, i) => [400 + i * HOP_GAP, sfx.pop] as Sounds[number]), ...(mode === 'reveal' ? [[end + 300, sfx.right] as Sounds[number]] : [])])

  if (mode === 'wrong') {
    // Price plus the chosen change doesn't come to what was paid.
    const got = price + Number(chose)
    return (
      <div className="mk-col">
        <div className="eq-row"><span className="mk-price-tag">🏷️ {price}</span> + <span className="wrong-pick mk-pad">{String(chose)}</span> = {got}</div>
        <div className="eq-row mk-row">
          <span>{got}</span><span className="mk-ne">≠</span><span className="coin c50 wide a-shake">{paid}</span>
        </div>
      </div>
    )
  }
  const solved = mode === 'solved'
  return (
    <div className="mk-col">
      <Hops pts={pts} from={solved ? pts.length : 0} start={0} />
      <Eq at={solved ? 200 : mode === 'strategy' ? end - 400 : end + 300}>{hopSum(pts, mode === 'strategy' ? '?' : paid - price)}</Eq>
    </div>
  )
}

const changeLesson: AnimBeat[] = [
  // A 37 tag, 50 paid, and a "?" coming back.
  {
    ms: 3600,
    show: (
      <div className="change">
        <span className="mk-price-tag a-pop" style={delay(200)}>🏷️ 37</span>
        <span className="arrow a-fade" style={delay(900)}>→</span>
        <span className="coin c50 wide a-arrive" style={delay(1200)}>50</span>
        <span className="mk-back a-pop" style={delay(2100)}>?</span>
      </div>
    ),
    sounds: [[200, sfx.pop], [1200, sfx.pop], [2100, sfx.pop]],
  },
  // Count up from 37 to 40: +3, three 1-dollar coins.
  {
    ms: 3800,
    show: <Hops pts={[37, 40, 50]} upto={1} start={300} />,
    eq: <span className="a-pop" style={delay(1500)}>37 + 3 = 40</span>,
    sounds: counts(1, 3, 700, 250),
  },
  // Then 40 to 50: +10. 3 + 10 = 13.
  {
    ms: 4600,
    show: <Hops pts={[37, 40, 50]} from={1} start={300} />,
    eq: <span className="a-pop" style={delay(1500)}>3 + 10 = <b className="eq-b">13</b></span>,
    sounds: [[700, sfx.pop], [1500, sfx.chime]],
  },
]

export const lessons: Lessons = { clock, coins: coinsLesson, change: changeLesson }
export const help: Helps = { clock: helpOf(ClockHelp), coins: helpOf(CoinsHelp), change: helpOf(ChangeHelp) }
