// Plays every level of every island in a real browser: 5 rounds each, one deliberate wrong
// answer (which must show a hint), and checks the stars and unlock rules.
// Quiz levels expose their answer through a dev-only data-answer attribute.
import { expect, test, type Page } from '@playwright/test'

const KEY = 'math-study:v1'

const ISLANDS: [string, string[]][] = [
  ['數數森林', ['數一數', '青蛙跳數線', '十格框快看']],
  ['十的海灣', ['湊十', '十和幾', '開船加減']],
  ['位值山谷', ['積木合體', '數字住哪裡', '直式加減']],
  ['形狀工坊', ['形狀名字', '對折看看', '量量看']],
  ['乘法農場', ['排排菜園', '九九乘法', '平分紅蘿蔔']],
  ['時間錢幣市集', ['看時鐘', '數錢', '找零錢']],
  ['分數廚房', ['切披薩', '分數數線', '一樣多']],
  ['大數港口', ['大數位值', '面積與周長', '小數']],
  ['挑戰島', ['找規律', '天平推理', '雞兔同籠']],
]

const CHOICE_TEXT: Record<string, string> = {
  circle: '圓形', triangle: '三角形', square: '正方形', rectangle: '長方形', pentagon: '五邊形', hexagon: '六邊形', yes: '會', no: '不會',
}

async function seed(page: Page, stars: Record<string, number> = {}) {
  await page.addInitScript(([key, value]) => {
    if (!sessionStorage.getItem('seeded')) { localStorage.setItem(key, value); sessionStorage.setItem('seeded', '1') }
  }, [KEY, JSON.stringify({ lang: 'zh', voice: false, stars })])
}

const bubble = (page: Page) => page.locator('.bubble').innerText()
/** The island or level card whose name is exactly `name` (descriptions may mention other names). */
const card = (page: Page, name: string) =>
  page.locator('.card').filter({ has: page.locator('.name', { hasText: new RegExp(`^${name}$`) }) })

/** Choice buttons as the child reads them: "3/4" for stacked fractions, digits without separators. */
async function choiceLabels(page: Page) {
  return page.locator('.choice').evaluateAll(bs => bs.map(b => {
    const f = b.querySelector('.frac')
    return f ? [...f.querySelectorAll('span')].map(s => s.textContent).join('/') : (b.textContent ?? '').replace(/,/g, '')
  }))
}

const stageHtml = (page: Page) => page.locator('.stage').first().innerHTML()

/** Clicks a wrong choice first when asked (and expects a hint, and in practice a changed picture), then the right one. */
async function answer(page: Page, value: string | number, wrongFirst: boolean, pictureHelps = false) {
  await expect(page.locator('.choice').nth(1)).toBeVisible()
  const shown = CHOICE_TEXT[value] ?? String(value)
  const labels = await choiceLabels(page)
  const right = labels.indexOf(shown)
  expect(right, `answer ${shown} in [${labels}]`).toBeGreaterThanOrEqual(0)
  if (wrongFirst) {
    const before = await bubble(page)
    const picture = await stageHtml(page)
    await page.locator('.choice').nth(right === 0 ? 1 : 0).click()
    await expect.poll(() => bubble(page), 'a hint replaces the prompt').not.toBe(before)
    if (pictureHelps) await expect.poll(() => stageHtml(page), 'the picture shows the miss').not.toBe(picture)
  }
  await page.locator('.choice').nth(right).click()
  await expect(page.locator('.choice.ok')).toBeVisible()
}

