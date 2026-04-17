import {
  fallbackGalleryItems,
  fallbackMenuData,
  fallbackOffers,
  fallbackReviews,
  fallbackSiteSettings,
} from './public-fallbacks'
import { getAssetBaseUrl, normalizeApiData } from './media'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const ASSET_BASE_URL = getAssetBaseUrl(API_BASE_URL)
const publicResponseCache = new Map()
const USER_TOKEN_STORAGE_KEY = 'palavu_user_token'

function getStoredUserToken() {
  if (typeof window === 'undefined') {
    return ''
  }

  return window.localStorage.getItem(USER_TOKEN_STORAGE_KEY) || ''
}

export function setUserAuthToken(token) {
  if (typeof window === 'undefined') {
    return
  }

  const normalizedToken = String(token || '').trim()

  if (!normalizedToken) {
    window.localStorage.removeItem(USER_TOKEN_STORAGE_KEY)
    return
  }

  window.localStorage.setItem(USER_TOKEN_STORAGE_KEY, normalizedToken)
}

export function clearUserAuthToken() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(USER_TOKEN_STORAGE_KEY)
}

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const payload = isJson ? await response.json() : await response.text()

  if (!response.ok) {
    const message =
      (typeof payload === 'object' && payload?.message) ||
      (typeof payload === 'string' && payload) ||
      'Request failed'

    const error = new Error(message)
    error.status = response.status
    error.payload = payload
    throw error
  }

  return payload
}

export async function apiRequest(path, options = {}) {
  const { body, headers, credentials = 'include', ...restOptions } = options
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData
  const userToken = getStoredUserToken()
  const requestHeaders = {
    ...(!isFormData && body ? { 'Content-Type': 'application/json' } : {}),
    ...(userToken ? { Authorization: `Bearer ${userToken}` } : {}),
    ...headers,
  }

  let response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      credentials,
      headers: requestHeaders,
      ...(body ? { body: isFormData ? body : JSON.stringify(body) } : {}),
      ...restOptions,
    })
  } catch (requestError) {
    const error = new Error('Could not reach the backend server')
    error.status = 0
    error.cause = requestError
    throw error
  }

  let payload

  try {
    payload = await parseResponse(response)
  } catch (requestError) {
    if (requestError?.status === 401 && path.startsWith('/account')) {
      clearUserAuthToken()
    }

    throw requestError
  }

  if (!payload || typeof payload !== 'object' || !payload.data) {
    return payload
  }

  return {
    ...payload,
    data: normalizeApiData(path, payload.data, { assetBaseUrl: ASSET_BASE_URL }),
  }
}

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

async function withPublicFallback(request, fallbackData, label) {
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
      },
    }
  }
}

export const publicApi = {
  getMenu: () =>
    withPublicFallback(() => withPublicCache('public:menu', () => apiRequest('/menu'), 30_000), fallbackMenuData, 'menu'),
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
      { items: fallbackOffers },
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

export const adminApi = {
  login: (body) => apiRequest('/admin/login', { method: 'POST', body }),
  logout: () => apiRequest('/admin/logout', { method: 'POST' }),
  me: () => apiRequest('/admin/me'),
  getDashboard: () => apiRequest('/admin/dashboard'),

  getMenuCategories: () => apiRequest('/admin/menu/categories'),
  createMenuCategory: (body) => apiRequest('/admin/menu/categories', { method: 'POST', body }),
  updateMenuCategory: (id, body) => apiRequest(`/admin/menu/categories/${id}`, { method: 'PATCH', body }),
  deleteMenuCategory: (id) => apiRequest(`/admin/menu/categories/${id}`, { method: 'DELETE' }),

  getMenuItems: () => apiRequest('/admin/menu/items?limit=100'),
  createMenuItem: (body) => apiRequest('/admin/menu/items', { method: 'POST', body }),
  updateMenuItem: (id, body) => apiRequest(`/admin/menu/items/${id}`, { method: 'PATCH', body }),
  deleteMenuItem: (id) => apiRequest(`/admin/menu/items/${id}`, { method: 'DELETE' }),

  getGallery: () => apiRequest('/admin/gallery?limit=100'),
  createGalleryItem: (body) => apiRequest('/admin/gallery', { method: 'POST', body }),
  updateGalleryItem: (id, body) => apiRequest(`/admin/gallery/${id}`, { method: 'PATCH', body }),
  deleteGalleryItem: (id) => apiRequest(`/admin/gallery/${id}`, { method: 'DELETE' }),

  getReviews: () => apiRequest('/admin/reviews?limit=100'),
  createReview: (body) => apiRequest('/admin/reviews', { method: 'POST', body }),
  updateReview: (id, body) => apiRequest(`/admin/reviews/${id}`, { method: 'PATCH', body }),
  deleteReview: (id) => apiRequest(`/admin/reviews/${id}`, { method: 'DELETE' }),

  getOffers: () => apiRequest('/admin/offers?limit=100'),
  createOffer: (body) => apiRequest('/admin/offers', { method: 'POST', body }),
  updateOffer: (id, body) => apiRequest(`/admin/offers/${id}`, { method: 'PATCH', body }),
  deleteOffer: (id) => apiRequest(`/admin/offers/${id}`, { method: 'DELETE' }),

  getPromoCodes: () => apiRequest('/admin/promocodes?limit=100'),
  createPromoCode: (body) => apiRequest('/admin/promocodes', { method: 'POST', body }),
  updatePromoCode: (id, body) => apiRequest(`/admin/promocodes/${id}`, { method: 'PATCH', body }),
  deletePromoCode: (id) => apiRequest(`/admin/promocodes/${id}`, { method: 'DELETE' }),

  getOrders: () => apiRequest('/admin/orders?limit=100'),
  updateOrder: (id, body) => apiRequest(`/admin/orders/${id}`, { method: 'PATCH', body }),

  getInquiries: () => apiRequest('/admin/inquiries'),
  updateInquiry: (type, id, body) => apiRequest(`/admin/inquiries/${type}/${id}`, { method: 'PATCH', body }),

  getSettings: () => apiRequest('/admin/settings'),
  updateSettings: (body) => apiRequest('/admin/settings', { method: 'PATCH', body }),
  uploadImage: ({ file, folder = 'general' }) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)
    return apiRequest('/admin/media/upload', { method: 'POST', body: formData })
  },
}

export { API_BASE_URL }
