import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Lock,
  Mail,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  User,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { useAccount } from '../context/AccountContext'
import { useCart } from '../context/CartContext'
import { useSiteSettings } from '../context/SiteContext'
import LocationPicker from '../components/LocationPicker'
import { promoApi, publicApi } from '../lib/api'
import { formatCurrency, normalizePhoneNumber } from '../lib/formatters'
import { STORE_LOCATIONS } from '../../../shared/store-locations'

const RAZORPAY_CHECKOUT_URL = 'https://checkout.razorpay.com/v1/checkout.js'
const STEP_LABELS = ['Contact', 'Pickup', 'Payment']

let razorpayScriptPromise

const initialForm = {
  name: '',
  email: '',
  phone: '',
  whatsapp: '',
  notes: '',
}

function getStoreLocationLabel(locationId) {
  return STORE_LOCATIONS.find((location) => location.id === locationId)?.name || 'Selected store'
}

function buildCustomerPayload({ formData, user }) {
  return {
    name: formData.name.trim(),
    email: formData.email.trim() || user?.email || undefined,
    phone: normalizePhoneNumber(formData.phone),
    whatsapp: formData.whatsapp ? normalizePhoneNumber(formData.whatsapp) : undefined,
  }
}

function loadRazorpayCheckout() {
  if (typeof window === 'undefined') return Promise.reject(new Error('Razorpay checkout is only available in the browser'))
  if (window.Razorpay) return Promise.resolve(window.Razorpay)
  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector(`script[src="${RAZORPAY_CHECKOUT_URL}"]`)
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(window.Razorpay))
        existingScript.addEventListener('error', () => reject(new Error('Could not load Razorpay checkout')))
        return
      }
      const script = document.createElement('script')
      script.src = RAZORPAY_CHECKOUT_URL
      script.async = true
      script.onload = () => resolve(window.Razorpay)
      script.onerror = () => reject(new Error('Could not load Razorpay checkout'))
      document.body.appendChild(script)
    })
  }
  return razorpayScriptPromise
}

function warmRazorpayCheckout() {
  loadRazorpayCheckout().catch(() => null)
}

function SectionHeading({ eyebrow, title, description, action }) {
  const stepMatch = /^Step\s+(\d+)/i.exec(eyebrow || '')
  if (stepMatch) {
    return (
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F0A500] font-sans text-[13px] font-semibold text-white">{stepMatch[1]}</span>
            <h2 className="ml-3 font-sans text-[18px] font-semibold leading-none text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>{title}</h2>
          </div>
          {description && <p className="mt-3 max-w-2xl font-sans text-[13px] leading-6 text-[var(--text-muted)]">{description}</p>}
        </div>
        {action}
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div>
        <p className="font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--text-subtle)]">{eyebrow}</p>
        <h2 className="mt-2 text-left text-[28px] leading-none text-gold" style={{ fontFamily: 'Playfair Display, serif', textTransform: 'none' }}>{title}</h2>
        {description && <p className="mt-3 max-w-2xl font-sans text-[13px] leading-6 text-[var(--text-muted)]">{description}</p>}
      </div>
      {action}
    </div>
  )
}

function StepNav({ step, setStep, onSubmit, isSubmitting, submitLabel, canGoNext, nextLabel }) {
  return (
    <div className="mt-6 hidden lg:flex items-center justify-between gap-3">
      {step > 1 ? (
        <button type="button" onClick={() => setStep(step - 1)} className="flex items-center gap-2 rounded-full border border-gold/30 px-5 py-3 text-[13px] font-medium text-gold transition hover:bg-gold/10">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      ) : <div />}
      {step < 3 ? (
        <button type="button" onClick={canGoNext} className="cta-shimmer px-6 py-3 text-[14px] flex items-center gap-2">
          {nextLabel} <ArrowRight className="h-4 w-4" />
        </button>
      ) : (
        <button type="submit" form="order-checkout-form" disabled={isSubmitting} className="cta-shimmer px-6 py-3 text-[14px] flex items-center justify-center gap-2">
          {submitLabel}
        </button>
      )}
    </div>
  )
}

