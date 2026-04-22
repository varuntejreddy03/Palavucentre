import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

import CartBar from './CartBar'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const mockAccount = {
  isAuthenticated: true,
}

const mockCart = {
  itemCount: 2,
  total: 240,
}

vi.mock('../context/AccountContext.jsx', () => ({
  useAccount: () => mockAccount,
}))

vi.mock('../context/CartContext.jsx', () => ({
  useCart: () => mockCart,
}))

beforeEach(() => {
  mockNavigate.mockReset()
  mockAccount.isAuthenticated = true
  mockCart.itemCount = 2
  mockCart.total = 240
})

describe('CartBar', () => {
  it('does not render when the cart is empty', () => {
    mockCart.itemCount = 0

    render(<CartBar />)

    expect(screen.queryByRole('button')).toBeNull()
  })

  it('routes signed-in users directly to the order page', async () => {
    const user = userEvent.setup()

    render(<CartBar />)
    await user.click(screen.getByRole('button', { name: /continue to checkout/i }))

    expect(mockNavigate).toHaveBeenCalledWith('/order')
  })

  it('routes signed-out users to login with the checkout return path', async () => {
    const user = userEvent.setup()
    mockAccount.isAuthenticated = false

    render(<CartBar />)
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
})
