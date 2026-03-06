import { useState } from 'react'
import { Search, Plus, Minus, Trash2, X } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { menuData, categories } from '../data/menuData'

export default function OrderPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const { cartItems, addToCart, updateQuantity, removeFromCart, total, setCartOpen } = useCart()

  const getItemQuantity = (itemId) => {
    const item = cartItems.find(i => i.id === itemId)
    return item ? item.quantity : 0
  }

  const handleUpdateQuantity = (item, change) => {
    const currentQty = getItemQuantity(item.id)
    const newQty = currentQty + change
    if (newQty <= 0) {
      updateQuantity(item.id, 0)
    } else {
      updateQuantity(item.id, newQty)
    }
  }

  const filteredItems = menuData[activeTab].filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.desc.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="pt-20 min-h-screen bg-bg-page animate-fadeIn">
      {/* Hero Banner */}
      <section className="relative h-[240px] overflow-hidden">
        <img src="https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1920&q=80" alt="Order" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'rgba(8,5,1,0.75)' }}></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <h1 className="text-[56px] leading-none mb-3" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 900, color: '#E8C96A' }}>Order Online</h1>
          <p className="tagline text-[16px]">Fresh, authentic Godavari cuisine delivered to you</p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16" style={{ background: 'linear-gradient(to bottom, transparent 0%, #080501 100%)' }}></div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Section */}
          <div className="lg:col-span-2">
            {/* Search */}
            <div className="mb-6 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gold w-5 h-5" />
              <input
                type="text"
                placeholder="Search dishes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 h-12 rounded-lg bg-[#1A1400] border border-[#2E2200] focus:border-gold focus:border-2 outline-none text-text-primary placeholder-text-dim transition"
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-text-dim hover:text-gold">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
              {Object.entries(categories).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-5 py-2 rounded-full text-[12px] uppercase tracking-[2px] font-medium whitespace-nowrap transition-all duration-200 ${String(activeTab).toLowerCase() === String(key).toLowerCase()
                    ? 'bg-gold text-bg-page font-bold'
                    : 'border border-[#2E2200] text-text-secondary hover:border-gold hover:text-gold'
                    }`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Menu Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredItems.map(item => {
                const qty = getItemQuantity(item.id)
                return (
                  <div key={item.id} className="bg-bg-card rounded-2xl overflow-hidden gold-border hover:border-gold hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.7)] transition-all duration-300 group">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400" />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 50%, #1A1400 100%)' }}></div>
                      <div className={`absolute top-3 right-3 w-4 h-4 rounded-full border-2 border-white ${item.veg ? 'bg-veg' : 'bg-nonveg'}`}></div>
                      {item.bestseller && (
                        <div className="absolute top-3 left-3 bg-gold text-bg-page px-2.5 py-1 rounded-full text-[10px] uppercase tracking-[1px] font-bold" style={{ fontFamily: 'Inter, sans-serif' }}>Bestseller</div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-[20px] text-text-primary mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontStyle: 'italic' }}>{item.name}</h3>
                      <p className="text-[12px] text-text-secondary line-clamp-2 leading-relaxed mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>{item.desc}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[22px] text-gold font-bold" style={{ fontFamily: 'Inter, sans-serif' }}>₹{item.price}</span>
                        {qty === 0 ? (
                          <button
                            onClick={() => addToCart(item)}
                            className="bg-transparent border-[1.5px] border-gold text-gold px-4 py-2 rounded-lg text-[12px] uppercase tracking-[1px] font-semibold hover:bg-gold hover:text-bg-page transition-all duration-200"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          >
                            Add
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 border-[1.5px] border-gold rounded-lg px-2 py-1">
                            <button onClick={() => handleUpdateQuantity(item, -1)} className="text-gold hover:text-gold-bright">
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-gold font-bold w-6 text-center" style={{ fontFamily: 'Inter, sans-serif' }}>{qty}</span>
                            <button onClick={() => handleUpdateQuantity(item, 1)} className="text-gold hover:text-gold-bright">
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Cart Summary */}
          <div className="lg:sticky lg:top-[100px] h-fit">
            <div className="bg-[#100C02] border border-[#2E2200] rounded-2xl p-6">
              <h3 className="text-[24px] text-gold mb-6" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>Order Summary</h3>
              {cartItems.length === 0 ? (
                <p className="text-text-dim text-center py-12">Your cart is empty</p>
              ) : (
                <>
                  <div className="space-y-3 mb-6 max-h-[400px] overflow-y-auto">
                    {cartItems.map(item => (
                      <div key={item.id} className="flex gap-3 bg-bg-card p-3 rounded-lg border border-gold-dim">
                        <img src={item.img} alt={item.name} className="w-14 h-14 object-cover rounded" />
                        <div className="flex-1">
                          <h4 className="text-[14px] text-text-primary font-semibold mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>{item.name}</h4>
                          <p className="text-[12px] text-text-dim">₹{item.price} × {item.quantity}</p>
                          <p className="text-[16px] text-gold font-bold" style={{ fontFamily: 'Inter, sans-serif' }}>₹{item.price * item.quantity}</p>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-text-dim hover:text-red-urgent transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gold-dim pt-4 mb-6 space-y-2">
                    <div className="flex justify-between items-center text-[14px]">
                      <span className="text-text-secondary">Subtotal</span>
                      <span className="text-text-primary font-semibold">₹{total}</span>
                    </div>
                    <div className="flex justify-between items-center text-[14px]">
                      <span className="text-text-secondary">GST (5%)</span>
                      <span className="text-text-primary font-semibold">₹{Math.round(total * 0.05)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[20px] font-bold text-gold pt-2 border-t border-gold-dim">
                      <span>Total</span>
                      <span>₹{Math.round(total * 1.05)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setCartOpen(true)}
                    className="w-full bg-gold text-bg-page py-4 rounded-lg text-[13px] uppercase tracking-[2px] font-bold hover:bg-gold-bright transition mb-3"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Proceed to Checkout
                  </button>
                  <p className="text-center text-[12px] text-text-dim" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Or call <a href="tel:9966655997" className="text-gold hover:underline font-semibold">9966655997</a>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
