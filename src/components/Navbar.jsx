import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useCart } from '../context/CartContext'
import CartDrawer from './CartDrawer'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false)
  const location = useLocation()
  const { cartItems } = useCart()

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
    <nav className="fixed w-full z-50 bg-[#080501] border-b border-[rgba(201,168,76,0.15)] shadow-[0_4px_32px_rgba(0,0,0,0.9)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-[70px]">
          <Link to="/" className="flex-shrink-0 max-w-[160px] h-[32px] flex flex-col justify-center">
            <span className="font-bold text-gold-bright whitespace-nowrap" style={{fontFamily: 'Playfair Display, serif', fontSize: '18px', lineHeight: '1', fontWeight: '700', color: '#E8C96A'}}>Palavu Centre</span>
            <span className="text-text-dim" style={{fontFamily: 'Inter, sans-serif', fontSize: '10px', lineHeight: '1', color: '#5C4F35', marginTop: '4px'}}>Rooted in Konaseema</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative py-2 uppercase text-[11px] tracking-[3px] font-medium transition-colors duration-200 ${
                  location.pathname === link.path ? 'text-gold pb-1 border-b-2 border-gold' : 'text-text-secondary hover:text-gold-bright'
                }`}
                style={{fontFamily: 'Inter, sans-serif'}}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={handleCallNow}
              className="bg-[#B33A3A] text-[#EDE0C4] px-6 py-2.5 rounded-full uppercase text-[11px] tracking-[2px] font-semibold hover:bg-[#8B2E2E] transition-colors duration-200"
              style={{fontFamily: 'Inter, sans-serif'}}
            >
              Call Now
            </button>
            <button onClick={() => {
              if (cartItems.length > 0) {
                setCartDrawerOpen(true)
              } else {
                window.location.href = '/menu'
              }
            }} className="relative cursor-pointer">
              <ShoppingCart className="w-6 h-6 text-gold hover:text-gold-bright transition" />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-urgent text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold" style={{fontFamily: 'Inter, sans-serif'}}>
                  {cartItems.length}
                </span>
              )}
            </button>
          </div>

          <div className="md:hidden flex items-center space-x-3">
            <button onClick={() => {
              if (cartItems.length > 0) {
                setCartDrawerOpen(true)
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
        <div className="md:hidden fixed inset-0 top-16 bg-[#080501] animate-fadeIn z-40">
          <div className="px-4 pt-6 pb-8 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block py-3 px-4 text-[15px] rounded-lg border-b border-gold-dim/10 uppercase tracking-wider transition-colors ${
                  location.pathname === link.path ? 'text-gold bg-[rgba(201,168,76,0.1)]' : 'text-text-primary hover:text-gold hover:bg-[rgba(201,168,76,0.05)]'
                }`}
                style={{fontFamily: 'Inter, sans-serif', fontWeight: 500}}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => { handleCallNow(); setIsOpen(false); }}
              className="w-full mt-4 bg-[#B33A3A] text-[#EDE0C4] px-6 py-3 rounded-lg uppercase text-[13px] tracking-[2px] font-semibold"
              style={{fontFamily: 'Inter, sans-serif'}}
            >
              Call Now
            </button>
          </div>
        </div>
      )}

      <CartDrawer isOpen={cartDrawerOpen} onClose={() => setCartDrawerOpen(false)} />
    </nav>
  )
}
