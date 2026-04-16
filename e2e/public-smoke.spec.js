import { expect, test } from '@playwright/test'

test('public site loads and menu page is reachable', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('link', { name: /menu/i }).first()).toBeVisible()
  await page.getByRole('link', { name: /menu/i }).first().click()

  await expect(page).toHaveURL(/\/menu$/)
  await expect(page.getByPlaceholder(/search/i)).toBeVisible()
})