/** Plays one practice round; `done` is how many progress dots will be filled once it is answered. */
async function playRound(page: Page, level: string, wrong: boolean, done: number) {
  const quizAnswer = await page.locator('.stage').first().getAttribute('data-answer')
  if (quizAnswer !== null) return answer(page, quizAnswer, wrong, true)

  if (level === '數一數') {
    const items = page.locator('.item')
    const n = await items.count()
    for (let i = 0; i < n; i++) await items.nth(i).click()
    await expect(page.locator('.badge')).toHaveText(Array.from({ length: n }, (_, i) => String(i + 1)))
    return answer(page, n, wrong, true)
  }
  if (level === '青蛙跳數線') {
    // The round's own prompt, not last round's praise or the lesson's closing line.
    await expect(page.locator('.bubble')).toHaveText(/^(幫青蛙跳到|青蛙在 \d+，往前跳)/)
    const nums = (await bubble(page)).match(/\d+/g)!.map(Number)
    const target = nums.length === 1 ? nums[0] : nums[0] + nums[1]
    if (wrong) {
      await page.locator('.pad').nth(target === 10 ? 9 : target + 1).click()
      // Hopping up to 9 pads at 550 ms each can take longer than the default 5 s.
      await expect.poll(() => bubble(page), { timeout: 15_000 }).toMatch(/跳過頭|還不夠遠/)
      // The frog hops back to the start before the next try is accepted.
      await page.waitForTimeout(1800 + 550 * 12)
    }
    const pad = await page.locator('.pad').nth(target).elementHandle()
    await pad!.click()
    // Wait for the hops to land and the round to end: its pads go when the next round (or the result) comes.
    await pad!.waitForElementState('hidden', { timeout: 20_000 })
    if (done === 5) await expect(page.locator('.big')).toBeVisible({ timeout: 15_000 })
    return
  }
  if (level === '十格框快看') {
    const n = await page.locator('.frame .dot').count()
    await expect(page.locator('.frame.hidden')).toBeVisible()
    return answer(page, n, wrong, true)
  }
  if (level === '湊十') return answer(page, 10 - (await page.locator('.frame .dot').count()), wrong)
  if (level === '十和幾') return answer(page, 10 + (await page.locator('.frame').nth(1).locator('.dot').count()), wrong)
  throw new Error(`no strategy for ${level}`)
}

/** Answers the "think first" question on a first visit (any answer is welcome), then goes on to the lesson. */
async function ponder(page: Page, see = '看示範') {
  await page.locator('.ponder-choice').first().click()
  await page.getByRole('button', { name: new RegExp(see) }).click()
}

/** Steps through the lesson shown on a first visit (animated ones also advance on their own); each step narrates something new. */
async function watchLesson(page: Page, next = '下一步', done = '換你試試！') {
  const seen = new Set<string>()
  for (let i = 0; i < 40; i++) {
    await expect(page.locator('.stage.lesson')).toBeVisible()
    const line = await bubble(page)
    seen.add(line)
    const finish = page.getByRole('button', { name: done })
    if (await finish.isVisible()) { await finish.click(); break }
    // An animated lesson may reach its last step on its own just before this click.
    await page.getByRole('button', { name: next }).click({ timeout: 2000 }).catch(() => {})
    await expect.poll(() => bubble(page), { timeout: 3000 }).not.toBe(line).catch(() => {})
  }
  expect(seen.size).toBeGreaterThanOrEqual(3)
  await expect(page.locator('.stage.lesson')).toHaveCount(0)
}

/** Plays the "do one together" problem: tap whatever is offered, answer each question (one wrong first, which must hint). */
async function doGuide(page: Page) {
  await expect(page.getByRole('heading', { name: '🤝 一起做' })).toBeVisible()
  let wrong = true
  for (let i = 0; i < 200; i++) {
    const start = page.getByRole('button', { name: '開始練習！' })
    if (await start.isVisible()) { await start.click(); return }
    const target = page.locator('.stage .tap:not([disabled])').first()
    if (await target.count() && await target.isVisible()) { await target.click(); continue }
    // Read the answer and "not yet answered" together, so a step change can't slip in between.
    const value = await page.evaluate(() =>
      document.querySelector('.choice.ok') ? null : document.querySelector('.stage')?.getAttribute('data-answer') ?? null)
    if (value !== null) { await answer(page, value, wrong); wrong = false; continue }
    await page.waitForTimeout(100)
  }
  throw new Error('guide never finished')
}

/** Opens an island, skipping its everyday story if this is the first visit. */
async function openIsland(page: Page, island: string) {
  await card(page, island).click()
  const skip = page.getByRole('button', { name: /跳過|Skip/ })
  if (await skip.isVisible()) await skip.click()
}

