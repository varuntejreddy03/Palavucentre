import { X, Minus, Plus, Trash2, Phone, User, MapPin, MessageCircle, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function CartDrawer() {
  const { cartItems, removeFromCart, updateQuantity, total, isCartOpen, setCartOpen, clearCart } = useCart()
  const [step, setStep] = useState('cart') // 'cart', 'phone', 'otp', 'address', 'success'
  const [showOtpGlow, setShowOtpGlow] = useState(false)
  const [otp, setOtp] = useState('')
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    whatsapp: user?.whatsapp || '',
    address: user?.address || ''
  })

  // Reset step when drawer closes/opens
  useEffect(() => {
    if (!isCartOpen) {
      setStep('cart')
      setOtp('')
    }
  }, [isCartOpen])

  const onClose = () => setCartOpen(false)

  const handleCheckout = () => {
    if (user) {
      setStep('address')
    } else {
      setStep('phone')
    }
  }

  const handlePhoneSubmit = (e) => {
    e.preventDefault()
    if (formData.phone.length === 10) {
      setStep('otp')
    }
  }

  const handleOtpSubmit = (e) => {
    e.preventDefault()
    if (otp === '1234' || otp.length === 4) { // Mock OTP
      setStep('address')
    } else {
      setShowOtpGlow(true)
      setTimeout(() => setShowOtpGlow(false), 500)
    }
  }

  const handleDetailsSubmit = (e) => {
    e.preventDefault()
    if (formData.name && formData.address) {
      const userData = {
        ...formData,
        picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=D4A853&color=080501`
      }
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      setStep('success')

      // Here you would normally send the order to backend
      setTimeout(() => {
        clearCart()
        onClose()
      }, 2500)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
    setFormData({ name: '', phone: '', whatsapp: '', address: '' })
    setStep('phone')
  }

  if (!isCartOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] animate-fadeIn" onClick={onClose}></div>
      <div className="fixed right-0 top-0 h-full w-[90vw] sm:w-[420px] bg-[#080501] border-l border-gold/20 z-[101] flex flex-col shadow-[-20px_0_80px_rgba(0,0,0,0.9)] overflow-hidden" style={{ animation: 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>

        {/* Header */}
        <div className="flex items-center justify-between p-7 border-b border-gold/10 bg-black/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl -mr-16 -mt-16 rounded-full"></div>
          <div className="relative z-10">
            {step === 'cart' && (
              <>
                <h2 className="text-[26px] metallic-gold" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 900 }}>Your Feast</h2>
                <p className="text-[10px] text-text-dim uppercase tracking-[3px] mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>Authentic Godavari Choice</p>
              </>
            )}
            {step === 'phone' && <h2 className="text-[24px] text-gold" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>Login</h2>}
            {step === 'otp' && <h2 className="text-[24px] text-gold" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>Verify OTP</h2>}
            {step === 'address' && <h2 className="text-[24px] text-gold" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>Delivery Details</h2>}
            {step === 'success' && <h2 className="text-[24px] text-veg" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>Order Placed!</h2>}
          </div>
          <button onClick={onClose} className="relative z-10 p-2 hover:bg-white/5 rounded-full text-text-dim hover:text-gold transition-all duration-300">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">

          {/* Transition Wrapper */}
          <div className="p-6 transition-all duration-500">

            {/* Step 1: Cart Items */}
            {step === 'cart' && (
              <div className="animate-fadeIn space-y-5">
                {cartItems.length === 0 ? (
                  <div className="text-center py-24 px-4">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Trash2 className="w-8 h-8 text-text-dim opacity-20" />
                    </div>
                    <p className="text-text-dim text-[16px]" style={{ fontFamily: 'Inter, sans-serif' }}>Your culinary journey starts here.</p>
                    <button onClick={onClose} className="mt-4 text-gold hover:text-gold-bright text-xs font-bold uppercase tracking-[2px] border-b border-gold/30 pb-1">Browse Menu</button>
                  </div>
                ) : (
                  cartItems.map(item => (
                    <div key={item.id} className="flex gap-4 bg-[#120607] gold-border p-4 rounded-xl group transition-all duration-300 hover:border-gold/40">
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <img src={item.img} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                        <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-lg"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[15px] text-text-primary font-bold mb-1 truncate" style={{ fontFamily: 'Inter, sans-serif' }}>{item.name}</h3>
                        <p className="text-[17px] text-gold font-black mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>₹{item.price}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center bg-black/60 border border-white/5 rounded-lg p-0.5">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center text-text-secondary hover:text-gold rounded transition-all"><Minus className="w-3 h-3" /></button>
                            <span className="text-[13px] font-black text-white w-7 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center text-text-secondary hover:text-gold rounded transition-all"><Plus className="w-3 h-3" /></button>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="self-start p-2 text-text-dim/40 hover:text-red-urgent transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Step 2: Phone Input */}
            {step === 'phone' && (
              <div className="animate-fadeIn py-4 space-y-8">
                <div className="space-y-2">
                  <p className="text-text-secondary text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>To continue, please provide your mobile number.</p>
                </div>
                <form onSubmit={handlePhoneSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase tracking-[3px] text-gold/60 ml-1">Phone Number</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold/40 group-focus-within:text-gold transition-colors" />
                      <input
                        required autoFocus type="tel" name="phone" maxLength="10"
                        value={formData.phone} onChange={handleChange}
                        placeholder="10-digit mobile number"
                        className="w-full bg-[#120607] border border-gold/20 rounded-xl py-4 pl-12 pr-4 text-[18px] text-text-primary focus:border-gold outline-none transition tracking-widest"
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-gold text-bg-page py-4 rounded-xl font-black uppercase tracking-[3px] text-[13px] hover:bg-gold-bright transition-all flex items-center justify-center gap-2">
                    Send OTP <ArrowRight className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => setStep('cart')} className="w-full text-text-dim text-[11px] uppercase tracking-[2px] font-bold hover:text-gold transition-colors">Back to Cart</button>
                </form>
              </div>
            )}

            {/* Step 3: OTP Input */}
            {step === 'otp' && (
              <div className="animate-fadeIn py-4 space-y-8">
                <div className="space-y-2">
                  <p className="text-text-secondary text-sm">We've sent a 4-digit code to <span className="text-gold font-bold">+91 {formData.phone}</span></p>
                </div>
                <form onSubmit={handleOtpSubmit} className="space-y-8">
                  <div className="flex justify-center gap-4">
                    <div className="relative group">
                      <input
                        required autoFocus type="text" maxLength="4" placeholder="••••"
                        value={otp} onChange={(e) => setOtp(e.target.value)}
                        className={`w-40 text-center bg-[#120607] border ${showOtpGlow ? 'border-red-urgent shadow-[0_0_20px_rgba(185,28,28,0.4)]' : 'border-gold/20 shadow-inner'} rounded-2xl py-5 text-[32px] text-gold font-black tracking-[12px] outline-none transition-all`}
                      />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-[12px] text-text-dim">Didn't receive code? <button type="button" className="text-gold font-bold hover:underline">Resend</button></p>
                  </div>
                  <button type="submit" className="w-full bg-gold text-bg-page py-4 rounded-xl font-black uppercase tracking-[3px] text-[13px] hover:bg-gold-bright transition-all">Verify & Continue</button>
                  <button type="button" onClick={() => setStep('phone')} className="w-full text-text-dim text-[11px] uppercase tracking-[2px] font-bold hover:text-gold transition-colors">Change Number</button>
                </form>
              </div>
            )}

            {/* Step 4: Address Details */}
            {step === 'address' && (
              <div className="animate-fadeIn py-2 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-gold/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-gold/30 bg-gold/5 flex items-center justify-center">
                      <Phone className="w-4 h-4 text-gold" />
                    </div>
                    <span className="text-sm text-text-primary font-bold">{formData.phone}</span>
                  </div>
                  <button onClick={() => setStep('phone')} className="text-[10px] text-gold font-bold uppercase tracking-[1px] hover:underline">Edit</button>
                </div>

                <form onSubmit={handleDetailsSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase tracking-[2px] text-gold/60 ml-1">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/40 group-focus-within:text-gold" />
                      <input
                        required type="text" name="name" value={formData.name} onChange={handleChange}
                        placeholder="Your full name"
                        className="w-full bg-[#120607] border border-gold/20 rounded-xl py-4 pl-12 pr-4 text-text-primary focus:border-gold outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] uppercase tracking-[2px] text-gold/60 ml-1">WhatsApp (Optional)</label>
                    <div className="relative group">
                      <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/40 group-focus-within:text-gold" />
                      <input
                        type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange}
                        placeholder="Keep updated on WhatsApp"
                        className="w-full bg-[#120607] border border-gold/20 rounded-xl py-4 pl-12 pr-4 text-text-primary focus:border-gold outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] uppercase tracking-[2px] text-gold/60 ml-1">Delivery Address</label>
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-4 w-4 h-4 text-gold/40 group-focus-within:text-gold" />
                      <textarea
                        required name="address" value={formData.address} onChange={handleChange}
                        placeholder="Complete street address & landmark"
                        rows="3"
                        className="w-full bg-[#120607] border border-gold/20 rounded-xl py-4 pl-12 pr-4 text-text-primary focus:border-gold outline-none transition resize-none"
                      ></textarea>
                    </div>
                  </div>

                  <button type="submit" className="w-full bg-gold text-bg-page py-5 rounded-xl font-black uppercase tracking-[3px] text-[14px] hover:bg-gold-bright transition-all shadow-2xl shadow-gold/20 mt-4">Place Order Now</button>
                </form>
              </div>
            )}

            {/* Step 5: Success */}
            {step === 'success' && (
              <div className="animate-fadeIn py-20 text-center space-y-6">
                <div className="w-24 h-24 bg-veg/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(61,153,112,0.2)]">
                  <ShieldCheck className="w-12 h-12 text-veg" />
                </div>
                <h3 className="text-[28px] text-white" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 900 }}>Shukriya!</h3>
                <p className="text-text-secondary leading-relaxed max-w-[280px] mx-auto">Your traditional Godavari feast is being prepared with love.</p>
                <div className="pt-8">
                  <p className="text-[11px] text-text-dim uppercase tracking-[3px]">Redirecting to Home...</p>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Sticky Footer for Cart Items Step */}
        {step === 'cart' && cartItems.length > 0 && (
          <div className="p-7 bg-black/60 border-t border-gold/10 space-y-6 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
            <div className="space-y-3">
              <div className="flex justify-between items-center opacity-60">
                <span className="text-[12px] text-text-secondary uppercase tracking-[1px]">Items Total</span>
                <span className="text-[15px] text-text-primary">₹{total}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-[15px] text-gold uppercase tracking-[2px] font-black">To Pay</span>
                <span className="text-[32px] text-gold font-black">₹{Math.round(total * 1.05)}</span>
              </div>
              <p className="text-[10px] text-text-dim italic mt-1">*Incl. 5% GST & packaging charges</p>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-gold text-bg-page py-5 rounded-xl text-[14px] uppercase tracking-[3px] font-black hover:bg-gold-bright transition-all duration-300 shadow-xl shadow-gold/10 transform active:scale-[0.98] flex items-center justify-center gap-3"
            >
              Checkout Now <ArrowRight className="w-4 h-4" />
            </button>

            {user && (
              <div className="flex items-center justify-center gap-4">
                <button onClick={handleLogout} className="text-[10px] text-red-urgent font-bold uppercase tracking-[2px] hover:underline">Logout from {user.name.split(' ')[0]}</button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
