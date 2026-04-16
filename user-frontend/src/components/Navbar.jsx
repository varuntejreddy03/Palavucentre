import { ChevronDown, ChevronRight, LogOut, Menu, PhoneCall, ShoppingCart, User, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAccount } from '../context/AccountContext'
import { useCart } from '../context/CartContext'
import { useSiteSettings } from '../context/SiteContext'

function getBrandLines(name) {
  const normalized = String(name || 'RajaMahendravaram PalavuCentre').trim()
  const exactBrandMatch = normalized.match(/^(.*)\s+(PalavuCentre)$/i)

  if (exactBrandMatch) {
    return [exactBrandMatch[1], exactBrandMatch[2]]
  }

  const words = normalized.split(/\s+/).filter(Boolean)
  if (words.length <= 1) {
    return [normalized, '']
  }

  const midpoint = Math.ceil(words.length / 2)
  return [words.slice(0, midpoint).join(' '), words.slice(midpoint).join(' ')]
}

function getCompactBrandName(name) {
  const normalized = String(name || 'RajaMahendravaram PalavuCentre').trim()

  if (/palavucentre/i.test(normalized)) {
    return 'Palavu Centre'
  }

  const words = normalized.split(/\s+/).filter(Boolean)
  if (words.length >= 2) {
    return words.slice(-2).join(' ')
  }

  return normalized
}

