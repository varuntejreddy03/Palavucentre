import { ChevronRight, ShoppingBag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { useAccount } from '../context/AccountContext'
import { useCart } from '../context/CartContext'
import { formatCurrency } from '../lib/formatters'
import { ORDER_ROUTE, navigateToLoginWithRedirect } from '../lib/order-flow'

export default function CartBar({ hidden = false, className = '' }) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAccount()
  const { itemCount, total } = useCart()

  if (hidden || itemCount === 0) {
    return null
  }

  const handleCheckoutClick = () => {
    if (isAuthenticated) {
      navigate('/order')
      return
    }

    navigateToLoginWithRedirect(navigate, ORDER_ROUTE, 'checkout')
  }

  return (
    <div className={`fixed inset-x-0 bottom-0 z-[70] px-4 pb-5 sm:px-5 sm:pb-6 ${className}`}>
      <button
        type="button"
        onClick={handleCheckoutClick}
        className="mx-auto flex w-full max-w-[600px] items-center justify-between gap-4 rounded-2xl bg-[#1a1208] border border-gold/25 px-5 py-3.5 text-left shadow-[0_-4px_24px_rgba(0,0,0,0.35),0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl transition hover:border-gold/40 active:scale-[0.98]"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/15 border border-gold/20">
            <ShoppingBag className="h-5 w-5 text-gold" />
          </div>
          <div className="min-w-0">
            <span className="block text-[11px] font-semibold uppercase tracking-wide text-[var(--text-hint)]">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
            <span className="block truncate text-[16px] font-bold text-[var(--text-primary)]">
              {isAuthenticated ? 'Checkout' : 'Login to checkout'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[18px] font-bold text-gold">{formatCurrency(total)}</span>
          <ChevronRight className="h-5 w-5 text-gold" />
        </div>
      </button>
    </div>
  )
}
