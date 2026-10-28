import type { Strings } from './i18n'
import type { QuizKind } from './levels/quizConfig'

/** Hand-built levels plus every choice-based quiz kind. */
export type LevelKind = 'count' | 'line' | 'flash' | 'makeTen' | 'teen' | QuizKind
export type LevelId = keyof Strings['levels']
export type IslandId = keyof Strings['islands']

export interface Level { id: LevelId; kind: LevelKind; icon: string }
export interface Island {
  id: IslandId
  icon: string
  /** The island whose levels must all have a star first. */
  requires?: IslandId
  levels: Level[]
}

// Main path: forest → bay → place → farm → kitchen → port.
// Side quests: shapes (after forest), market (after bay), challenge (after forest).
export const ISLANDS: Island[] = [
  {
    id: 'forest', icon: '🌳', levels: [
      { id: 'forest-count', kind: 'count', icon: '🍎' },
      { id: 'forest-line', kind: 'line', icon: '🐸' },
      { id: 'forest-flash', kind: 'flash', icon: '🔟' },
    ],
  },
  {
    id: 'bay', icon: '🌊', requires: 'forest', levels: [
      { id: 'bay-make10', kind: 'makeTen', icon: '🐚' },
      { id: 'bay-teen', kind: 'teen', icon: '🐟' },
      { id: 'bay-add20', kind: 'add20', icon: '⛵' },
    ],
  },
  {
    id: 'place', icon: '⛰️', requires: 'bay', levels: [
      { id: 'place-blocks', kind: 'blocks', icon: '🧱' },
      { id: 'place-digit', kind: 'digit', icon: '🏠' },
      { id: 'place-column', kind: 'column', icon: '➕' },
    ],
  },
  {
    id: 'shapes', icon: '🔷', requires: 'forest', levels: [
      { id: 'shapes-name', kind: 'shapeName', icon: '🔺' },
      { id: 'shapes-symmetry', kind: 'symmetry', icon: '🦋' },
      { id: 'shapes-measure', kind: 'measure', icon: '📏' },
    ],
  },
  {
    id: 'farm', icon: '🌾', requires: 'place', levels: [
      { id: 'farm-array', kind: 'array', icon: '🥬' },
      { id: 'farm-times', kind: 'times', icon: '✖️' },
      { id: 'farm-share', kind: 'share', icon: '🥕' },
    ],
  },
  {
    id: 'market', icon: '🏪', requires: 'bay', levels: [
      { id: 'market-clock', kind: 'clock', icon: '🕒' },
      { id: 'market-coins', kind: 'coins', icon: '🪙' },
      { id: 'market-change', kind: 'change', icon: '🏷️' },
    ],
  },
  {
    id: 'kitchen', icon: '🍰', requires: 'farm', levels: [
      { id: 'kitchen-name', kind: 'fracName', icon: '🍕' },
      { id: 'kitchen-line', kind: 'fracLine', icon: '⭐' },
      { id: 'kitchen-equal', kind: 'fracEqual', icon: '🍫' },
    ],
  },
  {
    id: 'port', icon: '⚓', requires: 'kitchen', levels: [
      { id: 'port-place', kind: 'bigPlace', icon: '🚢' },
      { id: 'port-area', kind: 'area', icon: '📦' },
      { id: 'port-decimal', kind: 'decimal', icon: '🔢' },
    ],
  },
  {
    id: 'challenge', icon: '🧩', requires: 'forest', levels: [
      { id: 'challenge-pattern', kind: 'pattern', icon: '🔁' },
      { id: 'challenge-balance', kind: 'balance', icon: '⚖️' },
      { id: 'challenge-legs', kind: 'legs', icon: '🐔' },
    ],
  },
]

export const islandById = (id: IslandId) => ISLANDS.find(i => i.id === id)!

/** An island opens once every level on its required island has at least one star. */
export function isUnlocked(island: Island, stars: Record<string, number>): boolean {
  if (!island.requires) return true
  return islandById(island.requires).levels.every(l => (stars[l.id] ?? 0) > 0)
}
