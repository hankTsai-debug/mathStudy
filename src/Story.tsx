import { useEffect, useState } from 'react'
import { ADVENTURE, ORIGIN_PICS } from './adventure'
import type { Lang, Strings } from './i18n'
import type { Island } from './islands'
import { sfx } from './sound'
import { parseItem, picRows, STORY_PICS } from './stories'

/**
 * An island's story, a picture per narrated scene: first how its idea was invented long ago,
 * then the everyday problem it still solves. One scene per story has the child tap to count.
 */
export function Story({ island, lang, t, prompt, onDone }: {
  island: Island
  lang: Lang
  t: Strings
  prompt: (text: string) => void
  onDone: () => void
}) {
  const a = ADVENTURE[lang]
  const origin = a.origin[island.id]
  const pics = [...ORIGIN_PICS[island.id], ...STORY_PICS[island.id]]
  const lines = [...origin, ...t.islands[island.id].scenes]
  const [i, setI] = useState(0)
  const line = lines[i]
  const old = i < origin.length
  const last = i === pics.length - 1
  const [counted, setCounted] = useState(true)

  useEffect(() => {
    prompt(line)
    sfx.pop()
  }, [prompt, line])

  return (
    <section>
      <div className="topbar">
        <h2>{island.icon} {t.islands[island.id].name}</h2>
        <button className="btn" onClick={onDone} aria-label={t.skip}>{t.skip} ⏭</button>
      </div>
      <Scene key={i} pic={pics[i]} old={old} longAgo={a.longAgo} onCounted={setCounted} />
      <div className="progress steps">
        {pics.map((_, j) => <i key={j} className={j <= i ? 'done' : ''} />)}
      </div>
      <div className="choices">
        {i > 0 && <button className="btn icon" aria-label={t.prevStep} onClick={() => setI(i - 1)}>◀</button>}
        {!counted ? null : last
          ? <button className="btn primary" onClick={onDone}>{t.letsGo} 🚀</button>
          : <button className="btn primary icon" aria-label={t.nextStep} onClick={() => setI(i + 1)}>▶</button>}
      </div>
    </section>
  )
}

/** One scene's picture. Items marked to be tapped get counted 1, 2, 3… (or their own counts) as the child taps them. */
function Scene({ pic, old, longAgo, onCounted }: {
  pic: string
  old: boolean
  longAgo: string
  onCounted: (done: boolean) => void
}) {
  const rows = picRows(pic).map(row => row.map(parseItem))
  // Counts go in reading order, whichever item is tapped: the third tap shows the third count.
  const counts = rows.flat().filter(item => item.tap).map((item, k) => item.count ?? String(k + 1))
  const [tapped, setTapped] = useState<string[]>([])

  useEffect(() => onCounted(counts.length === 0), [onCounted, counts.length])

  const tap = (key: string) => {
    if (tapped.includes(key)) return
    const next = [...tapped, key]
    setTapped(next)
    sfx.count(next.length)
    if (next.length === counts.length) {
      onCounted(true)
      sfx.chime()
    }
  }

  let n = 0
  return (
    <div className={`stage story${old ? ' old' : ''}`}>
      {old && <div className="tag-old">{longAgo}</div>}
      {rows.map((row, r) => (
        <div className="row" key={r}>
          {row.map((item, j) => {
            const style = { animationDelay: `${n++ * 70}ms` }
            if (!item.tap) return <span key={j} className="a-pop" style={style}>{item.glyph}</span>
            const key = `${r}-${j}`
            const k = tapped.indexOf(key)
            return (
              <button key={j} className={`a-pop story-tap${k >= 0 ? ' done' : ''}`} style={style} onClick={() => tap(key)}>
                {item.glyph}
                {k >= 0 && <span className="tag-n">{counts[k]}</span>}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
