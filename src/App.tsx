import { useCallback, useEffect, useRef, useState } from 'react'
import { starsFor } from './game/logic'
import { STRINGS } from './i18n'
import { ISLANDS, isUnlocked, type Island, type Level } from './islands'
import { Play } from './Play'
import { hush, say as speak } from './speech'
import { loadProgress, saveProgress, type Progress } from './store'

type Screen =
  | { name: 'map' }
  | { name: 'island'; island: Island }
  | { name: 'play'; island: Island; level: Level; run: number }
  | { name: 'result'; island: Island; level: Level; run: number; firstTry: number; stars: number }

// `?all` opens every island, for testing and demos.
const UNLOCK_ALL = new URLSearchParams(location.search).has('all')

const starText = (n: number) => '⭐'.repeat(n) + '☆'.repeat(3 - n)

export default function App() {
  const [progress, setProgress] = useState<Progress>(loadProgress)
  const [screen, setScreen] = useState<Screen>({ name: 'map' })
  const t = STRINGS[progress.lang]
  const [bubble, setBubble] = useState(t.hiMap)

  useEffect(() => saveProgress(progress), [progress])
  useEffect(() => { document.documentElement.lang = progress.lang === 'zh' ? 'zh-Hant' : 'en' }, [progress.lang])

  const say = useCallback((text: string) => {
    if (progress.voice) speak(text, progress.lang)
  }, [progress.voice, progress.lang])
  const prompt = useCallback((text: string) => { setBubble(text); say(text) }, [say])

  const goMap = () => { hush(); setBubble(t.hiMap); setScreen({ name: 'map' }) }
  const goIsland = (island: Island) => { hush(); setBubble(t.hiIsland); setScreen({ name: 'island', island }) }
  const runs = useRef(0)
  const start = (island: Island, level: Level) => setScreen({ name: 'play', island, level, run: ++runs.current })

  const finish = (firstTry: number) => {
    if (screen.name !== 'play') return
    const { id } = screen.level
    const stars = starsFor(firstTry)
    setProgress(p => ({ ...p, stars: { ...p.stars, [id]: Math.max(p.stars[id] ?? 0, stars) } }))
    setScreen({ ...screen, name: 'result', firstTry, stars })
    prompt(t.result(firstTry))
  }

  const toggleLang = () => {
    const lang = progress.lang === 'zh' ? 'en' : 'zh'
    if (screen.name === 'map') setBubble(STRINGS[lang].hiMap)
    if (screen.name === 'island') setBubble(STRINGS[lang].hiIsland)
    setProgress({ ...progress, lang })
  }
  const toggleVoice = () => {
    if (progress.voice) hush()
    setProgress({ ...progress, voice: !progress.voice })
  }

  return (
    <>
      <header>
        <h1>{t.appTitle}</h1>
        <button className="btn" onClick={toggleLang}>{t.langBtn}</button>
        <button className="btn" onClick={toggleVoice} aria-label="voice">{progress.voice ? '🔊' : '🔇'}</button>
      </header>
      <main>
        <div className="mascot"><div className="face">🦊</div><div className="bubble">{bubble}</div></div>

        {screen.name === 'map' && (
          <section className="cards">
            {ISLANDS.map((island, i) => {
              const open = UNLOCK_ALL || isUnlocked(i, progress.stars)
              const earned = island.levels.reduce((sum, l) => sum + (progress.stars[l.id] ?? 0), 0)
              return (
                <button
                  key={island.id}
                  className={`card${open ? '' : ' locked'}`}
                  onClick={() => (open ? goIsland(island) : prompt(t.locked))}
                >
                  <span className="ico">{open ? island.icon : '🔒'}</span>
                  <span><div className="name">{t.islands[island.id].name}</div><div className="desc">{t.islands[island.id].desc}</div></span>
                  <span className="stars">⭐ {earned}/{island.levels.length * 3}</span>
                </button>
              )
            })}
            <p className="note">{t.note}</p>
          </section>
        )}

        {screen.name === 'island' && (
          <section className="cards">
            <div className="topbar">
              <button className="btn" onClick={goMap} aria-label="back">←</button>
              <h2>{screen.island.icon} {t.islands[screen.island.id].name}</h2>
            </div>
            {screen.island.levels.map(level => (
              <button key={level.id} className="card" onClick={() => start(screen.island, level)}>
                <span className="ico">{level.icon}</span>
                <span><div className="name">{t.levels[level.id].name}</div><div className="desc">{t.levels[level.id].desc}</div></span>
                <span className="stars">{starText(progress.stars[level.id] ?? 0)}</span>
              </button>
            ))}
          </section>
        )}

        {screen.name === 'play' && (
          <Play
            key={screen.run}
            level={screen.level}
            t={t}
            prompt={prompt}
            say={say}
            onExit={() => goIsland(screen.island)}
            onDone={finish}
          />
        )}

        {screen.name === 'result' && (
          <section className="stage center">
            <div className="big">{starText(screen.stars)}</div>
            <p>{t.result(screen.firstTry)}</p>
            <div className="choices">
              <button className="btn primary" onClick={() => start(screen.island, screen.level)}>{t.again}</button>
              <button className="btn" onClick={() => goIsland(screen.island)}>{t.back}</button>
            </div>
          </section>
        )}
      </main>
    </>
  )
}
