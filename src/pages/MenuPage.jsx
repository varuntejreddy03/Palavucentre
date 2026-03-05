import { useState } from 'react'
import { Search, Grid, List, X, Minus, Plus, ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { menuData, categories } from '../data/menuData'
import CartDrawer from '../components/CartDrawer'

export default function MenuPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [cartOpen, setCartOpen] = useState(false)
  const [showCartBar, setShowCartBar] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastItem, setToastItem] = useState('')
  const { addToCart, cartItems, updateQuantity, total } = useCart()

  const getItemQuantity = (itemId) => {
    const item = cartItems.find(i => i.id === itemId)
    return item ? item.quantity : 0
  }

  const handleAddToCart = (item) => {
    addToCart(item)
    setShowCartBar(true)
    setToastItem(item.name)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2000)
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
      <section className="relative h-[280px] overflow-hidden">
        <img src="https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1920&q=80" alt="Menu" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{background: 'rgba(8,5,1,0.75)'}}></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="w-12 h-[1px] bg-gold mb-4"></div>
          <h1 className="text-[64px] leading-none" style={{fontFamily: 'Playfair Display, serif', fontWeight: 900, color: '#E8C96A'}}>Our Menu</h1>
          <div className="w-16 h-[2px] bg-gold mt-4"></div>
          <p className="tagline text-[18px] mt-4">Authentic Godavari flavors crafted with tradition</p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20" style={{background: 'linear-gradient(to bottom, transparent 0%, #080501 100%)'}}></div>
      </section>

      {/* Sticky Search Bar */}
      <div className="sticky top-[70px] z-40 bg-[rgba(16,12,2,0.97)] backdrop-blur-xl border-b border-[#2E2200]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 max-w-2xl relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gold w-5 h-5" />
              <input
                type="text"
                placeholder="Search dishes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 h-12 rounded-lg bg-[#1A1400] border border-[#2E2200] focus:border-gold focus:border-2 outline-none text-text-primary placeholder-text-dim transition"
                style={{fontFamily: 'Inter, sans-serif'}}
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-text-dim hover:text-gold">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {Object.entries(categories).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-5 py-2 rounded-full text-[12px] uppercase tracking-[2px] font-medium whitespace-nowrap transition-all duration-200 ${
                  activeTab === key 
                    ? 'bg-gold text-bg-page font-bold' 
                    : 'border border-[#2E2200] text-text-secondary hover:border-gold hover:text-gold'
                }`}
                style={{fontFamily: 'Inter, sans-serif'}}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex gap-8">
          {/* Sidebar - Desktop Only */}
          <div className="hidden lg:block w-[220px] flex-shrink-0">
            <div className="sticky top-[200px] bg-[#100C02] border border-[#2E2200] rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#2E2200]">
                <h3 className="text-[10px] uppercase tracking-[3px] text-gold" style={{fontFamily: 'Inter, sans-serif', fontWeight: 600}}>Categories</h3>
              </div>
              <div>
                {Object.entries(categories).map(([key, label]) => {
                  const count = menuData[key].length
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`w-full px-5 py-3.5 flex items-center justify-between text-[14px] transition-all duration-200 ${
                        activeTab === key
                          ? 'bg-gradient-to-r from-[rgba(201,168,76,0.15)] to-transparent border-l-[3px] border-gold text-gold-bright font-semibold'
                          : 'text-text-secondary hover:bg-[rgba(201,168,76,0.06)] hover:text-gold'
                      }`}
                      style={{fontFamily: 'Inter, sans-serif', fontWeight: activeTab === key ? 600 : 500}}
                    >
                      <span>{label}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2E2200] text-gold">{count}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Menu Grid */}
          <div className="flex-1">
            {filteredItems.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-text-dim text-xl">No dishes found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map(item => {
                  const qty = getItemQuantity(item.id)
                  return (
                    <div key={item.id} className="bg-[#1A1400] rounded-xl overflow-hidden border border-[#2E2200] hover:border-gold hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_0_1px_rgba(201,168,76,0.2)] transition-all duration-300 group">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400" />
                        <div className="absolute inset-0" style={{background: 'linear-gradient(to bottom, transparent 50%, #1A1400 100%)'}}></div>
                        <div style={{position: 'absolute', top: '8px', right: '8px', width: '14px', height: '14px', borderRadius: '50%', backgroundColor: item.veg ? '#3D9970' : '#C0392B', border: '2px solid white', zIndex: 10}}></div>
                        {item.bestseller && (
                          <div className="absolute top-2 left-2 bg-gold text-bg-page px-2 py-0.5 rounded-full text-[9px] uppercase tracking-[1px] font-bold" style={{fontFamily: 'Inter, sans-serif'}}>Bestseller</div>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="text-[16px] md:text-[20px] text-text-primary mb-1 line-clamp-1" style={{fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontStyle: 'italic'}}>{item.name}</h3>
                        <p className="text-[11px] md:text-[12px] text-text-secondary line-clamp-2 leading-relaxed mb-2" style={{fontFamily: 'Inter, sans-serif'}}>{item.desc}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-[18px] md:text-[22px] text-gold font-bold" style={{fontFamily: 'Inter, sans-serif'}}>₹{item.price}</span>
                          {qty === 0 ? (
                            <button
                              onClick={() => handleAddToCart(item)}
                              className="bg-transparent border-[1.5px] border-gold text-gold px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-[11px] md:text-[12px] uppercase tracking-[1px] font-semibold hover:bg-gold hover:text-bg-page transition-all duration-200"
                              style={{fontFamily: 'Inter, sans-serif'}}
                            >
                              Add
                            </button>
                          ) : (
                            <div className="flex items-center gap-1.5 md:gap-2 border-[1.5px] border-gold rounded-lg px-1.5 md:px-2 py-1">
                              <button onClick={() => handleUpdateQuantity(item, -1)} className="text-gold hover:text-gold-bright">
                                <Minus className="w-3 h-3 md:w-4 md:h-4" />
                              </button>
                              <span className="text-gold font-bold w-5 md:w-6 text-center text-[12px] md:text-[14px]" style={{fontFamily: 'Inter, sans-serif'}}>{qty}</span>
                              <button onClick={() => handleUpdateQuantity(item, 1)} className="text-gold hover:text-gold-bright">
                                <Plus className="w-3 h-3 md:w-4 md:h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Sticky Bottom Cart Bar */}
      {showCartBar && cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-[rgba(201,168,76,0.95)] backdrop-blur-md z-40 animate-slideUp" style={{boxShadow: '0 -2px 12px rgba(0,0,0,0.2)', height: '64px'}}>
          <div className="max-w-7xl mx-auto px-3 md:px-4 h-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-white text-[#C9A84C] w-6 h-6 rounded flex items-center justify-center font-bold text-[12px]" style={{fontFamily: 'Inter, sans-serif'}}>
                {cartItems.length}
              </div>
              <div>
                <p className="text-[9px] text-[#080501] opacity-70 leading-tight line-clamp-1 max-w-[120px] md:max-w-[200px]" style={{fontFamily: 'Inter, sans-serif'}}>{cartItems.map(i => i.name).join(', ')}</p>
                <p className="text-[12px] text-[#080501] font-bold" style={{fontFamily: 'Inter, sans-serif'}}>₹{total} <span className="text-[9px] font-normal opacity-80">+ taxes</span></p>
              </div>
            </div>
            <button
              onClick={() => setCartOpen(true)}
              className="bg-[#080501] text-white px-4 md:px-5 py-2 rounded text-[11px] md:text-[12px] font-bold uppercase tracking-[1px] hover:bg-[#1A1400] transition-all duration-200"
              style={{fontFamily: 'Inter, sans-serif'}}
            >
              View Cart
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-20 md:top-24 left-1/2 transform -translate-x-1/2 bg-veg text-white px-4 md:px-6 py-2.5 md:py-3 rounded-lg shadow-lg z-50 animate-slideUp flex items-center gap-2 max-w-[90vw]">
          <svg className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-[13px] md:text-[14px] truncate" style={{fontFamily: 'Inter, sans-serif', fontWeight: 600}}>{toastItem} added to cart</span>
        </div>
      )}
    </div>
  )
}
