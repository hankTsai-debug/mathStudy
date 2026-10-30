import { describe, expect, it } from 'vitest'
import { ADVENTURE, foxLevel, ORIGIN_PICS, POWER_ICONS, PONDER_PICS, solvedIslands } from './adventure'
import { ISLANDS } from './islands'

const levels = ISLANDS.flatMap(i => i.levels.map(l => l.id))

describe('adventure', () => {
  it.each(levels)('%s asks a question to think about first, in both languages', id => {
    expect(PONDER_PICS[id]).toBeTruthy()
    for (const a of Object.values(ADVENTURE)) {
      expect(a.ponder[id].q.length).toBeGreaterThan(5)
      expect(a.ponder[id].choices.length).toBeGreaterThanOrEqual(2)
    }
    // Choices are the same ideas in both languages.
    expect(ADVENTURE.zh.ponder[id].choices).toHaveLength(ADVENTURE.en.ponder[id].choices.length)
  })
  it.each(ISLANDS.map(i => i.id))('%s has long-ago scenes, a mystery with a clue per level, and a power', id => {
    for (const a of Object.values(ADVENTURE)) {
      expect(a.origin[id]).toHaveLength(ORIGIN_PICS[id].length)
      expect(a.mystery[id].clues).toHaveLength(ISLANDS.find(i => i.id === id)!.levels.length)
      expect(a.mystery[id].power.startsWith(POWER_ICONS[id])).toBe(true)
    }
  })
  it('has a rank for every number of solved islands', () => {
    for (const a of Object.values(ADVENTURE)) expect(a.ranks).toHaveLength(ISLANDS.length + 1)
  })
  it('the fox grows one level per level with a star, and wins a power per finished island', () => {
    expect(foxLevel({})).toBe(0)
    const stars = { 'forest-count': 1, 'forest-line': 3, 'forest-flash': 2, 'bay-make10': 1 }
    expect(foxLevel(stars)).toBe(4)
    expect(solvedIslands(stars)).toEqual(['forest'])
    expect(foxLevel(Object.fromEntries(levels.map(id => [id, 1])))).toBe(27)
  })
})
