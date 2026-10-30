import { useCallback, useEffect, useRef, useState } from 'react'
import { ADVENTURE, foxLevel, solvedIslands } from './adventure'
import { Finale } from './Finale'
import { Fox } from './Fox'
import { pick, starsFor } from './game/logic'
import { STRINGS, type Lang } from './i18n'
import { ISLANDS, isUnlocked, type Island, type Level } from './islands'
import { Play } from './Play'
import { setSoundOn } from './sound'
import { Story } from './Story'
import { hush, say as speak } from './speech'
import { loadProgress, saveProgress, type Progress } from './store'

type Screen =
  | { name: 'map' }
  | { name: 'island'; island: Island }
  | { name: 'story'; island: Island }
  | { name: 'play'; island: Island; level: Level; run: number; review?: Level }
  | { name: 'result'; island: Island; level: Level; run: number; firstTry: number; stars: number; growth: Growth | null }

/** What a level finished for the first time brings: the fox's new level, a clue, maybe the island's mystery solved. */
interface Growth { level: number; clue: number; solved: boolean }

// Dev builds open every island (`?locked` restores the unlock rule); `?all` does the same in production demos.
const params = new URLSearchParams(location.search)
const UNLOCK_ALL = import.meta.env.DEV ? !params.has('locked') : params.has('all')

const starText = (n: number) => '⭐'.repeat(n) + '☆'.repeat(3 - n)

