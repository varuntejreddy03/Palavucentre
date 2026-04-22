import {
  fallbackGalleryItems,
  fallbackMenuData,
  fallbackReviews,
  fallbackSiteSettings,
} from './public-fallbacks'
import { API_BASE_URL } from './api-config'
import { apiRequest } from '../../../shared/api/request'
const publicResponseCache = new Map()

function shouldUsePublicFallback(error) {
  return !error?.status || error.status >= 500
}

function getCachedPublicResponse(cacheKey) {
  const entry = publicResponseCache.get(cacheKey)

  if (!entry) {
    return null
  }

  if (entry.expiresAt > Date.now() && entry.value) {
    return entry.value
  }

  if (entry.promise) {
    return entry.promise
  }

  publicResponseCache.delete(cacheKey)
  return null
}

function setCachedPublicResponse(cacheKey, value, ttlMs) {
  publicResponseCache.set(cacheKey, {
    value,
    expiresAt: Date.now() + ttlMs,
  })

  return value
}

async function withPublicCache(cacheKey, request, ttlMs = 30_000) {
  const cachedResponse = getCachedPublicResponse(cacheKey)

  if (cachedResponse) {
    return cachedResponse
  }

  const pendingPromise = Promise.resolve(request())
    .then((response) => setCachedPublicResponse(cacheKey, response, ttlMs))
    .catch((error) => {
      publicResponseCache.delete(cacheKey)
      throw error
    })

  publicResponseCache.set(cacheKey, {
    promise: pendingPromise,
    expiresAt: 0,
  })

  return pendingPromise
}

async function withPublicFallback(request, fallbackData, label, fallbackMeta = {}) {
  try {
    return await request()
  } catch (requestError) {
    if (!shouldUsePublicFallback(requestError)) {
      throw requestError
    }

    console.warn(`[publicApi] Falling back to local ${label} data because the backend is unavailable.`, requestError)
    return {
      success: true,
      data: fallbackData,
      meta: {
        fallback: true,
        ...fallbackMeta,
      },
    }
  }
}

export const publicApi = {
  getMenu: () =>
    withPublicFallback(
      () => withPublicCache('public:menu', () => apiRequest('/menu'), 30_000),
      fallbackMenuData,
      'menu',
      {
        degraded: true,
        degradedMessage: 'Menu temporarily unavailable',
      },
    ),
  getGallery: () =>
    withPublicFallback(
      () => withPublicCache('public:gallery', () => apiRequest('/gallery'), 30_000),
      { items: fallbackGalleryItems },
      'gallery',
    ),
  getReviews: () =>
    withPublicFallback(
      () => withPublicCache('public:reviews', () => apiRequest('/reviews?visible=true'), 30_000),
      { items: fallbackReviews },
      'reviews',
    ),
  submitReview: (body) => apiRequest('/reviews/submit', { method: 'POST', body }),
  getOffers: () =>
    withPublicFallback(
      () => withPublicCache('public:offers', () => apiRequest('/offers'), 30_000),
      { items: [] },
      'offers',
    ),
  getSiteSettings: () =>
    withPublicFallback(
      () => withPublicCache('public:site-settings', () => apiRequest('/site-settings/public'), 30_000),
      fallbackSiteSettings,
      'site settings',
    ),
  submitContact: (body) => apiRequest('/contact', { method: 'POST', body }),
  submitFranchise: (body) => apiRequest('/franchise', { method: 'POST', body }),
  submitCatering: (body) => apiRequest('/catering', { method: 'POST', body }),
  createOrder: (body) => apiRequest('/orders', { method: 'POST', body }),
  trackOrder: (body) => apiRequest('/orders/track', { method: 'POST', body }),
  createRazorpayOrder: (body) => apiRequest('/payments/razorpay/order', { method: 'POST', body }),
  verifyRazorpayPayment: (body) => apiRequest('/payments/razorpay/verify', { method: 'POST', body }),
}

export const promoApi = {
  apply: (body) => apiRequest('/promocodes/apply', { method: 'POST', body }),
}

export const accountApi = {
  signup: (body) => apiRequest('/account/signup', { method: 'POST', body }),
  login: (body) => apiRequest('/account/login', { method: 'POST', body }),
  googleLogin: (body) => apiRequest('/account/google-login', { method: 'POST', body }),
  logout: () => apiRequest('/account/logout', { method: 'POST' }),
  me: () => apiRequest('/account/me'),
  getProfile: () => apiRequest('/account/profile'),
  getOrders: () => apiRequest('/account/orders'),
  getAddresses: () => apiRequest('/account/addresses'),
  createAddress: (body) => apiRequest('/account/addresses', { method: 'POST', body }),
  updateAddress: (id, body) => apiRequest(`/account/addresses/${id}`, { method: 'PATCH', body }),
  deleteAddress: (id) => apiRequest(`/account/addresses/${id}`, { method: 'DELETE' }),
}

export { API_BASE_URL }
