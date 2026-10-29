# 數學島 Math Islands

A game-based math app for children aged 5–10, mapped to Taiwan's 108 curriculum. Traditional Chinese and English.

Proposal (Chinese): https://claude.ai/artifact/7NN5ax9NUK6emES3BsCLTs

## Islands

9 islands, 3 levels each, 5 rounds per level. Stars count rounds answered right on the first try. A wrong answer gets a strategy hint, never a red ✗.

| Island | Opens after | Levels |
|---|---|---|
| 🌳 數數森林 Counting Forest | — | 數一數 count, 青蛙跳數線 number line, 十格框快看 ten-frame flash |
| 🌊 十的海灣 Ten Bay | 數數森林 | 湊十 make ten, 十和幾 11–19, 開船加減 add/subtract to 20 |
| ⛰️ 位值山谷 Place Value Valley | 十的海灣 | 積木合體 base-ten blocks, 數字住哪裡 digit value, 直式加減 carrying/borrowing |
| 🔷 形狀工坊 Shape Workshop (side quest) | 數數森林 | 形狀名字 shapes, 對折看看 symmetry, 量量看 measuring |
| 🌾 乘法農場 Times Farm | 位值山谷 | 排排菜園 arrays, 九九乘法 times tables, 平分紅蘿蔔 sharing |
| 🏪 時間錢幣市集 Time & Money Market (side quest) | 十的海灣 | 看時鐘 clocks, 數錢 coins, 找零錢 change |
| 🍰 分數廚房 Fraction Kitchen | 乘法農場 | 切披薩 fractions, 分數數線 fractions on a line, 一樣多 equivalent fractions |
| ⚓ 大數港口 Big Number Port | 分數廚房 | 大數位值 big place values, 面積與周長 area/perimeter, 小數 decimals |
| 🧩 挑戰島 Challenge Island | 數數森林 | 找規律 patterns, 天平推理 balance, 雞兔同籠 heads and legs |

An island opens once every level on the island it follows has a star. In development (`npm run dev`) every island is open; add `?locked` to try the unlock rule. In a production build, `?all` opens everything.

Every island starts with a real problem its skills solve (the squirrels must count their nuts for winter; the market needs change checked), and every level says where a child uses it in daily life (🎯), on its card and again on the result screen. Children practise harder when they can see why a skill matters.

Wrong choices are the mistakes children typically make (forgetting to carry, reading the end of a ruler that doesn't start at 0, counting tick marks instead of parts, adding instead of multiplying for equal fractions), so a miss tells you something.

## Develop

```sh
npm install
npm run dev      # http://localhost:5173
npm test         # unit tests: every generator's answers and choices
npm run e2e      # plays all 27 levels in Chrome (uses your installed Chrome)
npm run lint
npm run build
```

## Layout

- `src/game/logic.ts`, `src/game/quizzes.ts`: pure round generators and scoring (unit-tested)
- `src/levels/`: the five hand-built levels, the generic `QuizLevel`, its registry (`quizConfig.ts`) and visuals (`visuals.tsx`)
- `src/islands.ts`: islands, levels, unlock rule
- `src/i18n.ts`: all zh-TW and English text, including prompts and hints
- `src/speech.ts`: browser text-to-speech (to be replaced by recorded voice lines)
- `src/store.ts`: progress in `localStorage`
- `e2e/`: Playwright play-through
- `prototype/index.html`: the first single-file prototype, kept for reference

To add a level: write a generator in `quizzes.ts`, a visual in `visuals.tsx`, its text in `i18n.ts`, then register it in `quizConfig.ts` and `islands.ts`.
