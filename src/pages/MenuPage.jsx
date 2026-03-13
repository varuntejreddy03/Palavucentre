import { useState } from 'react'
import { Search, Grid, List, X, Minus, Plus, ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { menuData, categories } from '../data/menuData'
import CartDrawer from '../components/CartDrawer'

export default function MenuPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [showCartBar, setShowCartBar] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastItem, setToastItem] = useState('')
  const { addToCart, cartItems, updateQuantity, total, isCartOpen, setCartOpen } = useCart()

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
      <section className="relative h-[280px] overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/Video-797.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center relative z-10">
          <div className="w-12 h-[1px] bg-gold mb-3"></div>
          <h1 className="text-[52px] md:text-[64px] leading-none" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 900, color: '#E8C96A' }}>Our Menu</h1>
          <div className="w-16 h-[2px] bg-gold mt-3"></div>
          <p className="tagline text-[16px] md:text-[18px] mt-3 shadow-text">Authentic Godavari flavors crafted with tradition</p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 z-10" style={{ background: 'linear-gradient(to bottom, transparent 0%, #080501 100%)' }}></div>
      </section>

      {/* Sticky Search Bar */}
      <div className="sticky top-[70px] z-40 bg-[rgba(16,12,2,0.97)] backdrop-blur-xl border-b border-[#2E2200]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gold transition-colors group-focus-within:text-gold-bright">
                <Search className="w-5 h-5 shadow-sm" />
              </div>
              <input
                type="text"
                placeholder="Search Godavari delicacies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-12 h-12 bg-bg-card gold-border rounded-full outline-none text-text-primary placeholder:text-text-dim/50 focus:border-gold focus:ring-4 focus:ring-gold/20 transition-all text-sm shadow-[0_0_15px_rgba(234,179,8,0.05)]"
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full text-text-dim transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Category Pills - Horizontal Scroll on Mobile */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {Object.entries(categories).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-1.5 rounded-full text-[11px] uppercase tracking-[1px] font-bold whitespace-nowrap transition-all duration-300 border ${String(activeTab).toLowerCase() === String(key).toLowerCase()
                  ? 'border-gold text-gold bg-gold/10 shadow-[0_0_15px_rgba(234,179,8,0.2)]'
                  : 'bg-bg-card border-white/5 text-text-secondary hover:border-gold/30'
                  }`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="flex gap-8">
          {/* Sidebar - Desktop Only */}
          <div className="hidden lg:block w-[220px] flex-shrink-0">
            <div className="sticky top-[200px] bg-[#100C02] border border-[#2E2200] rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#2E2200]">
                <h3 className="text-[10px] uppercase tracking-[3px] text-gold" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>Categories</h3>
              </div>
              <div>
                {Object.entries(categories).map(([key, label]) => {
                  const count = menuData[key].length
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`w-full px-5 py-3.5 flex items-center justify-between text-[14px] transition-all duration-200 ${String(activeTab).trim().toLowerCase() === String(key).trim().toLowerCase()
                        ? 'bg-gradient-to-r from-[rgba(201,168,76,0.15)] to-transparent border-l-[3px] border-gold text-gold-bright font-semibold'
                        : 'text-text-secondary hover:bg-[rgba(201,168,76,0.06)] hover:text-gold'
                        }`}
                      style={{ fontFamily: 'Inter, sans-serif', fontWeight: String(activeTab).trim().toLowerCase() === String(key).trim().toLowerCase() ? 600 : 500 }}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-12 lg:gap-14">
                {filteredItems.map(item => {
                  const qty = getItemQuantity(item.id)
                  return (
                    <div key={item.id} className="bg-bg-card rounded-2xl overflow-hidden gold-border hover:border-gold hover:-translate-y-1 shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-500 group">
                      <div className="relative aspect-[16/9] md:aspect-[4/3] overflow-hidden">
                        <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg-card/40"></div>
                        <div style={{ position: 'absolute', top: '12px', right: '12px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.veg ? '#3D9970' : '#C0392B', border: '2px solid white', zIndex: 10 }}></div>
                        {item.bestseller && (
                          <div className="absolute top-3 left-3 bg-gold text-bg-page px-2 py-0.5 rounded-full text-[9px] uppercase tracking-[1px] font-black" style={{ fontFamily: 'Inter, sans-serif' }}>Bestseller</div>
                        )}
                      </div>
                      <div className="p-4 md:p-6">
                        <h3 className="text-[18px] md:text-[22px] text-text-primary mb-1 line-clamp-1 font-bold" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{item.name}</h3>
                        <p className="text-[12px] md:text-[13px] text-text-secondary line-clamp-2 leading-relaxed mb-4 min-h-[36px] opacity-80" style={{ fontFamily: 'Inter, sans-serif' }}>{item.desc}</p>
                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-[20px] md:text-[24px] text-gold-bright font-black" style={{ fontFamily: 'Inter, sans-serif' }}>₹{item.price}</span>
                          {qty === 0 ? (
                            <button
                              onClick={() => handleAddToCart(item)}
                              className="border-2 border-gold text-gold px-8 h-[44px] md:h-11 rounded-full text-[13px] uppercase tracking-[2px] font-black hover:bg-gold hover:text-bg-page transition-all duration-300 transform active:scale-[0.9] shadow-lg shadow-gold/10"
                              style={{ fontFamily: 'Inter, sans-serif' }}
                            >
                              Add
                            </button>
                          ) : (
                            <div className="flex items-center gap-3 border-2 border-gold rounded-full px-3 h-[44px] md:h-11 bg-gold/5 shadow-inner">
                              <button onClick={() => handleUpdateQuantity(item, -1)} className="w-8 h-8 flex items-center justify-center text-gold hover:text-gold-bright transition-all hover:bg-gold/10 rounded-full">
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="text-gold font-black w-8 text-center text-[16px]" style={{ fontFamily: 'Inter, sans-serif' }}>{qty}</span>
                              <button onClick={() => handleUpdateQuantity(item, 1)} className="w-8 h-8 flex items-center justify-center text-gold hover:text-gold-bright transition-all hover:bg-gold/10 rounded-full">
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
            )}
          </div>
        </div>
      </div>



      {/* Sticky Bottom Cart Bar */}
      {showCartBar && cartItems.length > 0 && !isCartOpen && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#120607]/98 backdrop-blur-2xl z-[60] animate-slideUp border-t-2 border-gold/10 pb-safe shadow-[0_-15px_50px_rgba(0,0,0,0.8)]" style={{ height: '70px' }}>
          <div className="max-w-7xl mx-auto px-5 h-full flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <div className="bg-gold text-bg-page min-w-[20px] h-5 rounded px-1.5 flex items-center justify-center font-black text-[11px] shadow-lg shadow-gold/20" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {cartItems.reduce((acc, i) => acc + i.quantity, 0)} {cartItems.reduce((acc, i) => acc + i.quantity, 0) === 1 ? 'Item' : 'Items'}
                </div>
                <p className="text-[18px] text-gold-bright font-black" style={{ fontFamily: 'Inter, sans-serif' }}>₹{total}</p>
              </div>
              <p className="text-[9px] text-text-dim/80 uppercase tracking-widest font-bold" style={{ fontFamily: 'Inter, sans-serif' }}>View Detailed Bill</p>
            </div>

            <button
              onClick={() => setCartOpen(true)}
              className="bg-gold text-bg-page h-[46px] px-8 rounded-xl text-[13px] font-black uppercase tracking-[2px] transition-all duration-300 hover:bg-gold-bright hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] flex items-center gap-2"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <ShoppingCart className="w-4 h-4" />
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
          <span className="text-[13px] md:text-[14px] truncate" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>{toastItem} added to cart</span>
        </div>
      )}
    </div>
  )
}
