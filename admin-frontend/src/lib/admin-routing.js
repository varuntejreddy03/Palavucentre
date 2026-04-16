function isTruthy(value) {
  return ['1', 'true', 'yes', 'on'].includes(String(value ?? '').trim().toLowerCase())
}

function normalizeBasePath(value) {
  const trimmed = String(value ?? '').trim()

  if (!trimmed) {
    return '/admin'
  }

  const withoutSlashes = trimmed.replace(/^\/+|\/+$/g, '')
  return withoutSlashes ? `/${withoutSlashes}` : '/admin'
}

function getDefaultPublicSiteUrl() {
  if (typeof window === 'undefined') {
    return '/'
  }

  const { protocol, hostname, port } = window.location

  if (hostname.startsWith('admin.')) {
    return `${protocol}//${hostname.slice('admin.'.length)}${port ? `:${port}` : ''}`
  }

  return '/'
}

function getDefaultAdminSiteUrl() {
  if (typeof window === 'undefined') {
    return ''
  }

  const { protocol, hostname } = window.location

  if (['localhost', '127.0.0.1'].includes(hostname)) {
    return `${protocol}//${hostname}:5174/login`
  }

  if (hostname.startsWith('admin.')) {
    return `${protocol}//${hostname}/login`
  }

  return `${protocol}//admin.${hostname}/login`
}

export const ADMIN_STANDALONE = isTruthy(import.meta.env.VITE_ADMIN_STANDALONE)
export const ADMIN_BASE_PATH = ADMIN_STANDALONE ? '' : normalizeBasePath(import.meta.env.VITE_ADMIN_BASE_PATH)
export const ADMIN_LOGIN_PATH = ADMIN_STANDALONE ? '/login' : `${ADMIN_BASE_PATH}/login`
export const ADMIN_DASHBOARD_PATH = ADMIN_STANDALONE ? '/dashboard' : `${ADMIN_BASE_PATH}/dashboard`
export const ADMIN_INDEX_PATH = ADMIN_STANDALONE ? '/' : ADMIN_BASE_PATH
export const LEGACY_ADMIN_BASE_PATH = '/admin'
export const LEGACY_ADMIN_LOGIN_PATH = '/admin/login'
export const LEGACY_ADMIN_DASHBOARD_PATH = '/admin/dashboard'
export const PUBLIC_SITE_URL = String(import.meta.env.VITE_PUBLIC_SITE_URL || getDefaultPublicSiteUrl()).trim() || '/'
export const ADMIN_SITE_URL = String(import.meta.env.VITE_ADMIN_SITE_URL || getDefaultAdminSiteUrl()).trim()

export function isAdminRoutePath(pathname) {
  if (ADMIN_STANDALONE) {
    return true
  }

  return pathname === ADMIN_BASE_PATH || pathname.startsWith(`${ADMIN_BASE_PATH}/`)
}
