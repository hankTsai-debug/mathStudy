import { useEffect, useState } from 'react'
import type { Strings } from './i18n'
import type { Island } from './islands'
import { sfx } from './sound'
import { picRows, STORY_PICS } from './stories'

/** An island's everyday story: a picture per scene, narrated, showing the real problem its skills solve. */
export function Story({ island, t, prompt, onDone }: {
  island: Island
  t: Strings
  prompt: (text: string) => void
  onDone: () => void
}) {
  const pics = STORY_PICS[island.id]
  const [i, setI] = useState(0)
  const line = t.islands[island.id].scenes[i]
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
      <div className="stage story" key={i}>
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
