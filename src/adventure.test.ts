import { describe, expect, it } from 'vitest'
import { ADVENTURE, FINALE_ANSWERS, foxLevel, ORIGIN_PICS, POWER_ICONS, PONDER_ANSWERS, PONDER_PICS, solvedIslands } from './adventure'
import { ISLANDS } from './islands'

const levels = ISLANDS.flatMap(i => i.levels.map(l => l.id))

describe('adventure', () => {
  it.each(levels)('%s asks a question to think about first, in both languages', id => {
    expect(PONDER_PICS[id]).toBeTruthy()
    for (const a of Object.values(ADVENTURE)) {
      expect(a.ponder[id].q.length).toBeGreaterThan(5)
      expect(a.ponder[id].choices.length).toBeGreaterThanOrEqual(2)
    }
    for (const a of Object.values(ADVENTURE)) expect(a.ponder[id].choices[PONDER_ANSWERS[id]]).toBeDefined()
    // Choices are the same ideas in both languages.
    expect(ADVENTURE.zh.ponder[id].choices).toHaveLength(ADVENTURE.en.ponder[id].choices.length)
  })
  it.each(ISLANDS.map(i => i.id))('%s has long-ago scenes, a mystery with a clue per level, and a power', id => {
    for (const a of Object.values(ADVENTURE)) {
      expect(a.origin[id]).toHaveLength(ORIGIN_PICS[id].length)
      expect(a.mystery[id].clues).toHaveLength(ISLANDS.find(i => i.id === id)!.levels.length)
      expect(a.mystery[id].power.startsWith(POWER_ICONS[id])).toBe(true)
      expect(a.mystery[id].finale.choices[FINALE_ANSWERS[id]]).toBeDefined()
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

describe('answers match the maths', () => {
  const zh = ADVENTURE.zh
  it.each([
    ['forest-count', '7'], ['forest-line', '5'], ['forest-flash', '5'], ['bay-make10', '3'], ['bay-teen', '13'],
    ['bay-add20', '13'], ['place-blocks', '231'], ['place-column', '75'], ['shapes-measure', '5'], ['farm-array', '12'],
    ['farm-times', '12'], ['farm-share', '4'], ['market-coins', '27'], ['market-change', '15'], ['port-area', '6'],
    ['challenge-balance', '3'],
  ] as const)('%s → %s', (id, answer) => expect(zh.ponder[id].choices[PONDER_ANSWERS[id]]).toBe(answer))
  it.each([
    ['forest', '10'], ['bay', '14'], ['place', '605'], ['shapes', '5'], ['farm', '1'], ['market', '5'], ['port', '40'], ['challenge', '2'],
  ] as const)('%s finale → %s', (id, answer) => expect(zh.mystery[id].finale.choices[FINALE_ANSWERS[id]]).toBe(answer))
})
