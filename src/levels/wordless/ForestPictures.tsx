// 數數森林's lesson pictures: apples that get counted, and a number line with a hopping frog.
import { useEffect, useState } from 'react'
import { delay } from './kit'
import './forest.css'

/** Apples that pop in at `popAt`, with number tags popping on at `tagAt`; the last apple lights up at `glow`. */
export function Fruits({ n, popAt = [], tagAt = [], glow }: { n: number; popAt?: number[]; tagAt?: (number | undefined)[]; glow?: number }) {
  return (
    <div className="field">
      {Array.from({ length: n }, (_, i) => {
        const lit = glow !== undefined && i === n - 1
        const at = lit ? glow : popAt[i]
        return (
          <span key={i} className={`item${popAt[i] !== undefined ? ' a-pop' : ''}${lit ? ' a-hi' : ''}`} style={at !== undefined ? delay(at) : undefined}>
            🍎
            {tagAt[i] !== undefined && <span className="badge a-pop" style={delay(tagAt[i]!)}>{i + 1}</span>}
          </span>
        )
      })}
    </div>
  )
}

/**
 * The 0–10 line. Pads can pop in one by one (`padsAt`), blink (`want`), be trailed and tagged with the
 * hop number; the frog starts on `from` and hops one pad at a time to `to`, starting at `hopAt`.
 */
export function HopLine({ from, to, hopAt = 0, gap = 600, padsAt, want = [], trail = [], tags = {}, frogAt }: {
  from?: number; to?: number; hopAt?: number; gap?: number
  padsAt?: number
  want?: number[]
  trail?: number[]
  tags?: Record<number, { n: number; at: number }>
  frogAt?: number
}) {
  const [pos, setPos] = useState(from)
  useEffect(() => {
    if (from === undefined || to === undefined) return
    const timers = Array.from({ length: Math.max(0, to - from) }, (_, k) => window.setTimeout(() => setPos(from + k + 1), hopAt + k * gap))
    return () => timers.forEach(clearTimeout)
  }, [from, to, hopAt, gap])
  return (
    <div className="line">
      {Array.from({ length: 11 }, (_, i) => (
        <span
          key={i}
          className={`pad${trail.includes(i) ? ' trail' : ''}${padsAt !== undefined ? ' a-pop' : ''}${want.includes(i) ? ' want' : ''}`}
          style={padsAt !== undefined ? delay(padsAt + i * 180) : undefined}
        >
          <span className="lily" />
          <b>{i}</b>
          {tags[i] && <span className="tag-n" style={delay(tags[i].at)}>{tags[i].n}</span>}
        </span>
      ))}
      {pos !== undefined && (
        <div className={`frog${frogAt !== undefined ? ' a-pop' : ''}`} style={{ left: `${((pos + 0.5) / 11) * 100}%`, ...(frogAt !== undefined ? delay(frogAt) : {}) }}>🐸</div>
      )}
    </div>
  )
}

