import { expect, test } from '@playwright/test'

test('order route redirects guests to login', async ({ page }) => {
  await page.route('**/api/account/me', async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ success: false, message: 'Unauthorized' }),
    })
  })

  await page.goto('/order')

  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByText(/sign in/i).first()).toBeVisible()
})
