import { X, Minus, Plus, Trash2 } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import GoogleLogin from './GoogleLogin'

export default function CartDrawer({ isOpen, onClose }) {
  const { cartItems, removeFromCart, updateQuantity, total } = useCart()
  const [showLogin, setShowLogin] = useState(false)
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })

  const handlePlaceOrder = () => {
    if (!user) {
      setShowLogin(true)
    } else {
      window.location.href = '/order'
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50 animate-fadeIn" onClick={onClose}></div>
      <div className="fixed right-0 top-0 h-full w-[380px] bg-[#100C02] border-l border-[#2E2200] z-50 flex flex-col shadow-[0_0_60px_rgba(0,0,0,0.9)]" style={{animation: 'slideInRight 0.35s ease'}}>
        <div className="flex items-center justify-between p-6 border-b border-gold-dim">
          <h2 className="text-[22px] text-gold" style={{fontFamily: 'Playfair Display, serif', fontWeight: 700}}>Your Order</h2>
          <button onClick={onClose} className="text-text-dim hover:text-gold transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-text-dim">Your cart is empty</p>
            </div>
          ) : (
            cartItems.map(item => (
              <div key={item.id} className="flex gap-3 bg-bg-card p-3 rounded-lg border border-gold-dim">
                <img src={item.img} alt={item.name} className="w-14 h-14 object-cover rounded" />
                <div className="flex-1">
                  <h3 className="text-[14px] text-text-primary font-semibold mb-1" style={{fontFamily: 'Inter, sans-serif'}}>{item.name}</h3>
                  <p className="text-[16px] text-gold font-bold mb-2" style={{fontFamily: 'Inter, sans-serif'}}>₹{item.price}</p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center bg-gold-dim hover:bg-gold text-bg-page rounded transition">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-[14px] font-semibold text-text-primary w-6 text-center" style={{fontFamily: 'Inter, sans-serif'}}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center bg-gold-dim hover:bg-gold text-bg-page rounded transition">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-text-dim hover:text-red-urgent transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t border-gold-dim p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[16px] text-text-secondary uppercase tracking-[2px]" style={{fontFamily: 'Inter, sans-serif', fontWeight: 600}}>Subtotal</span>
              <span className="text-[28px] text-gold font-bold" style={{fontFamily: 'Inter, sans-serif'}}>₹{total}</span>
            </div>
            {user && (
              <div className="flex items-center justify-between gap-2 mb-2 p-3 bg-bg-section rounded-lg border border-gold-dim">
                <div className="flex items-center gap-2">
                  <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />
                  <div>
                    <p className="text-[12px] text-text-primary font-semibold" style={{fontFamily: 'Inter, sans-serif'}}>{user.name}</p>
                    <p className="text-[10px] text-text-dim" style={{fontFamily: 'Inter, sans-serif'}}>{user.email}</p>
                  </div>
                </div>
                <button onClick={handleLogout} className="text-[10px] text-red-urgent hover:underline" style={{fontFamily: 'Inter, sans-serif'}}>Logout</button>
              </div>
            )}
            <button onClick={handlePlaceOrder} className="block w-full bg-gold text-bg-page py-4 text-center rounded-lg text-[13px] uppercase tracking-[2px] font-bold hover:bg-gold-bright transition" style={{fontFamily: 'Inter, sans-serif'}}>
              {user ? 'Proceed to Payment' : 'Sign In with Google'}
            </button>
            <button onClick={onClose} className="block w-full text-center text-[12px] text-text-dim hover:text-gold transition underline" style={{fontFamily: 'Inter, sans-serif'}}>
              Continue Browsing
            </button>
          </div>
        )}
      </div>
      <GoogleLogin isOpen={showLogin} onClose={() => setShowLogin(false)} onSuccess={setUser} />
    </>
  )
}
