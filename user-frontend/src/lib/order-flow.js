export const ORDER_ROUTE = { pathname: '/order', search: '' }
export const PROFILE_ROUTE = { pathname: '/profile', search: '' }
export const PROFILE_ORDERS_ROUTE = { pathname: '/profile', search: '?tab=orders' }

const STATUS_STEP_ORDER = ['pending', 'accepted', 'preparing', 'ready', 'delivered']
const STATUS_META = {
  pending: {
    label: 'Order placed',
    subtitle: 'The kitchen has your order.',
  },
  accepted: {
    label: 'Accepted',
    subtitle: 'Your order has entered the queue.',
  },
  preparing: {
    label: 'Preparing',
    subtitle: 'Fresh dishes are on the stove.',
  },
  ready: {
    label: 'Ready for pickup',
    subtitle: 'Packed and waiting at the selected store.',
  },
  delivered: {
    label: 'Completed',
    subtitle: 'Order picked up successfully.',
  },
  cancelled: {
    label: 'Cancelled',
    subtitle: 'This order was cancelled.',
  },
}

export function isVegItem(item) {
  return item?.veg === true || item?.isVeg === true
}

export function buildPathWithSearch(pathname = '/', search = '') {
  const normalizedPath = String(pathname || '/').trim() || '/'
  const normalizedSearch = String(search || '').trim()

  if (!normalizedSearch) {
    return normalizedPath
  }

  return normalizedSearch.startsWith('?')
    ? `${normalizedPath}${normalizedSearch}`
    : `${normalizedPath}?${normalizedSearch}`
}

export function buildAuthRedirectState(target, authSource = '') {
  return {
    from: {
      pathname: target?.pathname || '/',
      search: target?.search || '',
    },
    ...(authSource ? { authSource } : {}),
  }
}

export function getRedirectTarget(locationState, fallbackPath = '/profile') {
  const pathname = locationState?.from?.pathname

  if (!pathname) {
    return fallbackPath
  }

  return buildPathWithSearch(pathname, locationState.from.search)
}

export function navigateToLoginWithRedirect(navigate, target, authSource = '') {
  navigate('/login', {
    state: buildAuthRedirectState(target, authSource),
  })
}

export function getInitials(value, fallback = 'PC') {
  const words = String(value || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (words.length === 0) {
    return fallback
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase()
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase()
}

export function getTrackingStatusMeta(status) {
  return STATUS_META[status] || STATUS_META.pending
}

export function getTrackingSteps(order) {
  if (!order) {
    return []
  }

  const currentIndex = order.orderStatus === 'cancelled' ? -1 : STATUS_STEP_ORDER.indexOf(order.orderStatus)

  return STATUS_STEP_ORDER.map((status, index) => ({
    id: status,
    ...getTrackingStatusMeta(status),
    completed: currentIndex >= index,
    active: order.orderStatus === status,
    pending: currentIndex < index,
    timestamp:
      status === 'pending'
        ? order.createdAt
        : status === 'accepted'
          ? order.acceptedAt
          : status === 'delivered'
            ? order.deliveredAt
            : null,
  }))
}

export function getStatusTone(status) {
  if (status === 'delivered') {
    return 'success'
  }

  if (status === 'cancelled' || status === 'failed') {
    return 'danger'
  }

  return 'progress'
}

export function getPaymentLabel(paymentMethod, paymentStatus) {
  const normalizedMethod = String(paymentMethod || '').toLowerCase()
  const normalizedStatus = String(paymentStatus || '').toLowerCase()

  if (normalizedMethod === 'online') {
    return normalizedStatus === 'paid' ? 'Online · Paid' : 'Online · Pending'
  }

  return normalizedStatus === 'paid' ? 'Cash · Paid' : 'Cash at pickup'
}

export function getOrderEta(order) {
  if (!order || ['delivered', 'cancelled'].includes(order.orderStatus)) {
    return {
      remainingMinutes: order?.orderStatus === 'delivered' ? 0 : null,
      arrivalTime: null,
    }
  }

  const baselineMinutes = {
    pending: 38,
    accepted: 30,
    preparing: 22,
    ready: 10,
  }

  const createdAt = new Date(order.createdAt || Date.now()).getTime()
  const elapsedMinutes = Math.max(0, Math.floor((Date.now() - createdAt) / 60_000))
  const targetMinutes = baselineMinutes[order.orderStatus] ?? 38
  const remainingMinutes = Math.max(6, targetMinutes - elapsedMinutes)

  return {
    remainingMinutes,
    arrivalTime: new Date(Date.now() + remainingMinutes * 60_000),
  }
}