export default function OrderPage() {
  const navigate = useNavigate()
  const { user, refreshProfile } = useAccount()
  const { cartItems, removeFromCart, updateQuantity, total, clearCart } = useCart()
  const { siteSettings } = useSiteSettings()

  const [formData, setFormData] = useState(initialForm)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [promoCodeInput, setPromoCodeInput] = useState('')
  const [appliedPromoCode, setAppliedPromoCode] = useState('')
  const [promoPreview, setPromoPreview] = useState(null)
  const [promoError, setPromoError] = useState('')
  const [promoNotice, setPromoNotice] = useState('')
  const [isApplyingPromo, setIsApplyingPromo] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [onlinePaymentStatus, setOnlinePaymentStatus] = useState('')
  const [pendingOnlineOrder, setPendingOnlineOrder] = useState(null)
  const [orderResult, setOrderResult] = useState(null)
  const [checkoutStep, setCheckoutStep] = useState(1)
  const [orderDrawerOpen, setOrderDrawerOpen] = useState(false)
  const [storeLocation, setStoreLocation] = useState('')

  const restaurantName = siteSettings?.restaurantName || 'PalavuCentre'

  const taxPercent = Number(siteSettings?.ordering?.taxPercent || 0)
  const estimatedDeliveryFee = 0
  const estimatedTax = total * (taxPercent / 100)
  const estimatedGrandTotal = total + estimatedTax
  const totalItems = cartItems.reduce((count, item) => count + item.quantity, 0)

  const baseOrderPreview = useMemo(() => ({
    subTotal: total, discountAmount: 0, discountedSubTotal: total,
    deliveryFee: estimatedDeliveryFee, taxAmount: estimatedTax, grandTotal: estimatedGrandTotal,
  }), [estimatedDeliveryFee, estimatedGrandTotal, estimatedTax, total])

  const orderPreview = promoPreview?.pricing && Number(promoPreview.pricing.subTotal) === Number(total) ? promoPreview.pricing : baseOrderPreview

  const submitButtonLabel = isSubmitting
    ? paymentMethod === 'online' ? 'Processing Payment...' : 'Placing order...'
    : paymentMethod === 'online'
      ? pendingOnlineOrder?.order?.orderNumber
        ? 'Retry Razorpay Payment \u2192'
        : `Pay with Razorpay (${formatCurrency(orderPreview.grandTotal)}) \u2192`
      : 'Place Pickup Order \u2192'

  const onlinePaymentHelperText = isSubmitting
    ? onlinePaymentStatus || 'Preparing secure payment...'
    : pendingOnlineOrder?.order?.orderNumber
      ? `Order ${pendingOnlineOrder.order.orderNumber} is awaiting payment. Tap once to reopen Razorpay safely.`
      : 'You will review and complete payment in Razorpay, then return here with confirmation.'

  useEffect(() => {
    setFormData((c) => ({
      ...c,
      name: c.name || user?.name || '',
      email: c.email || user?.email || '',
      phone: c.phone || '',
      whatsapp: c.whatsapp || '',
    }))
  }, [user?.email, user?.name])

  useEffect(() => {
    if (cartItems.length === 0) return undefined
    const scheduler = typeof window !== 'undefined' && 'requestIdleCallback' in window
      ? window.requestIdleCallback(() => warmRazorpayCheckout(), { timeout: 1500 })
      : window.setTimeout(() => warmRazorpayCheckout(), 900)
    return () => {
      if (typeof window !== 'undefined' && 'cancelIdleCallback' in window && typeof scheduler === 'number') { window.cancelIdleCallback(scheduler); return }
      window.clearTimeout(scheduler)
    }
  }, [cartItems.length])

  useEffect(() => { if (paymentMethod === 'online') warmRazorpayCheckout() }, [paymentMethod])

  useEffect(() => {
    if (!appliedPromoCode || !promoPreview) return
    if (Number(promoPreview.pricing?.subTotal) === Number(total)) return
    let isCurrent = true
    const refreshPromo = async () => {
      try {
        setIsApplyingPromo(true)
        const r = await promoApi.apply({ code: appliedPromoCode, subTotal: total })
        if (!isCurrent) return
        setPromoPreview(r.data); setPromoNotice(`${r.data.promoCode.code} applied`); setPromoError('')
      } catch (e) {
        if (!isCurrent) return
        setAppliedPromoCode(''); setPromoPreview(null); setPromoError(e.message || 'Cart changed. Reapply the promo code.'); setPromoNotice('')
      } finally { if (isCurrent) setIsApplyingPromo(false) }
    }
    refreshPromo()
    return () => { isCurrent = false }
  }, [appliedPromoCode, promoPreview, total])

  const handleChange = (e) => {
    const { name, value } = e.target
    const v = name === 'phone' || name === 'whatsapp' ? normalizePhoneNumber(value).slice(0, 10) : value
    setFormData((c) => ({ ...c, [name]: v }))
  }

  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim() || cartItems.length === 0) return
    try {
      setIsApplyingPromo(true); setPromoError(''); setPromoNotice('')
      const r = await promoApi.apply({ code: promoCodeInput.trim(), subTotal: total })
      setPromoPreview(r.data); setAppliedPromoCode(r.data.promoCode.code); setPromoCodeInput(r.data.promoCode.code); setPromoNotice(`${r.data.promoCode.code} applied`)
    } catch (e) {
      setAppliedPromoCode(''); setPromoPreview(null); setPromoError(e.message || 'Could not apply promo code'); setPromoNotice('')
    } finally { setIsApplyingPromo(false) }
  }

  const handleRemovePromo = () => { setAppliedPromoCode(''); setPromoCodeInput(''); setPromoPreview(null); setPromoError(''); setPromoNotice('') }

  const openRazorpayCheckout = async ({ order, razorpay, customer, checkoutLoader, onStatusChange }) => {
    const Rp = checkoutLoader ? await checkoutLoader : await loadRazorpayCheckout()
    if (!Rp) throw new Error('Razorpay checkout is unavailable')
    return new Promise((resolve, reject) => {
      let settled = false
      const inst = new Rp({
        key: razorpay.keyId, amount: razorpay.amountPaise, currency: razorpay.currency,
        name: restaurantName, description: `Order ${order.orderNumber}`, order_id: razorpay.orderId,
        prefill: { name: customer.name, email: customer.email, contact: customer.phone },
        theme: { color: '#F0A500' },
        modal: {
          ondismiss: () => {
            if (settled) return; settled = true
            onStatusChange?.('Payment window was closed. You can reopen it safely.')
            const err = new Error(`Payment not completed for order ${order.orderNumber}. You can retry it.`); err.code = 'PAYMENT_DISMISSED'; reject(err)
          },
        },
        handler: async (pr) => {
          try {
            onStatusChange?.('Payment received. Verifying with the restaurant...')
            const vr = await publicApi.verifyRazorpayPayment({ razorpayOrderId: pr.razorpay_order_id, razorpayPaymentId: pr.razorpay_payment_id, razorpaySignature: pr.razorpay_signature, payload: pr })
            settled = true; resolve(vr.data)
          } catch (e) { settled = true; reject(e) }
        },
      })
      inst.on('payment.failed', (ev) => {
        if (settled) return; settled = true
        onStatusChange?.('Payment failed. Please retry to continue.')
        const err = new Error(ev?.error?.description || ev?.error?.reason || `Payment failed for order ${order.orderNumber}`); err.code = 'PAYMENT_FAILED'; reject(err)
      })
      onStatusChange?.('Opening Razorpay secure payment window...'); inst.open()
    })
  }

  const handleSubmitOrder = async (e) => {
    e.preventDefault()
    if (cartItems.length === 0) return
    try {
      setIsSubmitting(true); setError('')
      if (paymentMethod === 'online') setOnlinePaymentStatus('Preparing secure checkout...')
      const checkoutLoader = paymentMethod === 'online' ? loadRazorpayCheckout().catch(() => null) : null
      const customer = buildCustomerPayload({ formData, user })
      let orderPayload = pendingOnlineOrder
      if (paymentMethod === 'online' && orderPayload?.order?.orderNumber) {
        setOnlinePaymentStatus('Refreshing your pending payment session...')
        const gr = await publicApi.createRazorpayOrder({ orderNumber: orderPayload.order.orderNumber, phone: customer.phone })
        orderPayload = { ...orderPayload, razorpay: gr.data }
        setPendingOnlineOrder(orderPayload)
      }
      if (!orderPayload) {
        if (paymentMethod === 'online') setOnlinePaymentStatus('Creating your order and payment request...')
        const r = await publicApi.createOrder({
          customer, items: cartItems.map((i) => ({ menuItemId: i.id, quantity: i.quantity })),
          paymentMethod, source: 'web', notes: formData.notes.trim() || undefined,
          promoCode: appliedPromoCode || undefined,
          storeLocation: storeLocation || undefined,
        })
        orderPayload = r.data
      }
      if (paymentMethod === 'online') {
        setPendingOnlineOrder(orderPayload)
        if (!orderPayload?.razorpay?.orderId) {
          setError(orderPayload?.paymentError?.message || 'Could not start Razorpay payment. Please retry or choose cash at pickup.')
          setOnlinePaymentStatus(
            orderPayload?.order?.orderNumber
              ? `Order ${orderPayload.order.orderNumber} is awaiting payment. Tap once to reopen Razorpay safely.`
              : '',
          )
          return
        }
        setOnlinePaymentStatus('Redirecting you to Razorpay...')
        const vo = await openRazorpayCheckout({ order: orderPayload.order, razorpay: orderPayload.razorpay, customer, checkoutLoader, onStatusChange: setOnlinePaymentStatus })
        setOrderResult(vo); setPendingOnlineOrder(null); setOnlinePaymentStatus('')
      } else {
        setOrderResult(orderPayload.order); setPendingOnlineOrder(null)
      }
      clearCart(); await refreshProfile()
    } catch (re) {
      setError(re.message || (paymentMethod === 'online' ? 'Could not start or verify your online payment' : 'Could not place your order'))
      if (paymentMethod === 'online' && !pendingOnlineOrder?.order?.orderNumber) setOnlinePaymentStatus('')
    } finally { setIsSubmitting(false) }
  }

  const goToStep2 = () => {
    const phone = normalizePhoneNumber(formData.phone)
    const whatsapp = normalizePhoneNumber(formData.whatsapp)
    if (!formData.name.trim() || !phone) { setError('Please fill name and phone'); return }
    if (!/^\d{10}$/.test(phone)) { setError('Please enter a valid 10-digit phone number'); return }
    if (whatsapp && !/^\d{10}$/.test(whatsapp)) { setError('Please enter a valid 10-digit WhatsApp number'); return }
    setError(''); setCheckoutStep(2)
  }
  const goToStep3 = () => {
    if (!storeLocation) { setError('Please select a store location'); return }
    setError(''); setCheckoutStep(3)
  }

  if (orderResult) {
    return (
      <div className="min-h-screen bg-[#0D0C09] px-4 pt-20 pb-12 sm:pt-24">
        <div className="mx-auto max-w-[520px]">

          {/* Success header */}
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/25">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
            <p className="mt-4 text-[28px] font-bold text-[#F8F1DE] sm:text-[34px]" style={{ fontFamily: 'Playfair Display, serif' }}>Order Confirmed</p>
            <p className="mt-2 text-[14px] text-[#8A8060]" style={{ fontFamily: 'DM Sans, sans-serif' }}>Your order is being prepared for pickup. Track it with your order number and phone.</p>
          </div>

          {/* Order number card */}
          <div className="mt-6 rounded-[14px] border border-[#F0A500]/25 bg-[#F0A500]/5 p-4 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#F0A500]/60" style={{ fontFamily: 'DM Sans, sans-serif' }}>Order Number</p>
            <p className="mt-1 text-[18px] font-bold text-[#F0A500] sm:text-[20px]" style={{ fontFamily: 'DM Sans, sans-serif' }}>{orderResult.orderNumber}</p>
            <p className="mt-1 text-[11px] uppercase tracking-wider text-[#8A8060]">{orderResult.paymentMethod === 'online' ? 'Paid Online' : 'Cash at Pickup'}</p>
          </div>

          {/* Details grid */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-[14px] border border-[#2E2B1F] bg-[#1A1810] p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A8060]" style={{ fontFamily: 'DM Sans, sans-serif' }}>Payment</p>
              <p className="mt-1.5 text-[14px] font-semibold capitalize text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>{orderResult.paymentMethod}</p>
              <p className="mt-0.5 text-[12px] capitalize text-[#8A8060]">{orderResult.paymentStatus}</p>
            </div>
            <div className="rounded-[14px] border border-[#2E2B1F] bg-[#1A1810] p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A8060]" style={{ fontFamily: 'DM Sans, sans-serif' }}>Total</p>
              <p className="mt-1.5 text-[20px] font-bold text-[#F0A500]" style={{ fontFamily: 'DM Sans, sans-serif' }}>{formatCurrency(orderResult.pricing?.grandTotal)}</p>
              <p className="mt-0.5 text-[12px] capitalize text-[#8A8060]">{orderResult.orderStatus}</p>
            </div>
          </div>

          <div className="mt-3 rounded-[14px] border border-[#2E2B1F] bg-[#1A1810] p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A8060]" style={{ fontFamily: 'DM Sans, sans-serif' }}>Pickup Store</p>
            <p className="mt-1.5 text-[13px] leading-[1.6] text-[#B0A880]" style={{ fontFamily: 'DM Sans, sans-serif' }}>{getStoreLocationLabel(orderResult.storeLocation)}</p>
          </div>

          {/* Order items */}
          <div className="mt-3 rounded-[14px] border border-[#2E2B1F] bg-[#1A1810] p-3.5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A8060]" style={{ fontFamily: 'DM Sans, sans-serif' }}>Items</p>
              <span className="text-[11px] text-[#8A8060]">{orderResult.items?.length || 0} items</span>
            </div>
            <div className="mt-3 space-y-2.5">
              {orderResult.items?.map((item, index) => (
                <div key={`${item.name}-${index}`} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-medium text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>{item.name}</p>
                    <p className="text-[12px] text-[#8A8060]">{item.quantity} x {formatCurrency(item.unitPrice)}</p>
                  </div>
                  <p className="shrink-0 text-[14px] font-bold text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>{formatCurrency(item.total)}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 border-t border-[#2E2B1F] pt-3 space-y-1.5 text-[13px]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              <div className="flex justify-between"><span className="text-[#8A8060]">Subtotal</span><span className="text-white">{formatCurrency(orderResult.pricing?.subTotal)}</span></div>
              <div className="flex justify-between"><span className="text-[#8A8060]">Tax</span><span className="text-white">{formatCurrency(orderResult.pricing?.taxAmount)}</span></div>
              <div className="flex justify-between border-t border-[#2E2B1F] pt-2 text-[15px] font-bold"><span className="text-[#F0A500]">Total</span><span className="text-[#F0A500]">{formatCurrency(orderResult.pricing?.grandTotal)}</span></div>
            </div>
          </div>

          {/* What happens next */}
          <div className="mt-3 rounded-[14px] border border-[#2E2B1F] bg-[#1A1810] p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A8060]" style={{ fontFamily: 'DM Sans, sans-serif' }}>What Happens Next</p>
            <div className="mt-3 space-y-0">
              {['Kitchen accepts your order', 'Track status with order number and phone', 'Pick up from the selected store'].map((text, i) => (
                <div key={i}>
                  <div className="flex items-center gap-3 py-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F0A500]/15 text-[10px] font-bold text-[#F0A500]">{i + 1}</span>
                    <p className="text-[13px] text-[#B0A880]" style={{ fontFamily: 'DM Sans, sans-serif' }}>{text}</p>
                  </div>
                  {i < 2 && <div className="ml-2.5 h-px bg-[#2E2B1F]" />}
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-5 space-y-3">
            <button type="button" onClick={() => navigate('/profile?tab=orders', { state: { justOrdered: true } })}
              className="shimmer-btn flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#F0A500] text-[15px] font-bold text-black active:scale-[0.97]">
              My Orders
            </button>
            <Link to="/menu" className="flex h-[48px] w-full items-center justify-center rounded-xl border border-[#2E2B1F] text-[14px] font-medium text-[#8A8060] transition hover:border-[#F0A500]/30 hover:text-[#F0A500]">
              Browse Menu
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-bg-page px-4 pb-16 pt-28">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-[36px] border border-gold/15 bg-black/30 p-8 text-center shadow-[0_30px_100px_rgba(0,0,0,0.55)] backdrop-blur md:p-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gold/10 text-gold"><ShoppingBag className="h-10 w-10" /></div>
            <h1 className="mt-6 text-[40px] leading-none md:text-[54px]">Your cart is empty</h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-text-secondary">Add items from the menu, then return to checkout.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link to="/menu" className="brand-primary-btn px-6 py-4 text-[12px]">Browse Menu</Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-screen overflow-x-hidden bg-bg-page pt-[116px] lg:pt-20 animate-page-mount">
      {/* Step progress bar */}
      <div className="bg-[#1C1A14] border-b border-[#2E2B1F]" style={{ padding: '12px 16px' }}>
        <div className="mx-auto flex max-w-[420px] items-center">
          {STEP_LABELS.map((label, i) => {
            const sn = i + 1
            const done = checkoutStep > sn
            const active = checkoutStep === sn
            const isLast = i === STEP_LABELS.length - 1
            return (
              <div key={label} className="flex flex-1 items-center">
                <button type="button" onClick={() => sn < checkoutStep && setCheckoutStep(sn)} disabled={sn > checkoutStep} className="flex flex-col items-center gap-1.5 transition">
                  <div className="relative">
                    {active && <div className="absolute -inset-2 rounded-full bg-[#F0A500]/20 blur-md" />}
                    <div className={`relative flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-bold transition-all duration-200 ${
                      done ? 'bg-[#F0A500] text-white'
                      : active ? 'bg-[#F0A500] text-white shadow-[0_0_16px_rgba(240,165,0,0.35)]'
                      : 'border-2 border-[#3A3A3A] bg-transparent text-[#6B6B6B]'
                    }`}>
                      {done ? <Check className="h-4 w-4" /> : sn}
                    </div>
                  </div>
                  <span className={`text-[11px] font-medium tracking-wide transition-colors duration-200 ${
                    active ? 'text-[#F0A500]' : done ? 'text-[#F0A500]/60' : 'text-[#6B6B6B]'
                  }`} style={{ fontFamily: 'DM Sans, sans-serif' }}>{label}</span>
                </button>
                {!isLast && (
                  <div className={`mx-1.5 h-[2px] flex-1 rounded-full transition-colors duration-300 ${
                    checkoutStep > sn + 1 ? 'bg-[#F0A500]' : checkoutStep > sn ? 'bg-[#F0A500]/50' : 'bg-[#2A2A2A]'
                  }`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Mobile expandable order drawer */}
      <div className="fixed top-16 inset-x-0 z-50 lg:hidden">
        <button type="button" onClick={() => setOrderDrawerOpen((p) => !p)}
          className="flex h-[52px] w-full items-center justify-between border-b border-[#2E2B1F] bg-[#1A1810] px-4 active:bg-[#222010]">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="h-[18px] w-[18px] text-[#F0A500]" />
            <span className="text-[14px] text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>{totalItems} {totalItems === 1 ? 'item' : 'items'} &middot; {formatCurrency(orderPreview.grandTotal)}</span>
          </div>
          <div className="flex items-center gap-1 text-[12px] text-[#F0A500]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            {orderDrawerOpen ? <><span>Hide Order</span><ChevronUp className="h-3.5 w-3.5" /></> : <><span>View Order</span><ChevronDown className="h-3.5 w-3.5" /></>}
          </div>
        </button>
        <div className={`overflow-hidden border-b transition-all duration-300 ease-out ${orderDrawerOpen ? 'max-h-[600px] border-[#F0A500]/20 opacity-100' : 'max-h-0 border-transparent opacity-0'}`}>
          <div className="bg-[#1A1810] px-4 pb-4 pt-2">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center py-6 text-center">
                <ShoppingBag className="h-8 w-8 text-[#F0A500]/40" />
                <p className="mt-2 text-[14px] font-medium text-white">Your order is empty</p>
                <Link to="/menu" className="mt-2 text-[13px] font-medium text-[#F0A500]">Browse Menu</Link>
              </div>
            ) : (
              <>
                <div className="space-y-2 max-h-[250px] overflow-y-auto scrollbar-hide">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 rounded-lg bg-[#111009] p-2.5">
                      {item.img ? <img src={item.img} alt={item.name} className="h-10 w-10 shrink-0 rounded-lg object-cover" /> : <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F0A500]/10"><ShoppingBag className="h-4 w-4 text-[#F0A500]" /></div>}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-semibold text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>{item.name}</p>
                        <p className="text-[12px] text-[#8A8060]">{formatCurrency(item.price)} each</p>
                      </div>
                      {checkoutStep < 3 ? (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="flex h-6 w-6 items-center justify-center rounded-full border border-[#F0A500]/30 text-[#F0A500]"><Minus className="h-3 w-3" /></button>
                          <span className="w-5 text-center text-[13px] font-bold text-white">{item.quantity}</span>
                          <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="flex h-6 w-6 items-center justify-center rounded-full border border-[#F0A500]/30 text-[#F0A500]"><Plus className="h-3 w-3" /></button>
                        </div>
                      ) : <span className="text-[12px] text-[#8A8060] shrink-0">x{item.quantity}</span>}
                      <p className="shrink-0 w-14 text-right text-[14px] font-bold text-white">{formatCurrency(item.price * item.quantity)}</p>
                      {checkoutStep < 3 && <button type="button" onClick={() => removeFromCart(item.id)} className="shrink-0 text-[#FF4444]"><Trash2 className="h-[18px] w-[18px]" /></button>}
                    </div>
                  ))}
                </div>
                <div className="mt-3 border-t border-[#2E2B1F] pt-3 space-y-1.5 text-[13px]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  <div className="flex justify-between text-[#B0A880]"><span>Subtotal</span><span className="text-white">{formatCurrency(orderPreview.subTotal)}</span></div>
                  {orderPreview.discountAmount > 0 && <div className="flex justify-between"><span className="text-[#4CAF50]">Promo{appliedPromoCode ? ` (${appliedPromoCode})` : ''}</span><span className="text-[#4CAF50]">- {formatCurrency(orderPreview.discountAmount)}</span></div>}
                  <div className="flex justify-between pt-1.5 border-t border-[#2E2B1F] text-[16px] font-bold"><span className="text-[#F0A500]">Total</span><span className="text-[#F0A500]">{formatCurrency(orderPreview.grandTotal)}</span></div>
                </div>
                <button type="button" onClick={() => setOrderDrawerOpen(false)} className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#F0A500]/15 text-[14px] font-bold text-[#F0A500] active:scale-[0.97]">
                  Continue to Checkout <ArrowRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1100px] px-3 pb-12 pt-4 sm:px-4 md:pt-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <form id="order-checkout-form" onSubmit={handleSubmitOrder} className="space-y-6">
            {error && (<div className="rounded-[20px] border border-red-500/30 bg-red-950/35 px-5 py-4 text-sm text-red-100">{error}</div>)}

            {/* STEP 1: Contact */}
            {checkoutStep === 1 && (
              <section className="step-card animate-auth-step">
                <SectionHeading eyebrow="Step 1" title="Contact Details" description="Confirm the contact details we should use for this order." />
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--gold-border)] bg-[var(--bg-card-hover)] px-4 py-2 font-sans text-[12px] text-[var(--text-muted)]">
                  <Mail className="h-3 w-3 text-gold" /> Signed in as <span className="font-medium text-[var(--text-primary)]">{user?.email}</span>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="ml-1 font-sans text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">Full Name</span>
                    <input required name="name" value={formData.name} onChange={handleChange} placeholder="Your full name" autoCapitalize="words" className="brand-input h-[46px] px-4 py-0" />
                  </label>
                  <label className="space-y-2">
                    <span className="ml-1 font-sans text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">Email</span>
                    <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="name@example.com" className="brand-input h-[46px] py-0" />
                  </label>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="ml-1 font-sans text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">Phone</span>
                    <input required type="tel" name="phone" maxLength="20" value={formData.phone} onChange={handleChange} placeholder="10-digit mobile" inputMode="tel" className="brand-input h-[46px] px-4 py-0" />
                  </label>
                  <label className="space-y-2">
                    <span className="ml-1 font-sans text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">WhatsApp</span>
                    <input type="tel" name="whatsapp" maxLength="20" value={formData.whatsapp} onChange={handleChange} placeholder="Optional" inputMode="tel" className="brand-input h-[46px] px-4 py-0" />
                  </label>
                </div>
                <StepNav step={1} setStep={setCheckoutStep} canGoNext={goToStep2} nextLabel="Next: Pickup" submitLabel={submitButtonLabel} isSubmitting={isSubmitting} />
              </section>
            )}

            {/* STEP 2: Pickup */}
            {checkoutStep === 2 && (
              <section className="step-card animate-auth-step">
                <SectionHeading eyebrow="Step 2" title="Pickup Store" description="Choose where you will collect this order." />

                <div className="mt-4 rounded-[16px] border border-[var(--border)] bg-black/20 p-[18px]">
                  <LocationPicker selected={storeLocation} onSelect={setStoreLocation} />
                </div>

                <div className="mt-4 rounded-[16px] border border-[var(--border)] bg-black/20 p-[18px]">
                  <label className="block space-y-2">
                    <span className="ml-1 font-sans text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">Order Notes</span>
                    <input name="notes" value={formData.notes} onChange={handleChange} placeholder="Optional cooking or pickup note" className="brand-input h-[46px] py-0" />
                  </label>
                </div>

                <StepNav step={2} setStep={setCheckoutStep} canGoNext={goToStep3} nextLabel="Next: Payment" submitLabel={submitButtonLabel} isSubmitting={isSubmitting} />
              </section>
            )}

            {/* STEP 3: Payment */}
            {checkoutStep === 3 && (
              <section className="animate-auth-step rounded-[14px] border border-[#2E2B1F] bg-[#1C1A14] p-4 sm:p-5">
                {/* Heading */}
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F0A500] text-[14px] font-bold text-black">3</span>
                  <p className="text-[22px] text-[#F0A500]" style={{ fontFamily: 'Playfair Display, serif' }}>Payment</p>
                </div>
                <p className="mt-2 text-[13px] text-[#8A8060]" style={{ fontFamily: 'DM Sans, sans-serif' }}>Choose payment and apply a promo.</p>

                {/* Payment options */}
                <div className="mt-5 space-y-3">
                  <button type="button" onClick={() => setPaymentMethod('cod')}
                    className={`w-full rounded-[14px] border text-left transition-all duration-200 ${paymentMethod === 'cod' ? 'border-[#F0A500] border-l-[3px] bg-[#F0A500]/[0.025]' : 'border-[#2E2B1F] bg-[#1C1A14] hover:border-[#3A3520]'}`} style={{ padding: '18px 16px' }}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[15px] font-semibold text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>Cash at Pickup</p>
                        <p className="mt-1 text-[12px] text-[#8A8060]" style={{ fontFamily: 'DM Sans, sans-serif' }}>Pay at the counter when you collect your order.</p>
                      </div>
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-[#F0A500] transition-all duration-200 ${paymentMethod === 'cod' ? 'bg-[#F0A500]' : 'bg-transparent'}`}>
                        {paymentMethod === 'cod' && <Check className="h-3 w-3 text-white" />}
                      </span>
                    </div>
                  </button>

                  <button type="button" onClick={() => setPaymentMethod('online')}
                    className={`w-full rounded-[14px] border text-left transition-all duration-200 ${paymentMethod === 'online' ? 'border-[#F0A500] border-l-[3px] bg-[#F0A500]/[0.025]' : 'border-[#2E2B1F] bg-[#1C1A14] hover:border-[#3A3520]'}`} style={{ padding: '18px 16px' }}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[15px] font-semibold text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>Razorpay Secure Payment</p>
                        <p className="mt-1 text-[12px] text-[#8A8060]" style={{ fontFamily: 'DM Sans, sans-serif' }}>Cards, UPI, netbanking, or wallet.</p>
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          <span className="rounded-md border border-[#2A5A2A] bg-[#1A2A1A] text-[10px] font-bold uppercase text-[#4CAF50]" style={{ padding: '3px 8px', borderRadius: '6px' }}>PCI-DSS Secure</span>
                          <span className="rounded-md border border-[#2A3A5A] bg-[#1A1F2A] text-[10px] font-bold uppercase text-[#5B9CF6]" style={{ padding: '3px 8px', borderRadius: '6px' }}>Instant Verification</span>
                        </div>
                      </div>
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-[#F0A500] transition-all duration-200 ${paymentMethod === 'online' ? 'bg-[#F0A500]' : 'bg-transparent'}`}>
                        {paymentMethod === 'online' && <Check className="h-3 w-3 text-white" />}
                      </span>
                    </div>
                  </button>
                </div>

                {/* How payment works */}
                {paymentMethod === 'online' && (
                  <div className="mt-4 rounded-[14px] border border-[#2E2B1F] bg-[#111009] p-4">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-[#6B6B6B]" style={{ fontFamily: 'DM Sans, sans-serif' }}>How Payment Works</p>
                    <div className="mt-3">
                      {[
                        'We create your order securely.',
                        'Razorpay opens for payment authorization.',
                        'We verify and confirm instantly.',
                      ].map((text, i) => (
                        <div key={i}>
                          <div className="flex items-center gap-3 py-2.5">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F0A500]/15 text-[10px] font-bold text-[#F0A500]">{i + 1}</span>
                            <p className="text-[13px] text-[#B0A880]" style={{ fontFamily: 'DM Sans, sans-serif' }}>{text}</p>
                          </div>
                          {i < 2 && <div className="ml-2.5 h-px bg-[#2E2B1F]" />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {pendingOnlineOrder?.order?.orderNumber && paymentMethod === 'online' && (
                  <div className="mt-3 rounded-[14px] border border-[#F0A500]/20 bg-[#F0A500]/5 px-4 py-3 text-[13px] text-[#F0A500]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    Pending order <span className="font-bold">{pendingOnlineOrder.order.orderNumber}</span> - tap below to reopen payment.
                  </div>
                )}

                {/* Promo code */}
                <div className="mt-4 rounded-[14px] border border-[#2E2B1F] bg-[#111009] p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-[#6B6B6B]" style={{ fontFamily: 'DM Sans, sans-serif' }}>Promo Code</p>
                    {appliedPromoCode && (
                      <button type="button" onClick={handleRemovePromo} className="text-[10px] font-bold uppercase tracking-wider text-red-400 transition hover:text-red-300">Remove</button>
                    )}
                  </div>
                  {!appliedPromoCode && (
                    <div className="mt-3 flex gap-2">
                      <input value={promoCodeInput} onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())} placeholder="Enter code"
                        className={`h-[42px] flex-1 rounded-[10px] border border-[#2E2B1F] bg-[#1C1A14] px-3 text-[14px] font-medium text-white outline-none transition placeholder:text-[#6B6B6B] focus:border-[#F0A500]/50 ${promoError ? 'border-red-500/50' : ''}`} style={{ fontFamily: 'DM Sans, sans-serif' }} />
                      <button type="button" onClick={handleApplyPromo} disabled={isApplyingPromo || !promoCodeInput.trim()}
                        className="h-[42px] rounded-[10px] bg-[#F0A500]/15 px-4 text-[13px] font-bold text-[#F0A500] transition hover:bg-[#F0A500]/25 disabled:opacity-40">
                        {isApplyingPromo ? '...' : 'Apply'}
                      </button>
                    </div>
                  )}
                  {promoNotice && <p className="mt-2 text-[12px] text-emerald-400">{promoNotice}</p>}
                  {promoError && <p className="mt-2 text-[12px] text-red-400">{promoError}</p>}
                </div>

                {paymentMethod === 'online' && (
                  <p className="mt-3 rounded-[10px] border border-[#F0A500]/15 bg-[#F0A500]/5 px-3 py-2 text-[11px] leading-5 text-[#B0A880]" style={{ fontFamily: 'DM Sans, sans-serif' }}>{onlinePaymentHelperText}</p>
                )}

                {/* Place Order CTA - desktop only (mobile uses sticky bottom bar) */}
                <div className="mt-5 hidden lg:flex gap-3">
                  <button type="button" onClick={() => setCheckoutStep(2)} className="flex h-[52px] items-center justify-center gap-1.5 rounded-xl border border-[#2E2B1F] bg-transparent px-5 text-[13px] font-medium text-[#8A8060] transition hover:border-[#F0A500]/30 active:scale-[0.97]">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button type="submit" form="order-checkout-form" disabled={isSubmitting}
                    className="shimmer-btn flex h-[52px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#F0A500] text-[15px] font-bold text-black transition active:scale-[0.97] disabled:opacity-50">
                    <Lock className="h-4 w-4" /> {submitButtonLabel}
                  </button>
                </div>
              </section>
            )}
          </form>

          {/* Order summary sidebar - desktop only */}
          <aside className="hidden lg:block">
            <div className="lg:sticky lg:top-20 rounded-[14px] border border-[#2E2B1F] bg-[#1A1810] overflow-y-auto" style={{ maxHeight: 'calc(100vh - 100px)' }}>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#2E2B1F] px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="h-[18px] w-[18px] text-[#F0A500]" />
                  <span className="text-[14px] font-bold text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>Your Order</span>
                </div>
                <span className="text-[12px] text-[#8A8060]" style={{ fontFamily: 'DM Sans, sans-serif' }}>{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
              </div>

              {/* Items */}
              <div className="px-5 py-4 space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    {item.img ? (
                      <img src={item.img} alt={item.name} className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F0A500]/10"><ShoppingBag className="h-4 w-4 text-[#F0A500]" /></div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-semibold text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>{item.name}</p>
                      <p className="text-[12px] text-[#8A8060]" style={{ fontFamily: 'DM Sans, sans-serif' }}>{formatCurrency(item.price)} each</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="flex h-6 w-6 items-center justify-center rounded-full border border-[#F0A500]/30 text-[#F0A500] transition hover:bg-[#F0A500]/10"><Minus className="h-3 w-3" /></button>
                      <span className="w-5 text-center text-[13px] font-bold text-white">{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="flex h-6 w-6 items-center justify-center rounded-full border border-[#F0A500]/30 text-[#F0A500] transition hover:bg-[#F0A500]/10"><Plus className="h-3 w-3" /></button>
                    </div>
                    <p className="shrink-0 w-16 text-right text-[14px] font-bold text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>{formatCurrency(item.price * item.quantity)}</p>
                    <button type="button" onClick={() => removeFromCart(item.id)} className="shrink-0 text-[#FF4444] transition hover:text-[#FF6666]"><Trash2 className="h-[18px] w-[18px]" /></button>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-[#2E2B1F] px-5 py-4 space-y-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                <div className="flex justify-between text-[13px]"><span className="text-[#B0A880]">Subtotal</span><span className="text-white">{formatCurrency(orderPreview.subTotal)}</span></div>
                {orderPreview.discountAmount > 0 && (
                  <div className="flex justify-between text-[13px]"><span className="text-[#4CAF50]">Promo{appliedPromoCode ? ` (${appliedPromoCode})` : ''}</span><span className="text-[#4CAF50]">- {formatCurrency(orderPreview.discountAmount)}</span></div>
                )}
                <div className="flex justify-between text-[13px]"><span className="text-[#B0A880]">Tax ({taxPercent}%)</span><span className="text-white">{formatCurrency(orderPreview.taxAmount)}</span></div>
                <div className="flex justify-between border-t border-[#2E2B1F] pt-3 mt-1 text-[16px] font-bold"><span className="text-[#F0A500]">Total</span><span className="text-[#F0A500]">{formatCurrency(orderPreview.grandTotal)}</span></div>
              </div>

              {/* Back to menu */}
              <div className="border-t border-[#2E2B1F] px-5 py-3">
                <Link to="/menu" className="flex w-full items-center justify-center gap-2 text-[13px] text-[#8A8060] transition hover:text-[#F0A500]" style={{ fontFamily: 'DM Sans, sans-serif' }}>&larr; Back to Menu</Link>
              </div>
            </div>
          </aside>
        {/* Sticky bottom CTA - mobile only */}
        <div className="fixed bottom-0 inset-x-0 z-[60] border-t border-[#2E2B1F] bg-[#0D0C09] px-4 py-3 lg:hidden">
          <div className="mx-auto max-w-[600px]">
            {checkoutStep === 1 && (
              <button type="button" onClick={goToStep2} className="shimmer-btn flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#F0A500] text-[15px] font-bold text-black active:scale-[0.97]">
                Next: Pickup <ArrowRight className="h-4 w-4" />
              </button>
            )}
            {checkoutStep === 2 && (
              <div className="flex gap-3">
                <button type="button" onClick={() => setCheckoutStep(1)} className="flex h-[52px] w-14 shrink-0 items-center justify-center rounded-xl border border-[#2E2B1F] text-[#8A8060] active:scale-[0.95]">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <button type="button" onClick={goToStep3} className="shimmer-btn flex h-[52px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#F0A500] text-[15px] font-bold text-black active:scale-[0.97]">
                  Next: Payment <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
            {checkoutStep === 3 && (
              <div className="flex gap-3">
                <button type="button" onClick={() => setCheckoutStep(2)} className="flex h-[52px] w-14 shrink-0 items-center justify-center rounded-xl border border-[#2E2B1F] text-[#8A8060] active:scale-[0.95]">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <button type="submit" form="order-checkout-form" disabled={isSubmitting} className="shimmer-btn flex h-[52px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#F0A500] text-[15px] font-bold text-black active:scale-[0.97] disabled:opacity-50">
                  <Lock className="h-4 w-4" /> {submitButtonLabel}
                </button>
              </div>
            )}
          </div>
        </div>

        </div>
      </div>
    </div>
  )
}
