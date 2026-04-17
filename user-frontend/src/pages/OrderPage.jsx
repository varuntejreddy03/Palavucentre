import { useEffect, useMemo, useState } from 'react'
import {
  Check,
  CheckCircle2,
  Mail,
  MapPin,
  Minus,
  Plus,
  Receipt,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  User,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { useAccount } from '../context/AccountContext'
import { useCart } from '../context/CartContext'
import { useSiteSettings } from '../context/SiteContext'
import { promoApi, publicApi } from '../lib/api'
import { formatCurrency, normalizePhoneNumber } from '../lib/formatters'

const RAZORPAY_CHECKOUT_URL = 'https://checkout.razorpay.com/v1/checkout.js'

let razorpayScriptPromise

const initialForm = {
  name: '',
  email: '',
  phone: '',
  whatsapp: '',
  address: '',
  city: '',
  notes: '',
}

function buildCustomerPayload({ formData, selectedAddress, user }) {
  if (selectedAddress) {
    const phone = normalizePhoneNumber(formData.phone || selectedAddress.phone)
    const whatsapp = formData.whatsapp ? normalizePhoneNumber(formData.whatsapp) : undefined

    return {
      name: formData.name.trim() || selectedAddress.recipientName,
      email: formData.email.trim() || user?.email || undefined,
      phone,
      whatsapp,
      address: selectedAddress.fullAddress,
      addressLine1: selectedAddress.addressLine1,
      addressLine2: selectedAddress.addressLine2 || undefined,
      landmark: selectedAddress.landmark || undefined,
      city: selectedAddress.city || undefined,
      state: selectedAddress.state || undefined,
      postalCode: selectedAddress.postalCode || undefined,
    }
  }

  return {
    name: formData.name.trim(),
    email: formData.email.trim() || user?.email || undefined,
    phone: normalizePhoneNumber(formData.phone),
    whatsapp: formData.whatsapp ? normalizePhoneNumber(formData.whatsapp) : undefined,
    address: formData.address.trim(),
    city: formData.city.trim() || undefined,
  }
}

function loadRazorpayCheckout() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Razorpay checkout is only available in the browser'))
  }

  if (window.Razorpay) {
    return Promise.resolve(window.Razorpay)
  }

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
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F0A500] font-sans text-[13px] font-semibold text-white">
              {stepMatch[1]}
            </span>
            <h2
              className="ml-3 font-sans text-[18px] font-semibold leading-none text-white"
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              {title}
            </h2>
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
        <h2 className="mt-2 text-left text-[28px] leading-none text-gold" style={{ fontFamily: 'Playfair Display, serif', textTransform: 'none' }}>
          {title}
        </h2>
        {description && <p className="mt-3 max-w-2xl font-sans text-[13px] leading-6 text-[var(--text-muted)]">{description}</p>}
      </div>
      {action}
    </div>
  )
}