async function playLevel(page: Page, island: string, level: string) {
  await openIsland(page, island)
  await card(page, level).click()
  await ponder(page)
  await watchLesson(page)
  // Back to the "think first" question, now with its answer.
  await expect(page.locator('.ponder-choice.answer')).toHaveCount(1)
  await page.getByRole('button', { name: /一起做/ }).click()
  await doGuide(page)
  // A miss in the second round repeats that difficulty, so 6 rounds fill the 5 dots.
  for (let round = 0; round < 6; round++) {
    const before = round <= 1 ? round : round - 1
    await expect(page.locator('.progress i.done')).toHaveCount(before, { timeout: 15_000 })
    await expect(page.locator('.choice.ok')).toHaveCount(0)
    await playRound(page, level, round === 1, Math.max(1, round))
  }
  // One round needed a second try → 2 stars.
  await expect(page.locator('.big')).toHaveText('⭐⭐☆', { timeout: 15_000 })
  // A level finished for the first time grows the fox and finds a clue; the last clue asks the child to solve the mystery.
  await expect(page.locator('.growth .clue')).toBeVisible()
  if (await page.locator('.finale').isVisible()) {
    // Try each choice in turn until the right one solves it (a wrong one is disabled).
    const solved = page.locator('.growth .solved')
    for (let i = 0; i < 3; i++) {
      await page.locator('.finale .ponder-choice:not([disabled])').first().click()
      if (await solved.waitFor({ timeout: 1000 }).then(() => true, () => false)) break
    }
    await expect(page.locator('.growth .solved')).toBeVisible()
  }
  await page.getByRole('button', { name: '回去' }).click()
  await expect(card(page, level)).toContainText('⭐⭐☆')
  await page.getByRole('button', { name: 'back' }).click()
}

for (const [island, levels] of ISLANDS) {
  test(`plays every level on ${island}`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', e => errors.push(e.message))
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
    await seed(page)
    await page.goto('/?all')
    for (const level of levels) await playLevel(page, island, level)
    await expect(card(page, island)).toContainText(`⭐ ${levels.length * 2}/${levels.length * 3}`)
    await expect(page.locator('.fox .powers')).toHaveCount(1)
    await expect(page.locator('.fox .lv')).toHaveText(`Lv.${levels.length}`)
    expect(errors).toEqual([])
  })
}

test('islands unlock along the map', async ({ page }) => {
  await seed(page)
  await page.goto('/?locked') // dev builds open everything unless asked not to
  const locked = () => page.locator('.card.locked .name').allInnerTexts()
  expect(await locked()).toEqual(ISLANDS.slice(1).map(([name]) => name))

  await card(page, '十的海灣').click()
  await expect(page.locator('.bubble')).toHaveText('在「數數森林」的每一關都拿到 ⭐⭐ 兩顆星，就能解鎖喔！')
  await expect(page.locator('h2')).toHaveCount(0)

  // One star each is not enough; two on all of 數數森林 open its three children: 十的海灣, 形狀工坊, 挑戰島.
  const setStars = (n: number) => page.evaluate(([key, n]) => localStorage.setItem(key as string, JSON.stringify({
    lang: 'zh', voice: false, stars: { 'forest-count': n, 'forest-line': 3, 'forest-flash': 2 },
  })), [KEY, n])
  await setStars(1)
  await page.reload()
  expect(await locked()).toEqual(ISLANDS.slice(1).map(([name]) => name))
  await setStars(2)
  await page.reload()
  expect(await locked()).toEqual(['位值山谷', '乘法農場', '時間錢幣市集', '分數廚房', '大數港口'])
})

test('a first visit tells the island\'s story from long ago to today, and it can be replayed', async ({ page }) => {
  await seed(page)
  await page.goto('/')
  await card(page, '數數森林').click()
  // First how counting was invented, then today's everyday problem.
  await expect(page.locator('.bubble')).toContainText('還沒有數字')
  await expect(page.locator('.tag-old')).toHaveText('📜 從前從前')
  for (let i = 0; i < 2; i++) await page.getByRole('button', { name: '下一步' }).click()
  await expect(page.locator('.bubble')).toHaveText('今天是你的生日派對，來了 5 個好朋友！')
  await expect(page.locator('.tag-old')).toHaveCount(0)
  for (let i = 0; i < 2; i++) await page.getByRole('button', { name: '下一步' }).click()
  // The cupcake scene waits for the child to tap each one, counting 1 to 5.
  await expect(page.getByRole('button', { name: '下一步' })).toHaveCount(0)
  for (const cake of await page.locator('.story-tap').all()) await cake.click()
  await expect(page.locator('.story-tap .tag-n')).toHaveText(['1', '2', '3', '4', '5'])
  await page.getByRole('button', { name: '下一步' }).click()
  await page.getByRole('button', { name: /出發/ }).click()
  await expect(card(page, '生活故事')).toBeVisible()
  await card(page, '生活故事').click()
  await expect(page.locator('.stage.story')).toBeVisible()
})

