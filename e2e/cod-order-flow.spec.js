import { expect, test } from '@playwright/test'

function success(data) {
  return {
    success: true,
    data,
  }
}

test('user can add an item to cart from menu', async ({ page }) => {

  await page.route('**/api/menu', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(
        success({
          categories: [{ slug: 'biryani', name: 'Biryani' }],
          groupedItems: {
            all: [
              {
                id: 'item-1',
                name: 'Chicken Biryani',
                price: 220,
                desc: 'Spicy and aromatic',
                veg: false,
                available: true,
                category: { slug: 'biryani', name: 'Biryani' },
              },
            ],
            biryani: [
              {
                id: 'item-1',
                name: 'Chicken Biryani',
                price: 220,
                desc: 'Spicy and aromatic',
                veg: false,
                available: true,
                category: { slug: 'biryani', name: 'Biryani' },
              },
            ],
          },
        }),
      ),
    })
  })

  await page.goto('/menu')
  const biryaniCard = page.locator('article', { hasText: 'Chicken Biryani' }).first()
  await expect(biryaniCard).toBeVisible()
  await biryaniCard.locator('button:has(svg.lucide-plus)').first().click()
  await expect(page.getByText(/items in cart/i)).toBeVisible()
  await page.getByRole('button', { name: /view cart/i }).click()
  await expect(page.getByText(/your cart/i).first()).toBeVisible()
})