function AddressOption({ address, isSelected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-[24px] border px-4 py-4 text-left transition ${
        isSelected ? 'border-gold bg-gold/10 shadow-[0_18px_40px_rgba(212,168,83,0.12)]' : 'border-gold/10 bg-black/20 hover:border-gold/30'
      }`}
    >
      <div className="flex flex-wrap items-center gap-3">
        <p className="font-semibold text-text-primary">{address.label || 'Saved Address'}</p>
        {address.isDefault && (
          <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[2px] text-emerald-200">
            Default
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-text-secondary">
        {address.recipientName} | {address.phone}
      </p>
      <p className="mt-2 text-sm leading-7 text-text-secondary">{address.fullAddress}</p>
    </button>
  )
}

export default function OrderPage() {
  const navigate = useNavigate()
  const { user, profile, refreshProfile } = useAccount()
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
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [useOneTimeAddress, setUseOneTimeAddress] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [onlinePaymentStatus, setOnlinePaymentStatus] = useState('')
  const [pendingOnlineOrder, setPendingOnlineOrder] = useState(null)
  const [orderResult, setOrderResult] = useState(null)

  const savedAddresses = profile?.addresses || []
  const defaultAddress = savedAddresses.find((address) => address.isDefault) || savedAddresses[0] || null
  const selectedAddress = useOneTimeAddress ? null : savedAddresses.find((address) => address.id === selectedAddressId) || null
  const usingSavedAddress = Boolean(selectedAddress)
  const restaurantName = siteSettings?.restaurantName || 'PalavuCentre'

  const taxPercent = Number(siteSettings?.ordering?.taxPercent || 0)
  const deliveryFee = Number(siteSettings?.ordering?.deliveryFee || 0)
  const freeDeliveryThreshold = Number(siteSettings?.ordering?.freeDeliveryThreshold || 0)
  const estimatedDeliveryFee = deliveryFee > 0 && total < freeDeliveryThreshold ? deliveryFee : 0
  const estimatedTax = (total + estimatedDeliveryFee) * (taxPercent / 100)
  const estimatedGrandTotal = total + estimatedDeliveryFee + estimatedTax
  const totalItems = cartItems.reduce((count, item) => count + item.quantity, 0)

  const baseOrderPreview = useMemo(
    () => ({
      subTotal: total,
      discountAmount: 0,
      discountedSubTotal: total,
      deliveryFee: estimatedDeliveryFee,
      taxAmount: estimatedTax,
      grandTotal: estimatedGrandTotal,
    }),
    [estimatedDeliveryFee, estimatedGrandTotal, estimatedTax, total],
  )

  const orderPreview =
    promoPreview?.pricing && Number(promoPreview.pricing.subTotal) === Number(total) ? promoPreview.pricing : baseOrderPreview
  const submitButtonLabel = isSubmitting
    ? paymentMethod === 'online'
      ? 'Processing Payment...'
      : 'Placing order...'
    : paymentMethod === 'online'
      ? pendingOnlineOrder?.order?.orderNumber
        ? 'Retry Razorpay Payment \u2192'
        : `Pay with Razorpay (${formatCurrency(orderPreview.grandTotal)}) \u2192`
      : 'Place COD Order \u2192'
  const onlinePaymentHelperText = isSubmitting
    ? onlinePaymentStatus || 'Preparing secure payment...'
    : pendingOnlineOrder?.order?.orderNumber
      ? `Order ${pendingOnlineOrder.order.orderNumber} is awaiting payment. Tap once to reopen Razorpay safely.`
      : 'You will review and complete payment in Razorpay, then return here with confirmation.'

  useEffect(() => {
    setFormData((current) => ({
      ...current,
      name: current.name || user?.name || '',
      email: current.email || user?.email || '',
      phone: current.phone || defaultAddress?.phone || '',
      whatsapp: current.whatsapp || defaultAddress?.phone || '',
      address: current.address || defaultAddress?.fullAddress || '',
      city: current.city || defaultAddress?.city || '',
    }))

    if (defaultAddress && !selectedAddressId && !useOneTimeAddress) {
      setSelectedAddressId(defaultAddress.id)
    }
  }, [
    defaultAddress,
    selectedAddressId,
    useOneTimeAddress,
    user?.email,
    user?.name,
  ])

  useEffect(() => {
    if (cartItems.length === 0) {
      return undefined
    }

    const scheduler =
      typeof window !== 'undefined' && 'requestIdleCallback' in window
        ? window.requestIdleCallback(() => warmRazorpayCheckout(), { timeout: 1500 })
        : window.setTimeout(() => warmRazorpayCheckout(), 900)

    return () => {
      if (typeof window !== 'undefined' && 'cancelIdleCallback' in window && typeof scheduler === 'number') {
        window.cancelIdleCallback(scheduler)
        return
      }

      window.clearTimeout(scheduler)
    }
  }, [cartItems.length])

  useEffect(() => {
    if (paymentMethod === 'online') {
      warmRazorpayCheckout()
    }
  }, [paymentMethod])

  useEffect(() => {
    if (!appliedPromoCode || !promoPreview) {
      return
    }

    if (Number(promoPreview.pricing?.subTotal) === Number(total)) {
      return
    }

    let isCurrent = true

    const refreshPromoPreview = async () => {
      try {
        setIsApplyingPromo(true)
        const response = await promoApi.apply({
          code: appliedPromoCode,
          subTotal: total,
        })

        if (!isCurrent) {
          return
        }

        setPromoPreview(response.data)
        setPromoNotice(`${response.data.promoCode.code} applied`)
        setPromoError('')
      } catch (requestError) {
        if (!isCurrent) {
          return
        }

        setAppliedPromoCode('')
        setPromoPreview(null)
        setPromoError(requestError.message || 'Cart changed. Reapply the promo code.')
        setPromoNotice('')
      } finally {
        if (isCurrent) {
          setIsApplyingPromo(false)
        }
      }
    }

    refreshPromoPreview()

    return () => {
      isCurrent = false
    }
  }, [appliedPromoCode, promoPreview, total])

  const handleChange = (event) => {
    const { name, value } = event.target
    const normalizedValue =
      name === 'phone' || name === 'whatsapp' ? normalizePhoneNumber(value).slice(0, 10) : value

    setFormData((current) => ({
      ...current,
      [name]: normalizedValue,
    }))
  }

  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim() || cartItems.length === 0) {
      return
    }

    try {
      setIsApplyingPromo(true)
      setPromoError('')
      setPromoNotice('')

      const response = await promoApi.apply({
        code: promoCodeInput.trim(),
        subTotal: total,
      })

      setPromoPreview(response.data)
      setAppliedPromoCode(response.data.promoCode.code)
      setPromoCodeInput(response.data.promoCode.code)
      setPromoNotice(`${response.data.promoCode.code} applied`)
    } catch (requestError) {
      setAppliedPromoCode('')
      setPromoPreview(null)
      setPromoError(requestError.message || 'Could not apply promo code')
      setPromoNotice('')
    } finally {
      setIsApplyingPromo(false)
    }
  }

  const handleRemovePromo = () => {
    setAppliedPromoCode('')
    setPromoCodeInput('')
    setPromoPreview(null)
    setPromoError('')
    setPromoNotice('')
  }

  const openRazorpayCheckout = async ({ order, razorpay, customer, checkoutLoader, onStatusChange }) => {
    const RazorpayCheckout = checkoutLoader ? await checkoutLoader : await loadRazorpayCheckout()

    if (!RazorpayCheckout) {
      throw new Error('Razorpay checkout is unavailable')
    }

    return new Promise((resolve, reject) => {
      let settled = false

      const instance = new RazorpayCheckout({
        key: razorpay.keyId,
        amount: razorpay.amountPaise,
        currency: razorpay.currency,
        name: restaurantName,
        description: `Order ${order.orderNumber}`,
        order_id: razorpay.orderId,
        prefill: {
          name: customer.name,
          email: customer.email,
          contact: customer.phone,
        },
        theme: {
          color: '#F0A500',
        },
        modal: {
          ondismiss: () => {
            if (settled) {
              return
            }

            settled = true
            onStatusChange?.('Payment window was closed. You can reopen it safely.')
            const dismissalError = new Error(`Payment not completed for order ${order.orderNumber}. You can retry it.`)
            dismissalError.code = 'PAYMENT_DISMISSED'
            reject(dismissalError)
          },
        },
        handler: async (paymentResponse) => {
          try {
            onStatusChange?.('Payment received. Verifying with the restaurant...')
            const verificationResponse = await publicApi.verifyRazorpayPayment({
              orderId: order.id,
              razorpayOrderId: paymentResponse.razorpay_order_id,
              razorpayPaymentId: paymentResponse.razorpay_payment_id,
              razorpaySignature: paymentResponse.razorpay_signature,
              payload: paymentResponse,
            })

            settled = true
            resolve(verificationResponse.data)
          } catch (requestError) {
            settled = true
            reject(requestError)
          }
        },
      })

      instance.on('payment.failed', (event) => {
        if (settled) {
          return
        }

        settled = true
        onStatusChange?.('Payment failed. Please retry to continue.')
        const paymentError = new Error(
          event?.error?.description || event?.error?.reason || `Payment failed for order ${order.orderNumber}`,
        )
        paymentError.code = 'PAYMENT_FAILED'
        reject(paymentError)
      })

      onStatusChange?.('Opening Razorpay secure payment window...')
      instance.open()
    })
  }

  const handleSubmitOrder = async (event) => {
    event.preventDefault()

    if (cartItems.length === 0) {
      return
    }

    try {
      setIsSubmitting(true)
      setError('')
      if (paymentMethod === 'online') {
        setOnlinePaymentStatus('Preparing secure checkout...')
      }
      const checkoutLoader = paymentMethod === 'online' ? loadRazorpayCheckout().catch(() => null) : null

      const customer = buildCustomerPayload({
        formData,
        selectedAddress,
        user,
      })

      let orderPayload = pendingOnlineOrder

      if (paymentMethod === 'online' && orderPayload?.order?.id) {
        setOnlinePaymentStatus('Refreshing your pending payment session...')
        const gatewayResponse = await publicApi.createRazorpayOrder({
          orderId: orderPayload.order.id,
        })

        orderPayload = gatewayResponse.data
        setPendingOnlineOrder(gatewayResponse.data)
      }

      if (!orderPayload) {
        if (paymentMethod === 'online') {
          setOnlinePaymentStatus('Creating your order and payment request...')
        }
        const response = await publicApi.createOrder({
          customer,
          items: cartItems.map((item) => ({
            menuItemId: item.id,
            quantity: item.quantity,
          })),
          paymentMethod,
          source: 'web',
          notes: formData.notes.trim() || undefined,
          promoCode: appliedPromoCode || undefined,
          userAddressId: selectedAddress?.id || undefined,
        })

        orderPayload = response.data
      }

      if (paymentMethod === 'online') {
        setPendingOnlineOrder(orderPayload)
        setOnlinePaymentStatus('Redirecting you to Razorpay...')
        const verifiedOrder = await openRazorpayCheckout({
          order: orderPayload.order,
          razorpay: orderPayload.razorpay,
          customer,
          checkoutLoader,
          onStatusChange: setOnlinePaymentStatus,
        })

        setOrderResult(verifiedOrder)
        setPendingOnlineOrder(null)
        setOnlinePaymentStatus('')
      } else {
        setOrderResult(orderPayload.order)
        setPendingOnlineOrder(null)
      }

      clearCart()
      await refreshProfile()
    } catch (requestError) {
      setError(
        requestError.message ||
          (paymentMethod === 'online'
            ? 'Could not start or verify your online payment'
            : 'Could not place your order'),
      )
      if (paymentMethod === 'online' && !pendingOnlineOrder?.order?.orderNumber) {
        setOnlinePaymentStatus('')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (orderResult) {
    return (
      <div className="min-h-screen bg-bg-page px-4 pb-16 pt-28">
        <div className="mx-auto max-w-6xl">
          <div className="overflow-hidden rounded-[36px] border border-gold/15 bg-black/30 shadow-[0_30px_100px_rgba(0,0,0,0.55)] backdrop-blur">
            <div className="relative overflow-hidden border-b border-gold/10 px-6 py-10 md:px-10 md:py-12">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,168,83,0.2),transparent_45%),linear-gradient(135deg,rgba(20,8,4,0.96),rgba(8,4,2,0.98))]"></div>
              <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="inline-flex items-center gap-3 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-4 py-2 text-[11px] font-black uppercase tracking-[3px] text-emerald-200">
                    <CheckCircle2 className="h-4 w-4" />
                    Order Confirmed
                  </div>
                  <h1 className="mt-5 text-left text-[38px] leading-none md:text-[56px]">Order confirmed.</h1>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-text-secondary md:text-base">
                    Payment is complete and your kitchen queue has been updated.
                  </p>
                </div>

                <div className="rounded-[20px] border border-gold/15 bg-black/30 px-5 py-4">
                  <p className="text-[10px] font-black uppercase tracking-[2px] text-gold/70">Order Number</p>
                  <p className="mt-1 text-xl font-black text-gold md:text-2xl">{orderResult.orderNumber}</p>
                  <p className="mt-1 text-xs uppercase tracking-[1.4px] text-text-secondary">{orderResult.paymentMethod === 'online' ? 'Paid online' : 'Cash on delivery'}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 px-6 py-8 md:px-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-[20px] border border-gold/12 bg-[#100603] px-4 py-4">
                    <p className="text-[10px] font-black uppercase tracking-[2px] text-gold/65">Customer</p>
                    <p className="mt-2 font-semibold text-text-primary">{orderResult.customer?.name}</p>
                    <p className="mt-1 text-sm text-text-secondary">{orderResult.customer?.phone}</p>
                  </div>
                  <div className="rounded-[20px] border border-gold/12 bg-[#100603] px-4 py-4">
                    <p className="text-[10px] font-black uppercase tracking-[2px] text-gold/65">Grand Total</p>
                    <p className="mt-2 text-xl font-black text-gold">{formatCurrency(orderResult.pricing?.grandTotal)}</p>
                    <p className="mt-1 text-sm capitalize text-text-secondary">{orderResult.orderStatus}</p>
                  </div>
                  <div className="rounded-[20px] border border-gold/12 bg-[#100603] px-4 py-4 sm:col-span-2 xl:col-span-1">
                    <p className="text-[10px] font-black uppercase tracking-[2px] text-gold/65">Items</p>
                    <p className="mt-2 text-xl font-black text-text-primary">{orderResult.items?.length || 0}</p>
                    <p className="mt-1 text-sm text-text-secondary">In this order</p>
                  </div>
                </div>

                {orderResult.customer?.address && (
                  <div className="rounded-[22px] border border-gold/12 bg-[#100603] px-5 py-4">
                    <p className="text-[10px] font-black uppercase tracking-[2px] text-gold/65">Delivery Address</p>
                    <p className="mt-2 text-sm leading-7 text-text-secondary">{orderResult.customer.address}</p>
                  </div>
                )}

                <div className="rounded-[22px] border border-gold/12 bg-[#100603] px-5 py-5">
                  <p className="text-[11px] font-black uppercase tracking-[2px] text-gold/70">What Happens Next</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[14px] border border-gold/10 bg-black/20 px-3 py-3 text-xs leading-6 text-text-secondary">
                      <span className="font-black text-gold">1.</span> Kitchen accepts your order.
                    </div>
                    <div className="rounded-[14px] border border-gold/10 bg-black/20 px-3 py-3 text-xs leading-6 text-text-secondary">
                      <span className="font-black text-gold">2.</span> Live status updates appear in your account.
                    </div>
                    <div className="rounded-[14px] border border-gold/10 bg-black/20 px-3 py-3 text-xs leading-6 text-text-secondary">
                      <span className="font-black text-gold">3.</span> Delivery partner dispatches and arrives.
                    </div>
                  </div>
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={() => navigate('/profile?tab=orders')}
                      className="brand-primary-btn flex-1 px-5 py-4 text-[12px]"
                    >
                      Open My Orders
                    </button>
                    <Link to="/menu" className="brand-secondary-btn flex-1 px-5 py-4 text-[12px]">
                      Browse Menu
                    </Link>
                  </div>
                </div>
              </div>

              <aside className="rounded-[22px] border border-gold/12 bg-[#100603] p-5">
                <div className="flex items-center justify-between gap-3 border-b border-gold/10 pb-3">
                  <p className="text-[11px] font-black uppercase tracking-[2px] text-gold/70">Order Items</p>
                  <span className="rounded-full border border-gold/20 bg-black/20 px-2.5 py-1 text-[11px] font-semibold text-text-secondary">
                    {orderResult.items?.length || 0} items
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {orderResult.items?.map((item) => (
                    <div key={item.id} className="rounded-[16px] border border-gold/10 bg-black/20 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-text-primary">{item.name}</p>
                          <p className="mt-1 text-sm text-text-secondary">
                            {item.quantity} x {formatCurrency(item.unitPrice)}
                          </p>
                        </div>
                        <p className="font-semibold text-gold">{formatCurrency(item.total)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-[16px] border border-gold/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between text-sm text-text-secondary">
                    <span>Subtotal</span>
                    <span>{formatCurrency(orderResult.pricing?.subTotal)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm text-text-secondary">
                    <span>Tax</span>
                    <span>{formatCurrency(orderResult.pricing?.taxAmount)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm text-text-secondary">
                    <span>Delivery</span>
                    <span>{formatCurrency(orderResult.pricing?.deliveryFee)}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-gold/10 pt-3 text-base font-black text-gold">
                    <span>Total Paid</span>
                    <span>{formatCurrency(orderResult.pricing?.grandTotal)}</span>
                  </div>
                </div>
              </aside>
            </div>
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
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gold/10 text-gold">
              <ShoppingBag className="h-10 w-10" />
            </div>
            <h1 className="mt-6 text-[40px] leading-none md:text-[54px]">Your cart is empty</h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-text-secondary">
              Add items from the menu, then return to checkout.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link to="/menu" className="brand-primary-btn px-6 py-4 text-[12px]">
                Browse Menu
              </Link>
              <Link to="/profile?tab=addresses" className="brand-secondary-btn px-6 py-4 text-[12px]">
                Manage Addresses
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-screen overflow-x-hidden bg-bg-page pt-16 animate-page-mount sm:pt-20">
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#1A1510_0%,#0F0C08_100%)]">
        <div className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:radial-gradient(circle_at_1px_1px,rgba(240,165,0,0.95)_1px,transparent_0)] [background-size:12px_12px]" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(240,165,0,0.18),transparent_34%)]" aria-hidden="true" />

        <div className="relative z-10 mx-auto w-full max-w-6xl px-3 py-8 sm:px-4 sm:py-12 md:px-8 md:py-20">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-3 rounded-full border border-gold/20 bg-[var(--bg-card)] px-4 py-2 font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-gold backdrop-blur">
              <ShieldCheck className="h-4 w-4" />
              Account Checkout
            </div>
            <h1 className="mt-4 text-left text-[32px] leading-none text-gold sm:mt-6 sm:text-[40px] md:text-[54px]">Checkout</h1>
            <p className="mt-3 max-w-3xl font-sans text-[14px] leading-6 text-[var(--text-muted)] md:text-[16px]">
              Saved addresses, faster orders, simple tracking.
            </p>
          </div>

          <div className="mt-6 hidden gap-4 md:mt-10 md:grid md:grid-cols-3">
            {[
              { label: 'Signed in', value: user?.name || 'Account ready', icon: User },
              { label: 'Saved addresses', value: `${savedAddresses.length} saved addresses`, icon: MapPin },
              { label: 'Cart total', value: `${formatCurrency(orderPreview.grandTotal)} total`, icon: Receipt },
            ].map((item) => (
              <div key={item.label} className="group flex items-center gap-3 rounded-[16px] border border-[var(--border)] bg-[var(--bg-card)] px-5 py-4 backdrop-blur transition hover:border-[var(--gold-border)]">
                <item.icon className="h-3.5 w-3.5 shrink-0 text-gold" />
                <div className="min-w-0">
                  <p className="truncate font-sans text-[13px] font-medium text-[var(--text-primary)]">{item.value}</p>
                  <p className="font-sans text-[11px] text-[var(--text-muted)]">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-4 md:px-8 md:py-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-8">
          <form id="order-checkout-form" onSubmit={handleSubmitOrder} className="space-y-4">
            {error && (
              <div className="rounded-[28px] border border-red-500/30 bg-red-950/35 px-5 py-4 text-sm text-red-100">
                {error}
              </div>
            )}

            <section className="rounded-[16px] border border-[var(--border)] border-l-[3px] border-l-gold bg-[var(--bg-card)] p-[18px] shadow-[var(--shadow-card)]">
              <SectionHeading
                eyebrow="Step 1"
                title="Contact details"
                description="Update the contact details for this order."
              />

              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--gold-border)] bg-[var(--bg-card-hover)] px-4 py-2 font-sans text-[12px] text-[var(--text-muted)]">
                <Mail className="h-3 w-3 text-gold" />
                Saved under <span className="font-medium text-[var(--text-primary)]">{user?.email}</span>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="ml-1 font-sans text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">Full Name</span>
                  <input
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    autoCapitalize="words"
                    className="brand-input h-[46px] px-4 py-0"
                  />
                </label>

                <label className="space-y-2">
                    <span className="ml-1 font-sans text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">Email</span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className="brand-input h-[46px] py-0"
                  />
                </label>
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="ml-1 font-sans text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">Phone</span>
                  <input
                    required
                    name="phone"
                    maxLength="10"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile"
                    inputMode="numeric"
                    className="brand-input h-[46px] px-4 py-0"
                  />
                </label>

                <label className="space-y-2">
                  <span className="ml-1 font-sans text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">WhatsApp</span>
                  <input
                    name="whatsapp"
                    maxLength="10"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    placeholder="Optional"
                    inputMode="numeric"
                    className="brand-input h-[46px] px-4 py-0"
                  />
                </label>
              </div>
            </section>

            <section className="rounded-[16px] border border-[var(--border)] border-l-[3px] border-l-gold bg-[var(--bg-card)] p-[18px] shadow-[var(--shadow-card)]">
              <SectionHeading
                eyebrow="Step 2"
                title="Choose a delivery address"
                description="Choose a saved address or enter one now."
                action={
                  <Link to="/profile?tab=addresses" className="brand-secondary-btn px-5 text-[15px]">
                    Manage Addresses
                  </Link>
                }
              />

              {savedAddresses.length === 0 && (
                <div className="mt-4 flex items-start gap-3 rounded-[16px] border border-dashed border-gold/30 bg-gold/5 px-5 py-4 font-sans text-[13px] leading-6 text-[var(--text-muted)]">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  <div>
                    <p className="font-medium text-white">No saved addresses</p>
                    <p>Enter one below or add one in your account.</p>
                    <Link to="/profile?tab=addresses" className="mt-2 inline-flex text-gold underline-offset-4 hover:underline">
                      + Add to Profile
                    </Link>
                  </div>
                </div>
              )}

              {savedAddresses.length > 0 && (
                <div className="mt-4 grid gap-3">
                  {savedAddresses.map((address) => (
                    <AddressOption
                      key={address.id}
                      address={address}
                      isSelected={selectedAddressId === address.id}
                      onSelect={() => {
                        setUseOneTimeAddress(false)
                        setSelectedAddressId(address.id)
                        setFormData((current) => ({
                          ...current,
                          phone: current.phone || address.phone || '',
                          address: current.address || address.fullAddress || '',
                          city: current.city || address.city || '',
                        }))
                      }}
                    />
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      setUseOneTimeAddress(true)
                      setSelectedAddressId(null)
                    }}
                    className={`w-full rounded-[24px] border px-4 py-4 text-left transition ${
                      useOneTimeAddress ? 'border-gold bg-gold/10' : 'border-gold/10 bg-black/20 hover:border-gold/30'
                    }`}
                  >
                    <p className="font-semibold text-text-primary">Use a one-time address</p>
                    <p className="mt-2 text-sm text-text-secondary">Use a different address for this order.</p>
                  </button>
                </div>
              )}

              {usingSavedAddress ? (
                <div className="mt-4 rounded-[16px] border border-[var(--border)] bg-black/20 p-[18px]">
                  <p className="font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--text-subtle)]">Selected Address</p>
                  <div className="mt-4 rounded-[16px] border border-[var(--border)] bg-[var(--input-bg)] px-4 py-4">
                    <p className="font-semibold text-text-primary">Selected: {selectedAddress.label || 'Saved Address'}</p>
                    <p className="mt-2 text-sm text-text-secondary">
                      {selectedAddress.recipientName} | {selectedAddress.phone}
                    </p>
                    <p className="mt-3 flex items-start gap-2 text-sm leading-7 text-text-secondary">
                      <MapPin className="mt-1 h-4 w-4 shrink-0 text-gold/60" />
                      <span>{selectedAddress.fullAddress}</span>
                    </p>
                  </div>

                  <label className="mt-3 block space-y-2">
                    <span className="ml-1 font-sans text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">Order Notes</span>
                    <input
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Optional cooking or delivery note"
                      className="brand-input h-[46px] py-0"
                    />
                  </label>
                </div>
              ) : (
                <div className="mt-4 rounded-[16px] border border-[var(--border)] bg-black/20 p-[18px]">
                  <div className="grid gap-3">
                    <label className="space-y-2">
                      <span className="ml-1 font-sans text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">Delivery Address</span>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-4 h-4 w-4 text-gold/40" />
                        <textarea
                          required
                          rows="4"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="Street, area, landmark"
                          className="brand-input min-h-20 resize-none py-4 pl-11 pr-4"
                        ></textarea>
                      </div>
                    </label>

                    <div className="grid gap-3 md:grid-cols-[1fr_1.4fr]">
                      <label className="space-y-2">
                        <span className="ml-1 font-sans text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">City</span>
                        <input
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          placeholder="Optional"
                          className="brand-input h-[46px] py-0"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="ml-1 font-sans text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">Order Notes</span>
                        <input
                          name="notes"
                          value={formData.notes}
                          onChange={handleChange}
                          placeholder="Optional cooking or delivery note"
                          className="brand-input h-[46px] py-0"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-[16px] border border-[var(--border)] border-l-[3px] border-l-gold bg-[var(--bg-card)] p-[18px] shadow-[var(--shadow-card)]">
              <SectionHeading
                eyebrow="Step 3"
                title="Payment"
                description="Choose payment and apply a promo."
              />

              <div className="mt-4 grid gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`relative rounded-[16px] border px-5 py-5 text-left transition ${
                    paymentMethod === 'cod' ? 'border-2 border-gold bg-gold/10' : 'border border-white/10 bg-[var(--bg-card)] hover:border-gold/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-sans text-[15px] font-semibold text-white">Cash on Delivery</p>
                      <p className="mt-2 font-sans text-[13px] text-[var(--text-muted)]">Place the order now and pay when it arrives.</p>
                    </div>
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-gold">
                      {paymentMethod === 'cod' && <Check className="h-3.5 w-3.5 text-gold" />}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('online')}
                  className={`relative rounded-[16px] border px-5 py-5 text-left transition ${
                    paymentMethod === 'online'
                      ? 'border-2 border-gold bg-gold/10'
                      : 'border border-white/10 bg-[var(--bg-card)] hover:border-gold/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-sans text-[15px] font-semibold text-white">Razorpay Secure Payment</p>
                      <p className="mt-2 font-sans text-[13px] text-[var(--text-muted)]">
                        Pay now with cards, UPI, netbanking, or wallet using Razorpay.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full border border-gold/25 bg-gold/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[1.6px] text-gold/85">
                          PCI-DSS secure
                        </span>
                        <span className="rounded-full border border-gold/25 bg-gold/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[1.6px] text-gold/85">
                          Instant verification
                        </span>
                      </div>
                    </div>
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-gold">
                      {paymentMethod === 'online' && <Check className="h-3.5 w-3.5 text-gold" />}
                    </span>
                  </div>
                </button>
              </div>

              {paymentMethod === 'online' && (
                <div className="mt-4 rounded-[16px] border border-[var(--border)] bg-black/20 p-[14px]">
                  <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-subtle)]">How payment works</p>
                  <div className="mt-3 grid gap-2 text-[12px] leading-5 text-[var(--text-muted)] sm:grid-cols-3">
                    <p className="rounded-[10px] border border-gold/10 bg-gold/5 px-3 py-2"><span className="font-semibold text-gold">1.</span> We create your order securely.</p>
                    <p className="rounded-[10px] border border-gold/10 bg-gold/5 px-3 py-2"><span className="font-semibold text-gold">2.</span> Razorpay opens for payment authorization.</p>
                    <p className="rounded-[10px] border border-gold/10 bg-gold/5 px-3 py-2"><span className="font-semibold text-gold">3.</span> We verify and confirm instantly here.</p>
                  </div>
                </div>
              )}

              {pendingOnlineOrder?.order?.orderNumber && paymentMethod === 'online' && (
                <div className="mt-4 rounded-[16px] border border-gold/20 bg-gold/10 px-4 py-4 font-sans text-[13px] text-[var(--text-primary)]">
                  Pending online order <span className="font-semibold">{pendingOnlineOrder.order.orderNumber}</span> found. Submitting again reopens Razorpay instead of creating a duplicate.
                </div>
              )}

              <div className="mt-4 rounded-[16px] border border-[var(--border)] bg-black/20 p-[18px]">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--text-subtle)]">Promo Code</p>
                  {appliedPromoCode && (
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      className="text-[10px] font-black uppercase tracking-[2px] text-red-200 transition hover:text-red-100"
                    >
                      Remove Promo
                    </button>
                  )}
                </div>

                {!appliedPromoCode && (
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <input
                      value={promoCodeInput}
                      onChange={(event) => setPromoCodeInput(event.target.value.toUpperCase())}
                      placeholder="Enter promo code"
                      className={`brand-input min-w-0 flex-1 h-[46px] py-0 ${promoError ? 'border-red-500/60' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      disabled={isApplyingPromo || !promoCodeInput.trim()}
                      className="h-[38px] rounded-[8px] border border-gold px-4 font-sans text-[13px] font-medium text-gold transition duration-150 hover:bg-gold hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isApplyingPromo ? 'Applying...' : 'Apply'}
                    </button>
                  </div>
                )}

                {promoNotice && <p className="mt-3 font-sans text-[13px] text-emerald-300">{promoNotice}</p>}
                {promoError && <p className="mt-3 font-sans text-[13px] text-red-300">{promoError}</p>}
              </div>

            </section>
          </form>

          <aside className="space-y-5">
            <div className="rounded-[16px] border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-card)] sm:p-[18px] xl:sticky xl:top-[110px]">
              <SectionHeading eyebrow="Summary" title="Your order" description={`${totalItems} items`} />

              <div className="mt-6 space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="rounded-[16px] border border-[var(--border)] bg-black/20 p-3">
                    <div className="flex gap-3">
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
                            <p className="truncate font-sans text-[15px] font-semibold text-white">{item.name}</p>
                            <p className="mt-1 font-sans text-[13px] text-[var(--text-muted)]">{formatCurrency(item.price)} each</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="rounded-full p-2 text-text-dim transition hover:bg-white/5 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-2 flex items-center justify-between gap-3">
                          <div className="flex h-8 items-center rounded-full border border-gold/30 bg-[var(--bg-card)] px-1 py-0">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition hover:bg-gold/10 hover:text-gold"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-7 text-center font-sans text-[13px] font-medium text-white">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition hover:bg-gold/10 hover:text-gold"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <p className="font-sans text-[18px] font-semibold text-gold">{formatCurrency(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-[16px] border border-[var(--border)] bg-black/20 p-[18px]">
                <div className="flex items-center gap-2 font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--text-subtle)]">
                  <Receipt className="h-4 w-4" />
                  Total
                </div>
                <div className="mt-5 space-y-3 font-sans text-[13px]">
                  <div className="flex items-center justify-between text-[var(--text-muted)]">
                    <span>Subtotal</span>
                    <span className="text-white">{formatCurrency(orderPreview.subTotal)}</span>
                  </div>
                  {orderPreview.discountAmount > 0 && (
                    <div className="flex items-center justify-between text-emerald-200">
                      <span>Discount</span>
                      <span>- {formatCurrency(orderPreview.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-[var(--text-muted)]">
                    <span>Tax ({taxPercent}%)</span>
                    <span className="text-white">{formatCurrency(orderPreview.taxAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[var(--text-muted)]">
                    <span>Delivery</span>
                    <span className="text-white">{formatCurrency(orderPreview.deliveryFee || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-gold/10 pt-3 font-sans text-[16px] font-semibold text-white">
                    <span>Final Total</span>
                    <span className="text-gold">{formatCurrency(orderPreview.grandTotal)}</span>
                  </div>
                </div>
              </div>

              {deliveryFee > 0 && (
                <p className="mt-3 text-[12px] text-[var(--text-muted)]">
                  Delivery fee {formatCurrency(deliveryFee)} applies below {formatCurrency(freeDeliveryThreshold)}.
                </p>
              )}

              <button
                type="submit"
                form="order-checkout-form"
                disabled={isSubmitting}
                className="brand-primary-btn mt-4 w-full px-6 text-[16px]"
              >
                {submitButtonLabel}
              </button>
              {paymentMethod === 'online' && (
                <p className="mt-3 rounded-[12px] border border-gold/20 bg-gold/10 px-3 py-2 font-sans text-[12px] leading-5 text-[var(--text-primary)]">
                  {onlinePaymentHelperText}
                </p>
              )}

              <Link to="/menu" className="mt-4 flex w-full items-center justify-center gap-2 font-sans text-[13px] text-[var(--text-muted)] underline-offset-4 transition hover:text-gold hover:underline">
                ← Back to Menu
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
