# 數學島 Math Islands

A game-based math app for children aged 5–10, mapped to Taiwan's 108 curriculum. Traditional Chinese and English.

Proposal (Chinese): https://claude.ai/artifact/7NN5ax9NUK6emES3BsCLTs

## What's playable

| Island | Level | Practises |
|---|---|---|
| 🌳 數數森林 Counting Forest | 🍎 數一數 Count Them | One-to-one counting, then "the last number is how many" |
| | 🐸 青蛙跳數線 Frog Hop | Locating numbers on a 0–10 line, hopping forward |
| | 🔟 十格框快看 Ten-Frame Flash | Recognising amounts at a glance as "5 and some more" |
| 🌊 十的海灣 Ten Bay | 🐚 湊十 Make Ten | How many more make 10 |
| | 🐟 十和幾 Ten and Some More | 11–19 as one ten and some ones |

Each level is 5 rounds. Stars count rounds answered right on the first try. Wrong answers get a hint, never a red ✗. Ten Bay unlocks once every Counting Forest level has a star; add `?all` to the URL to open everything.

## Develop

```sh
npm install
npm run dev      # http://localhost:5173
npm test         # round generators and scoring
npm run lint
npm run build
```

## Layout

- `src/game/logic.ts`: pure round generators and scoring (unit-tested)
- `src/levels/`: one component per level kind, plus shared `Choices`, `TenFrame` and timer hooks
- `src/islands.ts`: island and level list, unlock rule
- `src/i18n.ts`: all zh-TW and English text
- `src/speech.ts`: browser text-to-speech (to be replaced by recorded voice lines)
- `src/store.ts`: progress in `localStorage`
- `prototype/index.html`: the first single-file prototype, kept for reference
