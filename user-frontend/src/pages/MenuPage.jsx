import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ChefHat,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  X,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import QuantityControl from '../components/QuantityControl'
import { useAccount } from '../context/AccountContext'
import { useCart } from '../context/CartContext'
import { useSiteSettings } from '../context/SiteContext'
import { formatCurrency } from '../lib/formatters'
import { publicApi } from '../lib/api'
import { getMenuCategoryIcon } from '../lib/menu-icons'
import {
  PROFILE_ORDERS_ROUTE,
  PROFILE_ROUTE,
  getInitials,
  isVegItem,
  navigateToLoginWithRedirect,
} from '../lib/order-flow'

/* ─── Image with fallback ─────────────────────────────────────── */
function MenuImage({ src, alt, className }) {
  const [errored, setErrored] = useState(false)
  if (!src || errored) {
    return (
      <div className={`flex items-center justify-center bg-[#111009] ${className}`}>
        <ChefHat className="h-6 w-6 text-[#F0A500]/40" />
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      className={`h-full w-full object-cover ${className}`}
      onError={() => setErrored(true)}
    />
  )
}

/* ─── Logo ────────────────────────────────────────────────────── */
function LogoMark({ logoUrl, restaurantName }) {
  if (logoUrl) {
    return <img src={logoUrl} alt={restaurantName} className="h-11 w-11 rounded-full object-cover" />
  }
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#F0A500] text-[13px] font-bold text-black">
      PC
    </div>
  )
}

/* ─── Avatar ──────────────────────────────────────────────────── */
function AccountAvatar({ initials, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#2E2B1F] bg-[#1A1810] text-[13px] font-semibold text-[#F0A500] transition hover:border-[#F0A500]/60"
      aria-label={label}
    >
      {initials}
    </button>
  )
}

