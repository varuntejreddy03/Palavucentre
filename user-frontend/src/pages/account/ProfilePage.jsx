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
  Package,
  Pencil,
  Phone,
  RotateCcw,
  Settings,
  Share2,
  ShoppingCart,
  Sparkles,
  Trash2,
  TrendingUp,
  User,
} from 'lucide-react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'

import { useAccount } from '../../context/AccountContext'
import { useCart } from '../../context/CartContext'
import { accountApi } from '../../lib/api'
import { formatCurrency, formatDate, formatDateTime, normalizePhoneNumber } from '../../lib/formatters'

const initialAddressForm = {
  label: '', recipientName: '', phone: '', addressLine1: '', addressLine2: '',
  landmark: '', city: '', state: '', postalCode: '', isDefault: false,
}

const ADDRESS_BOOK_ENABLED = false

const tabs = [
  { id: 'overview', label: 'Overview', icon: TrendingUp },
  { id: 'orders', label: 'Orders', icon: Package },
  ADDRESS_BOOK_ENABLED ? { id: 'addresses', label: 'Addresses', icon: MapPin } : null,
].filter(Boolean)

const orderTrackingFlow = ['pending', 'accepted', 'preparing', 'ready', 'delivered']

function getInitials(v) {
  const w = String(v || '').trim().split(/\s+/).filter(Boolean)
  if (!w.length) return 'PC'
  if (w.length === 1) return w[0].slice(0, 2).toUpperCase()
  return `${w[0][0]}${w[1][0]}`.toUpperCase()
}

function toTitleCase(v) {
  const n = String(v || '').trim().replace(/\s+/g, ' ')
  if (!n) return 'Palavu Guest'
  return n.replace(/\b([a-z])([a-z]*)/gi, (_, f, r) => `${f.toUpperCase()}${r.toLowerCase()}`)
}

