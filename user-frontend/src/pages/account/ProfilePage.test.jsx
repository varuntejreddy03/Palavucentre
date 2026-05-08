import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { vi } from 'vitest'

import ProfilePage from './ProfilePage'

const mockAccount = {
  user: { id: 11, name: 'Varun Teja', email: 'varun@example.com' },
  profile: {
    addresses: [
      {
        id: 101,
        label: 'Home',
        recipientName: 'Varun Teja',
        phone: '9876543210',
        addressLine1: 'Door 1-1',
        city: 'Rajahmundry',
        fullAddress: 'Door 1-1, Rajahmundry',
        isDefault: true,
      },
    ],
    orders: [
      {
        id: 501,
        orderNumber: 'ORD-501',
        createdAt: '2026-04-21T10:00:00.000Z',
        orderStatus: 'preparing',
        paymentStatus: 'paid',
        pricing: { grandTotal: 252 },
        items: [
          {
            id: 1,
            name: 'Punugulu',
            unitPrice: 120,
            quantity: 2,
            total: 240,
          },
        ],
      },
    ],
    favourites: [],
  },
  isLoading: false,
  isProfileLoading: false,
  logout: vi.fn(),
  refreshProfile: vi.fn().mockResolvedValue(null),
}

const mockCart = {
  addToCart: vi.fn(),
  setCartOpen: vi.fn(),
}

vi.mock('../../context/AccountContext.jsx', () => ({
  useAccount: () => mockAccount,
}))

vi.mock('../../context/CartContext.jsx', () => ({
  useCart: () => mockCart,
}))

vi.mock('../../lib/api', () => ({
  accountApi: {
    createAddress: vi.fn(),
    updateAddress: vi.fn(),
    deleteAddress: vi.fn(),
  },
}))

function renderProfile(entry = '/profile?tab=overview') {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  mockCart.addToCart.mockReset()
  mockCart.setCartOpen.mockReset()
  mockAccount.logout.mockReset()
  mockAccount.refreshProfile.mockClear()
})

describe('ProfilePage', () => {
  it('keeps order tracking visible while the address book is hidden', async () => {
    const user = userEvent.setup()

    renderProfile()
    expect(screen.queryByText(/^Addresses$/)).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Track' }))

    expect(screen.getByText('Live Orders')).toBeTruthy()
    expect(screen.getByText('Your items are being prepared.')).toBeTruthy()
  })
})