/* ─── Header action button ────────────────────────────────────── */
function HeaderAction({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#2E2B1F] bg-[#1A1810] px-3 text-[12px] font-semibold text-[#8A8060] transition hover:border-[#F0A500]/60 hover:text-white"
    >
      <Icon className="h-4 w-4 text-[#F0A500]" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}

/* ─── Search field ────────────────────────────────────────────── */
function SearchField({ value, onChange, inputRef }) {
  return (
    <label className="relative block">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B6B6B] transition-colors peer-focus:text-[#F0A500]" />
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search menu…"
        className="peer h-12 w-full rounded-[12px] border border-[#2E2B1F] bg-[#111009] pl-[44px] pr-10 text-[14px] text-white placeholder-[#4A4A4A] outline-none transition focus:border-[#F0A500] focus:shadow-[0_0_0_3px_rgba(240,165,0,0.08)]"
        style={{ fontFamily: 'DM Sans, sans-serif' }}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B6B] transition hover:text-[#F0A500]"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </label>
  )
}

/* ─── Filter chip ─────────────────────────────────────────────── */
function FilterChip({ active, onClick, children, dotColor }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-[34px] shrink-0 whitespace-nowrap items-center gap-1.5 rounded-full border px-4 text-[12px] font-semibold uppercase tracking-[0.12em] transition-all duration-150 ${
        active
          ? 'border-[#F0A500] bg-[#F0A500] text-black shadow-[0_0_12px_rgba(240,165,0,0.35)]'
          : 'border-[#2E2B1F] bg-[#1A1810] text-[#8A8060] hover:border-[#F0A500]/50 hover:text-white'
      }`}
      style={{ fontFamily: 'DM Sans, sans-serif' }}
    >
      {dotColor && (
        <span
          className="h-[6px] w-[6px] flex-shrink-0 rounded-full"
          style={{ backgroundColor: dotColor }}
        />
      )}
      {children}
    </button>
  )
}

/* ─── Veg badge ───────────────────────────────────────────────── */
function VegBadge({ veg }) {
  return (
    <span className="absolute left-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-black/50">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: veg ? '#4CAF50' : '#FF4444' }}
      />
    </span>
  )
}

/* ─── Item card ───────────────────────────────────────────────── */
function ItemCard({ item, quantity, onAdd, onUpdateQuantity }) {
  const veg = isVegItem(item)
  const unavailable = item.available === false
  const [flash, setFlash] = useState(false)

  const handleAdd = () => {
    setFlash(true)
    setTimeout(() => setFlash(false), 300)
    onAdd(item)
  }

  return (
    <article
      className={`flex items-start gap-4 rounded-[14px] border bg-[#1A1810] p-4 transition-all duration-200 hover:-translate-y-0.5 ${
        flash ? 'border-[#F0A500]' : 'border-[#2E2B1F] hover:border-[#F0A500]/50'
      }`}
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[10px] border border-[#2E2B1F]">
        <MenuImage src={item.img} alt={item.name} className="h-full w-full" />
        <VegBadge veg={veg} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-[14px] font-semibold text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              {item.name}
            </h3>
            {item.bestseller && (
              <span className="mt-1.5 inline-flex rounded-[4px] bg-[#F0A500] px-[7px] py-[2px] text-[9px] font-bold uppercase tracking-[0.12em] text-black">
                Bestseller
              </span>
            )}
          </div>
          <span className="text-[14px] font-bold text-[#F0A500]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            {formatCurrency(item.price)}
          </span>
        </div>

        <p className="mt-2 line-clamp-2 text-[12px] leading-5 text-[#8A8060]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          {item.desc || item.description || 'Freshly prepared to order.'}
        </p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6B6B6B]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            {item.category?.name || 'Chef special'}
          </span>

          {unavailable ? (
            <span className="rounded-[8px] border border-[#2E2B1F] px-3 py-1.5 text-[12px] text-[#6B6B6B]">
              Unavailable
            </span>
          ) : quantity > 0 ? (
            <QuantityControl
              size="sm"
              quantity={quantity}
              onDecrease={() => onUpdateQuantity(item, quantity - 1)}
              onIncrease={() => onUpdateQuantity(item, quantity + 1)}
            />
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              className="rounded-[8px] border border-[#F0A500] px-4 py-1.5 text-[13px] font-semibold text-[#F0A500] transition-all duration-150 hover:bg-[#F0A500] hover:text-black"
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              ADD
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

/* ─── Popular picks card ──────────────────────────────────────── */
function FavouriteCard({ item, quantity, onAdd, onUpdateQuantity }) {
  return (
    <article className="flex min-w-[140px] max-w-[140px] sm:min-w-[160px] sm:max-w-[160px] snap-start flex-col overflow-hidden rounded-[14px] border border-[#2E2B1F] bg-[#1A1810] transition hover:border-[#F0A500]/50">
      <div className="relative h-[88px] sm:h-[100px] w-full overflow-hidden bg-[#111009]">
        <MenuImage src={item.img} alt={item.name} className="h-full w-full" />
        <VegBadge veg={isVegItem(item)} />
        <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-[#F0A500]/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#F0A500] border border-[#F0A500]/30">
          <Star className="h-2.5 w-2.5" />
          Popular
        </span>
      </div>

      <div className="flex flex-1 flex-col p-2.5 sm:p-3">
        <p className="line-clamp-1 text-[12px] sm:text-[13px] font-semibold text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          {item.name}
        </p>
        <p className="mt-0.5 line-clamp-1 text-[11px] text-[#8A8060]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          {item.desc || item.description}
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2.5">
          <span className="text-[13px] sm:text-[14px] font-bold text-[#F0A500]">{formatCurrency(item.price)}</span>
          {quantity > 0 ? (
            <QuantityControl
              size="sm"
              quantity={quantity}
              onDecrease={() => onUpdateQuantity(item, quantity - 1)}
              onIncrease={() => onUpdateQuantity(item, quantity + 1)}
            />
          ) : (
            <button
              type="button"
              onClick={() => onAdd(item)}
              className="rounded-[7px] border border-[#F0A500] px-2.5 py-1.5 text-[11px] font-semibold text-[#F0A500] transition hover:bg-[#F0A500] hover:text-black"
            >
              ADD
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

/* ─── Sidebar ─────────────────────────────────────────────────── */
function MenuSidebar({ categories, activeSlug, onSelect }) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-[112px] overflow-hidden rounded-[18px] border border-[#2E2B1F] bg-[#1A1810] p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6B6B6B]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          Categories
        </p>
        <div className="mt-3 space-y-0.5">
          {categories.map((category) => {
            const CategoryIcon = getMenuCategoryIcon(category.icon)
            const isActive = activeSlug === category.slug
            return (
              <button
                key={category.slug}
                type="button"
                onClick={() => onSelect(category.slug)}
                className={`flex w-full items-center gap-3 rounded-[10px] px-3 py-3 text-left text-[13px] transition-all duration-150 ${
                  isActive
                    ? 'border-l-[3px] border-[#F0A500] bg-[#F0A500]/10 pl-[9px] text-[#F0A500]'
                    : 'border-l-[3px] border-transparent text-[#8A8060] hover:bg-[#1F1C14] hover:text-white'
                }`}
                style={{ fontFamily: 'DM Sans, sans-serif' }}
              >
                <CategoryIcon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[#F0A500]' : 'text-[#8A8060]'}`} />
                <span className="flex-1">{category.name}</span>
              </button>
            )
          })}
        </div>
      </div>
    </aside>
  )
}

