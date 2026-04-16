import { expect, test } from '@playwright/test'

function success(data) {
  return {
    success: true,
    data,
  }
}

test('admin can log in and reach dashboard', async ({ page }) => {
  let loggedIn = false

  await page.route('**/api/admin/**', async (route) => {
    const url = route.request().url()

    if (url.includes('/api/admin/login')) {
      loggedIn = true
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(success({ admin: { id: 'a1', email: 'admin@palavucentre.com', name: 'Admin' } })),
      })
      return
    }

    if (url.includes('/api/admin/me')) {
      if (!loggedIn) {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, message: 'Unauthorized' }),
        })
        return
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(success({ admin: { id: 'a1', email: 'admin@palavucentre.com', name: 'Admin' } })),
      })
      return
    }

    if (url.includes('/api/admin/dashboard')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(success({ stats: { totalOrders: 1, totalRevenue: 220 } })),
      })
      return
    }

    if (url.includes('/api/admin/inquiries')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(success({ contact: [], franchise: [], catering: [] })),
      })
      return
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(success({ items: [] })),
    })
  })

  await page.goto('http://127.0.0.1:5174/login')

  await expect(page.getByText(/admin login/i)).toBeVisible()
  await page.getByPlaceholder(/enter admin password/i).fill('strong-password')
  await page.getByRole('button', { name: /login to dashboard/i }).click()

  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(page.getByText(/overview/i).first()).toBeVisible()
})
