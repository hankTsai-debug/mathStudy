import { describe, expect, it } from 'vitest'
import { STRINGS } from './i18n'
import { ISLANDS } from './islands'
import { picRows, STORY_PICS } from './stories'

describe('everyday stories', () => {
  it.each(ISLANDS.map(i => i.id))('%s has a picture for every narrated scene in both languages', id => {
    expect(STORY_PICS[id].length).toBeGreaterThanOrEqual(3)
    for (const t of Object.values(STRINGS)) expect(t.islands[id].scenes).toHaveLength(STORY_PICS[id].length)
    for (const pic of STORY_PICS[id]) expect(picRows(pic).every(row => row.length > 0 && row[0] !== '')).toBe(true)
  })
  it.each(ISLANDS.flatMap(i => i.levels.map(l => l.id)))('%s has something to go and find in both languages', id => {
    for (const t of Object.values(STRINGS)) expect(t.levels[id].spot.length).toBeGreaterThan(5)
  })
})