function getBrandMark(name) {
  const compactName = getCompactBrandName(name)
  const words = compactName.split(/\s+/).filter(Boolean)

  if (words.length === 0) {
    return 'PC'
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase()
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase()
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const accountMenuRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAccount()
  const { cartItems, setCartOpen } = useCart()
  const { siteSettings } = useSiteSettings()

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/menu', label: 'Menu' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/catering', label: 'Catering' },
    { path: '/franchise', label: 'Franchise' },
    { path: '/contact', label: 'Contact' },
  ]

  const phoneNumber = siteSettings?.contact?.phone || '9966655997'
  const brandName = siteSettings?.restaurantName || 'RajaMahendravaram PalavuCentre'
  const tagline = siteSettings?.tagline || 'Rooted in Konaseema'
  const [brandLineOne, brandLineTwo] = getBrandLines(brandName)
  const compactBrandName = getCompactBrandName(brandName)
  const brandMark = getBrandMark(brandName)
  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  )

  const handleCallNow = () => {
    window.location.href = `tel:${phoneNumber}`
  }

  const handleCartClick = () => {
    if (cartCount > 0) {
      setCartOpen(true)
      return
    }

    navigate('/menu')
  }

  const handleAccountClick = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    setIsAccountMenuOpen((current) => !current)
  }

  const handleLogout = async () => {
    await logout()
    setIsAccountMenuOpen(false)
    navigate('/login')
  }

  const closeMobileMenu = () => setIsOpen(false)

  const isActivePath = (path) => location.pathname === path

  useEffect(() => {
    if (!isAccountMenuOpen) {
      return undefined
    }

    const handleClickOutside = (event) => {
      if (!accountMenuRef.current?.contains(event.target)) {
        setIsAccountMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isAccountMenuOpen])

  const accountDisplayName = user?.name?.trim() || user?.email?.split('@')?.[0] || 'My Account'

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-[rgba(212,175,55,0.2)] bg-[rgba(15,10,5,0.85)] shadow-[0_20px_70px_rgba(0,0,0,0.55)] backdrop-blur-[12px]">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="flex h-[72px] items-center gap-3 lg:gap-5">
            <Link
              to="/"
              className="min-w-0 shrink-0 rounded-[24px] border border-gold/10 bg-black/20 px-2.5 py-2 sm:px-4"
            >
              <div className="flex items-center gap-2.5 lg:hidden">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/20 bg-gold/10 text-[12px] font-black uppercase tracking-[0.14em] text-gold shadow-[0_10px_24px_rgba(212,160,23,0.14)]">
                  {brandMark}
                </div>
                <div className="min-w-0 max-w-[145px]">
                  <span
                    className="brand-logo-text block truncate"
                    style={{ fontSize: 'clamp(8.5px, 2.3vw, 10px)', lineHeight: '0.94', letterSpacing: '0px', wordSpacing: '1px' }}
                  >
                    {brandLineOne.toUpperCase()}
                  </span>
                  {brandLineTwo && (
                    <span
                      className="brand-logo-text mt-0.5 block truncate"
                      style={{ fontSize: 'clamp(8.5px, 2.3vw, 10px)', lineHeight: '0.94', letterSpacing: '0px', wordSpacing: '1px' }}
                    >
                      {brandLineTwo.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              <span
                className="brand-logo-text hidden lg:block"
                style={{ fontSize: 'clamp(10px, 1.25vw, 13px)', lineHeight: '0.94', letterSpacing: '0px' }}
              >
                <span className="block">{brandLineOne.toUpperCase()}</span>
                {brandLineTwo && <span className="block">{brandLineTwo.toUpperCase()}</span>}
              </span>
              <span
                className="mt-0.5 hidden text-[#FFFBEB]/90 italic lg:block"
                style={{ fontFamily: 'var(--font-body)', fontSize: '9px', lineHeight: '1' }}
              >
                {tagline}
              </span>
            </Link>

            <div className="hidden min-w-0 flex-1 lg:flex lg:justify-center">
              <div className="flex min-w-0 items-center gap-1 rounded-full border border-gold/10 bg-black/20 p-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`whitespace-nowrap rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[2.2px] transition xl:px-4 xl:text-[11px] ${
                      isActivePath(link.path)
                        ? 'bg-gold text-bg-page shadow-[0_10px_25px_rgba(212,168,83,0.2)]'
                        : 'text-white/80 hover:bg-white/5 hover:text-gold-bright'
                    }`}
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="ml-auto hidden shrink-0 items-center gap-3 lg:flex">
              <button
                onClick={handleCallNow}
                className="inline-flex items-center gap-2 rounded-full bg-[#B33A3A] px-5 py-3 text-[11px] font-black uppercase tracking-[2px] text-[#F5ECD7] shadow-[0_18px_35px_rgba(139,46,46,0.35)] transition hover:bg-[#8B2E2E]"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                <PhoneCall className="h-4 w-4" />
                Call Now
              </button>

              <div ref={accountMenuRef} className="relative">
                <button
                  onClick={handleAccountClick}
                  className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-black/20 px-5 py-3 text-[11px] font-black uppercase tracking-[2px] text-gold transition hover:border-gold/40 hover:bg-gold/10 hover:text-gold-bright"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  <User className="h-4 w-4" />
                  {isAuthenticated ? 'Profile' : 'Login'}
                  {isAuthenticated && (
                    <ChevronDown className={`h-3.5 w-3.5 transition ${isAccountMenuOpen ? 'rotate-180' : ''}`} />
                  )}
                </button>

                {isAuthenticated && isAccountMenuOpen && (
                  <div className="absolute right-0 top-[calc(100%+10px)] w-[320px] overflow-hidden rounded-[20px] border border-gold/20 bg-[rgba(11,7,4,0.98)] shadow-[0_24px_60px_rgba(0,0,0,0.55)] backdrop-blur">
                    <div className="border-b border-gold/10 px-4 py-4">
                      <p className="text-[10px] font-black uppercase tracking-[2px] text-gold/70">Signed in as</p>
                      <p className="mt-2 truncate text-[18px] font-semibold text-gold-bright">{accountDisplayName}</p>
                      {user?.email && <p className="mt-1 truncate text-xs text-text-secondary">{user.email}</p>}
                    </div>

                    <div className="p-2">
                      <Link
                        to="/profile"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="flex items-center justify-between rounded-[12px] px-3 py-3 text-sm text-text-primary transition hover:bg-gold/10 hover:text-gold-bright"
                      >
                        <span>Profile Overview</span>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                      <Link
                        to="/profile?tab=orders"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="flex items-center justify-between rounded-[12px] px-3 py-3 text-sm text-text-primary transition hover:bg-gold/10 hover:text-gold-bright"
                      >
                        <span>My Orders</span>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                      <Link
                        to="/profile?tab=addresses"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="flex items-center justify-between rounded-[12px] px-3 py-3 text-sm text-text-primary transition hover:bg-gold/10 hover:text-gold-bright"
                      >
                        <span>Saved Addresses</span>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>

                    <div className="border-t border-gold/10 p-2">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center justify-between rounded-[12px] px-3 py-3 text-sm text-red-200 transition hover:bg-red-500/12 hover:text-red-100"
                      >
                        <span className="inline-flex items-center gap-2">
                          <LogOut className="h-4 w-4" />
                          Logout
                        </span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleCartClick}
                className="relative flex h-12 w-12 items-center justify-center rounded-full border border-gold/20 bg-black/20 text-gold transition hover:border-gold/40 hover:bg-gold/10 hover:text-gold-bright"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-urgent px-1 text-[10px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>

            <div className="ml-auto flex items-center gap-2.5 lg:hidden">
              <button
                onClick={handleCartClick}
                className="relative flex h-11 w-11 items-center justify-center rounded-full border border-gold/20 bg-black/20 text-gold shadow-[0_10px_24px_rgba(0,0,0,0.24)]"
                aria-label={cartCount > 0 ? `Open cart with ${cartCount} items` : 'Browse menu'}
              >
                <ShoppingCart className="h-4.5 w-4.5" />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-urgent px-1 text-[8px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsOpen((current) => !current)}
                className={`flex h-11 w-11 items-center justify-center rounded-full border shadow-[0_10px_24px_rgba(0,0,0,0.24)] transition ${
                  isOpen ? 'border-gold bg-gold/10 text-gold' : 'border-gold/20 bg-black/20 text-gold'
                }`}
                aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
              >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {isOpen && (
        <div className="fixed inset-0 top-[72px] z-[100] overflow-y-auto bg-[#070200]/98 px-4 pb-10 pt-6 lg:hidden">
          <div className="mx-auto max-w-lg space-y-4">
            <div className="rounded-[28px] border border-gold/12 bg-black/20 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold/20 bg-gold/10 text-sm font-black uppercase tracking-[0.14em] text-gold">
                  {brandMark}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-black uppercase tracking-[3px] text-gold/70">Quick Access</p>
                  <p className="mt-2 text-lg font-semibold text-text-primary">{compactBrandName}</p>
                  <p className="mt-1 text-sm text-text-secondary">{tagline}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    closeMobileMenu()
                    handleAccountClick()
                  }}
                  className="rounded-[22px] border border-white/8 bg-white/5 px-4 py-4 text-left text-text-primary transition hover:border-gold/30 hover:text-gold-bright"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="block text-[12px] font-black uppercase tracking-[2px]">
                        {isAuthenticated ? 'Profile' : 'Login'}
                      </span>
                      <span className="mt-1 block text-[10px] uppercase tracking-[2px] text-text-dim">
                        Account and orders
                      </span>
                    </div>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/20 bg-black/20 text-gold">
                      <User className="h-4 w-4" />
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    closeMobileMenu()
                    handleCallNow()
                  }}
                  className="rounded-[22px] border border-[#B33A3A]/30 bg-[#B33A3A]/12 px-4 py-4 text-left text-[#F5ECD7] transition hover:border-[#B33A3A]/45 hover:bg-[#B33A3A]/20"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="block text-[12px] font-black uppercase tracking-[2px]">Call Restaurant</span>
                      <span className="mt-1 block text-[10px] uppercase tracking-[2px] text-white/60">
                        {phoneNumber}
                      </span>
                    </div>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/15 text-[#F5ECD7]">
                      <PhoneCall className="h-4 w-4" />
                    </span>
                  </div>
                </button>
              </div>
            </div>

            <div className="rounded-[28px] border border-gold/12 bg-black/20 p-5">
              <p className="text-[11px] font-black uppercase tracking-[3px] text-gold/70">Navigate</p>
              <div className="mt-4 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={closeMobileMenu}
                    className={`group flex items-center justify-between gap-3 rounded-[22px] border px-4 py-4 transition ${
                      isActivePath(link.path)
                        ? 'border-gold/35 bg-gold/12 text-gold'
                        : 'border-white/8 bg-white/5 text-text-primary hover:border-gold/30 hover:text-gold-bright'
                    }`}
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    <div>
                      <span className="block text-[12px] font-black uppercase tracking-[2px]">{link.label}</span>
                      <span className="mt-1 block text-[10px] uppercase tracking-[2px] text-text-dim">
                        {isActivePath(link.path) ? 'Current page' : 'Open page'}
                      </span>
                    </div>
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
                        isActivePath(link.path)
                          ? 'border-gold/30 bg-gold/15 text-gold'
                          : 'border-gold/15 bg-black/20 text-gold/80 group-hover:border-gold/30 group-hover:text-gold'
                      }`}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-gold/12 bg-black/20 p-5">
              <p className="text-[11px] font-black uppercase tracking-[3px] text-gold/70">Account Access</p>
              <p className="mt-3 text-sm leading-7 text-text-secondary">
                Manage orders and saved addresses here.
              </p>
              <Link
                to={isAuthenticated ? '/profile?tab=orders' : '/login'}
                onClick={closeMobileMenu}
                className="brand-secondary-btn mt-5 flex w-full px-5 py-4 text-[11px]"
              >
                {isAuthenticated ? 'Open My Orders' : 'Login To Order'}
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
