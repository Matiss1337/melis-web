import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('./')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

test('shows the supplied icons at the shared game icon size', async ({ page }) => {
  for (const [name, source] of [['Tik Tok', 'tik-tok.png'], ['Mēmais šovs', 'memais-sovs.png']]) {
    const icon = page.getByRole('link', { name }).locator('img')
    await expect(icon).toHaveAttribute('src', new RegExp(`${source}$`))
    const box = await icon.boundingBox()
    expect(box).not.toBeNull()
    expect(Math.max(box!.width, box!.height)).toBeLessThanOrEqual(56)
  }
})

test('opens every game from the hub and returns home', async ({ page }) => {
  for (const name of ['Melis', 'Tik Tok', 'Mēmais šovs']) {
    await page.getByRole('link', { name }).click()
    await expect(page.getByRole('heading', { name })).toBeVisible()
    await page.getByRole('button', { name: 'Uz spēlēm' }).click()
    await expect(page.getByRole('heading', { name: 'Spēles' })).toBeVisible()
  }
})

test('plays Tik Tok and shows its winning line', async ({ page }) => {
  await page.getByRole('link', { name: 'Tik Tok' }).click()
  await page.getByRole('button', { name: 'Atvērt noteikumus' }).click()
  await expect(page.getByText('Gājieni')).toBeVisible()
  await page.getByRole('button', { name: 'Aizvērt noteikumus' }).click()
  for (const cell of [1, 2, 5, 3, 9]) await page.getByRole('button', { name: `Tik Tok ${cell}` }).click()

  await expect(page.getByRole('heading', { name: 'Uzvarēja!' })).toBeVisible()
  await expect(page.getByTestId('tik-tok-winning-line')).toBeVisible()
  await page.getByRole('button', { name: 'Sākt no jauna' }).click()
  await expect(page.getByText('Nākamais:')).toBeVisible()
})

test('reveals and replaces a mēmais šovs word', async ({ page }) => {
  await page.getByRole('link', { name: 'Mēmais šovs' }).click()
  await page.getByRole('button', { name: 'Atvērt noteikumus' }).click()
  await expect(page.getByText('Rādīšana')).toBeVisible()
  await page.getByRole('button', { name: 'Aizvērt noteikumus' }).click()
  await page.getByRole('button', { name: 'Atvērt vārdu' }).click()
  await expect(page.getByRole('button', { name: 'Paslēpt vārdu' })).toBeVisible()
  await page.getByRole('button', { name: 'Nākamais vārds' }).click()
  await expect(page.getByRole('button', { name: 'Atvērt vārdu' })).toBeVisible()
})

test('starts a Melis round', async ({ page }) => {
  await page.getByRole('link', { name: 'Melis' }).click()
  await expect(page.getByRole('button', { name: 'Sākt spēli' })).toBeDisabled()
  for (const [index, name] of ['Anna', 'Berts', 'Cēsis'].entries()) {
    await page.getByPlaceholder(`Spēlētājs ${index + 1}`).fill(name)
  }
  await page.getByRole('button', { name: 'Sākt spēli' }).click()
  await expect(page.getByRole('button', { name: 'Skatīt lokāciju' })).toBeVisible()
  await page.getByRole('button', { name: 'Skatīt lokāciju' }).click()
  await page.getByRole('button', { name: 'Paslēpt un nodot tālāk' }).click()
  await page.getByRole('button', { name: 'Skatīt lokāciju' }).click()
  await page.getByRole('button', { name: 'Paslēpt un nodot tālāk' }).click()
  await page.getByRole('button', { name: 'Skatīt lokāciju' }).click()
  await page.getByRole('button', { name: 'Sākt raundu' }).click()
  await expect(page.getByRole('button', { name: 'Pauze' })).toBeVisible()
})
