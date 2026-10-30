// Every sentence the app can say whose words are known ahead of time, for recording voice clips.
// Lines built from a round's own numbers (most practice prompts) are left to the browser's voice.
import { ADVENTURE, PONDER_ANSWERS } from '../adventure'
import { STRINGS, type Lang } from '../i18n'
import { ISLANDS } from '../islands'
import { sentences } from './key'

/** Every string in a nested object of text (functions are skipped; their lines are added below). */
function leaves(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') out.push(value)
  else if (Array.isArray(value)) value.forEach(v => leaves(v, out))
  else if (value && typeof value === 'object') Object.values(value).forEach(v => leaves(v, out))
  return out
}

export function spokenLines(lang: Lang): string[] {
  const t = STRINGS[lang]
  const a = ADVENTURE[lang]
  // Only what the fox says aloud; names, descriptions and button labels are shown, not spoken.
  const lines = leaves([
    t.hiMap, t.teach, t.guide, t.guideRight, t.countTap, t.howMany, t.countHint, t.look, t.howManyDots, t.frameHint,
    t.makeTenHint, t.teen, t.teenHint, t.praise, Object.values(t.islands).map(i => i.scenes),
    a.ponderDunno, Object.values(a.ponder).map(p => p.q), a.origin,
    Object.values(a.mystery).map(m => [m.title, m.clues, m.solved, m.finale.q]), a.finaleTry,
  ])
  for (let ok = 0; ok <= 8; ok++) lines.push(t.result(ok))
  for (let n = 1; n <= 27; n++) lines.push(a.foxGrew(n))
  for (const island of ISLANDS) {
    const m = a.mystery[island.id]
    lines.push(a.islandHi(m.title), a.newPower(m.power), `${a.finaleTitle} ${m.finale.q}`, `${a.solvedTitle} ${m.solved} ${a.newPower(m.power)}`)
    m.clues.forEach((c, i) => lines.push(a.newClue(i + 1) + c))
    if (island.requires) lines.push(t.locked(t.islands[island.requires].name))
    for (const level of island.levels) {
      const { choices } = a.ponder[level.id]
      const answer = choices[PONDER_ANSWERS[level.id]]
      lines.push(a.recap(answer, null))
      for (const c of choices) lines.push(a.ponderAck(c), a.recap(answer, c))
    }
  }
  for (const r of a.ranks) lines.push(a.nowRank(r))
  return [...new Set(lines.flatMap(sentences))]
}
