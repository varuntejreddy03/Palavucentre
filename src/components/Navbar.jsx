import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const { cartItems, setCartOpen } = useCart()

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/menu', label: 'Menu' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/catering', label: 'Catering' },
    { path: '/franchise', label: 'Franchise' },
    { path: '/contact', label: 'Contact' },
  ]

  const handleCallNow = () => {
    window.location.href = 'tel:+919966655997'
  }

  return (
    <>
      <nav className="fixed w-full z-50 bg-[#050100]/60 backdrop-blur-[20px] border-b border-white/5 shadow-2xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-[70px]">
            <Link to="/" className="flex-shrink-0 flex flex-col justify-center max-w-[60%] sm:max-w-none">
              <span className="brand-logo-text" style={{ fontSize: 'clamp(10px, 3.5vw, 24px)', lineHeight: '1', whiteSpace: 'nowrap' }}>RAJAMAHENDRAVARAM PALAVUCENTRE</span>
              <span className="text-[#FFFBEB]/90 italic mt-0.5" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '10px', lineHeight: '1' }}>Rooted in Konaseema</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative py-2 uppercase text-[11px] tracking-[3px] font-light transition-colors duration-200 nav-link-underline ${location.pathname === link.path ? 'text-gold-bright' : 'text-white/80 hover:text-white'
                    }`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={handleCallNow}
                className="bg-[#B33A3A] text-[#EDE0C4] px-7 py-2.5 rounded-full uppercase text-[11px] tracking-[2px] font-bold hover:bg-[#8B2E2E] shadow-lg transition-all active:scale-95 animate-pulse-red"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Call Now
              </button>
              <button onClick={() => {
                if (cartItems.length > 0) {
                  setCartOpen(true)
                } else {
                  window.location.href = '/menu'
                }
              }} className="relative cursor-pointer group">
                <ShoppingCart className="w-5 h-5 text-gold group-hover:text-gold-bright transition-all" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-urgent text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {cartItems.length}
                  </span>
                )}
              </button>
            </div>

            <div className="md:hidden flex items-center space-x-2">
              <button
                onClick={handleCallNow}
                className="bg-[#B33A3A] text-[#EDE0C4] px-3.5 py-1.5 rounded-full uppercase text-[10px] tracking-[1px] font-bold shadow-lg transition-all"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Call Now
              </button>
              <button onClick={() => {
                if (cartItems.length > 0) {
                  setCartOpen(true)
                } else {
                  window.location.href = '/menu'
                }
              }} className="relative cursor-pointer p-1">
                <ShoppingCart className="w-5 h-5 text-gold" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-urgent text-white rounded-full w-3.5 h-3.5 flex items-center justify-center text-[8px] font-bold">
                    {cartItems.length}
                  </span>
                )}
              </button>
              <button 
                onClick={() => setIsOpen(!isOpen)} 
                className={`p-1.5 transition-all duration-300 rounded-md border ${isOpen ? 'border-gold bg-gold/10' : 'border-gold/20'}`}
              >
                {isOpen ? <X className="w-5 h-5 text-gold" /> : <Menu className="w-5 h-5 text-gold" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {isOpen && (
        <div className="md:hidden fixed inset-0 top-[64px] bg-[#080501] z-[100] overflow-y-auto">
          <div className="px-4 pt-6 pb-20 flex flex-col gap-3 min-h-full">
            {navLinks.map((link, idx) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block py-5 px-6 rounded-2xl border transition-all duration-300 ${
                  location.pathname === link.path 
                    ? 'text-gold bg-gold/15 border-gold shadow-[0_10px_40px_rgba(201,168,76,0.1)]' 
                    : 'text-white bg-white/5 border-white/10 hover:border-gold/30'
                }`}
                style={{ 
                  fontFamily: 'Inter, sans-serif', 
                  fontSize: '14px',
                  fontWeight: 600, 
                  letterSpacing: '2px',
                  textTransform: 'uppercase'
                }}
              >
                <div className="flex items-center justify-between">
                  <span>{link.label}</span>
                  <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20">
                    <span className="text-gold text-xl">→</span>
                  </div>
                </div>
              </Link>
            ))}
            <button
              onClick={() => { handleCallNow(); setIsOpen(false); }}
              className="w-full mt-4 bg-gradient-to-r from-[#B33A3A] to-[#8B2E2E] text-white px-6 py-5 rounded-2xl uppercase text-[14px] tracking-[3px] font-black shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-transform"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              📞 CALL NOW TO ORDER
            </button>
          </div>
        </div>
      )}
    </>
  )
}
