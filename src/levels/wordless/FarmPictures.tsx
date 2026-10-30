// 乘法農場 pictures for the wordless lessons and help (see farm.tsx).
import type { ReactNode } from 'react'
import type { ArrayQ, Share, Times } from '../../game/quizzes'
import { sfx } from '../../sound'
import { delay, useSounds, type HelpProps, type Sounds } from './kit'
import './farm.css'

type Mark = 'ring' | 'miss' | undefined

/**
 * Marks for "you chose `chose`": rings on the first `chose` things in counting order, blinking
 * dashed circles on those left out, and the extra drawn spilling past the picture.
 */
const marks = (total: number, chose: number) => ({
  mark: (i: number): Mark => (i < chose ? 'ring' : 'miss'),
  overflow: Math.max(0, chose - total),
})

const Overflow = ({ n }: { n: number }) =>
  n > 0 ? <div className="overflow">{Array.from({ length: n }, (_, i) => <span key={i} className="mark over" />)}</div> : null

const chime = (at: number): [number, () => void] => [at, sfx.chime]
/** One rising note per row or group, `gap` ms apart. */
const steps = (n: number, start: number, gap: number): Sounds =>
  Array.from({ length: n }, (_, j) => [start + j * gap, () => sfx.count(j + 1)])

/* ---------- 排排菜園: rows of plants ---------- */

/**
 * `rows` rows of `cols` plants. Rows can pop in one after another (`popAt`), light up with a
 * running total from `litAt` (`gap` ms apart, for the first `lit` rows), and the last lit row can show
 * "?" instead of its total; `mark` draws a wrong choice on the plants.
 */
export function Rows({ rows, cols, popAt, litAt, gap = 900, lit = rows, ask = false, mark }: {
  rows: number; cols: number; popAt?: number; litAt?: number; gap?: number; lit?: number; ask?: boolean; mark?: (i: number) => Mark
}) {
  return (
    <div className="wl-rows">
      {Array.from({ length: rows }, (_, r) => {
        const on = litAt !== undefined && r < lit
        const at = (litAt ?? 0) + r * gap
        return (
          <div key={r} className={`wl-row${on ? ' lit' : ''}`} style={on ? delay(at) : undefined}>
            {Array.from({ length: cols }, (_, c) => {
              const i = r * cols + c
              const m = mark?.(i)
              return (
                <span key={c} className={`wl-plant${popAt !== undefined ? ' a-pop' : ''}`} style={popAt !== undefined ? delay(popAt + r * 600 + c * 80) : undefined}>
                  🥬{m && <span className={`mark ${m}`} />}
                </span>
              )
            })}
            {on && <span className="tag-n row-tag" style={delay(at)}>{ask && r === lit - 1 ? '?' : (r + 1) * cols}</span>}
          </div>
        )
      })}
    </div>
  )
}

const ab = (a: ReactNode, b: ReactNode, rest: ReactNode, op = '×') =>
  <><span className="eq-a">{a}</span> {op} <span className="eq-b">{b}</span> = {rest}</>


export function ArrayHelp({ data: { rows, cols }, mode, chose }: HelpProps<ArrayQ>) {
  const total = rows * cols
  const gap = mode === 'solved' ? 200 : 900
  useSounds(mode === 'wrong' ? [] : [...steps(rows, 300, gap), ...(mode === 'solved' ? [chime(300 + rows * gap)] : [])])
  // 1st miss: the chosen number ringed plant by plant; the rest blink, or the extra spill over.
  if (mode === 'wrong') {
    const m = marks(total, chose as number)
    return <div className="wl-col"><Rows rows={rows} cols={cols} mark={m.mark} /><Overflow n={m.overflow} /></div>
  }
  // Count row by row; the last row's total waits for the 3rd miss.
  return (
    <div className="wl-col">
      <Rows rows={rows} cols={cols} litAt={300} gap={gap} ask={mode === 'strategy'} />
      {mode === 'solved' && <div className="eq-row">{ab(rows, cols, total)}</div>}
    </div>
  )
}

/* ---------- 九九乘法: groups of dots ---------- */

