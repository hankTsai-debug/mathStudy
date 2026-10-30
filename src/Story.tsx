import { useEffect, useState } from 'react'
import { ADVENTURE, ORIGIN_PICS } from './adventure'
import type { Lang, Strings } from './i18n'
import type { Island } from './islands'
import { sfx } from './sound'
import { picRows, STORY_PICS } from './stories'

/**
 * An island's story, a picture per narrated scene: first how its idea was invented long ago,
 * then the everyday problem it still solves.
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

  useEffect(() => {
    prompt(line)
    sfx.pop()
  }, [prompt, line])

  let n = 0
  return (
    <section>
      <div className="topbar">
        <h2>{island.icon} {t.islands[island.id].name}</h2>
        <button className="btn" onClick={onDone} aria-label={t.skip}>{t.skip} ⏭</button>
      </div>
      <div className={`stage story${old ? ' old' : ''}`} key={i}>
        {old && <div className="tag-old">{a.longAgo}</div>}
        {picRows(pics[i]).map((row, r) => (
          <div className="row" key={r}>
            {row.map((item, j) => <span key={j} className="a-pop" style={{ animationDelay: `${n++ * 70}ms` }}>{item}</span>)}
          </div>
        ))}
      </div>
      <div className="progress steps">
        {pics.map((_, j) => <i key={j} className={j <= i ? 'done' : ''} />)}
      </div>
      <div className="choices">
        {i > 0 && <button className="btn icon" aria-label={t.prevStep} onClick={() => setI(i - 1)}>◀</button>}
        {last
          ? <button className="btn primary" onClick={onDone}>{t.letsGo} 🚀</button>
          : <button className="btn primary icon" aria-label={t.nextStep} onClick={() => setI(i + 1)}>▶</button>}
      </div>
    </section>
  )
}
