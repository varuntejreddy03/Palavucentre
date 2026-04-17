import { useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Heart,
  History,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Pencil,
  RotateCcw,
  Share2,
  ShoppingCart,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'

import { useAccount } from '../../context/AccountContext'
import { useCart } from '../../context/CartContext'
import { accountApi } from '../../lib/api'
import { formatCurrency, formatDate, formatDateTime, normalizePhoneNumber } from '../../lib/formatters'

const initialAddressForm = {
  label: '',
  recipientName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  landmark: '',
  city: '',
  state: '',
  postalCode: '',
  isDefault: false,
}

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'addresses', label: 'Addresses' },
  { id: 'orders', label: 'Orders' },
]

const orderTrackingFlow = ['pending', 'accepted', 'preparing', 'ready', 'delivered']

function getInitials(value) {
  const words = String(value || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (words.length === 0) {
    return 'PC'
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase()
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase()
}

function toTitleCase(value) {
  const normalized = String(value || '')
    .trim()
    .replace(/\s+/g, ' ')

  if (!normalized) {
    return 'Palavu Guest'
  }

  return normalized.replace(/\b([a-z])([a-z]*)/gi, (_, first, rest) => `${first.toUpperCase()}${rest.toLowerCase()}`)
}

function StatusBadge({ value, kind = 'order' }) {
  const orderMeta = {
    pending: {
      label: 'Placed',
      classes: 'bg-[#E3F2FD] text-[#1565C0]',
    },
    accepted: {
      label: 'Out for Delivery',
      classes: 'bg-[#F3E5F5] text-[#6A1B9A]',
    },
    preparing: {
      label: 'Preparing',
      classes: 'bg-[#FFF3E0] text-[#E65100]',
    },
    ready: {
      label: 'Out for Delivery',
      classes: 'bg-[#F3E5F5] text-[#6A1B9A]',
    },
    delivered: {
      label: 'Delivered',
      classes: 'bg-[#E8F5E9] text-[#2E7D32]',
    },
    cancelled: {
      label: 'Cancelled',
      classes: 'bg-[#FFEBEE] text-[#C62828]',
    },
  }

  const paymentMeta = {
    paid: {
      label: 'Paid',
      classes: 'bg-[#E8F5E9] text-[#2E7D32]',
    },
    pending: {
      label: 'Pending',
      classes: 'bg-[#FFF8E1] text-[#F57F17]',
    },
    unpaid: {
      label: 'Unpaid',
      classes: 'bg-[#FFEBEE] text-[#C62828]',
    },
    failed: {
      label: 'Failed',
      classes: 'bg-[#FFEBEE] text-[#C62828]',
    },
    refunded: {
      label: 'Refunded',
      classes: 'bg-[#FFF8E1] text-[#F57F17]',
    },
  }

  const fallback = {
    label: String(value || kind),
    classes: 'bg-[#F4F5F7] text-[#C9B9A0]',
  }

  const meta = kind === 'order' ? orderMeta[value] || fallback : paymentMeta[value] || fallback

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${meta.classes}`}>
      {meta.label}
    </span>
  )
}

function AnimatedCounter({ value }) {
  const targetValue = Number(value || 0)
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const duration = 650
    const startedAt = performance.now()
    let frameId

    const tick = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1)
      setDisplayValue(Math.round(targetValue * progress))

      if (progress < 1) {
        frameId = requestAnimationFrame(tick)
      }
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [targetValue])

  return displayValue
}

function SummaryCard({ label, value, note, icon, active = false }) {
  const IconComponent = icon

  return (
    <button
      type="button"
      className="w-full rounded-xl border border-gold/15 bg-[#100603] p-3 text-left shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] sm:p-4"
    >
      <div className="flex items-start justify-between">
        <IconComponent className="h-4.5 w-4.5 text-[#FF6B35] sm:h-5 sm:w-5" />
        {active && <span className="h-2.5 w-2.5 rounded-full bg-[#48C479] animate-[pulse_1.5s_ease-in-out_infinite]" />}
      </div>
      <p className="mt-3 text-[20px] font-bold leading-none text-[#F8F1DE] sm:text-[22px]">
        <AnimatedCounter value={value} />
      </p>
      <p className="mt-2 text-[11px] leading-5 text-[#A8977E] sm:text-[12px]">{label}</p>
      <p className="mt-1 text-[10px] leading-5 text-[#A8977E] sm:text-[11px]">{note}</p>
    </button>
  )
}

function BowlIllustration() {
  return <div className="mx-auto text-4xl">🍽️</div>
}

function getTrackingMeta(status) {
  return {
    pending: {
      label: 'Order Placed',
      note: 'Restaurant received your order.',
    },
    accepted: {
      label: 'Accepted',
      note: 'Kitchen accepted and queued your order.',
    },
    preparing: {
      label: 'Preparing',
      note: 'Your items are being prepared now.',
    },
    ready: {
      label: 'Ready',
      note: 'Order is packed and ready for dispatch.',
    },
    delivered: {
      label: 'Delivered',
      note: 'Order was delivered successfully.',
    },
  }[status] || {
    label: 'Order Placed',
    note: 'Restaurant received your order.',
  }
}

function buildTrackingSteps(order) {
  if (!order) {
    return []
  }

  const currentIndex = order.orderStatus === 'cancelled' ? -1 : orderTrackingFlow.indexOf(order.orderStatus)

  return orderTrackingFlow.map((status, index) => {
    const meta = getTrackingMeta(status)
    return {
      id: status,
      ...meta,
      completed: currentIndex >= index,
      active: order.orderStatus === status,
    }
  })
}

function OrderCard({ order, onReorder, showReorder = false, showTrack = false, isTracking = false, onTrackToggle, index = 0 }) {
  const firstItem = order.items?.[0]
  const extraItemCount = Math.max((order.items?.length || 0) - 1, 0)
  const itemSummary = firstItem ? `${firstItem.name}${extraItemCount > 0 ? ` + ${extraItemCount} more` : ''}` : 'Order items'
  const isLiveOrder = !['delivered', 'cancelled'].includes(order.orderStatus)
  const trackingSteps = buildTrackingSteps(order)
  const hasMultipleImages = (order.items?.length || 0) > 1
  const secondItem = order.items?.[1]

  // Detect if this card is rendered in the Overview page (by prop or context)
  // We'll use a prop: isOverview, default false
  // If isOverview, Track button should redirect to /profile?tab=orders
  // Otherwise, keep the original toggle logic
  const isOverview = !!order.isOverview;
  const navigateToOrders = () => {
    window.location.href = '/profile?tab=orders';
  };
  return (
    <article
      className="rounded-2xl border border-gold/15 bg-[#100603] px-4 py-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] sm:px-5 sm:py-5"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-normal uppercase tracking-[0.08em] text-[#A8977E]">Order #{order.orderNumber || order.id}</p>
          <p className="mt-1 text-[11px] font-normal text-[#A8977E]">{formatDateTime(order.createdAt)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge value={order.paymentStatus} kind="payment" />
          <StatusBadge value={order.orderStatus} kind="order" />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative h-14 w-[70px] shrink-0">
            {firstItem?.img ? (
              <img src={firstItem.img} alt={firstItem.name} className="absolute left-0 top-0 h-14 w-14 rounded-xl object-cover" />
            ) : (
              <div className="absolute left-0 top-0 flex h-14 w-14 items-center justify-center rounded-xl bg-[#FFF1EB] text-[#FF6B35]">
                <Sparkles className="h-4 w-4" />
              </div>
            )}

            {hasMultipleImages && (
              <div className="absolute left-4 top-2">
                {secondItem?.img ? (
                  <img src={secondItem.img} alt={secondItem.name || 'Order item'} className="h-14 w-14 rounded-xl border-2 border-white object-cover" />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-white bg-[#FFF1EB] text-[#FF6B35]">
                    <Sparkles className="h-4 w-4" />
                  </div>
                )}
                {extraItemCount > 0 && (
                  <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#282C3F] px-1 text-[10px] font-semibold text-white">
                    +{extraItemCount}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-[#F8F1DE]">{itemSummary}</p>
            <p className="mt-1 text-[13px] text-[#C9B9A0]">
              {order.items?.length || 0} item{(order.items?.length || 0) > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-[11px] uppercase tracking-[0.08em] text-[#A8977E]">Total</p>
          <p className="mt-1 text-[17px] font-bold leading-none text-[#F8F1DE] sm:text-[18px]">{formatCurrency(order.pricing?.grandTotal)}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-gold/15 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="inline-flex items-center gap-1.5 text-[11px] text-[#48C479] sm:text-[12px]">
          <MapPin className="h-3.5 w-3.5" />
          {isLiveOrder ? 'Live tracking available' : 'Order completed'}
        </p>

        <div className="flex w-full items-center gap-2 sm:w-auto sm:justify-end">
          {showTrack && isLiveOrder && (
            isOverview ? (
              <button
                type="button"
                onClick={navigateToOrders}
                className="inline-flex h-9 flex-1 items-center justify-center rounded-full border border-[#FF6B35] px-4 text-[13px] font-medium text-[#FF6B35] transition hover:bg-[#FFF1EB] sm:flex-none"
              >
                Track
              </button>
            ) : (
              <button
                type="button"
                onClick={onTrackToggle}
                className="inline-flex h-9 flex-1 items-center justify-center rounded-full border border-[#FF6B35] px-4 text-[13px] font-medium text-[#FF6B35] transition hover:bg-[#FFF1EB] sm:flex-none"
              >
                {isTracking ? 'Hide' : 'Track'}
              </button>
            )
          )}
          {showReorder && (
            <button
              type="button"
              onClick={() => onReorder(order)}
              className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full border border-[#FF6B35] px-4 text-[13px] font-medium text-[#FF6B35] transition hover:bg-[#FFF1EB] sm:flex-none"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reorder
            </button>
          )}
        </div>
      </div>

      {showTrack && isLiveOrder && isTracking && (
        <div className="mt-4 rounded-xl border border-gold/15 bg-[#1a110b] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C9B9A0]">Tracking</p>
          <div className="mt-3 space-y-2.5">
            {trackingSteps.map((step) => (
              <div key={step.id} className="flex items-start gap-2.5">
                <span
                  className={`mt-1 h-2.5 w-2.5 rounded-full ${
                    step.active ? 'bg-[#FC8019] animate-[pulse_1.5s_ease-in-out_infinite]' : step.completed ? 'bg-[#48C479]' : 'bg-[#DADCE1]'
                  }`}
                />
                <div>
                  <p className="text-[13px] font-medium text-[#F8F1DE]">{step.label}</p>
                  <p className="text-[12px] text-[#C9B9A0]">{step.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  )
}

function AddressField({ name, label, value, onChange, required = false, maxLength, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-[12px] font-medium text-[#C9B9A0]">{label}</span>
      <input
        required={required}
        name={name}
        maxLength={maxLength}
        value={value}
        onChange={onChange}
        className="h-[46px] w-full rounded-xl border border-gold/15 bg-[#100603] px-4 text-[14px] text-[#F8F1DE] outline-none transition focus:border-[#FF6B35]"
      />
    </label>
  )
}

function SnapshotAction({ label, title, subtitle, icon, action, onClick, to }) {
  const IconComponent = icon
  const content = (
    <>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFF1EB] text-[#FF6B35]">
        <IconComponent className="h-4.5 w-4.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#A8977E]">{label}</p>
        <p className="mt-1 text-[15px] font-semibold text-[#F8F1DE]">{title}</p>
        <p className="mt-1 text-[13px] text-[#C9B9A0]">{subtitle}</p>
      </div>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/15 text-[#C9B9A0]">
        {action || <ChevronRight className="h-4 w-4" />}
      </span>
    </>
  )

  const classes = 'group flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left transition hover:bg-[#1a110b]'

  if (to) {
    return (
      <Link to={to} className={classes}>
        {content}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      {content}
    </button>
  )
}

export default function ProfilePage() {
  const { user, profile, isLoading, isProfileLoading, logout, refreshProfile } = useAccount()
  const { addToCart, setCartOpen } = useCart()
  const [searchParams, setSearchParams] = useSearchParams()
  const [addressForm, setAddressForm] = useState(initialAddressForm)
  const [editingAddressId, setEditingAddressId] = useState(null)
  const [addressError, setAddressError] = useState('')
  const [addressNotice, setAddressNotice] = useState('')
  const [dashboardNotice, setDashboardNotice] = useState('')
  const [trackingOrderId, setTrackingOrderId] = useState(null)
  const [isAddressBusy, setIsAddressBusy] = useState(false)
  const [deleteBusyId, setDeleteBusyId] = useState(null)
  const [showAddressForm, setShowAddressForm] = useState(false)

  const addresses = useMemo(() => profile?.addresses || [], [profile?.addresses])
  const orders = useMemo(() => profile?.orders || [], [profile?.orders])
  const activeOrders = useMemo(() => orders.filter((order) => !['delivered', 'cancelled'].includes(order.orderStatus)), [orders])
  const previousOrders = useMemo(() => orders.filter((order) => ['delivered', 'cancelled'].includes(order.orderStatus)), [orders])
  const defaultAddress = addresses.find((address) => address.isDefault) || null
  const activeTab = tabs.some((tab) => tab.id === searchParams.get('tab')) ? searchParams.get('tab') : 'overview'
  const userInitials = getInitials(user?.name || user?.email)
  const displayName = toTitleCase(user?.name || user?.email?.split('@')?.[0])

  useEffect(() => {
    if (!dashboardNotice) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => setDashboardNotice(''), 2800)
    return () => window.clearTimeout(timeoutId)
  }, [dashboardNotice])

  const setActiveTab = (tab) => {
    setSearchParams({ tab })
  }

  const resetAddressForm = () => {
    setEditingAddressId(null)
    setAddressForm(initialAddressForm)
    setShowAddressForm(false)
  }

  const handleAddressChange = (event) => {
    const { name, value, type, checked } = event.target

    setAddressForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : name === 'phone' ? normalizePhoneNumber(value).slice(0, 10) : value,
    }))
  }

  const handleAddressSubmit = async (event) => {
    event.preventDefault()

    try {
      setIsAddressBusy(true)
      setAddressError('')
      setAddressNotice('')

      const payload = {
        label: addressForm.label.trim() || undefined,
        recipientName: addressForm.recipientName.trim(),
        phone: normalizePhoneNumber(addressForm.phone),
        addressLine1: addressForm.addressLine1.trim(),
        addressLine2: addressForm.addressLine2.trim() || undefined,
        landmark: addressForm.landmark.trim() || undefined,
        city: addressForm.city.trim(),
        state: addressForm.state.trim() || undefined,
        postalCode: addressForm.postalCode.trim() || undefined,
        isDefault: addressForm.isDefault,
      }

      if (editingAddressId) {
        await accountApi.updateAddress(editingAddressId, payload)
        setAddressNotice('Address updated')
      } else {
        await accountApi.createAddress(payload)
        setAddressNotice('Address added')
      }

      resetAddressForm()
      await refreshProfile()
    } catch (requestError) {
      setAddressError(requestError.message || 'Could not save address')
    } finally {
      setIsAddressBusy(false)
    }
  }

  const handleEditAddress = (address) => {
    setActiveTab('addresses')
    setShowAddressForm(true)
    setEditingAddressId(address.id)
    setAddressError('')
    setAddressNotice('')
    setAddressForm({
      label: address.label || '',
      recipientName: address.recipientName || '',
      phone: address.phone || '',
      addressLine1: address.addressLine1 || '',
      addressLine2: address.addressLine2 || '',
      landmark: address.landmark || '',
      city: address.city || '',
      state: address.state || '',
      postalCode: address.postalCode || '',
      isDefault: Boolean(address.isDefault),
    })
  }

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Delete this saved address?')) {
      return
    }

    try {
      setDeleteBusyId(addressId)
      setAddressError('')
      setAddressNotice('')
      await accountApi.deleteAddress(addressId)
      if (editingAddressId === addressId) {
        resetAddressForm()
      }
      setAddressNotice('Address deleted')
      await refreshProfile()
    } catch (requestError) {
      setAddressError(requestError.message || 'Could not delete address')
    } finally {
      setDeleteBusyId(null)
    }
  }

  const handleSetDefaultAddress = async (addressId) => {
    try {
      setDeleteBusyId(addressId)
      setAddressError('')
      setAddressNotice('')
      await accountApi.updateAddress(addressId, { isDefault: true })
      setAddressNotice('Default address updated')
      await refreshProfile()
    } catch (requestError) {
      setAddressError(requestError.message || 'Could not update default address')
    } finally {
      setDeleteBusyId(null)
    }
  }

  const handleReorder = (order) => {
    ;(order.items || []).forEach((item) => {
      addToCart(
        {
          id: item.menuItemId || `${order.id}-${item.id}`,
          name: item.name,
          price: item.unitPrice,
          img: item.img,
          veg: item.veg,
        },
        item.quantity,
      )
    })

    setDashboardNotice(`${order.orderNumber} added to cart`)
    setCartOpen(true)
  }

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#20150b_0%,#0b0502_55%,#050201_100%)] text-[#d1d5db]">Loading...</div>
  }

  return (
    // REDESIGNED: Page Shell
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,#20150b_0%,#0b0502_55%,#050201_100%)] px-3 pb-10 pt-20 sm:px-4 sm:pt-24">
      <div className="mx-auto w-full max-w-[1100px]">
        {dashboardNotice && (
          <div className="mb-4 rounded-2xl border border-[#BCE9CC] bg-[#E8F8EF] px-5 py-3 text-sm text-[#2E7D32]">
            {dashboardNotice}
          </div>
        )}

        {/* REDESIGNED: Two-column layout */}
        <div className="grid gap-5 md:grid-cols-[280px_minmax(0,1fr)] lg:gap-6">
          {/* REDESIGNED: Left profile panel */}
          <aside className="rounded-2xl border border-gold/15 bg-[#100603] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)] sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start md:block">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#FF6B35] text-lg font-bold text-white sm:h-[72px] sm:w-[72px] sm:text-xl">
                {userInitials}
              </div>

              <div className="min-w-0 flex-1 md:mt-4">
                <h1 className="truncate text-[24px] font-bold leading-tight text-[#F8F1DE] sm:text-[28px]">{displayName}</h1>
                <div className="mt-2 space-y-1">
                  <p className="inline-flex items-center gap-2 text-[12px] text-[#A8977E]">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate">{user?.email}</span>
                  </p>
                  <p className="inline-flex items-center gap-2 text-[12px] text-[#A8977E]">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Joined {formatDate(user?.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            <hr className="my-4 border-gold/15" />

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 md:grid-cols-1">
              <Link
                to="/menu"
                className="inline-flex h-10 items-center justify-center rounded-full bg-[#FF6B35] px-3 text-[13px] font-medium text-white transition hover:bg-[#FC8019]"
              >
                Browse Menu
              </Link>
              <button
                type="button"
                onClick={() => setSearchParams({ tab: 'orders' })}
                className="inline-flex h-10 items-center justify-center rounded-full border border-[#FF6B35] px-3 text-[13px] font-medium text-[#FF6B35] transition hover:bg-[#FFF1EB]"
              >
                My Orders
              </button>
              <button
                type="button"
                onClick={logout}
                className="inline-flex h-10 items-center justify-center rounded-full px-3 text-[13px] font-medium text-[#A8977E] transition hover:bg-[#1a110b]"
              >
                Logout
              </button>
            </div>

            <hr className="my-4 border-gold/15" />

            {/* REDESIGNED: Stats grid */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <SummaryCard
                label="Saved Addresses"
                value={addresses.length}
                note={defaultAddress ? `Default: ${defaultAddress.label || 'Saved Address'}` : 'Add address'}
                icon={MapPin}
              />
              <SummaryCard
                label="Active Orders"
                value={activeOrders.length}
                note="Track current orders"
                icon={Clock3}
                active={activeOrders.length > 0}
              />
              <SummaryCard
                label="Past Orders"
                value={previousOrders.length}
                note="Reorder anytime"
                icon={History}
              />
              <SummaryCard
                label="Favourite Items"
                value={profile?.favourites?.length || 0}
                note="Quick access"
                icon={Heart}
              />
            </div>
          </aside>

          <div className="space-y-6">
            {/* REDESIGNED: Tab bar underline style */}
            <div className="rounded-2xl border border-gold/15 bg-[#100603] px-3 shadow-[0_2px_8px_rgba(0,0,0,0.08)] sm:px-4">
              <div className="scrollbar-hide flex overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative mr-5 whitespace-nowrap border-b-[3px] py-3 text-[13px] transition-all duration-200 sm:mr-6 sm:text-[14px] ${
                      activeTab === tab.id
                        ? 'border-[#FF6B35] font-semibold text-[#FF6B35]'
                        : 'border-transparent font-medium text-[#A8977E] hover:text-[#C9B9A0]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              {isProfileLoading && <p className="pb-3 text-sm text-[#A8977E]">Refreshing profile...</p>}
            </div>

            <div key={activeTab}>
              {activeTab === 'overview' && (
                // REDESIGNED: Overview cards
                <section className={`grid gap-6 ${activeOrders.length > 0 ? 'xl:grid-cols-2' : 'grid-cols-1'}`}>
                  <div className="rounded-2xl border border-gold/15 bg-[#100603] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)] sm:p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3px] text-[#C9B9A0]">Snapshot</p>
                    <h2 className="mt-2 text-[18px] font-semibold text-[#F8F1DE] sm:text-[20px]">Account Snapshot</h2>

                    <div className="mt-3 divide-y divide-[#E9E9EB]">
                      <SnapshotAction
                        label="Save address"
                        title="Save your first address"
                        subtitle="Keep delivery locations ready for one-tap checkout."
                        icon={MapPin}
                        onClick={() => setActiveTab('addresses')}
                      />
                      <SnapshotAction
                        label="Start a new order"
                        title={activeOrders.length > 0 ? 'View active orders' : 'Browse the menu'}
                        subtitle={
                          activeOrders.length > 0
                            ? `${activeOrders.length} active order${activeOrders.length > 1 ? 's' : ''}.`
                            : 'Explore Palavu signatures and Godavari favourites.'
                        }
                        icon={ShoppingCart}
                        to={activeOrders.length > 0 ? '/profile?tab=orders' : '/menu'}
                      />
                      <SnapshotAction
                        label="Invite a friend"
                        title="Share Palavu love"
                        subtitle="Send your friends a link to discover PalavuCentre."
                        icon={Share2}
                        action={<Share2 className="h-4 w-4" />}
                        onClick={() => setDashboardNotice('Invite link copied')}
                      />
                    </div>
                  </div>

                  {activeOrders.length > 0 ? (
                    <div className="rounded-2xl border border-gold/15 bg-[#100603] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)] sm:p-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.3px] text-[#C9B9A0]">Live Orders</p>
                      <h2 className="mt-2 text-[18px] font-semibold text-[#F8F1DE] sm:text-[20px]">Order Status</h2>
                      <div className="mt-4 space-y-4">
                        {activeOrders.slice(0, 2).map((order, index) => (
                          <OrderCard key={order.id} order={{...order, isOverview: true}} showTrack index={index} />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-gold/15 bg-[#100603] p-4 text-[#C9B9A0] shadow-[0_2px_8px_rgba(0,0,0,0.08)] sm:p-5">
                      No active orders right now.
                    </div>
                  )}
                </section>
              )}

              {activeTab === 'addresses' && (
                // REDESIGNED: Addresses tab
                <section className="rounded-2xl border border-gold/15 bg-[#100603] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)] sm:p-5">
                  <div className="space-y-4">
                    <button
                      type="button"
                      onClick={() => setShowAddressForm((current) => !current)}
                      className="inline-flex h-10 items-center justify-center rounded-full border border-[#FF6B35] px-4 text-[13px] font-medium text-[#FF6B35] transition hover:bg-[#FFF1EB]"
                    >
                      {showAddressForm || editingAddressId ? 'Hide Address Form' : '+ Add New Address'}
                    </button>

                    <div
                      className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
                        showAddressForm || editingAddressId ? 'max-h-[1400px] opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <form onSubmit={handleAddressSubmit} className="rounded-2xl border border-gold/15 bg-[#1a110b] p-4 sm:p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.3px] text-[#C9B9A0]">Address Book</p>
                            <p className="mt-2 text-[17px] font-semibold leading-none text-[#F8F1DE] sm:text-[18px]">
                              {editingAddressId ? 'Edit Address' : 'Add Address'}
                            </p>
                          </div>
                          {editingAddressId && (
                            <button
                              type="button"
                              onClick={resetAddressForm}
                              className="text-[13px] font-medium text-[#C9B9A0] transition hover:text-[#F8F1DE]"
                            >
                              Cancel
                            </button>
                          )}
                        </div>

                        {addressError && <div className="mt-4 rounded-xl border border-[#FFCDD2] bg-[#FFEBEE] px-4 py-3 text-sm text-[#C62828]">{addressError}</div>}
                        {addressNotice && <div className="mt-4 rounded-xl border border-[#BCE9CC] bg-[#E8F8EF] px-4 py-3 text-sm text-[#2E7D32]">{addressNotice}</div>}

                        <div className="mt-4 grid gap-3">
                          <AddressField name="label" label="Home / Work / Hostel" value={addressForm.label} onChange={handleAddressChange} />

                          <div className="grid gap-3 md:grid-cols-2">
                            <AddressField name="recipientName" label="Recipient Name" value={addressForm.recipientName} onChange={handleAddressChange} required />
                            <AddressField name="phone" label="Phone" value={addressForm.phone} onChange={handleAddressChange} required maxLength="10" />
                          </div>

                          <AddressField name="addressLine1" label="Address Line 1" value={addressForm.addressLine1} onChange={handleAddressChange} required />

                          <div className="grid gap-3 md:grid-cols-2">
                            <AddressField name="addressLine2" label="Address Line 2" value={addressForm.addressLine2} onChange={handleAddressChange} />
                            <AddressField name="landmark" label="Landmark" value={addressForm.landmark} onChange={handleAddressChange} />
                          </div>

                          <div className="grid gap-3 md:grid-cols-3">
                            <AddressField name="city" label="City" value={addressForm.city} onChange={handleAddressChange} required />
                            <AddressField name="state" label="State" value={addressForm.state} onChange={handleAddressChange} />
                            <AddressField name="postalCode" label="Postal Code" value={addressForm.postalCode} onChange={handleAddressChange} />
                          </div>

                          <label className="flex items-center justify-between gap-4 border-t border-gold/15 pt-4 text-[13px] text-[#C9B9A0]">
                            <span>Use as default delivery address</span>
                            <span className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-gold/15 transition ${addressForm.isDefault ? 'bg-[#FF6B35]' : 'bg-white'}`}>
                              <input type="checkbox" name="isDefault" checked={addressForm.isDefault} onChange={handleAddressChange} className="peer sr-only" />
                              <span className="ml-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
                            </span>
                          </label>

                          <button
                            type="submit"
                            disabled={isAddressBusy}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#FF6B35] px-5 text-sm font-medium text-white transition hover:bg-[#FC8019] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <MapPin className="h-4 w-4" />
                            {isAddressBusy ? 'Saving...' : editingAddressId ? 'Update Address' : 'Save Address'}
                          </button>
                        </div>
                      </form>
                    </div>

                    <div className="space-y-3">
                      {addresses.map((address, index) => (
                        <div
                          key={address.id}
                          className="rounded-2xl border border-gold/15 bg-[#100603] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] sm:p-5"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-3">
                                <p className="text-[15px] font-semibold text-[#F8F1DE]">{address.label || 'Saved Address'}</p>
                                {address.isDefault && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-[#E8F5E9] px-3 py-1 text-[11px] font-medium text-[#2E7D32]">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="mt-2 text-[14px] font-semibold text-[#F8F1DE]">{address.recipientName}</p>
                              <p className="mt-1 text-[13px] text-[#C9B9A0]">{address.phone}</p>
                              <p className="mt-2 inline-flex items-start gap-2 text-[13px] leading-6 text-[#C9B9A0]">
                                <MapPin className="mt-1 h-4 w-4 shrink-0 text-[#A8977E]" />
                                <span>{address.fullAddress}</span>
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-2 sm:justify-end">
                              {!address.isDefault && (
                                <button
                                  type="button"
                                  onClick={() => handleSetDefaultAddress(address.id)}
                                  disabled={deleteBusyId === address.id}
                                  className="h-10 rounded-full border border-[#FF6B35] px-4 text-[13px] font-medium text-[#FF6B35] transition hover:bg-[#FFF1EB] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  Set Default
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleEditAddress(address)}
                                className="inline-flex h-10 items-center gap-2 rounded-full border border-[#FF6B35] px-4 text-[13px] font-medium text-[#FF6B35] transition hover:bg-[#FFF1EB]"
                              >
                                <Pencil className="h-4 w-4" />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteAddress(address.id)}
                                disabled={deleteBusyId === address.id}
                                className="inline-flex h-10 items-center gap-2 rounded-full border border-[#E23744] px-4 text-[13px] font-medium text-[#E23744] transition hover:bg-[#FFEBEE] disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {addresses.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-gold/15 bg-[#1a110b] px-5 py-10 text-center">
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF1EB] text-[#FF6B35]">
                            <MapPin className="h-6 w-6" />
                          </div>
                          <p className="mt-4 text-[16px] font-semibold text-[#F8F1DE]">No saved addresses yet.</p>
                          <p className="mt-2 text-[13px] text-[#C9B9A0]">Add your first address for faster checkout</p>
                          <button
                            type="button"
                            onClick={() => setShowAddressForm(true)}
                            className="mt-5 inline-flex h-10 items-center justify-center rounded-full border border-[#FF6B35] px-4 text-[13px] font-medium text-[#FF6B35] transition hover:bg-[#FFF1EB]"
                          >
                            + Add Address
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {activeTab === 'orders' && (
                // REDESIGNED: Orders tab with Live + History
                <section className="space-y-6">
                  {/* REDESIGNED: Live orders section */}
                  <div className="rounded-2xl border border-gold/15 bg-[#100603] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)] sm:p-6">
                    <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-[0.3px] text-[#A8977E]">CURRENT ORDERS</p>
                        <h2 className="mt-1 text-[18px] font-semibold text-[#F8F1DE] sm:text-[20px]">Live Orders</h2>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#E8F5E9] px-3 py-1 text-[12px] font-medium text-[#2E7D32]">
                          <span className="h-2 w-2 rounded-full bg-[#48C479] animate-[pulse_1.5s_ease-in-out_infinite]" />
                          {activeOrders.length} live
                        </span>
                        <Link
                          to="/menu"
                          className="inline-flex h-8 items-center justify-center rounded-full border border-[#FF6B35] px-4 text-[13px] font-medium text-[#FF6B35] transition hover:bg-[#FFF1EB]"
                        >
                          Browse Menu
                        </Link>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {activeOrders.map((order, index) => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          showTrack
                          isTracking={trackingOrderId === order.id}
                          onTrackToggle={() => setTrackingOrderId((current) => (current === order.id ? null : order.id))}
                          index={index}
                        />
                      ))}

                      {activeOrders.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-gold/15 bg-[#1a110b] px-5 py-10 text-center">
                          <BowlIllustration />
                          <p className="mt-4 text-[18px] font-semibold text-[#F8F1DE]">No active orders right now</p>
                          <p className="mt-2 text-[14px] text-[#C9B9A0]">Browse the menu or review your past orders.</p>
                          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                            <Link
                              to="/menu"
                              className="inline-flex h-10 items-center justify-center rounded-full bg-[#FF6B35] px-5 text-[13px] font-medium text-white transition hover:bg-[#FC8019]"
                            >
                              Browse Menu
                            </Link>
                            <button
                              type="button"
                              onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                              className="inline-flex h-10 items-center justify-center rounded-full border border-[#FF6B35] px-5 text-[13px] font-medium text-[#FF6B35] transition hover:bg-[#FFF1EB]"
                            >
                              View Past Orders
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* REDESIGNED: Past orders section */}
                  <div className="rounded-2xl border border-gold/15 bg-[#100603] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)] sm:p-6">
                    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-[0.3px] text-[#A8977E]">HISTORY</p>
                        <h2 className="mt-1 text-[18px] font-semibold text-[#F8F1DE] sm:text-[20px]">Past Orders</h2>
                      </div>
                      <span className="rounded-full border border-gold/15 bg-[#1a110b] px-3 py-1 text-[12px] font-medium text-[#C9B9A0]">
                        {previousOrders.length} history
                      </span>
                    </div>

                    <div className="space-y-4">
                      {previousOrders.map((order, index) => (
                        <OrderCard key={order.id} order={order} onReorder={handleReorder} showReorder index={index} />
                      ))}

                      {previousOrders.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-gold/15 bg-[#1a110b] px-5 py-12 text-center">
                          <BowlIllustration />
                          <p className="mt-4 text-[18px] font-semibold text-[#F8F1DE]">No orders yet</p>
                          <p className="mt-2 text-[14px] text-[#C9B9A0]">Your completed orders will appear here</p>
                          <Link
                            to="/menu"
                            className="mt-6 inline-flex h-10 items-center justify-center rounded-full bg-[#FF6B35] px-5 text-[13px] font-medium text-white transition hover:bg-[#FC8019]"
                          >
                            Browse Menu
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