test('a round from an earlier island comes back for review, without moving the level on', async ({ page }) => {
  await seed(page, { 'bay-make10': 2, 'place-blocks': 2 })
  await page.goto('/')
  await openIsland(page, '十的海灣')
  await card(page, '湊十').click()
  const dataAnswer = () => page.locator('.stage').first().getAttribute('data-answer')
  for (let round = 0; round < 2; round++) {
    await expect(page.locator('.progress i.done')).toHaveCount(round, { timeout: 15_000 })
    await expect(page.locator('.choice.ok')).toHaveCount(0)
    await answer(page, (await dataAnswer())!, false)
  }
  await expect(page.locator('.review-tag')).toHaveText('🔁 複習一下： 積木合體', { timeout: 15_000 })
  await answer(page, (await dataAnswer())!, false)
  await expect(page.locator('.review-tag')).toHaveCount(0, { timeout: 15_000 })
  await expect(page.locator('.progress i.done')).toHaveCount(2)
})

test('a level already played skips the lesson, and 📖 replays it and the guide', async ({ page }) => {
  await seed(page, { 'forest-flash': 2 })
  await page.goto('/')
  await openIsland(page, '數數森林')
  await card(page, '十格框快看').click()
  await expect(page.locator('.frame.hidden')).toBeVisible()
  await page.getByRole('button', { name: 'lesson' }).click()
  await watchLesson(page)
  await doGuide(page)
  await expect(page.locator('.frame.hidden')).toBeVisible()
})

test('十的海灣 shows mistakes without words, giving more help each time', async ({ page }) => {
  await seed(page, { 'bay-make10': 1 })
  await page.goto('/')
  await openIsland(page, '十的海灣')
  await card(page, '湊十').click()
  const answer = await page.locator('.stage').first().getAttribute('data-answer')
  const wrong = page.locator('.choice:not(.no)').filter({ hasNotText: new RegExp(`^${answer}$`) })

  // 1st miss: the chosen amount is drawn on the frame: rings, blinking gaps or spill-over.
  await wrong.first().click()
  await expect(page.locator('.stage .mark')).not.toHaveCount(0)
  // 2nd miss: the gaps are counted out one by one.
  await wrong.first().click()
  await expect(page.locator('.stage .cell .badge')).toHaveCount(Number(answer))
  await expect(page.locator('.stage .mark')).toHaveCount(0)
  // With 3 choices there is no third miss here; until then nothing pulses.
  await expect(page.locator('.choice.pulse')).toHaveCount(0)
})

test('the sound button cycles voice and effects → effects only → off', async ({ page }) => {
  await page.goto('/')
  const button = page.getByRole('button', { name: 'voice' })
  await expect(button).toHaveText('🔊')
  await button.click()
  await expect(button).toHaveText('🎵')
  await button.click()
  await expect(button).toHaveText('🔇')
  await button.click()
  await expect(button).toHaveText('🔊')
})

test('switches to English everywhere', async ({ page }) => {
  await seed(page)
  await page.goto('/?all')
  await page.getByRole('button', { name: 'EN' }).click()
  await expect(page.locator('h1')).toHaveText('Math Islands')
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await openIsland(page, 'Fraction Kitchen')
  await card(page, 'Pizza Slices').click()
  await expect(page.locator('.bubble')).toHaveText('A pizza cut into 4 equal slices. What do we call one slice?')
  await ponder(page, 'Watch')
  await expect(page.locator('.bubble')).toHaveText('Cut the pizza into 4 equal slices.')
  await watchLesson(page, 'Next', 'Your turn!')
  await page.getByRole('button', { name: /Together/ }).click()
  await expect(page.getByRole('heading', { name: '🤝 Together' })).toBeVisible()
  await expect(page.locator('.bubble')).toHaveText('How many equal slices is the pizza cut into?')
})
