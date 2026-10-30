import type { IslandId } from './islands'

/**
 * Pictures for each island's everyday story, one per narrated scene (`t.islands[id].scenes`).
 * Rows are split by '/', items by spaces; each item pops in after the one before.
 * An item starting with '*' is tapped by the child to count it ('*🔟:20' shows 20 as its count);
 * the story waits until every one is tapped.
 */
export const STORY_PICS: Record<IslandId, string[]> = {
  forest: [
    '🎂 / 🧒 👧 👦 🧒 👧',
    '🧁 🧁 🧁 ❓ / 🧒 👧 👦 🧒 👧',
    '*🧁 *🧁 *🧁 *🧁 *🧁 / 🧒 👧 👦 🧒 👧',
    '🎲 / ⚀ ⚁ ⚂ ⚃ ⚄',
  ],
  bay: [
    '🧺 / 🥚 🥚 🥚 🥚 🥚 / 🥚 🥚 🥚 🥚 🥚',
    '🥚 🥚 🥚 🥚 🥚 / 🥚 🥚 *⬜ *⬜ *⬜',
    '🥚 🥚 🥚 🥚 🥚 / 🥚 🥚 🐣 🐣 🐣',
    '🛗 / 🔟 ➕ 2️⃣ / 1️⃣2️⃣',
  ],
  place: [
    '🏪 / 🧸 / 3️⃣0️⃣5️⃣',
    '🧸 / 3️⃣0️⃣5️⃣ ≠ 3️⃣5️⃣',
    '*💯:100 *💯:200 *💯:300 / *🪙:301 *🪙:302 *🪙:303 *🪙:304 *🪙:305',
    '🌟 ✏️ / 3️⃣5️⃣ ➕ 4️⃣8️⃣',
  ],
  shapes: [
    '🚸 / *🛑 *⚠️ *🔵',
    '🌳 / 🦋',
    '🚪 / 🧒 📏',
    '🛏️ / 🪑 📏 ❓',
  ],
  farm: [
    '🍫 / *🟫 *🟫 *🟫 *🟫 *🟫 *🟫 / 🟫 🟫 🟫 🟫 🟫 🟫 / 🟫 🟫 🟫 🟫 🟫 🟫 / 🟫 🟫 🟫 🟫 🟫 🟫',
    '🐢 / 👆 1 2 3 4 5 …',
    '🍫 / 4️⃣ ✖️ 6️⃣ / ✨ 2️⃣4️⃣',
    '🍬 🍬 🍬 🍬 🍬 🍬 / 🧒 👧 👦',
    '🧒 🍬 🍬 / 👧 🍬 🍬 / 👦 🍬 🍬',
  ],
  market: [
    '⏰ / 📺 🦸',
    '🥞 / 3️⃣5️⃣',
    '👛 / *🔟:10 *🔟:20 *🔟:30 *5️⃣:35',
    '💵 5️⃣0️⃣ / 🪙 🔟 5️⃣',
    '🚌 / 🕗',
  ],
  kitchen: [
    '🍕 / 👩 👨 🧒 👧',
    '🍕 / 😃 😢',
    '🍕 / *◔ *◔ *◔ *◔ / 😃 😃 😃 😃',
    '🥞 / 🥛 ½',
    '📱 / 🔋 ½',
  ],
  port: [
    '🚲 / 1️⃣2️⃣,0️⃣0️⃣0️⃣',
    '🏠 / *🟩 *🟩 *🟩 *🟩 / *🟩 *🟩 *🟩 *🟩 / *🟩 *🟩 *🟩 *🟩',
    '🌼 / 🪵 🪵 🪵 🪵',
    '🤒 / 🌡️ 3️⃣7️⃣.5️⃣',
  ],
  challenge: [
    '🚶 / 🟥 ⬜ 🟥 ⬜ 🟥 ❓',
    '🎠 / 🧒 🧒 ⚖️ 🧑',
    '🅿️ / *🛵:2 *🚗:6 *🛵:8 *🚗:12 *🛵:14',
    '🕵️ / 🛵 🛵 🛵 🛵 🛵 / 🔍',
  ],
}

/** Splits a picture into rows of items. */
export const picRows = (pic: string) => pic.split('/').map(row => row.trim().split(/\s+/))

/** One picture item: its glyph, whether the child taps it, and the count it shows if not the usual 1, 2, 3… */
export function parseItem(item: string): { glyph: string; tap: boolean; count?: string } {
  if (!item.startsWith('*')) return { glyph: item, tap: false }
  const [glyph, count] = item.slice(1).split(':')
  return { glyph, tap: true, count }
}
