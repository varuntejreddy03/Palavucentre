import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

import OrderPage from './OrderPage'

const {
  mockNavigate,
  mockAccount,
  mockCart,
  mockSiteSettings,
  publicApi,
  promoApi,
} = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockAccount: {
    user: { id: 11, name: 'Varun Teja', email: 'varun@example.com' },
    profile: {
      addresses: [
        {
          id: 101,
          label: 'Home',
          recipientName: 'Varun Teja',
          phone: '9876543210',
          fullAddress: 'Door 1-1, Rajahmundry',
          addressLine1: 'Door 1-1',
          addressLine2: '',
          landmark: '',
          city: 'Rajahmundry',
          state: 'AP',
          postalCode: '533101',
          isDefault: true,
        },
        {
          id: 102,
          label: 'Office',
          recipientName: 'Varun Teja',
          phone: '9876500000',
          fullAddress: 'Office Street, Hyderabad',
          addressLine1: 'Office Street',
          addressLine2: '',
          landmark: '',
          city: 'Hyderabad',
          state: 'TS',
          postalCode: '500001',
          isDefault: false,
        },
      ],
      orders: [],
    },
    refreshProfile: vi.fn().mockResolvedValue(null),
  },
  mockCart: {
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
    clearCart: vi.fn(),
  },
  mockSiteSettings: {
    restaurantName: 'Palavu Centre',
    ordering: {
      taxPercent: 5,
    },
  },
  publicApi: {
    createOrder: vi.fn(),
    createRazorpayOrder: vi.fn(),
    verifyRazorpayPayment: vi.fn(),
  },
  promoApi: {
    apply: vi.fn(),
  },
}))

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
  promoApi,
}))

function renderOrderPage() {
  return render(
    <MemoryRouter>
      <OrderPage />
    </MemoryRouter>,
  )
}

function getActionButton(name) {
  const matches = screen.getAllByRole('button', { name })
  return matches.find((button) => !String(button.className || '').includes('hidden')) || matches[0]
}

function installRazorpayMock({ onOpen } = {}) {
  const instance = {
    on: vi.fn(),
    open: vi.fn(),
  }

  const RazorpayMock = vi.fn(function RazorpayMock(options) {
    instance.open.mockImplementation(() => {
      onOpen?.(options)
    })
    return instance
  })

  window.Razorpay = RazorpayMock

  return { instance, RazorpayMock }
}

function baseOrderPayload() {
  return {
    order: {
      id: 501,
      orderNumber: 'ORD-501',
      orderStatus: 'pending',
      paymentMethod: 'cod',
      customer: {
        name: 'Varun Teja',
        phone: '9876543210',
        address: 'Door 1-1, Rajahmundry',
      },
      pricing: {
        subTotal: 240,
        taxAmount: 12,
        deliveryFee: 0,
        grandTotal: 252,
      },
      items: [
        {
          id: 1,
          name: 'Punugulu',
          quantity: 2,
          unitPrice: 120,
          total: 240,
        },
      ],
    },
  }
}

beforeEach(() => {
  mockNavigate.mockReset()
  mockAccount.refreshProfile.mockClear()
  mockCart.removeFromCart.mockReset()
  mockCart.updateQuantity.mockReset()
  mockCart.clearCart.mockReset()
  mockCart.cartItems = [
    {
      id: 1,
      name: 'Punugulu',
      price: 120,
      quantity: 2,
      img: '/hero-bg.jpg',
    },
  ]
  mockCart.total = 240
  publicApi.createOrder.mockReset()
  publicApi.createRazorpayOrder.mockReset()
  publicApi.verifyRazorpayPayment.mockReset()
  promoApi.apply.mockReset()
  window.Razorpay = undefined
})