function StatusBadge({ value, kind = 'order' }) {
  const meta = kind === 'order'
    ? { pending: { l: 'Placed', c: 'bg-blue-500/15 text-blue-300 border-blue-500/20' }, accepted: { l: 'Accepted', c: 'bg-purple-500/15 text-purple-300 border-purple-500/20' }, preparing: { l: 'Preparing', c: 'bg-amber-500/15 text-amber-300 border-amber-500/20' }, ready: { l: 'Ready for Pickup', c: 'bg-purple-500/15 text-purple-300 border-purple-500/20' }, delivered: { l: 'Completed', c: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20' }, cancelled: { l: 'Cancelled', c: 'bg-red-500/15 text-red-300 border-red-500/20' } }
    : { paid: { l: 'Paid', c: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20' }, pending: { l: 'Pending', c: 'bg-amber-500/15 text-amber-300 border-amber-500/20' }, unpaid: { l: 'Unpaid', c: 'bg-red-500/15 text-red-300 border-red-500/20' }, failed: { l: 'Failed', c: 'bg-red-500/15 text-red-300 border-red-500/20' }, refunded: { l: 'Refunded', c: 'bg-amber-500/15 text-amber-300 border-amber-500/20' } }
  const m = meta[value] || { l: String(value || kind), c: 'bg-white/5 text-[#C9B9A0] border-white/10' }
  return <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${m.c}`}>{m.l}</span>
}

function getTrackingMeta(s) {
  return { pending: { label: 'Order Placed', note: 'Restaurant received your order.' }, accepted: { label: 'Accepted', note: 'Kitchen accepted your order.' }, preparing: { label: 'Preparing', note: 'Your items are being prepared.' }, ready: { label: 'Ready', note: 'Packed and ready for pickup.' }, delivered: { label: 'Completed', note: 'Picked up successfully.' } }[s] || { label: 'Order Placed', note: 'Restaurant received your order.' }
}

function buildTrackingSteps(order) {
  if (!order) return []
  const ci = order.orderStatus === 'cancelled' ? -1 : orderTrackingFlow.indexOf(order.orderStatus)
  return orderTrackingFlow.map((s, i) => ({ id: s, ...getTrackingMeta(s), completed: ci >= i, active: order.orderStatus === s }))
}

function AddressField({ name, label, value, onChange, required = false, maxLength }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[#A8977E]">{label}</span>
      <input required={required} name={name} maxLength={maxLength} value={value} onChange={onChange}
        className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3.5 text-[14px] text-[#F8F1DE] outline-none transition focus:border-gold/50 focus:bg-white/[0.06]" />
    </label>
  )
}

function OrderCard({ order, onReorder, showReorder = false, showTrack = false, isTracking = false, onTrackToggle, isNew = false }) {
  const firstItem = order.items?.[0]
  const extra = Math.max((order.items?.length || 0) - 1, 0)
  const summary = firstItem ? `${firstItem.name}${extra > 0 ? ` + ${extra} more` : ''}` : 'Order items'
  const isLive = !['delivered', 'cancelled'].includes(order.orderStatus)
  const steps = buildTrackingSteps(order)

  return (
    <article className={`rounded-xl border bg-white/[0.02] p-4 transition ${isNew ? 'border-gold/40 bg-gold/[0.04] ring-1 ring-gold/20' : 'border-white/8 hover:border-white/15'}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-medium text-[#A8977E]">#{order.orderNumber || order.id}</p>
          <p className="mt-0.5 text-[11px] text-[#A8977E]/60">{formatDateTime(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <StatusBadge value={order.paymentStatus} kind="payment" />
          <StatusBadge value={order.orderStatus} kind="order" />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {firstItem?.img ? (
            <img src={firstItem.img} alt={firstItem.name} className="h-12 w-12 rounded-lg object-cover shrink-0" />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold"><Sparkles className="h-4 w-4" /></div>
          )}
          <div className="min-w-0">
            <p className="truncate text-[14px] font-medium text-[#F8F1DE]">{summary}</p>
            <p className="text-[12px] text-[#A8977E]">{order.items?.length || 0} item{(order.items?.length || 0) > 1 ? 's' : ''}</p>
          </div>
        </div>
        <p className="text-[16px] font-bold text-gold shrink-0">{formatCurrency(order.pricing?.grandTotal)}</p>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/6 pt-3">
        <p className="text-[11px] text-emerald-400/80 flex items-center gap-1">
          {isLive ? <><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live</> : 'Completed'}
        </p>
        <div className="flex items-center gap-2">
          {showTrack && isLive && (
            <button type="button" onClick={onTrackToggle} className="h-7 rounded-md border border-gold/25 px-3 text-[11px] font-medium text-gold transition hover:bg-gold/10">
              {isTracking ? 'Hide' : 'Track'}
            </button>
          )}
          {showReorder && (
            <button type="button" onClick={() => onReorder(order)} className="h-7 rounded-md border border-gold/25 px-3 text-[11px] font-medium text-gold transition hover:bg-gold/10 flex items-center gap-1">
              <RotateCcw className="h-3 w-3" /> Reorder
            </button>
          )}
        </div>
      </div>

      {showTrack && isLive && isTracking && (
        <div className="mt-3 rounded-lg border border-white/8 bg-white/[0.02] p-3">
          <div className="space-y-2">
            {steps.map((step, i) => (
              <div key={step.id} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <span className={`h-2.5 w-2.5 rounded-full ${step.active ? 'bg-gold animate-pulse' : step.completed ? 'bg-emerald-400' : 'bg-white/15'}`} />
                  {i < steps.length - 1 && <span className={`mt-0.5 h-5 w-px ${step.completed ? 'bg-emerald-400/40' : 'bg-white/10'}`} />}
                </div>
                <div className="-mt-0.5">
                  <p className={`text-[12px] font-medium ${step.active ? 'text-gold' : step.completed ? 'text-[#F8F1DE]' : 'text-[#A8977E]/50'}`}>{step.label}</p>
                  <p className="text-[11px] text-[#A8977E]/60">{step.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  )
}

export default function ProfilePage() {
  const { user, profile, isLoading, isProfileLoading, logout, refreshProfile } = useAccount()
  const { addToCart, setCartOpen } = useCart()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [addressForm, setAddressForm] = useState(initialAddressForm)
  const [editingAddressId, setEditingAddressId] = useState(null)
  const [addressError, setAddressError] = useState('')
  const [addressNotice, setAddressNotice] = useState('')
  const [dashboardNotice, setDashboardNotice] = useState('')
  const [trackingOrderId, setTrackingOrderId] = useState(null)
  const [justOrderedBanner, setJustOrderedBanner] = useState(false)
  const [isAddressBusy, setIsAddressBusy] = useState(false)
  const [deleteBusyId, setDeleteBusyId] = useState(null)
  const [showAddressForm, setShowAddressForm] = useState(false)

  const addresses = useMemo(() => profile?.addresses || [], [profile?.addresses])
  const orders = useMemo(() => profile?.orders || [], [profile?.orders])
  const activeOrders = useMemo(() => orders.filter((o) => !['delivered', 'cancelled'].includes(o.orderStatus)), [orders])
  const previousOrders = useMemo(() => orders.filter((o) => ['delivered', 'cancelled'].includes(o.orderStatus)), [orders])
  const defaultAddress = addresses.find((a) => a.isDefault) || null
  const activeTab = tabs.some((t) => t.id === searchParams.get('tab')) ? searchParams.get('tab') : 'overview'
  const userInitials = getInitials(user?.name || user?.email)
  const displayName = toTitleCase(user?.name || user?.email?.split('@')?.[0])

  useEffect(() => {
    if (location.state?.justOrdered) {
      setJustOrderedBanner(true)
      if (activeOrders[0]) setTrackingOrderId(activeOrders[0].id)
      window.history.replaceState({}, '')
      const tid = window.setTimeout(() => setJustOrderedBanner(false), 6000)
      return () => window.clearTimeout(tid)
    }
  }, [location.state?.justOrdered, activeOrders])

  useEffect(() => {
    if (!dashboardNotice) return
    const t = window.setTimeout(() => setDashboardNotice(''), 2800)
    return () => window.clearTimeout(t)
  }, [dashboardNotice])

  const setActiveTab = (tab) => setSearchParams({ tab })
  const resetAddressForm = () => { setEditingAddressId(null); setAddressForm(initialAddressForm); setShowAddressForm(false) }

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target
    setAddressForm((c) => ({ ...c, [name]: type === 'checkbox' ? checked : name === 'phone' ? normalizePhoneNumber(value).slice(0, 10) : value }))
  }

  const handleAddressSubmit = async (e) => {
    e.preventDefault()
    try {
      setIsAddressBusy(true); setAddressError(''); setAddressNotice('')
      const p = { label: addressForm.label.trim() || undefined, recipientName: addressForm.recipientName.trim(), phone: normalizePhoneNumber(addressForm.phone), addressLine1: addressForm.addressLine1.trim(), addressLine2: addressForm.addressLine2.trim() || undefined, landmark: addressForm.landmark.trim() || undefined, city: addressForm.city.trim(), state: addressForm.state.trim() || undefined, postalCode: addressForm.postalCode.trim() || undefined, isDefault: addressForm.isDefault }
      if (editingAddressId) { await accountApi.updateAddress(editingAddressId, p); setAddressNotice('Address updated') }
      else { await accountApi.createAddress(p); setAddressNotice('Address added') }
      resetAddressForm(); await refreshProfile()
    } catch (err) { setAddressError(err.message || 'Could not save address') }
    finally { setIsAddressBusy(false) }
  }

  const handleEditAddress = (a) => {
    setActiveTab('addresses'); setShowAddressForm(true); setEditingAddressId(a.id); setAddressError(''); setAddressNotice('')
    setAddressForm({ label: a.label || '', recipientName: a.recipientName || '', phone: a.phone || '', addressLine1: a.addressLine1 || '', addressLine2: a.addressLine2 || '', landmark: a.landmark || '', city: a.city || '', state: a.state || '', postalCode: a.postalCode || '', isDefault: Boolean(a.isDefault) })
  }

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Delete this saved address?')) return
    try { setDeleteBusyId(id); setAddressError(''); setAddressNotice(''); await accountApi.deleteAddress(id); if (editingAddressId === id) resetAddressForm(); setAddressNotice('Address deleted'); await refreshProfile() }
    catch (err) { setAddressError(err.message || 'Could not delete address') }
    finally { setDeleteBusyId(null) }
  }

  const handleSetDefaultAddress = async (id) => {
    try { setDeleteBusyId(id); await accountApi.updateAddress(id, { isDefault: true }); setAddressNotice('Default updated'); await refreshProfile() }
    catch (err) { setAddressError(err.message || 'Could not update') }
    finally { setDeleteBusyId(null) }
  }

  const handleReorder = (order) => {
    (order.items || []).forEach((item) => { addToCart({ id: item.menuItemId || `${order.id}-${item.id}`, name: item.name, price: item.unitPrice, img: item.img, veg: item.veg }, item.quantity) })
    setDashboardNotice(`${order.orderNumber} added to cart`); setCartOpen(true)
  }

  if (isLoading) return <div className="flex min-h-screen items-center justify-center bg-bg-page text-text-secondary">Loading...</div>

  return (
    <div className="min-h-screen bg-bg-page px-3 pb-12 pt-20 sm:px-4 sm:pt-24">
      <div className="mx-auto w-full max-w-[960px]">

        {/* Notices */}
        {justOrderedBanner && (
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200 animate-fade-lift">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
            <div><p className="font-semibold text-emerald-100">Order placed!</p><p className="text-emerald-200/70 text-[13px]">Track it live below.</p></div>
          </div>
        )}
        {dashboardNotice && <div className="mb-4 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{dashboardNotice}</div>}

        {/* Profile header card */}
        <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4 sm:p-6">
          {/* Mobile: stacked layout, Desktop: row */}
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-left gap-3 sm:gap-4">
            <div className="profile-avatar shrink-0" style={{ width: 52, height: 52, fontSize: 18 }}>{userInitials}</div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-[18px] font-bold text-[#F8F1DE] sm:text-[24px]" style={{ fontFamily: 'var(--font-display)' }}>{displayName}</h1>
              <p className="mt-0.5 truncate text-[11px] text-[#A8977E] sm:text-[12px]">{user?.email}</p>
            </div>
            <button type="button" onClick={logout} className="hidden sm:flex h-9 items-center gap-2 rounded-lg border border-white/10 px-3 text-[12px] font-medium text-[#A8977E] transition hover:border-red-500/30 hover:text-red-300">
              <LogOut className="h-3.5 w-3.5" /> Logout
            </button>
          </div>

          {/* Quick stats — 2x2 on mobile, 4 cols on desktop */}
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            {[
              { label: 'Total Orders', value: orders.length, icon: Package, tap: () => setActiveTab('orders') },
              { label: 'Active Now', value: activeOrders.length, icon: Clock3, live: activeOrders.length > 0, tap: () => setActiveTab('orders') },
              ADDRESS_BOOK_ENABLED ? { label: 'Addresses', value: addresses.length, icon: MapPin, tap: () => setActiveTab('addresses') } : null,
              { label: 'Favourites', value: profile?.favourites?.length || 0, icon: Heart },
            ].filter(Boolean).map((s) => (
              <button key={s.label} type="button" onClick={s.tap} className="rounded-lg border border-white/6 bg-white/[0.02] px-3 py-3 text-left transition hover:border-gold/20 hover:bg-gold/[0.03] active:scale-[0.97]">
                <div className="flex items-center justify-between">
                  <s.icon className="h-4 w-4 text-gold/60" />
                  {s.live && <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />}
                </div>
                <p className="mt-2 text-[20px] font-bold leading-none text-[#F8F1DE] sm:text-[22px]">{s.value}</p>
                <p className="mt-1 text-[10px] text-[#A8977E] sm:text-[11px]">{s.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Tab bar — sticky on mobile for easy reach */}
        <div className="sticky top-[72px] z-30 mt-3 sm:mt-4 -mx-3 px-3 sm:-mx-0 sm:px-0">
          <div className="flex items-center gap-0.5 rounded-xl border border-white/8 bg-[rgba(13,10,6,0.95)] p-1 backdrop-blur-xl sm:gap-1">
            {tabs.map((tab) => {
              const active = activeTab === tab.id
              return (
                <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-semibold transition active:scale-[0.96] sm:py-2.5 sm:text-[13px] sm:gap-2 ${
                    active ? 'bg-gold/15 text-gold shadow-[0_0_12px_rgba(212,160,23,0.1)]' : 'text-[#A8977E] hover:text-[#F8F1DE]'
                  }`}>
                  <tab.icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                  {tab.id === 'orders' && activeOrders.length > 0 && (
                    <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gold/20 px-1 text-[9px] font-bold text-gold">{activeOrders.length}</span>
                  )}
                </button>
              )
            })}
            <button type="button" onClick={logout} className="flex sm:hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#A8977E] hover:text-red-300 active:scale-90">
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {isProfileLoading && <p className="mt-2 text-center text-[11px] text-[#A8977E]/50">Refreshing...</p>}

        {/* Tab content */}
        <div className="mt-4" key={activeTab}>

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Quick actions */}
              {/* Quick actions — horizontal scroll on mobile, grid on desktop */}
              <div className={`flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide sm:grid ${ADDRESS_BOOK_ENABLED ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} sm:gap-3 sm:overflow-visible sm:pb-0`}>
                <Link to="/menu" className="group flex min-w-[200px] shrink-0 items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-3.5 transition active:scale-[0.97] hover:border-gold/25 hover:bg-gold/[0.04] sm:min-w-0 sm:shrink sm:p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold sm:h-10 sm:w-10"><ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" /></div>
                  <div><p className="text-[13px] font-semibold text-[#F8F1DE] sm:text-[14px]">Browse Menu</p><p className="text-[10px] text-[#A8977E] sm:text-[11px]">Order something new</p></div>
                </Link>
                <button type="button" onClick={() => setActiveTab('orders')} className="group flex min-w-[200px] shrink-0 items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-3.5 text-left transition active:scale-[0.97] hover:border-gold/25 hover:bg-gold/[0.04] sm:min-w-0 sm:shrink sm:p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold sm:h-10 sm:w-10"><Package className="h-4 w-4 sm:h-5 sm:w-5" /></div>
                  <div><p className="text-[13px] font-semibold text-[#F8F1DE] sm:text-[14px]">{activeOrders.length > 0 ? `${activeOrders.length} Active` : 'My Orders'}</p><p className="text-[10px] text-[#A8977E] sm:text-[11px]">{activeOrders.length > 0 ? 'Track live' : 'View history'}</p></div>
                </button>
                {ADDRESS_BOOK_ENABLED && (
                  <button type="button" onClick={() => setActiveTab('addresses')} className="group flex min-w-[200px] shrink-0 items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-3.5 text-left transition active:scale-[0.97] hover:border-gold/25 hover:bg-gold/[0.04] sm:min-w-0 sm:shrink sm:p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold sm:h-10 sm:w-10"><MapPin className="h-4 w-4 sm:h-5 sm:w-5" /></div>
                    <div><p className="text-[13px] font-semibold text-[#F8F1DE] sm:text-[14px]">{addresses.length} Addresses</p><p className="text-[10px] text-[#A8977E] sm:text-[11px]">{defaultAddress ? `Default: ${defaultAddress.label || 'Saved'}` : 'Add address'}</p></div>
                  </button>
                )}
              </div>

              {/* Active orders preview */}
              {activeOrders.length > 0 && (
                <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <p className="text-[13px] font-semibold text-[#F8F1DE]">Live Orders</p>
                    </div>
                    <button type="button" onClick={() => setActiveTab('orders')} className="text-[11px] font-medium text-gold hover:underline">View all</button>
                  </div>
                  <div className="space-y-3">
                    {activeOrders.slice(0, 2).map((order) => (
                      <OrderCard key={order.id} order={order} showTrack isTracking={trackingOrderId === order.id} isNew={justOrderedBanner && order.id === activeOrders[0]?.id}
                        onTrackToggle={() => setTrackingOrderId((c) => c === order.id ? null : order.id)} />
                    ))}
                  </div>
                </div>
              )}

              {/* Recent orders */}
              {previousOrders.length > 0 && (
                <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[13px] font-semibold text-[#F8F1DE]">Recent Orders</p>
                    <button type="button" onClick={() => setActiveTab('orders')} className="text-[11px] font-medium text-gold hover:underline">View all</button>
                  </div>
                  <div className="space-y-3">
                    {previousOrders.slice(0, 2).map((order) => (
                      <OrderCard key={order.id} order={order} onReorder={handleReorder} showReorder />
                    ))}
                  </div>
                </div>
              )}

              {orders.length === 0 && (
                <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.01] px-6 py-12 text-center">
                  <Package className="mx-auto h-10 w-10 text-gold/30" />
                  <p className="mt-3 text-[16px] font-semibold text-[#F8F1DE]">No orders yet</p>
                  <p className="mt-1 text-[13px] text-[#A8977E]">Your orders will appear here</p>
                  <Link to="/menu" className="mt-4 inline-flex h-9 items-center rounded-lg bg-gold/15 px-4 text-[13px] font-medium text-gold transition hover:bg-gold/25">Browse Menu</Link>
                </div>
              )}
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {activeOrders.length > 0 && (
                <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <p className="text-[13px] font-semibold text-[#F8F1DE]">Active ({activeOrders.length})</p>
                    </div>
                    <Link to="/menu" className="h-7 rounded-md border border-gold/25 px-3 text-[11px] font-medium text-gold transition hover:bg-gold/10 flex items-center">New Order</Link>
                  </div>
                  <div className="space-y-3">
                    {activeOrders.map((order) => (
                      <OrderCard key={order.id} order={order} showTrack isTracking={trackingOrderId === order.id} isNew={justOrderedBanner && order.id === activeOrders[0]?.id}
                        onTrackToggle={() => setTrackingOrderId((c) => c === order.id ? null : order.id)} />
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[13px] font-semibold text-[#F8F1DE]">History ({previousOrders.length})</p>
                </div>
                {previousOrders.length > 0 ? (
                  <div className="space-y-3">
                    {previousOrders.map((order) => (
                      <OrderCard key={order.id} order={order} onReorder={handleReorder} showReorder />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-white/10 px-5 py-8 text-center">
                    <Package className="mx-auto h-8 w-8 text-gold/25" />
                    <p className="mt-2 text-[14px] font-medium text-[#F8F1DE]">No past orders</p>
                    <p className="mt-1 text-[12px] text-[#A8977E]">Completed orders appear here</p>
                  </div>
                )}
              </div>

              {activeOrders.length === 0 && previousOrders.length === 0 && (
                <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.01] px-6 py-12 text-center">
                  <Package className="mx-auto h-10 w-10 text-gold/30" />
                  <p className="mt-3 text-[16px] font-semibold text-[#F8F1DE]">No orders yet</p>
                  <Link to="/menu" className="mt-4 inline-flex h-9 items-center rounded-lg bg-gold/15 px-4 text-[13px] font-medium text-gold transition hover:bg-gold/25">Browse Menu</Link>
                </div>
              )}
            </div>
          )}

          {/* ADDRESSES TAB */}
          {ADDRESS_BOOK_ENABLED && activeTab === 'addresses' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-semibold text-[#F8F1DE]">{addresses.length} saved address{addresses.length !== 1 ? 'es' : ''}</p>
                <button type="button" onClick={() => { setShowAddressForm((c) => !c); if (editingAddressId) resetAddressForm() }}
                  className="h-8 rounded-lg border border-gold/25 px-3 text-[12px] font-medium text-gold transition hover:bg-gold/10">
                  {showAddressForm || editingAddressId ? 'Cancel' : '+ Add New'}
                </button>
              </div>

              {(showAddressForm || editingAddressId) && (
                <form onSubmit={handleAddressSubmit} className="rounded-xl border border-gold/20 bg-gold/[0.03] p-4 space-y-3 animate-fade-lift">
                  <p className="text-[14px] font-semibold text-[#F8F1DE]">{editingAddressId ? 'Edit Address' : 'New Address'}</p>
                  {addressError && <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[12px] text-red-300">{addressError}</div>}
                  {addressNotice && <div className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-[12px] text-emerald-300">{addressNotice}</div>}
                  <AddressField name="label" label="Label (Home / Work)" value={addressForm.label} onChange={handleAddressChange} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <AddressField name="recipientName" label="Recipient Name" value={addressForm.recipientName} onChange={handleAddressChange} required />
                    <AddressField name="phone" label="Phone" value={addressForm.phone} onChange={handleAddressChange} required maxLength="10" />
                  </div>
                  <AddressField name="addressLine1" label="Address Line 1" value={addressForm.addressLine1} onChange={handleAddressChange} required />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <AddressField name="addressLine2" label="Address Line 2" value={addressForm.addressLine2} onChange={handleAddressChange} />
                    <AddressField name="landmark" label="Landmark" value={addressForm.landmark} onChange={handleAddressChange} />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <AddressField name="city" label="City" value={addressForm.city} onChange={handleAddressChange} required />
                    <AddressField name="state" label="State" value={addressForm.state} onChange={handleAddressChange} />
                    <AddressField name="postalCode" label="Postal Code" value={addressForm.postalCode} onChange={handleAddressChange} />
                  </div>
                  <label className="flex items-center justify-between border-t border-white/8 pt-3 text-[12px] text-[#A8977E]">
                    <span>Set as default</span>
                    <input type="checkbox" name="isDefault" checked={addressForm.isDefault} onChange={handleAddressChange} className="h-4 w-4 rounded accent-gold" />
                  </label>
                  <button type="submit" disabled={isAddressBusy} className="h-10 w-full rounded-lg bg-gold/15 text-[13px] font-semibold text-gold transition hover:bg-gold/25 disabled:opacity-50">
                    {isAddressBusy ? 'Saving...' : editingAddressId ? 'Update' : 'Save Address'}
                  </button>
                </form>
              )}

              {addresses.length > 0 ? (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <div key={address.id} className="rounded-xl border border-white/8 bg-white/[0.02] p-4 transition hover:border-white/15">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-[14px] font-semibold text-[#F8F1DE]">{address.label || 'Address'}</p>
                            {address.isDefault && <span className="rounded-md border border-gold/30 bg-gold/10 px-1.5 py-0.5 text-[9px] font-bold uppercase text-gold">Default</span>}
                          </div>
                          <p className="mt-1 text-[13px] text-[#F8F1DE]">{address.recipientName}</p>
                          <p className="text-[12px] text-[#A8977E]">{address.phone}</p>
                          <p className="mt-1 text-[12px] leading-5 text-[#A8977E]">{address.fullAddress}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 border-t border-white/6 pt-3">
                        {!address.isDefault && (
                          <button type="button" onClick={() => handleSetDefaultAddress(address.id)} disabled={deleteBusyId === address.id}
                            className="h-7 rounded-md border border-gold/25 px-3 text-[11px] font-medium text-gold transition hover:bg-gold/10 disabled:opacity-50">Set Default</button>
                        )}
                        <button type="button" onClick={() => handleEditAddress(address)}
                          className="h-7 rounded-md border border-white/15 px-3 text-[11px] font-medium text-[#A8977E] transition hover:text-[#F8F1DE] flex items-center gap-1"><Pencil className="h-3 w-3" /> Edit</button>
                        <button type="button" onClick={() => handleDeleteAddress(address.id)} disabled={deleteBusyId === address.id}
                          className="h-7 rounded-md border border-red-500/20 px-3 text-[11px] font-medium text-red-300/70 transition hover:text-red-300 hover:border-red-500/40 flex items-center gap-1 disabled:opacity-50"><Trash2 className="h-3 w-3" /> Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : !showAddressForm && (
                <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.01] px-6 py-10 text-center">
                  <MapPin className="mx-auto h-8 w-8 text-gold/25" />
                  <p className="mt-3 text-[14px] font-medium text-[#F8F1DE]">No addresses saved</p>
                  <p className="mt-1 text-[12px] text-[#A8977E]">Add one for faster checkout</p>
                  <button type="button" onClick={() => setShowAddressForm(true)} className="mt-3 h-8 rounded-lg border border-gold/25 px-4 text-[12px] font-medium text-gold transition hover:bg-gold/10">+ Add Address</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