/* ─── Section heading ─────────────────────────────────────────── */
function SectionHeading({ icon: Icon, name, count }) {
  return (
    <div className="mb-5 flex items-center gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#F0A500]/30 bg-[#F0A500]/10 text-[#F0A500]">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <h2
          className="text-[22px] font-medium text-[#F0A500]"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          {name}
        </h2>
        <p className="text-[10px] uppercase tracking-[0.16em] text-[#6B6B6B]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          {count} dishes
        </p>
      </div>
      <div className="h-px flex-1 bg-gradient-to-r from-[#F0A500]/25 to-transparent" />
    </div>
  )
}

/* ─── Popular picks with scroll arrows ───────────────────────── */
function PopularRow({ items, getQty, onAdd, onUpdate }) {
  const rowRef = useRef(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(true)

  const checkScroll = () => {
    const el = rowRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 8)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8)
  }

  useEffect(() => {
    const el = rowRef.current
    if (!el) return
    checkScroll()
    el.addEventListener('scroll', checkScroll, { passive: true })
    return () => el.removeEventListener('scroll', checkScroll)
  }, [items])

  const scroll = (dir) => {
    rowRef.current?.scrollBy({ left: dir * 340, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      {/* Left arrow — desktop only */}
      {canLeft && (
        <button
          type="button"
          onClick={() => scroll(-1)}
          className="absolute -left-4 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center h-8 w-8 rounded-full border border-[#2E2B1F] bg-[#1A1810] text-[#F0A500] shadow-lg transition hover:border-[#F0A500] lg:flex"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}

      {/* Negative margin on mobile for edge-to-edge scroll with peek */}
      <div className="-mx-3 sm:mx-0">
        <div
          ref={rowRef}
          className="scrollbar-hide flex snap-x snap-mandatory gap-3 overflow-x-auto px-3 sm:px-0 pb-2"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {items.map((item) => (
            <FavouriteCard
              key={item.id}
              item={item}
              quantity={getQty(item.id)}
              onAdd={onAdd}
              onUpdateQuantity={onUpdate}
            />
          ))}
          {/* Trailing spacer on mobile */}
          <span className="w-3 shrink-0 sm:hidden" />
        </div>
      </div>

      {/* Right arrow — desktop only */}
      {canRight && (
        <button
          type="button"
          onClick={() => scroll(1)}
          className="absolute -right-4 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center h-8 w-8 rounded-full border border-[#2E2B1F] bg-[#1A1810] text-[#F0A500] shadow-lg transition hover:border-[#F0A500] lg:flex"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

/* ─── Sticky Checkout Bar ─────────────────────────────────────── */
function StickyCheckoutBar({ cartItems, onCheckout }) {
  const totalQty   = cartItems.reduce((n, i) => n + i.quantity, 0)
  const totalPrice = cartItems.reduce((n, i) => n + i.price * i.quantity, 0)
  const [visible, setVisible] = useState(false)

  // Slide in when first item added, slide out when cart empty
  useEffect(() => {
    setVisible(totalQty > 0)
  }, [totalQty])

  if (!visible) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-4 lg:hidden"
      style={{
        paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
        animation: 'slideUpBar 320ms cubic-bezier(0.34,1.56,0.64,1) both',
      }}
    >
      <style>{`
        @keyframes slideUpBar {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
      `}</style>

      <button
        type="button"
        onClick={onCheckout}
        className="group relative flex w-full max-w-[480px] items-center overflow-hidden rounded-[16px] bg-[#F0A500] px-4 shadow-[0_8px_32px_rgba(240,165,0,0.35)]"
        style={{ height: '60px' }}
      >
        {/* Shimmer sweep on hover */}
        <span
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)',
            backgroundSize: '400px 100%',
            animation: 'shimmer 1.2s infinite',
          }}
        />

        {/* Left: bag icon + count badge */}
        <span className="relative mr-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-black/15">
          <ShoppingBag className="h-5 w-5 text-black" />
          <span
            className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] font-bold text-[#F0A500]"
          >
            {totalQty}
          </span>
        </span>

        {/* Middle: label */}
        <span className="flex-1 text-left">
          <span className="block text-[15px] font-bold text-black" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            View Cart
          </span>
          <span className="block text-[11px] font-semibold text-black/60" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            {totalQty} {totalQty === 1 ? 'item' : 'items'} added
          </span>
        </span>

        {/* Right: total + arrow */}
        <span className="flex items-center gap-1.5 rounded-[10px] bg-black/15 px-3 py-1.5">
          <span className="text-[15px] font-bold text-black" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            {formatCurrency(totalPrice)}
          </span>
          <ChevronRight className="h-4 w-4 text-black" />
        </span>
      </button>
    </div>
  )
}

/* ─── Page ────────────────────────────────────────────────────── */
export default function MenuPage() {
  const navigate = useNavigate()
  const searchInputRef = useRef(null)
  const sectionRefs = useRef({})
  const { siteSettings } = useSiteSettings()
  const { isAuthenticated, user } = useAccount()
  const { cartItems, addToCart, updateQuantity } = useCart()

  const [menuGroups, setMenuGroups] = useState({ all: [] })
  const [categoryList, setCategoryList] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [menuNotice, setMenuNotice] = useState('')
  const [search, setSearch] = useState('')
  const [dietFilter, setDietFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [activeSidebarSlug, setActiveSidebarSlug] = useState('all')
  const [visibleCount, setVisibleCount] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 640 ? 6 : Number.POSITIVE_INFINITY,
  )
  const isMobile =
    typeof window !== 'undefined'
      ? window.matchMedia?.('(max-width: 639px)')?.matches ?? window.innerWidth < 640
      : false

  useEffect(() => {
    let isMounted = true
    const loadMenu = async () => {
      try {
        setIsLoading(true)
        setError('')
        const response = await publicApi.getMenu()
        if (!isMounted) return
        setMenuGroups(response.data.groupedItems || { all: [] })
        setCategoryList(response.data.categories || [])
        setMenuNotice(response.meta?.degraded ? response.meta?.degradedMessage || 'Menu temporarily unavailable' : '')
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load menu')
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    loadMenu()
    return () => { isMounted = false }
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    const handler = (e) => setVisibleCount(e.matches ? 6 : Number.POSITIVE_INFINITY)
    handler(mq)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const categoryEntries = useMemo(
    () => (Array.isArray(categoryList) ? categoryList.filter((c) => c?.slug) : []),
    [categoryList],
  )
  const allItems = useMemo(() => menuGroups.all || [], [menuGroups])
  const popularItems = useMemo(
    () => allItems.filter((item) => item.bestseller && item.available !== false).slice(0, 8),
    [allItems],
  )
  const accountInitials = getInitials(user?.name || user?.email, 'AC')
  const locationLabel = 'Rajahmundry · 30–40 min'

  const handleAccountClick = () => {
    if (isAuthenticated) { navigate('/profile'); return }
    navigateToLoginWithRedirect(navigate, PROFILE_ROUTE, 'profile')
  }
  const handleTrackClick = () => {
    if (isAuthenticated) { navigate('/profile?tab=orders'); return }
    navigateToLoginWithRedirect(navigate, PROFILE_ORDERS_ROUTE, 'profile')
  }

  const filteredSections = useMemo(() => {
    const query = search.trim().toLowerCase()
    return categoryEntries
      .map((category) => {
        const items = (menuGroups[category.slug] || []).filter((item) => {
          const matchesCategory = categoryFilter === 'all' || category.slug === categoryFilter
          const matchesDiet = dietFilter === 'all' || (dietFilter === 'veg' ? isVegItem(item) : !isVegItem(item))
          const matchesSearch =
            !query ||
            item.name.toLowerCase().includes(query) ||
            (item.desc || item.description || '').toLowerCase().includes(query) ||
            (item.category?.name || '').toLowerCase().includes(query)
          return matchesCategory && matchesDiet && matchesSearch
        })
        return { ...category, items }
      })
      .filter((s) => s.items.length > 0)
  }, [categoryEntries, categoryFilter, dietFilter, menuGroups, search])

  const totalFilteredItems = useMemo(
    () => filteredSections.reduce((n, s) => n + s.items.length, 0),
    [filteredSections],
  )

  const visibleSections = useMemo(() => {
    let remaining = visibleCount
    if (!isMobile) return filteredSections.map((s) => ({ ...s, visibleItems: s.items }))
    return filteredSections
      .map((s) => {
        if (remaining <= 0) return null
        const visibleItems = s.items.slice(0, remaining)
        remaining -= visibleItems.length
        return { ...s, visibleItems }
      })
      .filter(Boolean)
  }, [filteredSections, isMobile, visibleCount])

  const hasMoreItems = isMobile && visibleCount < totalFilteredItems
  const hasActiveFilters = categoryFilter !== 'all' || dietFilter !== 'all' || Boolean(search.trim())

  useEffect(() => {
    if (categoryFilter !== 'all') { setActiveSidebarSlug(categoryFilter); return }
    if (visibleSections[0]?.slug) setActiveSidebarSlug(visibleSections[0].slug)
  }, [categoryFilter, visibleSections])

  useEffect(() => {
    if (categoryFilter !== 'all') return
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (hit?.target?.id) setActiveSidebarSlug(hit.target.id.replace('menu-section-', ''))
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0.15, 0.35, 0.6] },
    )
    visibleSections.forEach((s) => {
      const el = sectionRefs.current[s.slug]
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [categoryFilter, visibleSections])

  const getItemQuantity = (id) => cartItems.find((i) => i.id === id)?.quantity || 0
  const handleUpdateQuantity = (item, next) => updateQuantity(item.id, Math.max(0, next))
  const scrollToCategory = (slug) => {
    setActiveSidebarSlug(slug)
    setCategoryFilter('all')
    sectionRefs.current[slug]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const handleClearFilters = () => { setSearch(''); setDietFilter('all'); setCategoryFilter('all') }

  return (
    /* pb-[80px] so last items aren't hidden behind sticky checkout bar */
    <div className="min-h-screen bg-[#0D0C09] pb-[80px]">

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-[#2E2B1F] bg-[#0D0C09]/95 backdrop-blur-xl"
        style={{ boxShadow: '0 1px 0 rgba(240,165,0,0.12), 0 4px 20px rgba(0,0,0,0.5)' }}>
        <div className="mx-auto flex h-14 sm:h-16 max-w-[1200px] items-center justify-between gap-3 px-4">
          {/* Logo */}
          <button type="button" onClick={() => navigate('/')} className="flex min-w-0 items-center gap-2.5 text-left">
            <LogoMark logoUrl={siteSettings?.logoUrl} restaurantName={siteSettings?.restaurantName} />
            <div className="min-w-0">
              <p
                className="truncate text-[12px] sm:text-[13px] font-bold uppercase tracking-[0.15em] text-white"
                style={{ fontFamily: 'DM Sans, sans-serif' }}
              >
                {siteSettings?.restaurantName || 'Palavu Centre'}
              </p>
              <p className="truncate text-[10px] text-[#8A8060]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                RajaMahendravaram
              </p>
            </div>
          </button>

          {/* Location pill — md+ */}
          <div className="hidden items-center gap-2 rounded-full border border-[#2E2B1F] bg-[#1A1810] px-4 py-2 text-[13px] text-[#8A8060] md:flex">
            <MapPin className="h-4 w-4 text-[#F0A500]" />
            <span style={{ fontFamily: 'DM Sans, sans-serif' }}>{locationLabel}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search icon — mobile only */}
            <button
              type="button"
              onClick={() => searchInputRef.current?.focus()}
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-[10px] border border-[#2E2B1F] bg-[#1A1810] text-[#8A8060] transition hover:border-[#F0A500]/60 hover:text-white"
              aria-label="Focus search"
            >
              <Search className="h-4 w-4" />
            </button>
            {/* Track — hidden on mobile, shown sm+ */}
            <div className="hidden sm:block">
              <HeaderAction icon={Clock3} label="Track" onClick={handleTrackClick} />
            </div>
            <AccountAvatar
              initials={accountInitials}
              label={isAuthenticated ? 'Open profile' : 'Login to continue'}
              onClick={handleAccountClick}
            />
          </div>
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1200px] px-3 sm:px-4 py-4 sm:py-6">

        {/* Search + Filters */}
        <div className="mb-5 space-y-3">
          <SearchField value={search} onChange={setSearch} inputRef={searchInputRef} />

          {/* Filter pills — edge-to-edge horizontal scroll on mobile */}
          <div className="-mx-3 sm:mx-0 overflow-hidden">
            <div
              className="flex flex-nowrap gap-2 overflow-x-auto px-3 sm:px-0 pb-1"
              style={{
                WebkitOverflowScrolling: 'touch',
                touchAction: 'pan-x',
                msOverflowStyle: 'none',
                scrollbarWidth: 'none',
              }}
            >
              <FilterChip
                active={dietFilter === 'veg'}
                onClick={() => setDietFilter(dietFilter === 'veg' ? 'all' : 'veg')}
                dotColor="#4CAF50"
              >
                Veg
              </FilterChip>
              <FilterChip
                active={dietFilter === 'nonveg'}
                onClick={() => setDietFilter(dietFilter === 'nonveg' ? 'all' : 'nonveg')}
                dotColor="#FF4444"
              >
                Non-Veg
              </FilterChip>
              {categoryEntries.map((cat) => (
                <FilterChip
                  key={cat.slug}
                  active={categoryFilter === cat.slug}
                  onClick={() => setCategoryFilter(categoryFilter === cat.slug ? 'all' : cat.slug)}
                >
                  {cat.name}
                </FilterChip>
              ))}
              <span className="w-3 shrink-0" aria-hidden="true" />
            </div>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="h-9 rounded-[10px] border border-[#2E2B1F] bg-[#1A1810] px-4 text-[12px] font-semibold text-[#8A8060] transition hover:border-[#F0A500]/60 hover:text-white"
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Sidebar + Content grid */}
        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <MenuSidebar categories={categoryEntries} activeSlug={activeSidebarSlug} onSelect={scrollToCategory} />

          <div className="min-w-0 space-y-10">

            {/* Popular picks */}
            {!isLoading && !error && !hasActiveFilters && popularItems.length > 0 && (
              <section>
                <div className="mb-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6B6B6B]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    Chef edits
                  </p>
                  <h2
                    className="mt-1 text-[22px] text-[#F0A500]"
                    style={{ fontFamily: 'Playfair Display, serif' }}
                  >
                    Popular picks
                  </h2>
                </div>
                <PopularRow
                  items={popularItems}
                  getQty={getItemQuantity}
                  onAdd={addToCart}
                  onUpdate={handleUpdateQuantity}
                />
              </section>
            )}

            {/* Menu notice */}
            {menuNotice && (
              <div className="rounded-[14px] border border-[#2E2B1F] border-l-[3px] border-l-[#F0A500] bg-[#1A1810] px-4 py-3 text-[13px] text-[#8A8060]">
                {menuNotice}
              </div>
            )}

            {/* States */}
            {isLoading ? (
              <div className="rounded-[18px] border border-[#2E2B1F] bg-[#1A1810] px-6 py-16 text-center text-[#8A8060]">
                Loading menu…
              </div>
            ) : error ? (
              <div className="rounded-[18px] border border-red-800/40 bg-[#1A1810] px-6 py-16 text-center text-red-400">
                {error}
              </div>
            ) : visibleSections.length === 0 ? (
              <div className="rounded-[18px] border border-[#2E2B1F] bg-[#1A1810] px-6 py-16 text-center">
                <ChefHat className="mx-auto mb-3 h-10 w-10 text-[#F0A500]/30" />
                <p className="text-[20px] text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                  No items found
                </p>
                <p className="mt-2 text-[13px] text-[#8A8060]">Try another search or filter.</p>
              </div>
            ) : (
              <div className="space-y-10">
                {visibleSections.map((section) => {
                  const CategoryIcon = getMenuCategoryIcon(section.icon)
                  return (
                    <section
                      key={section.slug}
                      id={`menu-section-${section.slug}`}
                      ref={(el) => { sectionRefs.current[section.slug] = el }}
                    >
                      <SectionHeading icon={CategoryIcon} name={section.name} count={section.visibleItems.length} />
                      <div className="grid gap-3 sm:grid-cols-2">
                        {section.visibleItems.map((item) => (
                          <ItemCard
                            key={item.id}
                            item={item}
                            quantity={getItemQuantity(item.id)}
                            onAdd={addToCart}
                            onUpdateQuantity={handleUpdateQuantity}
                          />
                        ))}
                      </div>
                    </section>
                  )
                })}

                {hasMoreItems && (
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((n) => n + 6)}
                      className="flex h-11 items-center gap-2 rounded-[10px] border border-[#2E2B1F] bg-[#1A1810] px-5 text-[13px] font-semibold text-[#8A8060] transition hover:border-[#F0A500]/60 hover:text-white"
                      style={{ fontFamily: 'DM Sans, sans-serif' }}
                    >
                      Load More
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky checkout bar — mobile only, hidden on lg+ */}
      <StickyCheckoutBar
        cartItems={cartItems}
        onCheckout={() => navigate('/checkout')}
      />
    </div>
  )
}