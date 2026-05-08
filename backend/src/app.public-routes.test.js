/** @vitest-environment node */

import request from 'supertest'
import jwt from 'jsonwebtoken'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { StatusCodes } from 'http-status-codes'

const {
  prismaConfig,
  menuService,
  orderService,
  reviewService,
  offerService,
  siteSettingsService,
  paymentService,
} = vi.hoisted(() => {
  process.env.NODE_ENV = 'test'
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/palavu_test'
  process.env.JWT_SECRET = 'test-secret-123456'

  return {
    prismaConfig: {
      prisma: {
        admin: {
          findUnique: vi.fn(),
        },
      },
      shutdownPrisma: vi.fn(),
      withReadDbRetry: vi.fn((operation) => operation()),
    },
    menuService: {
      getPublicMenu: vi.fn(),
      listAdminCategories: vi.fn(),
      createCategory: vi.fn(),
      updateCategory: vi.fn(),
      deleteCategory: vi.fn(),
      listAdminItems: vi.fn(),
      createMenuItem: vi.fn(),
      updateMenuItem: vi.fn(),
      deleteMenuItem: vi.fn(),
    },
    orderService: {
      createOrder: vi.fn(),
      trackOrder: vi.fn(),
      getOrderById: vi.fn(),
      listOrders: vi.fn(),
      updateOrder: vi.fn(),
    },
    reviewService: {
      getPublicReviews: vi.fn(),
      listAdminReviews: vi.fn(),
      createReview: vi.fn(),
      updateReview: vi.fn(),
      deleteReview: vi.fn(),
    },
    offerService: {
      getPublicOffers: vi.fn(),
      listAdminOffers: vi.fn(),
      createOffer: vi.fn(),
      updateOffer: vi.fn(),
      deleteOffer: vi.fn(),
    },
    siteSettingsService: {
      getPublicSiteSettings: vi.fn(),
      getAdminSiteSettings: vi.fn(),
      updateSiteSettings: vi.fn(),
    },
    paymentService: {
      createRazorpayOrderForVerifiedOrder: vi.fn(),
      verifyRazorpayPayment: vi.fn(),
    },
  }
})

vi.mock('./config/prisma.js', () => prismaConfig)
vi.mock('./services/menu.service.js', () => menuService)
vi.mock('./services/order.service.js', () => orderService)
vi.mock('./services/review.service.js', () => reviewService)
vi.mock('./services/offer.service.js', () => offerService)
vi.mock('./services/site-settings.service.js', () => siteSettingsService)
vi.mock('./services/payment.service.js', () => paymentService)

import { createApp } from './app.js'
import { ApiError } from './utils/ApiError.js'

const app = createApp()
const ADMIN_COOKIE_NAME = 'palavu_admin_token'

async function postWithCsrf(path, body) {
  const agent = request.agent(app)
  const csrfResponse = await agent.get('/api/csrf-token')

  return agent.post(path).set('X-CSRF-Token', csrfResponse.body.data.csrfToken).send(body)
}

function buildAdminCookie(payload) {
  return `${ADMIN_COOKIE_NAME}=${jwt.sign(payload, process.env.JWT_SECRET)}`
}

function expectNoPublicOrderSecrets(value) {
  const serialized = JSON.stringify(value)

  expect(serialized).not.toContain('password')
  expect(serialized).not.toContain('passwordHash')
  expect(serialized).not.toContain('gatewayResponse')
  expect(serialized).not.toContain('providerSignature')
  expect(serialized).not.toContain('razorpaySecret')
  expect(serialized).not.toContain('stack')
}

