import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Clock3, PackageCheck, Phone, RefreshCw, Search, ShoppingBag, XCircle } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import { useSiteSettings } from '../context/SiteContext'
import { publicApi } from '../lib/api'
import { formatCurrency, formatDateTime, normalizePhoneNumber } from '../lib/formatters'
import { STORE_LOCATIONS } from '../../../shared/store-locations'

const LAST_ORDER_STORAGE_KEY = 'palavu:last-order-tracking'
const orderTimeline = ['pending', 'accepted', 'preparing', 'ready', 'delivered']

function readStoredTrackingOrder() {
  try {
    const raw = window.localStorage.getItem(LAST_ORDER_STORAGE_KEY)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw)
    if (!parsed?.orderNumber || !parsed?.phone) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

function writeStoredTrackingOrder(orderNumber, phone) {
  try {
    window.localStorage.setItem(
      LAST_ORDER_STORAGE_KEY,
      JSON.stringify({
        orderNumber,
        phone,
      }),
    )
  } catch {
    // Best-effort only. Tracking source of truth stays on the backend.
  }
}

function getStoreLocationLabel(locationId) {
  return STORE_LOCATIONS.find((location) => location.id === locationId)?.name || 'Selected store'
}

function getStatusMeta(status) {
  const map = {
    pending: {
      label: 'Pending',
      description: 'Your order was received by the restaurant.',
      icon: Clock3,
    },
    accepted: {
      label: 'Accepted',
      description: 'The kitchen has accepted your order.',
      icon: CheckCircle2,
    },
    preparing: {
      label: 'Preparing',
      description: 'Your dishes are being prepared now.',
      icon: ShoppingBag,
    },
    ready: {
      label: 'Ready',
      description: 'The order is ready for pickup.',
      icon: PackageCheck,
    },
    delivered: {
      label: 'Completed',
      description: 'The order has been picked up.',
      icon: CheckCircle2,
    },
    cancelled: {
      label: 'Cancelled',
      description: 'The order was cancelled by the restaurant.',
      icon: XCircle,
    },
  }

  return map[status] || map.pending
}

function buildTimelineRows(order) {
  if (!order) {
    return []
  }

  const currentIndex = order.orderStatus === 'cancelled' ? -1 : orderTimeline.indexOf(order.orderStatus)

  return orderTimeline.map((status, index) => {
    const meta = getStatusMeta(status)
    const timestampMap = {
      pending: order.createdAt,
      accepted: order.acceptedAt,
      preparing: null,
      ready: null,
      delivered: order.deliveredAt,
    }

    return {
      ...meta,
      status,
      completed: currentIndex >= index,
      active: order.orderStatus === status,
      timestamp: timestampMap[status],
    }
  })
}

export default function TrackOrderPage() {
  const location = useLocation()
  const { siteSettings } = useSiteSettings()
  const storedOrder = useMemo(() => readStoredTrackingOrder(), [])
  const initialStateOrder = location.state?.orderNumber && location.state?.phone
    ? {
        orderNumber: location.state.orderNumber,
        phone: location.state.phone,
      }
    : null

  const [form, setForm] = useState({
    orderNumber: initialStateOrder?.orderNumber || storedOrder?.orderNumber || '',
    phone: initialStateOrder?.phone || storedOrder?.phone || '',
  })
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const contactPhone = siteSettings?.contact?.phone || '9966655997'

  const handleTrackOrder = async ({ silent = false } = {}) => {
    const payload = {
      orderNumber: form.orderNumber.trim(),
      phone: normalizePhoneNumber(form.phone),
    }

    if (!payload.orderNumber || !payload.phone) {
      if (!silent) {
        setError('Enter your order number and phone to track the order')
      }
      return
    }

    try {
      if (silent) {
        setIsRefreshing(true)
      } else {
        setIsSubmitting(true)
      }

      setError('')
      const response = await publicApi.trackOrder(payload)
      setOrder(response.data)
      writeStoredTrackingOrder(payload.orderNumber, payload.phone)
    } catch (requestError) {
      if (!silent) {
        setOrder(null)
      }
      setError(requestError.message || 'Could not find that order')
    } finally {
      setIsSubmitting(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    if (form.orderNumber && form.phone) {
      handleTrackOrder()
    }
    // Intentional one-time bootstrap from local or router state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!order || ['delivered', 'cancelled'].includes(order.orderStatus)) {
      return undefined
    }

    const intervalId = window.setInterval(() => {
      handleTrackOrder({ silent: true })
    }, 30000)

    return () => window.clearInterval(intervalId)
  }, [order, form.orderNumber, form.phone])

  const currentStatusMeta = getStatusMeta(order?.orderStatus)
  const timelineRows = buildTimelineRows(order)

  return (
    <div className="min-h-screen bg-bg-page pt-20 animate-fadeIn">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="/hero-bg.jpg" alt="Track order background" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,1,0,0.95)_0%,rgba(5,1,0,0.82)_42%,rgba(5,1,0,0.93)_100%)]"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-14 md:py-18">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-3 rounded-full border border-gold/20 bg-black/25 px-4 py-2 text-[11px] font-black uppercase tracking-[3px] text-gold">
              <PackageCheck className="h-4 w-4" />
              Guest Order Tracking
            </p>
            <h1 className="mt-6 text-left text-[42px] leading-none md:text-[64px]">Track Your Order</h1>
            <p className="mt-4 max-w-2xl text-[16px] leading-8 text-text-secondary md:text-[18px]">
              Enter the order number and phone used at checkout. Status changes from the admin panel appear here
              automatically.
            </p>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[420px_minmax(0,1fr)]">
            <div className="brand-panel rounded-[32px] p-6 md:p-8">
              <p className="text-[11px] font-black uppercase tracking-[3px] text-gold/70">Lookup</p>
              <h3 className="mt-4 text-[30px] text-gold-bright">Find an Order</h3>

              <form
                onSubmit={(event) => {
                  event.preventDefault()
                  handleTrackOrder()
                }}
                className="mt-8 space-y-4"
              >
                <div>
                  <label className="mb-2 block text-[11px] font-bold uppercase tracking-[2px] text-text-dim">
                    Order Number
                  </label>
                  <input
                    type="text"
                    value={form.orderNumber}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, orderNumber: event.target.value.toUpperCase() }))
                    }
                    placeholder="Example: RPC-123456"
                    className="brand-input"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[11px] font-bold uppercase tracking-[2px] text-text-dim">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, phone: normalizePhoneNumber(event.target.value).slice(0, 12) }))
                    }
                    placeholder="Phone used at checkout"
                    className="brand-input"
                  />
                </div>

                {error && (
                  <div className="rounded-[24px] border border-red-500/30 bg-red-950/30 p-4 text-sm text-red-100">
                    {error}
                  </div>
                )}

                <button type="submit" disabled={isSubmitting} className="brand-primary-btn w-full px-6 py-4 text-[12px]">
                  <Search className="h-4 w-4" />
                  {isSubmitting ? 'Tracking...' : 'Track Order'}
                </button>
              </form>

              <div className="mt-6 rounded-[24px] border border-gold/10 bg-black/20 p-4 text-sm leading-7 text-text-secondary">
                Keep your order number safe after checkout. If you need help, call
                <a href={`tel:${contactPhone}`} className="ml-1 font-semibold text-gold hover:text-gold-bright">
                  {contactPhone}
                </a>
                .
              </div>
            </div>

            <div className="brand-panel rounded-[32px] p-6 md:p-8">
              {!order ? (
                <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                  <div className="rounded-full bg-gold/10 p-5 text-gold">
                    <PackageCheck className="h-10 w-10" />
                  </div>
                  <h3 className="mt-6 text-[32px] text-gold-bright">Order Status Will Show Here</h3>
                  <p className="mt-3 max-w-xl text-sm leading-7 text-text-secondary">
                    Once you search with the right order number and phone, this page will show the current status,
                    order total, items, and pickup updates.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-col gap-4 border-b border-gold/10 pb-6 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[3px] text-gold/70">Current Status</p>
                      <div className="mt-4 flex items-center gap-3">
                        <div className="rounded-full bg-gold/10 p-3 text-gold">
                          <currentStatusMeta.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-[28px] font-semibold text-text-primary" style={{ fontFamily: 'Playfair Display, serif' }}>
                            {currentStatusMeta.label}
                          </p>
                          <p className="mt-1 text-sm text-text-secondary">{currentStatusMeta.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <div className="rounded-[22px] border border-gold/10 bg-black/20 px-4 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-[2px] text-text-dim">Order Number</p>
                        <p className="mt-1 font-black text-gold">{order.orderNumber}</p>
                      </div>
                      <div className="rounded-[22px] border border-gold/10 bg-black/20 px-4 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-[2px] text-text-dim">Payment</p>
                        <p className="mt-1 font-semibold capitalize text-text-primary">{order.paymentStatus}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleTrackOrder({ silent: true })}
                        disabled={isRefreshing}
                        className="brand-secondary-btn px-4 py-3 text-[11px]"
                      >
                        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Refresh
                      </button>
                    </div>
                  </div>

                  {order.orderStatus === 'cancelled' ? (
                    <div className="rounded-[26px] border border-red-500/30 bg-red-950/25 p-5">
                      <p className="font-semibold text-red-100">This order was cancelled.</p>
                      <p className="mt-2 text-sm leading-7 text-red-100/80">
                        If you need clarification, contact the restaurant with your order number.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-5">
                      {timelineRows.map((step) => (
                        <div
                          key={step.status}
                          className={`rounded-[24px] border p-4 ${
                            step.active
                              ? 'border-gold bg-gold/10'
                              : step.completed
                                ? 'border-gold/20 bg-black/20'
                                : 'border-white/6 bg-black/10'
                          }`}
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/25 text-gold">
                            <step.icon className="h-5 w-5" />
                          </div>
                          <p className="mt-4 font-semibold text-text-primary">{step.label}</p>
                          <p className="mt-2 text-xs leading-6 text-text-secondary">{step.description}</p>
                          <p className="mt-3 text-[10px] uppercase tracking-[2px] text-text-dim">
                            {step.timestamp ? formatDateTime(step.timestamp) : step.completed ? 'Updated' : 'Pending'}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                    <div className="rounded-[28px] border border-gold/10 bg-black/20 p-5">
                      <p className="text-[11px] font-black uppercase tracking-[3px] text-gold/70">Items</p>
                      <div className="mt-4 space-y-3">
                        {(order.items || []).map((item, index) => (
                          <div key={`${item.name}-${index}`} className="flex items-center justify-between gap-4 rounded-[20px] border border-gold/10 bg-[#120907] p-4">
                            <div className="min-w-0">
                              <p className="font-semibold text-text-primary">{item.name}</p>
                              <p className="mt-1 text-sm text-text-secondary">
                                {item.quantity} x {formatCurrency(item.unitPrice)}
                              </p>
                            </div>
                            <p className="font-semibold text-gold">{formatCurrency(item.total)}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-[28px] border border-gold/10 bg-black/20 p-5">
                        <p className="text-[11px] font-black uppercase tracking-[3px] text-gold/70">Order Summary</p>
                        <div className="mt-4 space-y-3 text-sm">
                          <div className="flex items-center justify-between text-text-secondary">
                            <span>Placed At</span>
                            <span>{formatDateTime(order.createdAt)}</span>
                          </div>
                          <div className="flex items-center justify-between text-text-secondary">
                            <span>Payment Method</span>
                            <span className="capitalize">{order.paymentMethod}</span>
                          </div>
                          <div className="flex items-center justify-between text-text-secondary">
                            <span>Subtotal</span>
                            <span>{formatCurrency(order.pricing?.subTotal)}</span>
                          </div>
                          <div className="flex items-center justify-between text-text-secondary">
                            <span>Tax</span>
                            <span>{formatCurrency(order.pricing?.taxAmount)}</span>
                          </div>
                          <div className="flex items-center justify-between border-t border-gold/10 pt-3 font-bold text-text-primary">
                            <span>Grand Total</span>
                            <span className="text-gold">{formatCurrency(order.pricing?.grandTotal)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-[28px] border border-gold/10 bg-black/20 p-5">
                        <p className="text-[11px] font-black uppercase tracking-[3px] text-gold/70">Pickup</p>
                        <p className="mt-4 font-semibold text-text-primary">{getStoreLocationLabel(order.storeLocation)}</p>
                        {order.pickupLocation?.address && (
                          <p className="mt-2 text-sm leading-7 text-text-secondary">{order.pickupLocation.address}</p>
                        )}
                        <div className="mt-4 flex flex-wrap gap-3">
                          <a href={`tel:${contactPhone}`} className="brand-primary-btn px-4 py-3 text-[11px]">
                            <Phone className="h-4 w-4" />
                            Call Restaurant
                          </a>
                          <Link to="/menu" className="brand-secondary-btn px-4 py-3 text-[11px]">
                            Order Again
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