describe('OrderPage', () => {
  it('shows the empty cart state when no items exist', () => {
    mockCart.cartItems = []
    mockCart.total = 0

    renderOrderPage()

    expect(screen.getByText('Your cart is empty')).toBeTruthy()
    expect(screen.getByText('Manage Addresses')).toBeTruthy()
  })

  it('renders the account-first checkout copy and saved addresses', () => {
    renderOrderPage()

    expect(screen.getByText('Account Checkout')).toBeTruthy()
    expect(screen.getByText(/signed in as/i)).toBeTruthy()
    expect(screen.getByText('Home')).toBeTruthy()
    expect(screen.getByText('Office')).toBeTruthy()
    expect(screen.queryByText(/guest checkout/i)).toBeNull()
  })

  it('lets the user switch to a one-time address form', async () => {
    const user = userEvent.setup()
    renderOrderPage()

    await user.click(screen.getByRole('button', { name: /use a one-time address/i }))

    expect(screen.getByPlaceholderText('Street, area, landmark')).toBeTruthy()
  })

  it('applies a promo code successfully', async () => {
    const user = userEvent.setup()
    promoApi.apply.mockResolvedValue({
      data: {
        promoCode: { code: 'WELCOME10' },
        pricing: {
          subTotal: 240,
          discountAmount: 24,
          taxAmount: 10.8,
          grandTotal: 226.8,
        },
      },
    })

    renderOrderPage()
    await user.type(screen.getByPlaceholderText('Enter promo code'), 'welcome10')
    await user.click(screen.getByRole('button', { name: 'Apply' }))

    expect(await screen.findByText('WELCOME10 applied')).toBeTruthy()
  })

  it('submits the selected address and promo code in the COD payload', async () => {
    const user = userEvent.setup()
    promoApi.apply.mockResolvedValue({
      data: {
        promoCode: { code: 'WELCOME10' },
        pricing: {
          subTotal: 240,
          discountAmount: 24,
          taxAmount: 10.8,
          grandTotal: 226.8,
        },
      },
    })
    publicApi.createOrder.mockResolvedValue({
      data: baseOrderPayload(),
    })

    renderOrderPage()

    await user.click(screen.getByRole('button', { name: /office/i }))
    await user.type(screen.getByPlaceholderText('Enter promo code'), 'WELCOME10')
    await user.click(screen.getByRole('button', { name: 'Apply' }))
    await screen.findByText('WELCOME10 applied')
    await user.click(getActionButton(/place cod order/i))

    await waitFor(() =>
      expect(publicApi.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentMethod: 'cod',
          promoCode: 'WELCOME10',
          userAddressId: 102,
        }),
      ),
    )
  })

  it('opens profile orders from the success state CTA after placing a COD order', async () => {
    const user = userEvent.setup()
    publicApi.createOrder.mockResolvedValue({
      data: baseOrderPayload(),
    })

    renderOrderPage()
    await user.click(getActionButton(/place cod order/i))

    expect(await screen.findByText('Order confirmed.')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: /open my orders/i }))

    expect(mockNavigate).toHaveBeenCalledWith('/profile?tab=orders')
    expect(mockCart.clearCart).toHaveBeenCalled()
    expect(mockAccount.refreshProfile).toHaveBeenCalled()
  })

  it('shows the payment walkthrough when switching to online payment', async () => {
    const user = userEvent.setup()
    renderOrderPage()

    await user.click(screen.getByRole('button', { name: /razorpay secure payment/i }))

    expect(screen.getByText('How payment works')).toBeTruthy()
    expect(screen.getByText(/Razorpay opens for payment authorization/i)).toBeTruthy()
  })

  it('starts the online payment flow and verifies Razorpay payment', async () => {
    const user = userEvent.setup()
    installRazorpayMock({
      onOpen: (options) =>
        options.handler({
          razorpay_order_id: 'order_test_1',
          razorpay_payment_id: 'pay_test_1',
          razorpay_signature: 'signature_test_1',
        }),
    })
    publicApi.createOrder.mockResolvedValue({
      data: {
        ...baseOrderPayload(),
        order: {
          ...baseOrderPayload().order,
          paymentMethod: 'online',
        },
        razorpay: {
          keyId: 'rzp_test_123',
          orderId: 'order_test_1',
          amountPaise: 25200,
          currency: 'INR',
        },
      },
    })
    publicApi.verifyRazorpayPayment.mockResolvedValue({
      data: {
        ...baseOrderPayload().order,
        paymentMethod: 'online',
        paymentStatus: 'paid',
      },
    })

    renderOrderPage()
    await user.click(screen.getByRole('button', { name: /razorpay secure payment/i }))
    await user.click(getActionButton(/pay with razorpay/i))

    expect(await screen.findByText('Order confirmed.')).toBeTruthy()
    expect(publicApi.verifyRazorpayPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: 501,
        razorpayOrderId: 'order_test_1',
      }),
    )
  })

  it('retries a failed online order by creating a fresh Razorpay order without recreating the order', async () => {
    const user = userEvent.setup()
    installRazorpayMock({
      onOpen: (options) =>
        options.handler({
          razorpay_order_id: options.order_id,
          razorpay_payment_id: 'pay_test_retry',
          razorpay_signature: 'signature_test_retry',
        }),
    })
    publicApi.createOrder.mockResolvedValueOnce({
      data: {
        ...baseOrderPayload(),
        order: {
          ...baseOrderPayload().order,
          paymentMethod: 'online',
        },
        razorpay: {
          keyId: 'rzp_test_123',
          orderId: 'order_pending_1',
          amountPaise: 25200,
          currency: 'INR',
        },
      },
    })
    publicApi.verifyRazorpayPayment.mockRejectedValueOnce(new Error('Payment verification failed'))
    publicApi.createRazorpayOrder.mockResolvedValueOnce({
      data: {
        order: {
          ...baseOrderPayload().order,
          paymentMethod: 'online',
        },
        razorpay: {
          keyId: 'rzp_test_123',
          orderId: 'order_retry_2',
          amountPaise: 25200,
          currency: 'INR',
        },
      },
    })
    publicApi.verifyRazorpayPayment.mockResolvedValueOnce({
      data: {
        ...baseOrderPayload().order,
        paymentMethod: 'online',
        paymentStatus: 'paid',
      },
    })

    renderOrderPage()
    await user.click(screen.getByRole('button', { name: /razorpay secure payment/i }))
    await user.click(getActionButton(/pay with razorpay/i))

    expect(await screen.findByText('Payment verification failed')).toBeTruthy()
    expect(screen.getByText(/Pending online order/i)).toBeTruthy()

    await user.click(getActionButton(/retry razorpay payment/i))

    await waitFor(() => expect(publicApi.createOrder).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(publicApi.createRazorpayOrder).toHaveBeenCalledWith({ orderId: 501 }))
    expect(await screen.findByText('Order confirmed.')).toBeTruthy()
  })
})