export default function App() {
  const [progress, setProgress] = useState<Progress>(loadProgress)
  const [screen, setScreen] = useState<Screen>({ name: 'map' })
  const t = STRINGS[progress.lang]
  const a = ADVENTURE[progress.lang]
  const [bubble, setBubble] = useState(t.hiMap)

  useEffect(() => saveProgress(progress), [progress])
  useEffect(() => setSoundOn(progress.sfx), [progress.sfx])
  useEffect(() => { document.documentElement.lang = progress.lang === 'zh' ? 'zh-Hant' : 'en' }, [progress.lang])

  const say = useCallback((text: string) => {
    if (progress.voice) speak(text, progress.lang)
  }, [progress.voice, progress.lang])
  const prompt = useCallback((text: string) => { setBubble(text); say(text) }, [say])

  const goMap = () => { hush(); setBubble(t.hiMap); setScreen({ name: 'map' }) }
  // Each island opens with its mystery; every level finished finds a clue.
  const islandIntro = (island: Island, lang = progress.lang) => ADVENTURE[lang].islandHi(ADVENTURE[lang].mystery[island.id].title)
  const goIsland = (island: Island) => { hush(); prompt(islandIntro(island)); setScreen({ name: 'island', island }) }
  // A first visit (no stars yet) opens with the island's everyday story.
  const showStory = (island: Island) => { hush(); setScreen({ name: 'story', island }) }
  const enterIsland = (island: Island) =>
    island.levels.some(l => progress.stars[l.id]) ? goIsland(island) : showStory(island)
  const runs = useRef(0)
  const start = (island: Island, level: Level) => setScreen({ name: 'play', island, level, run: ++runs.current, review: reviewFor(island) })
  // Review comes from levels already earned on other islands.
  const reviewFor = (island: Island) => {
    const earned = ISLANDS.filter(i => i !== island).flatMap(i => i.levels).filter(l => progress.stars[l.id])
    return earned.length ? pick(earned) : undefined
  }

  const finish = (firstTry: number, misses: number) => {
    if (screen.name !== 'play') return
    const { id } = screen.level
    const stars = starsFor(misses)
    const after = { ...progress.stars, [id]: Math.max(progress.stars[id] ?? 0, stars) }
    const island = screen.island
    const growth = progress.stars[id] ? null : {
      level: foxLevel(after),
      clue: island.levels.indexOf(screen.level),
      solved: solvedIslands(after).includes(island.id),
    }
    setProgress(p => ({ ...p, stars: { ...p.stars, [id]: Math.max(p.stars[id] ?? 0, stars) } }))
    setScreen({ ...screen, name: 'result', firstTry, stars, growth })
    const m = a.mystery[island.id]
    prompt([
      t.result(firstTry),
      growth && a.foxGrew(growth.level),
      growth && a.newClue(growth.clue + 1) + m.clues[growth.clue],
      growth?.solved && `${a.finaleTitle} ${m.finale.q}`,
    ].filter(Boolean).join(' '))
  }

  const toggleLang = () => {
    const lang = progress.lang === 'zh' ? 'en' : 'zh'
    if (screen.name === 'map') setBubble(STRINGS[lang].hiMap)
    if (screen.name === 'island') setBubble(islandIntro(screen.island, lang))
    setProgress({ ...progress, lang })
  }
  // 🔊 voice and effects → 🎵 effects only (wordless) → 🔇 off.
  const sound = progress.voice ? 'all' : progress.sfx ? 'sfx' : 'off'
  const toggleSound = () => {
    hush()
    if (sound === 'all') setProgress({ ...progress, voice: false, sfx: true })
    else if (sound === 'sfx') setProgress({ ...progress, voice: false, sfx: false })
    else setProgress({ ...progress, voice: true, sfx: true })
  }

  return (
    <>
      <header>
        <h1>{t.appTitle}</h1>
        <button className="btn" onClick={toggleLang}>{t.langBtn}</button>
        <button className="btn" onClick={toggleSound} aria-label="voice" title={t.soundLabel[sound]}>{{ all: '🔊', sfx: '🎵', off: '🔇' }[sound]}</button>
      </header>
      <main>
        <div className="mascot">
          <Fox stars={progress.stars} grow={screen.name === 'result' && screen.growth !== null} />
          <div className="bubble">{bubble}</div>
        </div>

        {screen.name === 'map' && (
          <section className="cards">
            <p className="rank">🦊 {a.ranks[solvedIslands(progress.stars).length]} · Lv.{foxLevel(progress.stars)}</p>
            {ISLANDS.map(island => {
              const open = UNLOCK_ALL || isUnlocked(island, progress.stars)
              const earned = island.levels.reduce((sum, l) => sum + (progress.stars[l.id] ?? 0), 0)
              return (
                <button
                  key={island.id}
                  className={`card${open ? '' : ' locked'}`}
                  onClick={() => (open ? enterIsland(island) : prompt(t.locked(t.islands[island.requires!].name)))}
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
            <button className="card story-card" onClick={() => showStory(screen.island)}>
              <span className="ico">📖</span>
              <span><div className="name">{t.storyBtn}</div><div className="desc">{t.islands[screen.island.id].scenes[0]}</div></span>
            </button>
            <Mystery island={screen.island} stars={progress.stars} lang={progress.lang} />
            {screen.island.levels.map(level => (
              <button key={level.id} className="card" onClick={() => start(screen.island, level)}>
                <span className="ico">{level.icon}</span>
                <span><div className="name">{t.levels[level.id].name}</div><div className="desc">{t.levels[level.id].desc}</div><div className="why">🎯 {t.levels[level.id].why}</div></span>
                <span className="stars">{starText(progress.stars[level.id] ?? 0)}</span>
              </button>
            ))}
          </section>
        )}

        {screen.name === 'story' && (
          <Story key={screen.island.id} island={screen.island} lang={progress.lang} t={t} prompt={prompt} onDone={() => goIsland(screen.island)} />
        )}

        {screen.name === 'play' && (
          <Play
            key={screen.run}
            level={screen.level}
            review={screen.review}
            firstVisit={!progress.stars[screen.level.id]}
            lang={progress.lang}
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
            <p className="why">🎯 {t.useIt} {t.levels[screen.level.id].why}</p>
            {screen.growth && (
              <div className="growth">
                <p className="grew">🦊⬆️ {a.foxGrew(screen.growth.level)}</p>
                <p className="clue">🧩 {a.newClue(screen.growth.clue + 1)}{a.mystery[screen.island.id].clues[screen.growth.clue]}</p>
                {screen.growth.solved && (
                  <Finale island={screen.island.id} lang={progress.lang} prompt={prompt} rank={a.ranks[solvedIslands(progress.stars).length]} />
                )}
              </div>
            )}
            <p className="spot">👀 {t.spotIt} {t.levels[screen.level.id].spot}</p>
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

/** The island's mystery: a clue for every level with a star, and the answer once all are found. */
function Mystery({ island, stars, lang }: { island: Island; stars: Record<string, number>; lang: Lang }) {
  const a = ADVENTURE[lang]
  const m = a.mystery[island.id]
  const solved = island.levels.every(l => stars[l.id])
  return (
    <div className="mystery">
      <div className="name">{a.mysteryTitle}：{m.title}</div>
      <ol>
        {island.levels.map((l, i) => (
          <li key={l.id} className={stars[l.id] ? '' : 'hidden'}>{a.clueOf(i + 1)}：{stars[l.id] ? m.clues[i] : a.hidden}</li>
        ))}
      </ol>
      {solved && <p className="solved">{a.solvedTitle} {m.solved} ✨ {m.power}</p>}
    </div>
  )
}
