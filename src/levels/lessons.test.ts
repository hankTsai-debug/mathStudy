import { describe, expect, it } from 'vitest'
import { STRINGS } from '../i18n'
import { ISLANDS } from '../islands'
import { LESSONS } from './lessons'
import { ANIM_LESSONS, HELP } from './wordless'
import { QUIZZES, type QuizKind } from './quizConfig'

describe('lessons', () => {
  const kinds = ISLANDS.flatMap(i => i.levels.map(l => l.kind))
  it.each(kinds)('%s has a narrated line for every step in both languages', kind => {
    expect(LESSONS[kind].length).toBeGreaterThanOrEqual(3)
    for (const t of Object.values(STRINGS)) expect(t.teach[kind]).toHaveLength(LESSONS[kind].length)
  })
  it.each(kinds)('%s has an animated lesson, one beat per narrated line', kind => {
    const beats = ANIM_LESSONS[kind]
    expect(beats).toBeDefined()
    for (const t of Object.values(STRINGS)) expect(t.teach[kind]).toHaveLength(beats!.length)
  })
  // 十的海灣's add20 has its own level (BayAdd20) with help built in.
  it.each(Object.keys(QUIZZES).filter(k => k !== 'add20'))('%s shows wordless help after a miss', kind => {
    expect(HELP[kind as QuizKind]).toBeDefined()
  })
})
