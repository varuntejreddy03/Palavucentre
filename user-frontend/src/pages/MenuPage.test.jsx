import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

import MenuPage from './MenuPage'

const {
  mockNavigate,
  mockAccount,
  mockCart,
  mockSiteSettings,
  publicApi,
} = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockAccount: {
    isAuthenticated: true,
    user: { name: 'Varun Teja', email: 'varun@example.com' },
  },
  mockCart: {
    addToCart: vi.fn(),
    updateQuantity: vi.fn(),
    cartItems: [],
    itemCount: 0,
    total: 0,
  },
  mockSiteSettings: {
    restaurantName: 'Palavu Centre',
    logoUrl: '',
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
      ],
      mains: [
        { id: 5, name: 'Gongura Chicken', desc: 'Tangy curry', price: 240, veg: false, bestseller: true, available: true, category: { name: 'Mains' } },
        { id: 6, name: 'Mamidikaya Pappu', desc: 'Raw mango dal', price: 160, veg: true, bestseller: false, available: true, category: { name: 'Mains' } },
      ],
    },
  },
}

mockMenuResponse.data.groupedItems.all = [
  ...mockMenuResponse.data.groupedItems.starters,
  ...mockMenuResponse.data.groupedItems.mains,
]

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('../context/AccountContext.jsx', () => ({
  useAccount: () => mockAccount,
}))

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
  mockNavigate.mockReset()
  mockAccount.isAuthenticated = true
  mockAccount.user = { name: 'Varun Teja', email: 'varun@example.com' }
  mockCart.addToCart.mockReset()
  mockCart.updateQuantity.mockReset()
  mockCart.cartItems = []
  mockCart.itemCount = 0
  mockCart.total = 0
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
    publicApi.getMenu.mockImplementation(() => new Promise(() => {}))

    renderMenu()

    expect(screen.getByText('Loading menu...')).toBeTruthy()
  })

  it('renders menu items and the popular picks section', async () => {
    renderMenu()

    expect(await screen.findByText('Popular picks')).toBeTruthy()
    expect(screen.getAllByText('Punugulu').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Gongura Chicken').length).toBeGreaterThan(0)
  })

  it('routes signed-in users to profile from the menu header avatar', async () => {
    const user = userEvent.setup()
    renderMenu()

    await screen.findByText('Popular picks')
    await user.click(screen.getByLabelText('Open profile'))

    expect(mockNavigate).toHaveBeenCalledWith('/profile')
  })

  it('routes signed-out users to login with the profile-orders return path from track', async () => {
    const user = userEvent.setup()
    mockAccount.isAuthenticated = false
    mockAccount.user = null

    renderMenu()

    await screen.findByText('Popular picks')
    await user.click(screen.getByRole('button', { name: /track/i }))

    expect(mockNavigate).toHaveBeenCalledWith('/login', {
      state: {
        from: {
          pathname: '/profile',
          search: '?tab=orders',
        },
        authSource: 'profile',
      },
    })
  })

  it('adds an item to cart', async () => {
    const user = userEvent.setup()
    renderMenu()

    await screen.findAllByText('Punugulu')
    const startersSection = screen.getByRole('heading', { name: 'Starters' }).closest('section')
    const punuguluCard = within(startersSection).getAllByText('Punugulu')[0].closest('article')
    const addButton = within(punuguluCard).getAllByRole('button', { name: /add/i })[0]

    await user.click(addButton)

    expect(mockCart.addToCart).toHaveBeenCalledWith(expect.objectContaining({ id: 1, name: 'Punugulu' }))
  })
})
