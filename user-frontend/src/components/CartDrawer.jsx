import { Lock, Minus, Plus, Shield, ShoppingBag, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAccount } from '../context/AccountContext'
import { useCart } from '../context/CartContext'
import { useSiteSettings } from '../context/SiteContext'
import { formatCurrency } from '../lib/formatters'
import { ORDER_ROUTE, navigateToLoginWithRedirect } from '../lib/order-flow'

export default function CartDrawer() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAccount()
  const { cartItems, removeFromCart, updateQuantity, total, isCartOpen, setCartOpen } = useCart()
  const { siteSettings } = useSiteSettings()
  const [removingIds, setRemovingIds] = useState({})

  const taxPercent = Number(siteSettings?.ordering?.taxPercent || 0)
  const tax = total * (taxPercent / 100)
  const grandTotal = total + tax
  const itemCount = useMemo(() => cartItems.reduce((s, i) => s + i.quantity, 0), [cartItems])

  useEffect(() => {
    if (!isCartOpen) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [isCartOpen])

  if (!isCartOpen) return null

  const close = () => setCartOpen(false)

  const handleCheckout = () => {
    close()
    if (isAuthenticated) { navigate('/order'); return }
    navigateToLoginWithRedirect(navigate, ORDER_ROUTE, 'checkout')
  }

  const handleRemove = (id) => {
    setRemovingIds((c) => ({ ...c, [id]: true }))
    setTimeout(() => {
      removeFromCart(id)
      setRemovingIds((c) => { const n = { ...c }; delete n[id]; return n })
    }, 200)
  }

  const handleQty = (item, next) => {
    if (next <= 0) { handleRemove(item.id); return }
    updateQuantity(item.id, next)
  }

  const openMenu = () => { close(); navigate('/menu') }

  const ItemCard = ({ item, size = 'sm' }) => {
    const imgSize = size === 'lg' ? 'h-16 w-16' : 'h-14 w-14'
    const btnSize = size === 'lg' ? 'h-8 w-8' : 'h-7 w-7'
    const nameSize = size === 'lg' ? 'text-[16px]' : 'text-[15px]'
    const priceSize = size === 'lg' ? 'text-[16px]' : 'text-[15px]'
    const removing = removingIds[item.id]

    return (
      <div className={`rounded-[14px] border border-[#2E2B1F] bg-[#1A1810] p-3.5 transition-all duration-200 ${removing ? 'opacity-0 scale-95' : 'opacity-100'}`}>
        <div className="flex items-center gap-3">
          {item.img ? (
            <img src={item.img} alt={item.name} className={`${imgSize} shrink-0 rounded-[10px] border border-[#2E2B1F] object-cover`} />
          ) : (
            <div className={`${imgSize} shrink-0 flex items-center justify-center rounded-[10px] border border-[#2E2B1F] bg-[#F0A500]/10`}><ShoppingBag className="h-5 w-5 text-[#F0A500]" /></div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className={`${nameSize} font-semibold text-white truncate`} style={{ fontFamily: 'DM Sans, sans-serif' }}>{item.name}</p>
                <p className="text-[12px] text-[#8A8060] mt-0.5" style={{ fontFamily: 'DM Sans, sans-serif' }}>{formatCurrency(item.price)} each</p>
              </div>
              <button type="button" onClick={() => handleRemove(item.id)} className="shrink-0 p-1 text-[#FF4444] transition hover:text-[#FF6666]">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-2.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <button type="button" onClick={() => handleQty(item, item.quantity - 1)}
                  className={`${btnSize} flex items-center justify-center rounded-full bg-[#111009] border border-[#2E2B1F] text-[#F0A500] transition hover:border-[#F0A500]/40`}>
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-6 text-center text-[14px] font-bold text-white">{item.quantity}</span>
                <button type="button" onClick={() => handleQty(item, item.quantity + 1)}
                  className={`${btnSize} flex items-center justify-center rounded-full bg-[#111009] border border-[#2E2B1F] text-[#F0A500] transition hover:border-[#F0A500]/40`}>
                  <Plus className="h-3 w-3" />
                </button>
              </div>
              <p className={`${priceSize} font-bold text-white`} style={{ fontFamily: 'DM Sans, sans-serif' }}>{formatCurrency(item.price * item.quantity)}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const SummaryCard = ({ size = 'sm' }) => {
    const totalSize = size === 'lg' ? 'text-[22px]' : 'text-[18px]'
    const headerSize = size === 'lg' ? 'text-[20px]' : 'text-[20px]'
    return (
      <div className="rounded-[14px] border border-[#2E2B1F] bg-[#1A1810] p-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-medium uppercase tracking-wider text-[#8A8060]" style={{ fontFamily: 'DM Sans, sans-serif' }}>Order Summary</p>
          <p className={`${headerSize} font-bold text-[#F0A500]`} style={{ fontFamily: 'DM Sans, sans-serif' }}>{formatCurrency(grandTotal)}</p>
        </div>
        <div className="my-3 h-px bg-[#2E2B1F]" />
        <div className="space-y-2 text-[13px]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          <div className="flex justify-between"><span className="text-[#8A8060]">Subtotal</span><span className="text-white">{formatCurrency(total)}</span></div>
          <div className="flex justify-between"><span className="text-[#8A8060]">Taxes ({taxPercent}%)</span><span className="text-white">{formatCurrency(tax)}</span></div>
        </div>
        <div className="my-3 h-px bg-[#2E2B1F]" />
        <div className="flex justify-between items-center">
          <span className="text-[15px] font-bold text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>Total</span>
          <span className={`${totalSize} font-bold text-[#F0A500]`} style={{ fontFamily: 'DM Sans, sans-serif' }}>{formatCurrency(grandTotal)}</span>
        </div>
      </div>
    )
  }

  const EmptyState = () => (
    <div className="flex flex-col items-center py-12 text-center">
      <ShoppingBag className="h-12 w-12 text-[#F0A500]/30" />
      <p className="mt-3 text-[16px] font-semibold text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>Your cart is empty</p>
      <p className="mt-1 text-[13px] text-[#8A8060]">Browse our menu and add some items</p>
      <button type="button" onClick={openMenu} className="mt-4 h-10 rounded-xl bg-[#F0A500]/15 px-5 text-[13px] font-bold text-[#F0A500] transition hover:bg-[#F0A500]/25">Browse Menu</button>
    </div>
  )

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-[4px] lg:bg-black/80 lg:backdrop-blur-[8px]" onClick={close} />

      {/* ===== MOBILE: Bottom Sheet ===== */}
      <div className="fixed inset-x-0 bottom-0 z-[101] flex flex-col lg:hidden" style={{ maxHeight: '92vh', borderRadius: '20px 20px 0 0', background: '#0D0C09', animation: 'slideUp 400ms cubic-bezier(0.32,0.72,0,1)' }}>
        {/* Drag handle */}
        <div className="flex justify-center pt-2.5 pb-1">
          <div className="h-1 w-9 rounded-full bg-[#2E2B1F]" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-2 pb-3 border-b border-[#2E2B1F]">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="h-[18px] w-[18px] text-[#F0A500]" />
              <p className="text-[20px] text-[#F0A500]" style={{ fontFamily: 'Playfair Display, serif' }}>Review Order</p>
            </div>
            <p className="mt-1 text-[13px] text-[#8A8060]" style={{ fontFamily: 'DM Sans, sans-serif' }}>Confirm items before checkout</p>
          </div>
          <button type="button" onClick={close} className="flex h-9 w-9 items-center justify-center rounded-full border border-[#2E2B1F] bg-[#1A1810]">
            <X className="h-4 w-4 text-white" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-4 py-3 scrollbar-hide">
          {cartItems.length === 0 ? <EmptyState /> : (
            <>
              <div className="space-y-2.5">
                {cartItems.map((item) => <ItemCard key={item.id} item={item} size="sm" />)}
              </div>
              <div className="mt-3">
                <SummaryCard size="sm" />
              </div>
            </>
          )}
        </div>

        {/* Sticky CTA */}
        {cartItems.length > 0 && (
          <div className="border-t border-[#2E2B1F] bg-[#0D0C09] px-4 py-3 safe-bottom">
            <button type="button" onClick={handleCheckout}
              className="shimmer-btn flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#F0A500] text-[15px] font-bold text-black active:scale-[0.97]">
              <Lock className="h-4 w-4" />
              {isAuthenticated ? 'Continue to Checkout' : 'Login to Checkout'}
            </button>
          </div>
        )}
      </div>

      {/* ===== DESKTOP: Centered Modal ===== */}
      <div className="fixed inset-0 z-[101] hidden lg:flex items-center justify-center p-8">
        <div className="flex flex-col overflow-hidden rounded-[20px] border border-[#2E2B1F] bg-[#0D0C09]"
          style={{ width: '480px', maxHeight: '80vh', animation: 'fadeInUp 250ms ease' }}>

          {/* Header */}
          <div className="relative px-7 pt-7 pb-4 border-b border-[#2E2B1F]">
            <div className="flex items-center gap-2.5">
              <Shield className="h-[18px] w-[18px] text-[#F0A500]" />
              <p className="text-[24px] text-[#F0A500]" style={{ fontFamily: 'Playfair Display, serif' }}>Review Order</p>
            </div>
            <p className="mt-1.5 text-[14px] text-[#8A8060]" style={{ fontFamily: 'DM Sans, sans-serif' }}>Confirm items before checkout</p>
            <button type="button" onClick={close} className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-full border border-[#2E2B1F] bg-[#1A1810] transition hover:border-[#F0A500]/30">
              <X className="h-4 w-4 text-white" />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-7 py-4" style={{ maxHeight: 'calc(80vh - 180px)', scrollbarWidth: 'thin', scrollbarColor: 'rgba(240,165,0,0.3) transparent' }}>
            {cartItems.length === 0 ? <EmptyState /> : (
              <>
                <div className="space-y-3">
                  {cartItems.map((item) => <ItemCard key={item.id} item={item} size="lg" />)}
                </div>
                <div className="mt-4">
                  <SummaryCard size="lg" />
                </div>
              </>
            )}
          </div>

          {/* CTA */}
          {cartItems.length > 0 && (
            <div className="px-7 pt-4 pb-7">
              <button type="button" onClick={handleCheckout}
                className="shimmer-btn flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#F0A500] text-[15px] font-bold text-black transition hover:brightness-110">
                <Lock className="h-4 w-4" />
                {isAuthenticated ? 'Continue to Checkout' : 'Login to Checkout'}
              </button>
              <p className="mt-2 text-center text-[11px] text-[#6B6B6B]" style={{ fontFamily: 'DM Sans, sans-serif' }}>🔒 256-bit encrypted • Powered by Razorpay</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
