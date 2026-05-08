import { ChevronDown, ChevronRight, LogOut, Menu, PhoneCall, ShoppingCart, User, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAccount } from '../context/AccountContext'
import { useCart } from '../context/CartContext'
import { useSiteSettings } from '../context/SiteContext'
import {
  ORDER_ROUTE,
  PROFILE_ORDERS_ROUTE,
  PROFILE_ROUTE,
  buildPathWithSearch,
  navigateToLoginWithRedirect,
} from '../lib/order-flow'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const accountMenuRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAccount()
  const { cartItems, setCartOpen } = useCart()
  const { siteSettings } = useSiteSettings()

  const phoneNumber = siteSettings?.contact?.phone || '9966655997'
  const brandName = siteSettings?.restaurantName || 'RajaMahendravaram PalavuCentre'
  const tagline = siteSettings?.tagline || 'Rooted in Konaseema'

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/menu', label: 'Menu' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/catering', label: 'Catering' },
    { path: '/franchise', label: 'Franchise' },
    { path: '/contact', label: 'Contact' },
  ]

  const profilePath = buildPathWithSearch(PROFILE_ROUTE.pathname, PROFILE_ROUTE.search)
  const ordersPath = buildPathWithSearch(PROFILE_ORDERS_ROUTE.pathname, PROFILE_ORDERS_ROUTE.search)
  const cartCount = useMemo(() => cartItems.reduce((t, i) => t + i.quantity, 0), [cartItems])
  const accountDisplayName = user?.name?.trim() || user?.email?.split('@')?.[0] || 'My Account'

  const handleCallNow = () => { window.location.href = `tel:${phoneNumber}` }
  const handleCartClick = () => { if (cartCount > 0) { setCartOpen(true); return }; navigate('/menu') }
  const handleAccountClick = () => { if (!isAuthenticated) { navigateToLoginWithRedirect(navigate, PROFILE_ROUTE, 'profile'); return }; setIsAccountMenuOpen((c) => !c) }
  const handleOrderShortcutClick = () => { closeMobileMenu(); if (isAuthenticated) { navigate('/order'); return }; navigateToLoginWithRedirect(navigate, ORDER_ROUTE, 'checkout') }
  const handleProfileShortcutClick = () => { closeMobileMenu(); if (isAuthenticated) { navigate(profilePath); return }; navigateToLoginWithRedirect(navigate, PROFILE_ROUTE, 'profile') }
  const handleLogout = async () => { await logout(); setIsAccountMenuOpen(false); navigate('/login') }
  const closeMobileMenu = () => setIsOpen(false)
  const isActivePath = (p) => location.pathname === p

  useEffect(() => {
    if (!isAccountMenuOpen) return
    const h = (e) => { if (!accountMenuRef.current?.contains(e.target)) setIsAccountMenuOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [isAccountMenuOpen])

  return (
    <>
      {/* ===== NAVBAR ===== */}
      <nav className="fixed top-0 inset-x-0 z-[100] h-16 border-b border-[#2E2B1F] backdrop-blur-xl"
        style={{ background: '#0D0C09', boxShadow: '0 1px 0 #F0A50030, 0 4px 20px #00000080' }}>
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 lg:px-8">

          {/* LEFT — Logo */}
          <Link to="/" className="flex items-center min-w-0">
            <div className="min-w-0">
              <span className="brand-logo-text block" style={{ fontSize: 'clamp(9px, 2.4vw, 11px)', lineHeight: '0.95', letterSpacing: '0px' }}>RAJAMAHENDRAVARAM</span>
              <span className="brand-logo-text block" style={{ fontSize: 'clamp(9px, 2.4vw, 11px)', lineHeight: '0.95', letterSpacing: '0px' }}>PALAVUCENTRE</span>
              <span className="mt-0.5 block text-[#FFFBEB]/80 italic" style={{ fontFamily: 'var(--font-body)', fontSize: '8px', lineHeight: '1', letterSpacing: '0px' }}>{tagline}</span>
            </div>
          </Link>

          {/* CENTER — Desktop nav links */}
          <div className="hidden min-w-0 flex-1 lg:flex lg:justify-center">
            <div className="flex items-center gap-1 rounded-full border border-[#2E2B1F] bg-[#1A1810] p-1.5">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path}
                  className={`whitespace-nowrap rounded-full px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.18em] transition ${
                    isActivePath(link.path)
                      ? 'bg-[#F0A500] text-black'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`} style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* RIGHT — Desktop actions */}
          <div className="hidden shrink-0 items-center gap-3 lg:flex">
            <button onClick={handleCallNow}
              className="inline-flex items-center gap-2 rounded-lg bg-[#B33A3A] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.15em] text-white transition hover:bg-[#8B2E2E]"
              style={{ fontFamily: 'DM Sans, sans-serif' }}>
              <PhoneCall className="h-4 w-4" /> Call Now
            </button>

            <div ref={accountMenuRef} className="relative">
              <button onClick={handleAccountClick}
                className="inline-flex items-center gap-2 rounded-lg border border-[#2E2B1F] bg-[#1A1810] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.15em] text-[#F0A500] transition hover:border-[#F0A500]/40"
                style={{ fontFamily: 'DM Sans, sans-serif' }}>
                <User className="h-4 w-4" />
                {isAuthenticated ? 'Profile' : 'Login'}
                {isAuthenticated && <ChevronDown className={`h-3.5 w-3.5 transition ${isAccountMenuOpen ? 'rotate-180' : ''}`} />}
              </button>

              {isAuthenticated && isAccountMenuOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] w-[280px] overflow-hidden rounded-xl border border-[#2E2B1F] bg-[#0D0C09] shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
                  <div className="border-b border-[#2E2B1F] px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A8060]">Signed in as</p>
                    <p className="mt-1 truncate text-[15px] font-semibold text-[#F0A500]">{accountDisplayName}</p>
                    {user?.email && <p className="mt-0.5 truncate text-[11px] text-[#8A8060]">{user.email}</p>}
                  </div>
                  <div className="p-1.5">
                    {[
                      { to: profilePath, label: 'Profile Overview' },
                      { to: ordersPath, label: 'My Orders' },
                    ].map((item) => (
                      <Link key={item.to} to={item.to} onClick={() => setIsAccountMenuOpen(false)}
                        className="flex items-center justify-between rounded-lg px-3 py-2.5 text-[13px] text-white transition hover:bg-[#F0A500]/10 hover:text-[#F0A500]">
                        <span>{item.label}</span><ChevronRight className="h-4 w-4 text-[#8A8060]" />
                      </Link>
                    ))}
                  </div>
                  <div className="border-t border-[#2E2B1F] p-1.5">
                    <button type="button" onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-[13px] text-red-400 transition hover:bg-red-500/10">
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button onClick={handleCartClick}
              className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-[#2E2B1F] bg-[#1A1810] transition hover:border-[#F0A500]/40 active:scale-110 active:transition-transform active:duration-150">
              <ShoppingCart className="h-5 w-5 text-[#F0A500]" />
              {cartCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#F0A500] px-1 text-[9px] font-bold text-black">{cartCount}</span>
              )}
            </button>
          </div>

          {/* RIGHT — Mobile actions */}
          <div className="flex items-center gap-2.5 lg:hidden">
            <button onClick={handleCartClick}
              className="relative flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#2E2B1F] bg-[#1A1810] transition active:scale-110 active:transition-transform active:duration-150"
              aria-label={cartCount > 0 ? `Cart with ${cartCount} items` : 'Browse menu'}>
              <ShoppingCart className="h-5 w-5 text-[#F0A500]" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#F0A500] px-1 text-[9px] font-bold text-black">{cartCount}</span>
              )}
            </button>

            <button onClick={() => setIsOpen((c) => !c)}
              className={`flex h-10 w-10 items-center justify-center rounded-[10px] border bg-[#1A1810] transition-all duration-250 ${
                isOpen ? 'border-[#F0A500] text-[#F0A500]' : 'border-[#2E2B1F] text-white'
              }`}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}>
              {isOpen ? (
                <X className="h-5 w-5 transition-transform duration-250 rotate-0" />
              ) : (
                <div className="flex flex-col items-end gap-[5px]">
                  <span className="block h-[2px] w-5 rounded-full bg-current" />
                  <span className="block h-[2px] w-3.5 rounded-full bg-current" />
                  <span className="block h-[2px] w-2.5 rounded-full bg-current" />
                </div>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ===== MOBILE MENU ===== */}
      {isOpen && (
        <div className="fixed inset-0 top-16 z-[100] overflow-y-auto bg-[#0D0C09]/98 px-4 pb-10 pt-5 lg:hidden">
          <div className="mx-auto max-w-lg space-y-3">

            {/* Quick actions */}
            <div className="grid grid-cols-2 gap-2.5">
              <button type="button" onClick={handleProfileShortcutClick}
                className="rounded-xl border border-[#2E2B1F] bg-[#1A1810] p-4 text-left transition active:scale-[0.97]">
                <User className="h-5 w-5 text-[#F0A500]" />
                <p className="mt-2 text-[12px] font-bold uppercase tracking-wider text-white">{isAuthenticated ? 'Profile' : 'Login'}</p>
                <p className="mt-0.5 text-[10px] text-[#8A8060]">{isAuthenticated ? 'Account details' : 'Sign in'}</p>
              </button>
            </div>

            {/* Call button */}
            <button type="button" onClick={() => { closeMobileMenu(); handleCallNow() }}
              className="flex w-full items-center justify-between rounded-xl border border-[#B33A3A]/30 bg-[#B33A3A]/10 p-4 transition active:scale-[0.97]">
              <div>
                <p className="text-[12px] font-bold uppercase tracking-wider text-white">Call Restaurant</p>
                <p className="mt-0.5 text-[10px] text-[#8A8060]">{phoneNumber}</p>
              </div>
              <PhoneCall className="h-5 w-5 text-white" />
            </button>

            {/* Nav links */}
            <div className="space-y-1.5">
              <p className="px-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8A8060]">Navigate</p>
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path} onClick={closeMobileMenu}
                  className={`flex items-center justify-between rounded-xl border p-4 transition active:scale-[0.97] ${
                    isActivePath(link.path)
                      ? 'border-[#F0A500]/30 bg-[#F0A500]/5 text-[#F0A500]'
                      : 'border-[#2E2B1F] bg-[#1A1810] text-white hover:border-[#3A3520]'
                  }`}>
                  <span className="text-[13px] font-bold uppercase tracking-wider" style={{ fontFamily: 'DM Sans, sans-serif' }}>{link.label}</span>
                  <ChevronRight className="h-4 w-4 text-[#8A8060]" />
                </Link>
              ))}
            </div>

            {/* Account section */}
            {isAuthenticated && (
              <button type="button" onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#2E2B1F] bg-[#1A1810] p-3 text-[12px] font-medium text-[#8A8060] transition hover:text-red-400">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}
