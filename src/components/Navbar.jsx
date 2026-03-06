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
    <nav className="fixed w-full z-50 bg-[#1A1A1A]/80 backdrop-blur-xl border-b border-white/5 shadow-2xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-[70px]">
          <Link to="/" className="flex-shrink-0 max-w-[160px] h-[32px] flex flex-col justify-center">
            <span className="font-bold text-gold-bright whitespace-nowrap" style={{ fontFamily: 'Playfair Display, serif', fontSize: '15px', lineHeight: '1', fontWeight: '700', color: '#E8C96A' }}>RajaMahendravaram PalavuCentre</span>
            <span className="text-text-dim" style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', lineHeight: '1', color: '#5C4F35', marginTop: '4px' }}>Rooted in Konaseema</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative py-2 uppercase text-[11px] tracking-[3px] font-medium transition-colors duration-200 ${location.pathname === link.path ? 'text-gold pb-1 border-b-2 border-gold' : 'text-text-secondary hover:text-gold-bright'
                  }`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={handleCallNow}
              className="bg-[#B33A3A] text-[#EDE0C4] px-6 py-2.5 rounded-full uppercase text-[11px] tracking-[2px] font-semibold hover:bg-[#8B2E2E] transition-colors duration-200"
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
            }} className="relative cursor-pointer">
              <ShoppingCart className="w-6 h-6 text-gold hover:text-gold-bright transition" />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-urgent text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {cartItems.length}
                </span>
              )}
            </button>
          </div>

          <div className="md:hidden flex items-center space-x-3">
            <button onClick={() => {
              if (cartItems.length > 0) {
                setCartOpen(true)
              } else {
                window.location.href = '/menu'
              }
            }} className="relative cursor-pointer">
              <ShoppingCart className="w-5 h-5 text-gold" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-urgent text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold">
                  {cartItems.length}
                </span>
              )}
            </button>
            <button onClick={() => setIsOpen(!isOpen)} className="text-gold p-1">
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-gradient-to-b from-[#080501] via-[#0D0802] to-[#080501] animate-fadeIn z-40 backdrop-blur-sm">
          <div className="px-4 pt-6 pb-8 space-y-1">
            {navLinks.map((link, idx) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block py-4 px-5 text-[15px] rounded-xl border border-gold-dim/20 uppercase tracking-wider transition-all duration-300 transform hover:scale-[1.02] ${location.pathname === link.path ? 'text-gold bg-[rgba(201,168,76,0.15)] border-gold shadow-[0_0_20px_rgba(201,168,76,0.2)]' : 'text-text-primary hover:text-gold hover:bg-[rgba(201,168,76,0.08)] hover:border-gold-dim'
                  }`}
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, animationDelay: `${idx * 0.05}s` }}
              >
                <span className="flex items-center justify-between">
                  {link.label}
                  <span className="text-gold text-xl">→</span>
                </span>
              </Link>
            ))}
            <button
              onClick={() => { handleCallNow(); setIsOpen(false); }}
              className="w-full mt-6 bg-gradient-to-r from-[#B33A3A] to-[#8B2E2E] text-[#EDE0C4] px-6 py-4 rounded-xl uppercase text-[13px] tracking-[2px] font-semibold shadow-lg hover:shadow-[0_0_30px_rgba(179,58,58,0.5)] transition-all duration-300 transform hover:scale-[1.02]"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              📞 Call Now
            </button>
          </div>
        </div>
      )}


    </nav>
  )
}
