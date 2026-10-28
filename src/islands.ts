import type { Strings } from './i18n'

export type LevelKind = 'count' | 'line' | 'flash' | 'makeTen' | 'teen'
export type LevelId = keyof Strings['levels']
export type IslandId = keyof Strings['islands']

export interface Level { id: LevelId; kind: LevelKind; icon: string }
export interface Island { id: IslandId; icon: string; levels: Level[] }

export const ISLANDS: Island[] = [
  {
    id: 'forest', icon: '🌳', levels: [
      { id: 'forest-count', kind: 'count', icon: '🍎' },
      { id: 'forest-line', kind: 'line', icon: '🐸' },
      { id: 'forest-flash', kind: 'flash', icon: '🔟' },
    ],
  },
  {
    id: 'bay', icon: '🌊', levels: [
      { id: 'bay-make10', kind: 'makeTen', icon: '🐚' },
      { id: 'bay-teen', kind: 'teen', icon: '🐟' },
    ],
  },
]

/** An island opens once every level on the island before it has at least one star. */
export function isUnlocked(index: number, stars: Record<string, number>): boolean {
  if (index === 0) return true
  return ISLANDS[index - 1].levels.every(l => (stars[l.id] ?? 0) > 0)
}
