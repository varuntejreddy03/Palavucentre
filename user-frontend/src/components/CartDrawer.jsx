import {
  ArrowRight,
  Lock,
  Minus,
  Plus,
  Shield,
  ShoppingBag,
  Trash2,
  User,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAccount } from '../context/AccountContext'
import { useCart } from '../context/CartContext'
import { useSiteSettings } from '../context/SiteContext'
import { formatCurrency } from '../lib/formatters'
import { ORDER_ROUTE, navigateToLoginWithRedirect } from '../lib/order-flow'

const SIGNED_IN_BANNER_STORAGE_KEY = 'palavu:cart-signed-in-banner-dismissed'

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

export default function CartDrawer() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAccount()
  const { cartItems, removeFromCart, updateQuantity, total, isCartOpen, setCartOpen } = useCart()
  const { siteSettings } = useSiteSettings()
  const [hideSignedInBanner, setHideSignedInBanner] = useState(() => {
    try {
      return window.localStorage.getItem(SIGNED_IN_BANNER_STORAGE_KEY) === 'true'
    } catch {
      return false
    }
  })
  const [removingIds, setRemovingIds] = useState({})

  const taxPercent = Number(siteSettings?.ordering?.taxPercent || 0)
  const deliveryFee = Number(siteSettings?.ordering?.deliveryFee || 0)
  const freeDeliveryThreshold = Number(siteSettings?.ordering?.freeDeliveryThreshold || 0)
  const estimatedDeliveryFee = deliveryFee > 0 && total < freeDeliveryThreshold ? deliveryFee : 0
  const estimatedTax = (total + estimatedDeliveryFee) * (taxPercent / 100)
  const estimatedGrandTotal = total + estimatedDeliveryFee + estimatedTax
  const itemCount = useMemo(
    () => cartItems.reduce((count, item) => count + item.quantity, 0),
    [cartItems],
  )
  const userInitials = getInitials(user?.name || user?.email)

  useEffect(() => {
    if (!isCartOpen) {
      return undefined
    }

    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [isCartOpen])

  if (!isCartOpen) {
    return null
  }

  const closeDrawer = () => setCartOpen(false)

  const handleCheckout = () => {
    closeDrawer()

    if (isAuthenticated) {
      navigate('/order')
      return
    }

    navigateToLoginWithRedirect(navigate, ORDER_ROUTE, 'checkout')
  }

  const handleDismissSignedInBanner = () => {
    setHideSignedInBanner(true)

    try {
      window.localStorage.setItem(SIGNED_IN_BANNER_STORAGE_KEY, 'true')
    } catch {
      // Ignore storage failures; this banner is non-critical.
    }
  }

  const handleRemoveItem = (itemId) => {
    setRemovingIds((current) => ({ ...current, [itemId]: true }))

    window.setTimeout(() => {
      removeFromCart(itemId)
      setRemovingIds((current) => {
        const next = { ...current }
        delete next[itemId]
        return next
      })
    }, 180)
  }

  const handleQuantityChange = (item, nextQuantity) => {
    if (nextQuantity <= 0) {
      handleRemoveItem(item.id)
      return
    }

    updateQuantity(item.id, nextQuantity)
  }

  const openMenu = () => {
    closeDrawer()
    navigate('/menu')
  }

  return (
    <>
      <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-[8px]" onClick={closeDrawer}></div>

      <aside
        className="fixed right-0 top-0 z-[101] flex h-full w-full max-w-full flex-col overflow-hidden border-l border-gold/15 bg-[#070301] shadow-[-24px_0_80px_rgba(0,0,0,0.82)] md:w-[440px]"
        style={{ animation: 'slideInDrawer 0.3s cubic-bezier(0.33, 1, 0.68, 1)' }}
      >
        <div className="relative border-b border-gold/10 bg-[linear-gradient(180deg,rgba(14,7,4,0.98),rgba(10,4,2,0.94))] px-6 py-6">
          <div className="absolute right-0 top-0 h-28 w-28 -translate-y-1/3 translate-x-1/3 rounded-full bg-gold/8 blur-3xl"></div>
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div>
              <p className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--text-subtle)]">Cart Review</p>
              <div className="mt-2 flex items-center gap-2">
                <Shield className="h-5 w-5 text-gold" />
                <h2
                  className="text-[26px] leading-none text-gold"
                  style={{ fontFamily: 'Playfair Display, serif', textTransform: 'none', filter: 'none' }}
                >
                  Checkout
                </h2>
              </div>
              <p className="mt-3 font-sans text-[13px] leading-6 text-[var(--text-muted)]">
                Review your cart before checkout.
              </p>
            </div>

            <button
              onClick={closeDrawer}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/8 bg-white/[0.04] text-text-secondary transition hover:bg-white/[0.08] hover:text-text-primary"
              aria-label="Close cart drawer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {cartItems.length === 0 ? (
            <div className="flex min-h-full flex-col items-center justify-center px-4 py-16 text-center">
              <div className="mb-6 flex h-28 w-28 items-center justify-center rounded-full border border-gold/12 bg-gold/5">
                <svg viewBox="0 0 120 120" className="h-16 w-16 text-gold/80" fill="none" stroke="currentColor" strokeWidth="5">
                  <path d="M20 78c0 14 18 25 40 25s40-11 40-25" />
                  <path d="M28 78h64" />
                  <path d="M40 54c0-10 9-18 20-18s20 8 20 18" />
                  <path d="M34 78c0-20 12-35 26-35h0c14 0 26 15 26 35" />
                </svg>
              </div>
              <p className="font-sans text-[18px] font-semibold leading-none text-white">
                Nothing here yet
              </p>
              <p className="mt-4 max-w-xs font-sans text-[13px] leading-6 text-[var(--text-muted)]">
                Your cart is empty. Browse our menu and add a few Konaseema favourites.
              </p>
              <button onClick={openMenu} className="brand-primary-btn mt-6 px-6 text-[15px]">
                Browse Menu
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {isAuthenticated && !hideSignedInBanner && (
                <div className="rounded-[26px] border border-emerald-400/20 border-l-4 border-l-emerald-400 bg-[linear-gradient(180deg,rgba(3,52,53,0.72),rgba(3,33,35,0.92))] px-4 py-4 text-sm text-emerald-50">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-black text-white">
                      {userInitials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-white">Signed in as {user?.email}</p>
                          <p className="mt-2 leading-7 text-emerald-50/82">
                            Your saved addresses and order history are ready.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleDismissSignedInBanner}
                          className="rounded-full p-2 text-emerald-50/70 transition hover:bg-white/8 hover:text-white"
                          aria-label="Dismiss signed in banner"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!isAuthenticated && (
                <div className="rounded-[26px] border border-gold/15 bg-[linear-gradient(180deg,rgba(22,12,7,0.96),rgba(9,4,2,0.94))] px-4 py-4 text-sm text-text-secondary">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-gold/10 p-2.5 text-gold">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary">Account required to place an order</p>
                      <p className="mt-2 leading-7">
                        Sign in to save addresses and track orders.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className={`animate-slideUp rounded-[16px] border border-[var(--border)] bg-[var(--bg-card)] p-4 backdrop-blur-[8px] transition-all duration-200 hover:border-[var(--gold-border)] ${
                      removingIds[item.id] ? 'translate-y-3 opacity-0' : 'translate-y-0 opacity-100'
                    }`}
                  >
                    <div className="relative flex gap-4">
                      {item.img ? (
                        <img src={item.img} alt={item.name} className="h-16 w-16 rounded-[12px] object-cover" />
                      ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[12px] bg-gold/10 text-gold">
                          <ShoppingBag className="h-5 w-5" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="line-clamp-1 font-sans text-[15px] font-semibold text-white">{item.name}</p>
                            <p className="mt-1 font-sans text-[13px] text-[var(--text-muted)]">{formatCurrency(item.price)} each</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="absolute right-0 top-0 rounded-full p-1.5 text-[var(--text-subtle)] transition hover:bg-white/5 hover:text-red-300"
                            aria-label={`Remove ${item.name}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-4">
                          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-[var(--bg-card)] px-2 py-1">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item, item.quantity - 1)}
                              aria-label={`Decrease ${item.name} quantity`}
                              className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)] transition hover:bg-gold/10 hover:text-gold"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span
                              key={`${item.id}-${item.quantity}`}
                              className="min-w-[30px] animate-fade-lift text-center font-sans text-[15px] font-medium text-white"
                            >
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item, item.quantity + 1)}
                              aria-label={`Increase ${item.name} quantity`}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/10 text-gold transition hover:bg-gold/15"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="font-sans text-[10px] font-medium uppercase tracking-wide text-[var(--text-muted)]">Line Total</p>
                            <p className="mt-1 font-sans text-[18px] font-semibold text-gold">{formatCurrency(item.price * item.quantity)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-[16px] border border-[var(--border)] bg-[var(--bg-card)] p-5 backdrop-blur-[8px]">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--text-subtle)]">Order Summary</p>
                    <p className="mt-2 font-sans text-[13px] text-[var(--text-muted)]">{itemCount} items</p>
                  </div>
                  <span className="font-sans text-[24px] font-semibold text-gold">{formatCurrency(estimatedGrandTotal)}</span>
                </div>

                <div className="mt-5 space-y-3 border-t border-gold/10 pt-4 font-sans text-[13px]">
                  <div className="flex items-center justify-between text-[var(--text-muted)]">
                    <span>Subtotal</span>
                    <span className="text-white">{formatCurrency(total)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[var(--text-muted)]">
                    <span>Delivery fee</span>
                    <span className={estimatedDeliveryFee === 0 ? 'text-emerald-300' : 'text-white'}>
                      {estimatedDeliveryFee === 0 ? 'Free' : formatCurrency(estimatedDeliveryFee)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[var(--text-muted)]">
                    <span>Taxes ({taxPercent}%)</span>
                    <span className="text-white">{formatCurrency(estimatedTax)}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-gold/10 pt-3 font-sans text-[15px] font-semibold text-white">
                    <span>Total</span>
                    <span className="text-gold">{formatCurrency(estimatedGrandTotal)}</span>
                  </div>
                </div>

                <p className="mt-4 text-xs text-[var(--text-muted)]">
                  Promo codes can be applied on the order page.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gold/10 bg-black/30 px-5 py-4">
          <button
            type="button"
            onClick={cartItems.length > 0 ? handleCheckout : undefined}
            disabled={cartItems.length === 0}
            className="brand-primary-btn w-full px-5 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Lock className="h-4 w-4" />
            <span>{cartItems.length > 0 ? (isAuthenticated ? 'Continue to order' : 'Login to checkout') : 'Your cart is empty'}</span>
          </button>
        </div>
      </aside>
    </>
  )
}
