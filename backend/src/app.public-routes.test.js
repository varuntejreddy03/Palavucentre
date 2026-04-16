/** @vitest-environment node */

import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  menuService,
  reviewService,
  offerService,
  siteSettingsService,
  paymentService,
} = vi.hoisted(() => {
  process.env.NODE_ENV = 'test'
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/palavu_test'
  process.env.JWT_SECRET = 'test-secret-123456'

  return {
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
      createRazorpayOrderForExistingOrder: vi.fn(),
      verifyRazorpayPayment: vi.fn(),
    },
  }
})

vi.mock('./services/menu.service.js', () => menuService)
vi.mock('./services/review.service.js', () => reviewService)
vi.mock('./services/offer.service.js', () => offerService)
vi.mock('./services/site-settings.service.js', () => siteSettingsService)
vi.mock('./services/payment.service.js', () => paymentService)

import { createApp } from './app.js'

const app = createApp()

beforeEach(() => {
  menuService.getPublicMenu.mockReset().mockResolvedValue({
    categories: [{ slug: 'starters', name: 'Starters' }],
    groupedItems: { all: [] },
    items: [],
  })
  reviewService.getPublicReviews.mockReset().mockResolvedValue([{ id: 1, name: 'Test Review' }])
  offerService.getPublicOffers.mockReset().mockResolvedValue([{ id: 1, title: 'Offer' }])
  siteSettingsService.getPublicSiteSettings.mockReset().mockResolvedValue({ restaurantName: 'Palavu Centre' })
  paymentService.createRazorpayOrderForExistingOrder.mockReset().mockResolvedValue({
    order: { id: 5, orderNumber: 'ORD-5' },
    razorpay: { orderId: 'order_5' },
  })
  paymentService.verifyRazorpayPayment.mockReset().mockResolvedValue({
    id: 5,
    orderNumber: 'ORD-5',
    paymentStatus: 'paid',
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
    const response = await request(app).post('/api/account/signup').send({
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
    const response = await request(app).post('/api/account/login').send({
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
    const response = await request(app).post('/api/orders').send({
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
    const response = await request(app).post('/api/orders/track').send({
      orderNumber: '',
      phone: '12',
    })

    expect(response.status).toBe(400)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toBe('Validation failed')
  })

  it('validates create razorpay order input', async () => {
    const response = await request(app).post('/api/payments/razorpay/order').send({})

    expect(response.status).toBe(400)
    expect(paymentService.createRazorpayOrderForExistingOrder).not.toHaveBeenCalled()
  })

  it('creates a razorpay order for a valid request', async () => {
    const response = await request(app).post('/api/payments/razorpay/order').send({ orderId: 5 })

    expect(response.status).toBe(200)
    expect(response.body.data.razorpay.orderId).toBe('order_5')
    expect(paymentService.createRazorpayOrderForExistingOrder).toHaveBeenCalledWith(5)
  })

  it('validates razorpay payment verification input', async () => {
    const response = await request(app).post('/api/payments/razorpay/verify').send({
      orderId: 5,
    })

    expect(response.status).toBe(400)
    expect(paymentService.verifyRazorpayPayment).not.toHaveBeenCalled()
  })

  it('verifies a razorpay payment with valid input', async () => {
    const response = await request(app).post('/api/payments/razorpay/verify').send({
      orderId: 5,
      razorpayOrderId: 'order_5',
      razorpayPaymentId: 'pay_5',
      razorpaySignature: 'signature_12345',
      payload: { ok: true },
    })

    expect(response.status).toBe(200)
    expect(response.body.data.paymentStatus).toBe('paid')
    expect(paymentService.verifyRazorpayPayment).toHaveBeenCalledWith({
      orderId: 5,
      razorpayOrderId: 'order_5',
      razorpayPaymentId: 'pay_5',
      razorpaySignature: 'signature_12345',
      payload: { ok: true },
    })
  })

  it('returns not found for unknown api routes', async () => {
    const response = await request(app).get('/api/does-not-exist')

    expect(response.status).toBe(404)
    expect(response.body.success).toBe(false)
  })
})
