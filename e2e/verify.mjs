// CI-only smoke test. Run against a deployed Firebase Hosting preview
// channel with a disposable test account (created and destroyed by the
// workflow around this script) — never against production data.
import { chromium } from 'playwright'

const PREVIEW_URL = requireEnv('PREVIEW_URL')
const TEST_EMAIL = requireEnv('TEST_EMAIL')
const TEST_PASSWORD = requireEnv('TEST_PASSWORD')

function requireEnv(name) {
  const v = process.env[name]
  if (!v) {
    console.error(`Missing required env var ${name}`)
    process.exit(1)
  }
  return v
}

async function pollUntil(fn, { timeout = 10000, interval = 250, message = 'condition' } = {}) {
  const start = Date.now()
  let lastErr
  while (Date.now() - start < timeout) {
    try {
      const result = await fn()
      if (result) return result
    } catch (err) {
      lastErr = err
    }
    await new Promise((r) => setTimeout(r, interval))
  }
  throw new Error(`Timed out waiting for: ${message}${lastErr ? ` (${lastErr.message})` : ''}`)
}

async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage()

  try {
    console.log(`Opening ${PREVIEW_URL}`)
    await page.goto(PREVIEW_URL, { waitUntil: 'networkidle' })

    console.log('Signing in with disposable test account')
    await page.getByLabel('Email').fill(TEST_EMAIL)
    await page.getByLabel('Password').fill(TEST_PASSWORD)
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()

    await page.getByText("Pablo's Tracker").waitFor({ timeout: 15000 })
    console.log('Signed in, app shell loaded')

    // --- Foods tab: add a food ---
    await page.getByRole('button', { name: 'Foods' }).click()
    await page.getByPlaceholder('e.g. Chicken breast').fill('CI Test Food')
    await page.getByLabel('calories', { exact: true }).fill('200')
    await page.getByRole('button', { name: '+ Add food' }).click()

    const foodNameInput = page.locator('.food-list .food-row .food-name-input').first()
    await foodNameInput.waitFor({ timeout: 10000 })
    await pollUntil(async () => (await foodNameInput.inputValue()) === 'CI Test Food', {
      message: 'new food to appear in the reusable list',
    })
    console.log('Food added to the reusable list')

    // --- Today tab: log the food, check the calorie total updates ---
    await page.getByRole('button', { name: 'Today' }).click()
    await page.getByRole('button', { name: 'Add food entry' }).click()

    await pollUntil(
      async () => {
        const text = await page.locator('.calorie-total').innerText()
        return /200/.test(text)
      },
      { message: 'daily calorie total to show 200 kcal' }
    )
    console.log('Daily calorie total updated correctly')

    // --- Today tab: log a weight entry ---
    await page.getByRole('button', { name: /Log weight for/ }).click()
    await page.getByText('Last recorded:').waitFor({ timeout: 10000 })
    console.log('Weight entry logged')

    // --- Trends tab: charts render ---
    await page.getByRole('button', { name: 'Trends' }).click()
    await page.locator('svg[aria-label="Weight over time"]').waitFor({ timeout: 10000 })
    await page.locator('svg[aria-label="Daily calories vs target"]').waitFor({ timeout: 10000 })
    console.log('Trend charts rendered')

    console.log('VERIFY OK')
  } finally {
    await browser.close()
  }
}

main().catch((err) => {
  console.error('VERIFY FAILED')
  console.error(err)
  process.exit(1)
})
