import type { IslandId } from './islands'

/**
 * Pictures for each island's everyday story, one per narrated scene (`t.islands[id].scenes`).
 * Rows are split by '/', items by spaces; each item pops in after the one before.
 */
export const STORY_PICS: Record<IslandId, string[]> = {
  forest: [
    '🎂 / 🧒 👧 👦 🧒 👧',
    '🧁 🧁 🧁 ❓ / 🧒 👧 👦 🧒 👧',
    '🧁 🧁 🧁 🧁 🧁 / 🧒 👧 👦 🧒 👧',
    '🎲 / ⚀ ⚁ ⚂ ⚃ ⚄',
  ],
  bay: [
    '🧺 / 🥚 🥚 🥚 🥚 🥚 / 🥚 🥚 🥚 🥚 🥚',
    '🥚 🥚 🥚 🥚 🥚 / 🥚 🥚 ⬜ ⬜ ⬜',
    '🥚 🥚 🥚 🥚 🥚 / 🥚 🥚 🐣 🐣 🐣',
    '🛗 / 🔟 ➕ 2️⃣ / 1️⃣2️⃣',
  ],
  place: [
    '🏪 / 🧸 / 3️⃣0️⃣5️⃣',
    '🧸 / 3️⃣0️⃣5️⃣ ≠ 3️⃣5️⃣',
    '💯 💯 💯 / 🪙 🪙 🪙 🪙 🪙',
    '🐷 / 💯 💯 🔟 🔟 🔟 🔟',
  ],
  shapes: [
    '🚸 / 🛑 ⚠️ 🔵',
    '🌳 / 🦋',
    '🚪 / 🧒 📏',
    '🛏️ / 🪑 📏 ❓',
  ],
  farm: [
    '🍫 / 🟫 🟫 🟫 🟫 🟫 🟫 / 🟫 🟫 🟫 🟫 🟫 🟫 / 🟫 🟫 🟫 🟫 🟫 🟫 / 🟫 🟫 🟫 🟫 🟫 🟫',
    '🐢 / 👆 1 2 3 4 5 …',
    '🍫 / 4️⃣ ✖️ 6️⃣ / ✨ 2️⃣4️⃣',
    '🍬 🍬 🍬 🍬 🍬 🍬 / 🧒 👧 👦',
    '🧒 🍬 🍬 / 👧 🍬 🍬 / 👦 🍬 🍬',
  ],
  market: [
    '⏰ / 📺 🦸',
    '🥞 / 3️⃣5️⃣',
    '👛 / 🔟 🔟 🔟 5️⃣',
    '💵 5️⃣0️⃣ / 🪙 🔟 5️⃣',
    '🚌 / 🕗',
  ],
  kitchen: [
    '🍕 / 👩 👨 🧒 👧',
    '🍕 / 😃 😢',
    '🍕 / ◔ ◔ ◔ ◔ / 😃 😃 😃 😃',
    '🥞 / 🥛 ½',
    '📱 / 🔋 ½',
  ],
  port: [
    '🚲 / 1️⃣2️⃣,0️⃣0️⃣0️⃣',
    '🏠 / 🟩 🟩 🟩 🟩 / 🟩 🟩 🟩 🟩 / 🟩 🟩 🟩 🟩',
    '🌼 / 🪵 🪵 🪵 🪵',
    '🤒 / 🌡️ 3️⃣7️⃣.5️⃣',
  ],
  challenge: [
    '🚶 / 🟥 ⬜ 🟥 ⬜ 🟥 ❓',
    '🎠 / 🧒 🧒 ⚖️ 🧑',
    '🅿️ / 🛵 🚗 🛵 🚗 🛵',
    '🕵️ / 🛵 🛵 🛵 🛵 🛵 / 🔍',
  ],
}

/** Splits a picture into rows of items. */
export const picRows = (pic: string) => pic.split('/').map(row => row.trim().split(/\s+/))