beforeEach(() => {
  prismaConfig.prisma.admin.findUnique.mockReset()
  menuService.getPublicMenu.mockReset().mockResolvedValue({
    categories: [{ slug: 'starters', name: 'Starters' }],
    groupedItems: { all: [] },
    items: [],
  })
  orderService.createOrder.mockReset().mockResolvedValue({
    order: {
      orderNumber: 'ORD-5',
      paymentMethod: 'cod',
      paymentStatus: 'unpaid',
      orderStatus: 'pending',
      items: [{ name: 'Biryani', quantity: 1, unitPrice: 250, total: 250 }],
      pricing: { grandTotal: 263, grandTotalPaise: 26300, currency: 'INR' },
      storeLocation: 'kukatpally',
      createdAt: '2026-05-08T00:00:00.000Z',
    },
  })
  orderService.trackOrder.mockReset().mockResolvedValue({
    orderNumber: 'ORD-5',
    paymentMethod: 'online',
    paymentStatus: 'pending',
    orderStatus: 'pending',
    items: [{ name: 'Biryani', quantity: 1, unitPrice: 250, total: 250 }],
    pricing: { grandTotal: 263, grandTotalPaise: 26300, currency: 'INR' },
    pickupLocation: { id: 'kukatpally', name: 'Kukatpally' },
    storeLocation: 'kukatpally',
    createdAt: '2026-05-08T00:00:00.000Z',
  })
  orderService.getOrderById.mockReset()
  orderService.listOrders.mockReset()
  orderService.updateOrder.mockReset()
  reviewService.getPublicReviews.mockReset().mockResolvedValue([{ id: 1, name: 'Test Review' }])
  offerService.getPublicOffers.mockReset().mockResolvedValue([{ id: 1, title: 'Offer' }])
  siteSettingsService.getPublicSiteSettings.mockReset().mockResolvedValue({ restaurantName: 'Palavu Centre' })
  paymentService.createRazorpayOrderForVerifiedOrder.mockReset().mockResolvedValue({
    keyId: 'rzp_test_key',
    orderId: 'order_5',
    razorpayOrderId: 'order_5',
    amount: 263,
    amountPaise: 26300,
    currency: 'INR',
    orderNumber: 'ORD-5',
  })
  paymentService.verifyRazorpayPayment.mockReset().mockResolvedValue({
    orderNumber: 'ORD-5',
    paymentStatus: 'paid',
    orderStatus: 'pending',
    items: [{ name: 'Biryani', quantity: 1, unitPrice: 250, total: 250 }],
    pricing: { grandTotal: 263, grandTotalPaise: 26300, currency: 'INR' },
  })
})

