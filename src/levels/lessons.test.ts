import { describe, expect, it } from 'vitest'
import { STRINGS } from '../i18n'
import { ISLANDS } from '../islands'
import { LESSONS } from './lessons'

describe('lessons', () => {
  const kinds = ISLANDS.flatMap(i => i.levels.map(l => l.kind))
  it.each(kinds)('%s has a narrated line for every step in both languages', kind => {
    expect(LESSONS[kind].length).toBeGreaterThanOrEqual(3)
    for (const t of Object.values(STRINGS)) expect(t.teach[kind]).toHaveLength(LESSONS[kind].length)
  })
})
