import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

import CartDrawer from './CartDrawer'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const mockAccount = {
  user: { name: 'Varun Teja', email: 'varun@example.com' },
  isAuthenticated: true,
}

const mockCart = {
  cartItems: [
    {
      id: 1,
      name: 'Punugulu',
      price: 120,
      quantity: 2,
      img: '/hero-bg.jpg',
    },
  ],
  removeFromCart: vi.fn(),
  updateQuantity: vi.fn(),
  total: 240,
  isCartOpen: true,
  setCartOpen: vi.fn(),
}

const mockSiteSettings = {
  ordering: {
    taxPercent: 5,
  },
}

vi.mock('../context/AccountContext.jsx', () => ({
  useAccount: () => mockAccount,
}))

vi.mock('../context/CartContext.jsx', () => ({
  useCart: () => mockCart,
}))

vi.mock('../context/SiteContext.jsx', () => ({
  useSiteSettings: () => ({ siteSettings: mockSiteSettings }),
}))

beforeEach(() => {
  vi.useRealTimers()
  mockNavigate.mockReset()
  mockCart.removeFromCart.mockReset()
  mockCart.updateQuantity.mockReset()
  mockCart.setCartOpen.mockReset()
  mockCart.isCartOpen = true
  mockCart.total = 240
  mockCart.cartItems = [
    {
      id: 1,
      name: 'Punugulu',
      price: 120,
      quantity: 2,
      img: '/hero-bg.jpg',
    },
  ]
  mockAccount.isAuthenticated = true
  mockAccount.user = { name: 'Varun Teja', email: 'varun@example.com' }
  window.localStorage.clear()
})

describe('CartDrawer', () => {
  it('shows the empty state and browses the menu from an empty cart', async () => {
    const user = userEvent.setup()
    mockCart.cartItems = []
    mockCart.total = 0

    render(<CartDrawer />)
    await user.click(screen.getByRole('button', { name: /browse menu/i }))

    expect(mockCart.setCartOpen).toHaveBeenCalledWith(false)
    expect(mockNavigate).toHaveBeenCalledWith('/menu')
  })

  it('sends unauthenticated users to login for checkout with the full order return path', async () => {
    const user = userEvent.setup()
    mockAccount.isAuthenticated = false
    mockAccount.user = null

    render(<CartDrawer />)
    await user.click(screen.getByRole('button', { name: /login to checkout/i }))

    expect(mockNavigate).toHaveBeenCalledWith('/login', {
      state: {
        from: {
          pathname: '/order',
          search: '',
        },
        authSource: 'checkout',
      },
    })
  })

  it('sends authenticated users to the order page', async () => {
    const user = userEvent.setup()

    render(<CartDrawer />)
    await user.click(screen.getByRole('button', { name: /continue to order/i }))

    expect(mockNavigate).toHaveBeenCalledWith('/order')
  })

  it('dismisses the signed-in banner and stores the preference', async () => {
    const user = userEvent.setup()

    render(<CartDrawer />)
    await user.click(screen.getByLabelText('Dismiss signed in banner'))

    expect(window.localStorage.getItem('palavu:cart-signed-in-banner-dismissed')).toBe('true')
    expect(screen.queryByText(/signed in as/i)).toBeNull()
  })

  it('increments item quantity from the drawer stepper', async () => {
    const user = userEvent.setup()

    render(<CartDrawer />)
    await user.click(screen.getByRole('button', { name: /increase punugulu quantity/i }))

    expect(mockCart.updateQuantity).toHaveBeenCalledWith(1, 3)
  })

  it('removes an item when quantity is decremented to zero', async () => {
    vi.useFakeTimers()
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    mockCart.cartItems = [
      {
        id: 1,
        name: 'Punugulu',
        price: 120,
        quantity: 1,
        img: '/hero-bg.jpg',
      },
    ]

    render(<CartDrawer />)
    fireEvent.click(screen.getByRole('button', { name: /decrease punugulu quantity/i }))
    vi.advanceTimersByTime(200)

    expect(mockCart.removeFromCart).toHaveBeenCalledWith(1)
  })
})