describe('public backend routes', () => {
  it('returns ok from the health endpoint', async () => {
    const response = await request(app).get('/api/health')

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
  })

  it('returns the public menu payload', async () => {
    const response = await request(app).get('/api/menu')

    expect(response.status).toBe(200)
    expect(response.body.data.categories[0].name).toBe('Starters')
    expect(menuService.getPublicMenu).toHaveBeenCalled()
  })

  it('returns public reviews', async () => {
    const response = await request(app).get('/api/reviews?visible=true')

    expect(response.status).toBe(200)
    expect(response.body.data.items[0].name).toBe('Test Review')
  })

  it('returns public offers', async () => {
    const response = await request(app).get('/api/offers')

    expect(response.status).toBe(200)
    expect(response.body.data.items[0].title).toBe('Offer')
  })

  it('returns public site settings', async () => {
    const response = await request(app).get('/api/site-settings/public')

    expect(response.status).toBe(200)
    expect(response.body.data.restaurantName).toBe('Palavu Centre')
  })

  it('rejects invalid account signup payloads', async () => {
    const response = await postWithCsrf('/api/account/signup', {
      name: 'A',
      email: 'not-an-email',
      password: '123',
      confirmPassword: '456',
    })

    expect(response.status).toBe(400)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toBe('Validation failed')
  })

  it('rejects invalid account login payloads', async () => {
    const response = await postWithCsrf('/api/account/login', {
      email: 'bad-email',
      password: '',
    })

    expect(response.status).toBe(400)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toBe('Validation failed')
  })

  it('requires authentication for account profile', async () => {
    const response = await request(app).get('/api/account/profile')

    expect(response.status).toBe(401)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toBe('User authentication is required')
  })

  it('rejects invalid order payloads before service execution', async () => {
    const response = await postWithCsrf('/api/orders', {
      paymentMethod: 'cod',
      customer: {
        name: 'V',
      },
      items: [],
    })

    expect(response.status).toBe(400)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toBe('Validation failed')
  })

  it('rejects invalid order tracking payloads', async () => {
    const response = await postWithCsrf('/api/orders/track', {
      orderNumber: '',
      phone: '12',
    })

    expect(response.status).toBe(400)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toBe('Validation failed')
  })

  it('does not expose orders by public numeric id lookup', async () => {
    const response = await request(app).get('/api/orders/5')

    expect(response.status).toBe(404)
    expect(orderService.getOrderById).not.toHaveBeenCalled()
    expectNoPublicOrderSecrets(response.body)
  })

  it('rejects order tracking with the wrong phone', async () => {
    orderService.trackOrder.mockRejectedValueOnce(
      new ApiError(StatusCodes.NOT_FOUND, 'Order not found for the provided order number and phone'),
    )

    const response = await postWithCsrf('/api/orders/track', {
      orderNumber: 'ORD-5',
      phone: '9876543210',
    })

    expect(response.status).toBe(404)
    expect(response.body.success).toBe(false)
    expectNoPublicOrderSecrets(response.body)
  })

  it('tracks an order with order number and phone using a safe public payload', async () => {
    const response = await postWithCsrf('/api/orders/track', {
      orderNumber: 'ORD-5',
      phone: '9876543210',
    })

    expect(response.status).toBe(200)
    expect(response.body.data.orderNumber).toBe('ORD-5')
    expect(response.body.data.id).toBeUndefined()
    expect(response.body.data.userId).toBeUndefined()
    expect(response.body.data.customer).toBeUndefined()
    expect(response.body.data.payments).toBeUndefined()
    expect(orderService.trackOrder).toHaveBeenCalledWith({
      orderNumber: 'ORD-5',
      phone: '9876543210',
    })
    expectNoPublicOrderSecrets(response.body)
  })

  it('validates create razorpay order input', async () => {
    const response = await postWithCsrf('/api/payments/razorpay/order', {})

    expect(response.status).toBe(400)
    expect(paymentService.createRazorpayOrderForVerifiedOrder).not.toHaveBeenCalled()
    expectNoPublicOrderSecrets(response.body)
  })

  it('rejects guessed numeric order id payment creation', async () => {
    const response = await postWithCsrf('/api/payments/razorpay/order', { orderId: 5 })

    expect(response.status).toBe(400)
    expect(paymentService.createRazorpayOrderForVerifiedOrder).not.toHaveBeenCalled()
  })

  it('creates a razorpay order only with verified order number and phone', async () => {
    const response = await postWithCsrf('/api/payments/razorpay/order', {
      orderNumber: 'ORD-5',
      phone: '9876543210',
    })

    expect(response.status).toBe(200)
    expect(response.body.data.razorpayOrderId).toBe('order_5')
    expect(response.body.data.orderNumber).toBe('ORD-5')
    expect(response.body.data.order).toBeUndefined()
    expect(response.body.data.customer).toBeUndefined()
    expect(paymentService.createRazorpayOrderForVerifiedOrder).toHaveBeenCalledWith({
      orderNumber: 'ORD-5',
      phone: '9876543210',
    })
    expectNoPublicOrderSecrets(response.body)
  })

  it('validates razorpay payment verification input', async () => {
    const response = await postWithCsrf('/api/payments/razorpay/verify', {
      orderId: 5,
    })

    expect(response.status).toBe(400)
    expect(paymentService.verifyRazorpayPayment).not.toHaveBeenCalled()
  })

  it('verifies a razorpay payment with valid input', async () => {
    const response = await postWithCsrf('/api/payments/razorpay/verify', {
      razorpayOrderId: 'order_5',
      razorpayPaymentId: 'pay_5',
      razorpaySignature: 'signature_12345',
      payload: { ok: true },
    })

    expect(response.status).toBe(200)
    expect(response.body.data.paymentStatus).toBe('paid')
    expect(response.body.data.id).toBeUndefined()
    expect(response.body.data.customer).toBeUndefined()
    expect(paymentService.verifyRazorpayPayment).toHaveBeenCalledWith({
      razorpayOrderId: 'order_5',
      razorpayPaymentId: 'pay_5',
      razorpaySignature: 'signature_12345',
      payload: { ok: true },
    })
    expectNoPublicOrderSecrets(response.body)
  })

  it('rejects a user token on admin routes', async () => {
    const response = await request(app)
      .get('/api/admin/me')
      .set('Cookie', buildAdminCookie({ sub: '7', email: 'user@example.com', role: 'user' }))

    expect(response.status).toBe(401)
    expect(prismaConfig.prisma.admin.findUnique).not.toHaveBeenCalled()
  })

  it('rejects admin route tokens with a missing role', async () => {
    const response = await request(app)
      .get('/api/admin/me')
      .set('Cookie', buildAdminCookie({ sub: '1', email: 'admin@example.com' }))

    expect(response.status).toBe(401)
    expect(prismaConfig.prisma.admin.findUnique).not.toHaveBeenCalled()
  })

  it('allows an active admin token on admin routes', async () => {
    const createdAt = new Date('2026-05-08T00:00:00.000Z')
    prismaConfig.prisma.admin.findUnique
      .mockResolvedValueOnce({ id: 1, email: 'admin@example.com', name: 'Admin', isActive: true })
      .mockResolvedValueOnce({ id: 1, email: 'admin@example.com', name: 'Admin', lastLoginAt: null, createdAt })

    const response = await request(app)
      .get('/api/admin/me')
      .set('Cookie', buildAdminCookie({ sub: '1', email: 'admin@example.com', role: 'admin' }))

    expect(response.status).toBe(200)
    expect(response.body.data.admin.email).toBe('admin@example.com')
  })

  it('returns not found for unknown api routes', async () => {
    const response = await request(app).get('/api/does-not-exist')

    expect(response.status).toBe(404)
    expect(response.body.success).toBe(false)
  })
})