/** `a` groups of `b` dots, with the same pop, light-up and marking options as Rows. */
export function Groups({ a, b, popAt, litAt, gap = 900, lit = a, ask = false, mark }: {
  a: number; b: number; popAt?: number; litAt?: number; gap?: number; lit?: number; ask?: boolean; mark?: (i: number) => Mark
}) {
  return (
    <div className="groups wl-groups">
      {Array.from({ length: a }, (_, g) => {
        const on = litAt !== undefined && g < lit
        const at = (litAt ?? 0) + g * gap
        const popped = popAt !== undefined
        return (
          <div key={g} className={`group${on ? ' lit' : ''}${popped ? ' a-pop' : ''}`}
            style={on ? delay(at) : popped ? delay(popAt + g * 600) : undefined}>
            {Array.from({ length: b }, (_, i) => {
              const m = mark?.(g * b + i)
              return <span key={i} className="wl-dot"><i className="dot small" />{m && <span className={`mark ${m}`} />}</span>
            })}
            {on && <span className="tag-n" style={delay(at)}>{ask && g === lit - 1 ? '?' : (g + 1) * b}</span>}
          </div>
        )
      })}
    </div>
  )
}

const timesEq = (a: number, b: number, answer: ReactNode) => <div className="equation">{ab(a, b, answer)}</div>


export function TimesHelp({ data: { a, b }, mode, chose }: HelpProps<Times>) {
  const total = a * b
  const gap = mode === 'solved' ? 200 : 900
  useSounds(mode === 'wrong' ? [] : [...steps(a, 300, gap), ...(mode === 'solved' ? [chime(300 + a * gap)] : [])])
  if (mode === 'wrong') {
    const m = marks(total, chose as number)
    return <div className="frames">{timesEq(a, b, '?')}<Groups a={a} b={b} mark={m.mark} /><Overflow n={m.overflow} /></div>
  }
  return (
    <div className="frames">
      {timesEq(a, b, mode === 'solved' ? total : '?')}
      <Groups a={a} b={b} litAt={300} gap={gap} ask={mode === 'strategy'} />
    </div>
  )
}

/* ---------- 平分紅蘿蔔: dealing ---------- */

/**
 * Rabbits above a pile of `total` carrots. Carrots are dealt one to each rabbit in turn, `gap` ms
 * apart from `start`, for `rounds` rounds; carrots a rabbit should get but the pile can't give show as
 * dashed gaps. `tags` puts each rabbit's count on it once dealt.
 */
export function Deal({ total, groups, rounds, start = 300, gap = 250, tags = false, popAt }: {
  total: number; groups: number; rounds: number; start?: number; gap?: number; tags?: boolean; popAt?: number
}) {
  const dealt = Math.min(total, rounds * groups)
  const end = start + rounds * groups * gap
  return (
    <div className="share">
      <div className="rabbits">
        {Array.from({ length: groups }, (_, g) => (
          <div key={g} className="rabbit wl-rabbit">
            <span>🐰</span>
            <div className="pile">
              {Array.from({ length: rounds }, (_, j) => {
                const k = j * groups + g
                return k < total
                  ? <span key={j} className="a-arrive" style={delay(start + k * gap)}>🥕</span>
                  : <span key={j} className="wl-gap a-pop" style={delay(start + k * gap)} />
              })}
            </div>
            {tags && <span className="tag-n" style={delay(end + 200)}>{Math.min(rounds, Math.floor((total - g - 1) / groups) + 1)}</span>}
          </div>
        ))}
      </div>
      <div className="pile">
        {Array.from({ length: total }, (_, i) => {
          // The carrot at the end of the pile goes first.
          const k = total - 1 - i
          if (k < dealt) return <span key={i} className="a-leave" style={delay(start + k * gap)}>🥕</span>
          return <span key={i} className={popAt !== undefined ? 'a-pop' : rounds > 0 ? 'a-blink' : undefined}
            style={popAt !== undefined ? delay(popAt + i * 60) : rounds > 0 ? delay(end) : undefined}>🥕</span>
        })}
      </div>
    </div>
  )
}

const pops = (n: number, start: number, gap: number): Sounds => Array.from({ length: n }, (_, k) => [start + k * gap, sfx.pop])


export function ShareHelp({ data: { total, groups }, mode, chose }: HelpProps<Share>) {
  const each = total / groups
  const gap = mode === 'solved' ? 80 : 250
  // 1st miss: each rabbit is given the chosen number: the pile runs out (gaps) or carrots are left over (blinking).
  // 2nd: deal all but the last round, so the rest of the pile is waiting. 3rd and solved: deal it all and count.
  const rounds = mode === 'wrong' ? (chose as number) : mode === 'strategy' ? Math.max(1, each - 1) : each
  const n = Math.min(total, rounds * groups)
  useSounds([...pops(n, 300, gap), ...(mode === 'solved' ? [chime(300 + n * gap + 200)] : [])])
  return (
    <div className="wl-col">
      <Deal total={total} groups={groups} rounds={rounds} gap={gap} tags={mode === 'reveal' || mode === 'solved'} />
      {mode === 'solved' && <div className="eq-row">{ab(total, groups, each, '÷')}</div>}
    </div>
  )
}
