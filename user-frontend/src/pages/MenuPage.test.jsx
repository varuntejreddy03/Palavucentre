import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

import MenuPage from './MenuPage'

const { mockCart, mockSiteSettings, publicApi } = vi.hoisted(() => ({
  mockCart: {
    addToCart: vi.fn(),
    cartItems: [],
    total: 0,
    isCartOpen: false,
    setCartOpen: vi.fn(),
  },
  mockSiteSettings: {
    restaurantName: 'Palavu Centre',
    logoUrl: '',
    heroMedia: [{ type: 'image', url: '/hero-bg.jpg' }],
  },
  publicApi: {
    getMenu: vi.fn(),
  },
}))

const mockMenuResponse = {
  data: {
    categories: [
      { slug: 'starters', name: 'Starters', icon: 'utensils-crossed' },
      { slug: 'mains', name: 'Mains', icon: 'chef-hat' },
    ],
    groupedItems: {
      all: [],
      starters: [
        { id: 1, name: 'Punugulu', desc: 'Crispy starter', price: 120, veg: true, bestseller: true, available: true, category: { name: 'Starters' } },
        { id: 2, name: 'Royyala Vepudu', desc: 'Prawn fry', price: 280, veg: false, bestseller: true, available: true, category: { name: 'Starters' } },
        { id: 3, name: 'Mirchi Bajji', desc: 'Chili fritter', price: 100, veg: true, bestseller: false, available: true, category: { name: 'Starters' } },
        { id: 4, name: 'Kodi Fry', desc: 'Spicy chicken', price: 260, veg: false, bestseller: false, available: true, category: { name: 'Starters' } },
      ],
      mains: [
        { id: 5, name: 'Gongura Chicken', desc: 'Tangy curry', price: 240, veg: false, bestseller: true, available: true, category: { name: 'Mains' } },
        { id: 6, name: 'Mamidikaya Pappu', desc: 'Raw mango dal', price: 160, veg: true, bestseller: false, available: true, category: { name: 'Mains' } },
        { id: 7, name: 'Chepala Pulusu', desc: 'Fish curry', price: 280, veg: false, bestseller: false, available: true, category: { name: 'Mains' } },
        { id: 8, name: 'Bendakaya Fry', desc: 'Okra fry', price: 140, veg: true, bestseller: false, available: true, category: { name: 'Mains' } },
      ],
    },
  },
}

mockMenuResponse.data.groupedItems.all = [
  ...mockMenuResponse.data.groupedItems.starters,
  ...mockMenuResponse.data.groupedItems.mains,
]

vi.mock('../context/CartContext.jsx', () => ({
  useCart: () => mockCart,
}))

vi.mock('../context/SiteContext.jsx', () => ({
  useSiteSettings: () => ({ siteSettings: mockSiteSettings }),
}))

vi.mock('../lib/api', () => ({
  publicApi,
}))

function renderMenu() {
  return render(<MenuPage />)
}

beforeEach(() => {
  mockCart.addToCart.mockReset()
  mockCart.setCartOpen.mockReset()
  mockCart.cartItems = []
  mockCart.total = 0
  mockCart.isCartOpen = false
  publicApi.getMenu.mockReset()
  publicApi.getMenu.mockResolvedValue(mockMenuResponse)
  window.innerWidth = 1024
  window.matchMedia.mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
})

describe('MenuPage', () => {
  it('shows a loading state before menu data arrives', () => {
    publicApi.getMenu.mockImplementation(
      () =>
        new Promise(() => {
          // Keep pending to assert initial loading state.
        }),
    )

    renderMenu()
    expect(screen.getByText('Loading menu...')).toBeTruthy()
  })

  it('renders menu categories and items from the API', async () => {
    renderMenu()

    expect(await screen.findByText('Starters')).toBeTruthy()
    expect(screen.getByText('Mains')).toBeTruthy()
    expect(screen.getAllByText('Punugulu').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Gongura Chicken').length).toBeGreaterThan(0)
  })

  it('renders the favourites section when bestseller items exist', async () => {
    renderMenu()

    expect(await screen.findByText('Popular picks')).toBeTruthy()
    expect(screen.getAllByText('Popular').length).toBeGreaterThan(0)
  })

  it('shows an error state when the menu request fails', async () => {
    publicApi.getMenu.mockRejectedValue(new Error('Menu failed'))
    renderMenu()

    expect(await screen.findByText('Menu failed')).toBeTruthy()
  })

  it('filters menu items by search query', async () => {
    const user = userEvent.setup()
    renderMenu()

    await screen.findAllByText('Punugulu')
    await user.type(screen.getByPlaceholderText('Search menu'), 'Gongura')

    expect(screen.getByText('Gongura Chicken')).toBeTruthy()
    expect(screen.queryAllByText('Punugulu').length).toBe(0)
  })

  it('filters the list to veg items', async () => {
    const user = userEvent.setup()
    renderMenu()

    await screen.findAllByText('Punugulu')
    await user.click(screen.getByRole('button', { name: 'Veg' }))

    expect(screen.getByText('Punugulu')).toBeTruthy()
    expect(screen.getByText('Mamidikaya Pappu')).toBeTruthy()
    expect(screen.queryAllByText('Gongura Chicken').length).toBe(0)
  })

  it('filters the list to non-veg items', async () => {
    const user = userEvent.setup()
    renderMenu()

    await screen.findAllByText('Punugulu')
    await user.click(screen.getByRole('button', { name: 'Non-Veg' }))

    expect(screen.getByText('Gongura Chicken')).toBeTruthy()
    expect(screen.getByText('Royyala Vepudu')).toBeTruthy()
    expect(screen.queryAllByText('Mamidikaya Pappu').length).toBe(0)
  })

  it('filters items by category pill', async () => {
    const user = userEvent.setup()
    renderMenu()

    await screen.findAllByText('Punugulu')
    await user.click(screen.getByRole('button', { name: 'Mains' }))

    expect(screen.getByText('Gongura Chicken')).toBeTruthy()
    expect(screen.queryAllByText('Punugulu').length).toBe(0)
  })

  it('clears active filters and search', async () => {
    const user = userEvent.setup()
    renderMenu()

    await screen.findAllByText('Punugulu')
    await user.type(screen.getByPlaceholderText('Search menu'), 'Gongura')
    await user.click(screen.getByRole('button', { name: 'Non-Veg' }))
    await user.click(screen.getByRole('button', { name: /clear filters/i }))

    expect(screen.getAllByText('Punugulu').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Gongura Chicken').length).toBeGreaterThan(0)
  })

  it('adds an item to cart', async () => {
    const user = userEvent.setup()
    renderMenu()

    await screen.findAllByText('Punugulu')
    const startersSection = screen.getAllByText('STARTERS')[0].closest('section')
    const punuguluCard = within(startersSection).getAllByText('Punugulu')[0].closest('article')
    const addButton = within(punuguluCard).getAllByRole('button')[0]
    await user.click(addButton)

    expect(mockCart.addToCart).toHaveBeenCalledWith(expect.objectContaining({ id: 1, name: 'Punugulu' }))
  })

  it('shows load more on mobile and reveals more items', async () => {
    const user = userEvent.setup()
    window.innerWidth = 375
    window.matchMedia.mockImplementation((query) => ({
      matches: query === '(max-width: 639px)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    renderMenu()

    await screen.findAllByText('Punugulu')
    expect(screen.queryByText('Bendakaya Fry')).toBeNull()
    await user.click(screen.getByRole('button', { name: /load more/i }))
    expect(await screen.findByText('Bendakaya Fry')).toBeTruthy()
  })
})
