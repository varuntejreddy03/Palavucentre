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

async function advanceToPickupStep(user) {
  await user.type(screen.getByLabelText(/phone/i), '9876543210')
  await user.click(getActionButton(/next: pickup/i))
}

async function advanceToPaymentStep(user, storeName = /kukatpally/i) {
  await advanceToPickupStep(user)
  await user.click(screen.getByRole('button', { name: storeName }))
  await user.click(getActionButton(/next: payment/i))
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
      orderNumber: 'ORD-501',
      orderStatus: 'pending',
      paymentMethod: 'cod',
      pricing: {
        subTotal: 240,
        taxAmount: 12,
        deliveryFee: 0,
        grandTotal: 252,
      },
      items: [
        {
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
    expect(screen.getByText('Browse Menu')).toBeTruthy()
  })

  it('renders pickup checkout without address controls', async () => {
    const user = userEvent.setup()
    renderOrderPage()

    expect(screen.getByText(/signed in as/i)).toBeTruthy()
    expect(screen.getByText('Pickup')).toBeTruthy()

    await advanceToPickupStep(user)

    expect(screen.getByText('Pickup Store')).toBeTruthy()
    expect(screen.getByRole('button', { name: /kukatpally/i })).toBeTruthy()
    expect(screen.queryByText(/delivery address/i)).toBeNull()
    expect(screen.queryByRole('button', { name: /use a one-time address/i })).toBeNull()
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
    await advanceToPaymentStep(user)
    await user.type(screen.getByPlaceholderText('Enter code'), 'welcome10')
    await user.click(screen.getByRole('button', { name: 'Apply' }))

    expect(await screen.findByText('WELCOME10 applied')).toBeTruthy()
  })

  it('submits a pickup store and promo code in the COD payload', async () => {
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

    await advanceToPaymentStep(user, /bachupally/i)
    await user.type(screen.getByPlaceholderText('Enter code'), 'WELCOME10')
    await user.click(screen.getByRole('button', { name: 'Apply' }))
    await screen.findByText('WELCOME10 applied')
    await user.click(getActionButton(/place pickup order/i))

    await waitFor(() => expect(publicApi.createOrder).toHaveBeenCalled())
    const payload = publicApi.createOrder.mock.calls[0][0]
    expect(payload).toEqual(expect.objectContaining({
      paymentMethod: 'cod',
      promoCode: 'WELCOME10',
      storeLocation: 'bachupally',
    }))
    expect(payload.userAddressId).toBeUndefined()
    expect(payload.customer.address).toBeUndefined()
  })

  it('normalizes formatted phone values before creating an order', async () => {
    const user = userEvent.setup()
    publicApi.createOrder.mockResolvedValue({
      data: baseOrderPayload(),
    })

    renderOrderPage()
    await user.click(screen.getByLabelText(/phone/i))
    await user.paste('+91 98765 43210')
    await user.click(getActionButton(/next: pickup/i))
    await user.click(screen.getByRole('button', { name: /kukatpally/i }))
    await user.click(getActionButton(/next: payment/i))
    await user.click(getActionButton(/place pickup order/i))

    await waitFor(() => expect(publicApi.createOrder).toHaveBeenCalled())
    expect(publicApi.createOrder.mock.calls[0][0].customer.phone).toBe('9876543210')
  })

  it('opens account orders from the success state CTA after placing a COD order', async () => {
    const user = userEvent.setup()
    publicApi.createOrder.mockResolvedValue({
      data: baseOrderPayload(),
    })

    renderOrderPage()
    await advanceToPaymentStep(user)
    await user.click(getActionButton(/place pickup order/i))

    expect(await screen.findByText('Order Confirmed')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: /my orders/i }))

    expect(mockNavigate).toHaveBeenCalledWith('/profile?tab=orders', { state: { justOrdered: true } })
    expect(mockCart.clearCart).toHaveBeenCalled()
    expect(mockAccount.refreshProfile).toHaveBeenCalled()
  })

  it('shows the payment walkthrough when switching to online payment', async () => {
    const user = userEvent.setup()
    renderOrderPage()

    await advanceToPaymentStep(user)
    await user.click(screen.getByRole('button', { name: /razorpay secure payment/i }))

    expect(screen.getByText(/how payment works/i)).toBeTruthy()
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
    await advanceToPaymentStep(user)
    await user.click(screen.getByRole('button', { name: /razorpay secure payment/i }))
    await user.click(getActionButton(/pay with razorpay/i))

    expect(await screen.findByText('Order Confirmed')).toBeTruthy()
    expect(publicApi.verifyRazorpayPayment).toHaveBeenCalledWith(
      expect.objectContaining({
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
        keyId: 'rzp_test_123',
        orderId: 'order_retry_2',
        razorpayOrderId: 'order_retry_2',
        amountPaise: 25200,
        currency: 'INR',
        orderNumber: 'ORD-501',
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
    await advanceToPaymentStep(user)
    await user.click(screen.getByRole('button', { name: /razorpay secure payment/i }))
    await user.click(getActionButton(/pay with razorpay/i))

    expect(await screen.findByText('Payment verification failed')).toBeTruthy()
    expect(screen.getByText(/Pending order/i)).toBeTruthy()

    await user.click(getActionButton(/retry razorpay payment/i))

    await waitFor(() => expect(publicApi.createOrder).toHaveBeenCalledTimes(1))
    await waitFor(() =>
      expect(publicApi.createRazorpayOrder).toHaveBeenCalledWith({
        orderNumber: 'ORD-501',
      }),
    )
    expect(await screen.findByText('Order Confirmed')).toBeTruthy()
  })

  it('keeps a pending online order when Razorpay order creation is temporarily unavailable', async () => {
    const user = userEvent.setup()
    publicApi.createOrder.mockResolvedValueOnce({
      data: {
        ...baseOrderPayload(),
        order: {
          ...baseOrderPayload().order,
          paymentMethod: 'online',
        },
        paymentError: {
          message: 'Could not start Razorpay payment. Please retry or choose cash at pickup.',
          retryable: true,
        },
      },
    })

    renderOrderPage()
    await advanceToPaymentStep(user)
    await user.click(screen.getByRole('button', { name: /razorpay secure payment/i }))
    await user.click(getActionButton(/pay with razorpay/i))

    expect(await screen.findByText(/Could not start Razorpay payment/i)).toBeTruthy()
    expect(screen.getByText(/Pending order/i)).toBeTruthy()
    expect(getActionButton(/retry razorpay payment/i)).toBeTruthy()
    expect(mockCart.clearCart).not.toHaveBeenCalled()
    expect(publicApi.verifyRazorpayPayment).not.toHaveBeenCalled()
  })
})
