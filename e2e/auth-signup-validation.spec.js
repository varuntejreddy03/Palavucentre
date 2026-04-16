import { expect, test } from '@playwright/test'

test('signup validates required details in step one', async ({ page }) => {
  await page.route('**/api/account/me', async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ success: false, message: 'Unauthorized' }),
    })
  })

  await page.goto('/signup')

  await page.getByRole('button', { name: /continue to security/i }).click()
  await expect(page.getByText(/enter your full name/i)).toBeVisible()
})
