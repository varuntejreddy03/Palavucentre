import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ChefHat,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  Star,
  X,
} from 'lucide-react'

import { useCart } from '../context/CartContext'
import { useSiteSettings } from '../context/SiteContext'
import { publicApi } from '../lib/api'
import { formatCurrency } from '../lib/formatters'
import { getMenuCategoryIcon } from '../lib/menu-icons'

function isVegItem(item) {
  return item?.veg === true || item?.isVeg === true
}

function FilterPill({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-full border px-4 py-2 text-[11px] font-black uppercase tracking-[2px] transition-all duration-200 ease-in-out ${
        active
          ? 'border-[#D4AF37] bg-[#D4AF37] text-[#120805]'
          : 'border-[rgba(212,175,55,0.3)] bg-[#0f0a08]/80 text-text-secondary hover:border-[rgba(212,175,55,0.5)] hover:text-gold'
      }`}
    >
      {children}
    </button>
  )
}

function MenuCardImage({ src, alt, className }) {
  const fallbackSrc = '/hero-bg.jpg'
  const [failedSrc, setFailedSrc] = useState('')
  const requestedSrc = src || fallbackSrc
  const imgSrc = failedSrc === requestedSrc ? fallbackSrc : requestedSrc

  return <img src={imgSrc} alt={alt} onError={() => setFailedSrc(requestedSrc)} className={className} />
}

function QuantityStepper({ quantity, onDecrease, onIncrease }) {
  return (
    <div className="flex items-center gap-1 rounded-full bg-[#1A0A04] border border-[#D4AF37]/30 px-1 py-1">
      <button
        onClick={onDecrease}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-[#D4AF37]/15 text-gold transition hover:bg-[#D4AF37]/30"
      >
        <Minus className="h-3 w-3" />
      </button>
      <span className="w-6 text-center text-[14px] font-black text-white">{quantity}</span>
      <button
        onClick={onIncrease}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-[#D4AF37] text-[#120805] transition hover:brightness-110"
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  )
}

function FavouriteCard({ item, quantity, onAdd, onUpdateQuantity }) {
  const imageSrc = item.img || '/hero-bg.jpg'

  return (
    <article className="group relative flex min-w-[280px] max-w-[280px] snap-start items-center gap-3 overflow-hidden rounded-2xl border border-[rgba(212,175,55,0.15)] bg-[linear-gradient(180deg,rgba(18,8,6,0.96),rgba(8,4,2,0.95))] p-3 shadow-[0_4px_24px_rgba(0,0,0,0.4)] transition duration-300 hover:-translate-y-1">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="inline-flex items-center gap-1.5 self-start rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-black uppercase tracking-[2px] text-gold">
          <Star className="h-3 w-3" />
          Popular
        </div>
        <p className="text-[15px] font-semibold leading-tight text-text-primary line-clamp-2">{item.name}</p>
        <p className="text-[13px] font-black text-[#D4AF37]">{formatCurrency(item.price)}</p>
        <p className="line-clamp-2 text-[12px] leading-5 text-text-secondary overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{item.desc}</p>
        <div className="mt-1 flex items-center justify-between">
          <span className="flex h-4 w-4 items-center justify-center rounded-sm border border-white/20">
            <span className={`h-2.5 w-2.5 rounded-sm ${isVegItem(item) ? 'bg-veg' : 'bg-red-urgent'}`}></span>
          </span>
          {quantity === 0 ? (
            <button
              onClick={() => onAdd(item)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D4AF37] text-[#120805] shadow-md transition hover:brightness-110"
            >
              <Plus className="h-4 w-4" />
            </button>
          ) : (
            <QuantityStepper
              quantity={quantity}
              onDecrease={() => onUpdateQuantity(item, quantity - 1)}
              onIncrease={() => onUpdateQuantity(item, quantity + 1)}
            />
          )}
        </div>
      </div>
      <div className="relative h-[100px] w-[100px] flex-shrink-0 overflow-hidden rounded-xl">
        <MenuCardImage src={imageSrc} alt={item.name} className="h-full w-full object-cover object-center" />
      </div>
    </article>
  )
}

function MenuItemCard({ item, quantity, onAdd, onUpdateQuantity }) {
  const imageSrc = item.img || '/hero-bg.jpg'
  const unavailable = item.available === false

  return (
    <article className="relative flex items-center gap-3 overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.04)] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.3)] transition duration-200 hover:border-[rgba(212,175,55,0.2)]" style={{ maxHeight: '180px' }}>
      <div className="flex min-w-0 flex-1 flex-col gap-1 self-stretch">
        <p className="text-[10px] font-black uppercase tracking-[2px] text-[#D4AF37] leading-none">{item.category?.name?.toUpperCase()}</p>
        <p className="text-[16px] font-semibold leading-tight text-text-primary line-clamp-1">{item.name}</p>
        <p
          className="text-[13px] leading-5 text-text-secondary"
          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
        >
          {item.desc}
        </p>
        <div className="mt-auto flex items-center justify-between pt-1">
          <p className="text-[16px] font-black text-[#D4AF37]">{formatCurrency(item.price)}</p>
          {unavailable ? (
            <span className="rounded-full bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[2px] text-text-dim">Unavailable</span>
          ) : quantity === 0 ? (
            <button
              onClick={() => onAdd(item)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D4AF37] text-[#120805] shadow-md transition hover:brightness-110"
            >
              <Plus className="h-4 w-4" />
            </button>
          ) : (
            <QuantityStepper
              quantity={quantity}
              onDecrease={() => onUpdateQuantity(item, quantity - 1)}
              onIncrease={() => onUpdateQuantity(item, quantity + 1)}
            />
          )}
        </div>
      </div>
      <div className="relative h-[140px] w-[140px] flex-shrink-0 overflow-hidden rounded-xl">
        <MenuCardImage src={imageSrc} alt={item.name} className="h-full w-full object-cover object-center" />
        <div className="absolute left-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-sm border border-white/20 bg-black/50">
          <span className={`h-3 w-3 rounded-sm ${isVegItem(item) ? 'bg-veg' : 'bg-red-urgent'}`}></span>
        </div>
      </div>
    </article>
  )
}

export default function MenuPage() {
  const carouselRef = useRef(null)
  const { siteSettings } = useSiteSettings()

  const [activeCategory, setActiveCategory] = useState('all')
  const [dietFilter, setDietFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [menuGroups, setMenuGroups] = useState({ all: [] })
  const [categoryList, setCategoryList] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const { addToCart, cartItems, updateQuantity, total, isCartOpen, setCartOpen } = useCart()
  const [heroParallaxY, setHeroParallaxY] = useState(0)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640)
  const [visibleCount, setVisibleCount] = useState(() => (window.innerWidth < 640 ? 6 : Number.POSITIVE_INFINITY))

  useEffect(() => {
    let isMounted = true

    const loadMenu = async () => {
      try {
        setIsLoading(true)
        setError('')
        const response = await publicApi.getMenu()
        if (!isMounted) {
          return
        }

        setMenuGroups(response.data.groupedItems || { all: [] })
        setCategoryList(
          Array.isArray(response.data.categories)
            ? response.data.categories
            : Object.entries(response.data.categoryMap || {})
                .filter(([slug]) => slug !== 'all')
                .map(([slug, name]) => ({ slug, name })),
        )
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.message || 'Failed to load menu')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadMenu()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 639px)')

    const handleMediaChange = (event) => {
      setIsMobile(event.matches)
      setVisibleCount(event.matches ? 6 : Number.POSITIVE_INFINITY)
    }

    handleMediaChange(mediaQuery)
    mediaQuery.addEventListener('change', handleMediaChange)
    return () => mediaQuery.removeEventListener('change', handleMediaChange)
  }, [])

  useEffect(() => {
    setVisibleCount(isMobile ? 6 : Number.POSITIVE_INFINITY)
  }, [activeCategory, dietFilter, search, isMobile])

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (ticking) {
        return
      }

      ticking = true
      window.requestAnimationFrame(() => {
        setHeroParallaxY(Math.min(window.scrollY * 0.22, 90))
        ticking = false
      })
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const heroImage = siteSettings?.heroMedia?.find((item) => item.type === 'image')?.url || '/hero-bg.jpg'
  const categoryEntries = useMemo(() => categoryList.filter((category) => category?.slug), [categoryList])
  const allItems = useMemo(() => menuGroups.all || [], [menuGroups])
  const favourites = useMemo(
    () => allItems.filter((item) => item.bestseller && item.available !== false).slice(0, 8),
    [allItems],
  )
  const totalItems = useMemo(
    () => cartItems.reduce((count, item) => count + item.quantity, 0),
    [cartItems],
  )

  const filteredSections = useMemo(() => {
    const query = search.trim().toLowerCase()

    return categoryEntries
      .map((category) => {
        const slug = category.slug
        const items = (menuGroups[slug] || []).filter((item) => {
          const matchesCategory = activeCategory === 'all' || slug === activeCategory
          const vegItem = isVegItem(item)
          const matchesDiet = dietFilter === 'all' || (dietFilter === 'veg' ? vegItem : !vegItem)
          const matchesSearch =
            !query ||
            item.name.toLowerCase().includes(query) ||
            (item.desc || '').toLowerCase().includes(query) ||
            (item.category?.name || '').toLowerCase().includes(query)

          return matchesCategory && matchesDiet && matchesSearch
        })

        return {
          slug,
          label: category.name,
          icon: category.icon,
          items,
        }
      })
      .filter((section) => section.items.length > 0)
  }, [activeCategory, categoryEntries, dietFilter, menuGroups, search])

  const totalFilteredItems = useMemo(
    () => filteredSections.reduce((count, section) => count + section.items.length, 0),
    [filteredSections],
  )

  const visibleSections = useMemo(() => {
    let remaining = isMobile ? visibleCount : Number.POSITIVE_INFINITY

    return filteredSections
      .map((section) => {
        if (remaining <= 0) {
          return null
        }

        const visibleItems = section.items.slice(0, remaining)
        remaining -= visibleItems.length

        return {
          ...section,
          visibleItems,
        }
      })
      .filter(Boolean)
  }, [filteredSections, isMobile, visibleCount])

  const hasMoreItems = isMobile && visibleCount < totalFilteredItems
  const hasActiveFilters = activeCategory !== 'all' || dietFilter !== 'all' || search.trim().length > 0

  const getItemQuantity = (itemId) => {
    const cartItem = cartItems.find((item) => item.id === itemId)
    return cartItem ? cartItem.quantity : 0
  }

  const handleAddToCart = (item) => {
    addToCart(item)
  }

  const handleUpdateQuantity = (item, nextQuantity) => {
    updateQuantity(item.id, Math.max(0, nextQuantity))
  }

  const handleClearFilters = () => {
    setActiveCategory('all')
    setDietFilter('all')
    setSearch('')
  }

  const scrollFavourites = (direction) => {
    carouselRef.current?.scrollBy({
      left: direction * 320,
      behavior: 'smooth',
    })
  }

  return (
    <div className="min-h-screen bg-bg-page pt-20">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Palavu menu banner"
            className="h-[115%] w-full object-cover"
            style={{ transform: `translateY(${heroParallaxY}px)` }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,1,0,0.45),rgba(5,1,0,0.78)_45%,rgba(5,1,0,0.92))]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.7)_100%)]"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 md:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-3 rounded-full border border-gold/20 bg-black/25 px-4 py-2 text-[11px] font-black uppercase tracking-[3px] text-gold backdrop-blur">
              <ChefHat className="h-4 w-4" />
              Konaseema Kitchen
            </div>
            <h1
              className="mt-6 text-center text-[54px] leading-none md:text-[78px]"
              style={{ fontFamily: 'Playfair Display, serif', textTransform: 'none', textShadow: '0 8px 28px rgba(212,175,55,0.22)' }}
            >
              Our Menu
            </h1>
            <p className="mt-4 text-[18px] text-[#f5ecd7] md:text-[24px]">Fresh Konaseema favourites.</p>
          </div>
        </div>
      </section>

      <div className="sticky top-[72px] z-30 border-b border-gold/20 bg-[#070301]/76 backdrop-blur-[12px]">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="mb-4 flex items-center justify-between sm:hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/15 bg-gold/10 text-gold">
                {siteSettings?.logoUrl ? (
                  <img src={siteSettings.logoUrl} alt={siteSettings.restaurantName} className="h-7 w-7 rounded-full object-cover" />
                ) : (
                  <ChefHat className="h-5 w-5" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">{siteSettings?.restaurantName || 'Palavu Centre'}</p>
                <p className="text-[10px] font-black uppercase tracking-[2px] text-text-dim">My Cart</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-gold/20 bg-black/25 text-gold"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gold px-1 text-[10px] font-black text-[#120805]">
                  {totalItems}
                </span>
              )}
            </button>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,360px)_1fr_auto] lg:items-center">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gold/70" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search menu"
                className="h-12 w-full rounded-full border border-gold/15 bg-black/25 pl-12 pr-11 text-sm text-text-primary outline-none transition focus:border-gold focus:shadow-[0_0_0_4px_rgba(212,160,23,0.12)]"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-text-dim transition hover:bg-white/5 hover:text-text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
              <FilterPill active={dietFilter === 'veg'} onClick={() => setDietFilter((current) => (current === 'veg' ? 'all' : 'veg'))}>
                Veg
              </FilterPill>
              <FilterPill active={dietFilter === 'nonveg'} onClick={() => setDietFilter((current) => (current === 'nonveg' ? 'all' : 'nonveg'))}>
                Non-Veg
              </FilterPill>
              {categoryEntries.map((category) => (
                <FilterPill
                  key={category.slug}
                  active={activeCategory === category.slug}
                  onClick={() => setActiveCategory((current) => (current === category.slug ? 'all' : category.slug))}
                >
                  {category.name}
                </FilterPill>
              ))}
            </div>

            {hasActiveFilters ? (
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-gold/20 px-4 py-3 text-[11px] font-black uppercase tracking-[2px] text-gold transition hover:bg-gold/10"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </button>
            ) : (
              <div className="hidden lg:block"></div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
        {!isLoading && !error && activeCategory === 'all' && dietFilter === 'all' && !search && favourites.length > 0 && (
          <section className="mb-10">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[3px] text-gold/70">Favourites</p>
                <p className="mt-3 text-[32px] leading-none text-text-primary" style={{ fontFamily: 'var(--font-body)' }}>
                  Popular picks
                </p>
              </div>

              <div className="hidden items-center gap-2 md:flex">
                <button type="button" onClick={() => scrollFavourites(-1)} className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/20 bg-black/20 text-gold transition hover:bg-gold/10">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button type="button" onClick={() => scrollFavourites(1)} className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/20 bg-black/20 text-gold transition hover:bg-gold/10">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div ref={carouselRef} className="scrollbar-hide flex snap-x gap-3 overflow-x-auto pb-2">
              {favourites.map((item) => (
                <FavouriteCard
                  key={item.id}
                  item={item}
                  quantity={getItemQuantity(item.id)}
                  onAdd={handleAddToCart}
                  onUpdateQuantity={handleUpdateQuantity}
                />
              ))}
            </div>
          </section>
        )}

        {isLoading ? (
          <div className="rounded-[32px] border border-gold/12 bg-black/20 px-6 py-20 text-center text-text-secondary">Loading menu...</div>
        ) : error ? (
          <div className="rounded-[32px] border border-red-500/30 bg-red-950/30 px-6 py-20 text-center text-red-100">{error}</div>
        ) : visibleSections.length === 0 ? (
          <div className="rounded-[32px] border border-gold/12 bg-black/20 px-6 py-20 text-center">
            <p className="text-[28px] leading-none text-text-primary" style={{ fontFamily: 'var(--font-body)' }}>
              No items found
            </p>
            <p className="mt-4 text-sm text-text-secondary">Try another search or filter.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {visibleSections.map((section) => {
              const CategoryIcon = getMenuCategoryIcon(section.icon)

              return (
                <section key={section.slug}>
                  <div className="mb-5 flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/15 bg-gold/10 text-gold">
                        <CategoryIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[28px] leading-none text-text-primary" style={{ fontFamily: 'var(--font-body)' }}>
                          {section.label.toUpperCase()}
                        </p>
                        <span className="mt-2 block h-[2px] w-10 bg-[#D4AF37]"></span>
                      </div>
                    </div>
                    <div className="h-px flex-1 bg-[linear-gradient(90deg,rgba(212,160,23,0.4),rgba(212,160,23,0.04))]"></div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {section.visibleItems.map((item) => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        quantity={getItemQuantity(item.id)}
                        onAdd={handleAddToCart}
                        onUpdateQuantity={handleUpdateQuantity}
                      />
                    ))}
                  </div>
                </section>
              )
            })}

            {hasMoreItems && (
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={() => setVisibleCount((current) => current + 6)}
                  className="brand-secondary-btn px-6 py-4 text-[11px]"
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {cartItems.length > 0 && !isCartOpen && (
        <div className="fixed bottom-4 left-1/2 z-[60] w-[calc(100%-1.5rem)] max-w-3xl -translate-x-1/2 animate-slideUp rounded-[28px] border border-gold/15 border-l-[3px] border-l-[#D4AF37] bg-[#120704]/92 px-4 py-4 shadow-[0_25px_70px_rgba(0,0,0,0.6)] backdrop-blur-[16px]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[3px] text-gold/70">{totalItems} items in cart</p>
              <p className="mt-2 text-xl font-black text-gold">{formatCurrency(total)}</p>
            </div>
            <button onClick={() => setCartOpen(true)} className="brand-primary-btn flex px-6 py-4 text-[11px]">
              <ShoppingCart className="h-4 w-4 animate-cart-icon-pulse" />
              View Cart
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
