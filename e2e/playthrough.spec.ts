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

/** Clicks a wrong choice first when asked (and expects a hint), then the right one. */
async function answer(page: Page, value: string | number, wrongFirst: boolean) {
  await expect(page.locator('.choice').nth(1)).toBeVisible()
  const shown = CHOICE_TEXT[value] ?? String(value)
  const labels = await choiceLabels(page)
  const right = labels.indexOf(shown)
  expect(right, `answer ${shown} in [${labels}]`).toBeGreaterThanOrEqual(0)
  if (wrongFirst) {
    const before = await bubble(page)
    await page.locator('.choice').nth(right === 0 ? 1 : 0).click()
    await expect.poll(() => bubble(page), 'a hint replaces the prompt').not.toBe(before)
  }
  await page.locator('.choice').nth(right).click()
  await expect(page.locator('.choice.ok')).toBeVisible()
}

async function playRound(page: Page, level: string, round: number) {
  const wrong = round === 1
  const quizAnswer = await page.locator('.stage').first().getAttribute('data-answer')
  if (quizAnswer !== null) return answer(page, quizAnswer, wrong)

  if (level === '數一數') {
    const items = page.locator('.item')
    const n = await items.count()
    for (let i = 0; i < n; i++) await items.nth(i).click()
    await expect(page.locator('.badge')).toHaveText(Array.from({ length: n }, (_, i) => String(i + 1)))
    return answer(page, n, wrong)
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
    await page.locator('.pad').nth(target).click()
    // Wait for the hops to land: the next round, or the result screen after the last one.
    const advanced = round === 4 ? page.locator('.big') : page.locator('.progress i.done').nth(round)
    await expect(advanced).toBeVisible({ timeout: 15_000 })
    return
  }
  if (level === '十格框快看') {
    const n = await page.locator('.frame .dot').count()
    await expect(page.locator('.frame.hidden')).toBeVisible()
    return answer(page, n, wrong)
  }
  if (level === '湊十') return answer(page, 10 - (await page.locator('.frame .dot').count()), wrong)
  if (level === '十和幾') return answer(page, 10 + (await page.locator('.frame').nth(1).locator('.dot').count()), wrong)
  throw new Error(`no strategy for ${level}`)
}

/** Steps through the worked example shown on a first visit; every step must narrate something new. */
async function watchLesson(page: Page, next = '下一步', done = '換你試試！') {
  const seen = new Set<string>()
  for (;;) {
    await expect(page.locator('.stage.lesson')).toBeVisible()
    const line = await bubble(page)
    expect(seen.has(line), `lesson repeats "${line}"`).toBe(false)
    seen.add(line)
    const finish = page.getByRole('button', { name: done })
    if (await finish.isVisible()) { await finish.click(); break }
    await page.getByRole('button', { name: next }).click()
    await expect.poll(() => bubble(page)).not.toBe(line)
  }
  expect(seen.size).toBeGreaterThanOrEqual(3)
  await expect(page.locator('.stage.lesson')).toHaveCount(0)
}

/** Plays the "do one together" problem: tap the offered cells, answer each question (one wrong first, which must hint). */
async function doGuide(page: Page) {
  await expect(page.getByRole('heading', { name: '🤝 一起做' })).toBeVisible()
  let wrong = true
  for (let i = 0; i < 200; i++) {
    const start = page.getByRole('button', { name: '開始練習！' })
    if (await start.isVisible()) { await start.click(); return }
    const cell = page.locator('.cell.tap').first()
    if (await cell.isVisible()) { await cell.click(); continue }
    const value = await page.locator('.stage').first().getAttribute('data-answer')
    if (value !== null && await page.locator('.choice.ok').count() === 0) { await answer(page, value, wrong); wrong = false; continue }
    await page.waitForTimeout(100)
  }
  throw new Error('guide never finished')
}

const GUIDED = new Set(['湊十', '十和幾', '開船加減'])

async function playLevel(page: Page, island: string, level: string) {
  await card(page, island).click()
  await card(page, level).click()
  await watchLesson(page)
  if (GUIDED.has(level)) await doGuide(page)
  for (let round = 0; round < 5; round++) {
    await expect(page.locator('.progress i.done')).toHaveCount(round, { timeout: 15_000 })
    await expect(page.locator('.choice.ok')).toHaveCount(0)
    await playRound(page, level, round)
  }
  // One wrong answer: 4 of 5 right first time → 2 stars.
  await expect(page.locator('.big')).toHaveText('⭐⭐☆', { timeout: 15_000 })
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
    expect(errors).toEqual([])
  })
}

test('islands unlock along the map', async ({ page }) => {
  await seed(page)
  await page.goto('/?locked') // dev builds open everything unless asked not to
  const locked = () => page.locator('.card.locked .name').allInnerTexts()
  expect(await locked()).toEqual(ISLANDS.slice(1).map(([name]) => name))

  await card(page, '十的海灣').click()
  await expect(page.locator('.bubble')).toHaveText('先在「數數森林」的每一關都拿到星星，就能解鎖喔！')
  await expect(page.locator('h2')).toHaveCount(0)

  // Stars on all of 數數森林 open its three children: 十的海灣, 形狀工坊, 挑戰島.
  await page.evaluate(key => localStorage.setItem(key, JSON.stringify({
    lang: 'zh', voice: false, stars: { 'forest-count': 1, 'forest-line': 1, 'forest-flash': 1 },
  })), KEY)
  await page.reload()
  expect(await locked()).toEqual(['位值山谷', '乘法農場', '時間錢幣市集', '分數廚房', '大數港口'])
})

test('a level already played skips the lesson, and 📖 replays it', async ({ page }) => {
  await seed(page, { 'forest-flash': 2 })
  await page.goto('/')
  await card(page, '數數森林').click()
  await card(page, '十格框快看').click()
  await expect(page.locator('.frame.hidden')).toBeVisible()
  await page.getByRole('button', { name: 'lesson' }).click()
  await watchLesson(page)
  await expect(page.locator('.frame.hidden')).toBeVisible()
})

test('switches to English everywhere', async ({ page }) => {
  await seed(page)
  await page.goto('/?all')
  await page.getByRole('button', { name: 'EN' }).click()
  await expect(page.locator('h1')).toHaveText('Math Islands')
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await card(page, 'Fraction Kitchen').click()
  await card(page, 'Pizza Slices').click()
  await expect(page.locator('.bubble')).toHaveText('Cut the pizza into 4 equal slices.')
  await watchLesson(page, 'Next', 'Your turn!')
  await expect(page.locator('.bubble')).toHaveText('What fraction is shaded?')
})
