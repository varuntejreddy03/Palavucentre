import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ChefHat,
  ChevronRight,
  Clock3,
  MapPin,
  Search,
  Sparkles,
  Star,
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

function LogoMark({ logoUrl, restaurantName }) {
  if (logoUrl) {
    return <img src={logoUrl} alt={restaurantName} className="h-11 w-11 rounded-full object-cover" />
  }

  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--gold-surface)] text-[13px] font-bold text-[var(--gold)]">
      PC
    </div>
  )
}

function AccountAvatar({ initials, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--gold-surface)] text-[13px] font-semibold text-[var(--gold)] transition hover:border-[var(--border-strong)]"
      aria-label={label}
    >
      {initials}
    </button>
  )
}

function HeaderAction({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-11 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-3 text-[12px] font-semibold text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
    >
      <Icon className="h-4 w-4 text-[var(--gold)]" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}

function SearchField({ value, onChange, inputRef }) {
  return (
    <label className="relative block">
      <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-hint)]" />
      <input
        ref={inputRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search menu"
        className="flow-input h-12 pr-4" style={{ paddingLeft: '52px' }}
      />
    </label>
  )
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition ${
        active
          ? 'border-[var(--border-strong)] bg-[var(--gold-surface)] text-[var(--text-primary)]'
          : 'border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'
      }`}
    >
      {children}
    </button>
  )
}

function VegBadge({ veg }) {
  return (
    <span className="absolute left-3 top-3 flex h-4 w-4 items-center justify-center rounded-full bg-[rgba(0,0,0,0.42)]">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: veg ? 'var(--veg)' : 'var(--nonveg)' }}
      />
    </span>
  )
}

function ItemCard({ item, quantity, onAdd, onUpdateQuantity }) {
  const veg = isVegItem(item)
  const unavailable = item.available === false

  return (
    <article className="flow-card flow-card-hover flex items-start gap-4 rounded-[12px] p-4">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[10px] bg-[var(--bg-elevated)]">
        {item.img ? (
          <img src={item.img} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[var(--gold)]">
            <ChefHat className="h-6 w-6" />
          </div>
        )}
        <VegBadge veg={veg} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-[14px] font-medium text-[var(--text-primary)]">{item.name}</h3>
            {item.bestseller ? (
              <span className="mt-2 inline-flex rounded-full border border-[var(--gold-muted)] bg-[var(--gold-surface)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--gold-light)]">
                Bestseller
              </span>
            ) : null}
          </div>
          <span className="text-[15px] font-semibold text-[var(--gold)]">{formatCurrency(item.price)}</span>
        </div>

        <p className="mt-2 line-clamp-2 text-[12px] leading-5 text-[var(--text-secondary)]">
          {item.desc || item.description || 'Freshly prepared to order.'}
        </p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-hint)]">
            {item.category?.name || 'Chef special'}
          </span>

          {unavailable ? (
            <span className="rounded-[8px] border border-[var(--border)] px-3 py-2 text-[12px] text-[var(--text-hint)]">
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
              onClick={() => onAdd(item)}
              className="rounded-[8px] border-[1.5px] border border-[var(--gold)] px-4 py-2 text-[13px] font-semibold text-[var(--gold)] transition hover:bg-[var(--gold-surface)]"
            >
              ADD
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

function FavouriteCard({ item, quantity, onAdd, onUpdateQuantity }) {
  return (
    <article className="flow-card flex min-w-[280px] max-w-[280px] snap-start gap-3 rounded-[14px] p-3">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[10px] bg-[var(--bg-elevated)]">
        {item.img ? (
          <img src={item.img} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[var(--gold)]">
            <Sparkles className="h-5 w-5" />
          </div>
        )}
        <VegBadge veg={isVegItem(item)} />
      </div>

      <div className="min-w-0 flex-1">
        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--gold-surface)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--gold-light)]">
          <Star className="h-3 w-3" />
          Popular
        </span>
        <p className="mt-2 line-clamp-1 text-[14px] font-medium text-[var(--text-primary)]">{item.name}</p>
        <p className="mt-1 text-[12px] text-[var(--text-secondary)]">{item.desc || item.description}</p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-[15px] font-semibold text-[var(--gold)]">{formatCurrency(item.price)}</span>
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
              className="rounded-[8px] border-[1.5px] border border-[var(--gold)] px-3 py-2 text-[12px] font-semibold text-[var(--gold)] transition hover:bg-[var(--gold-surface)]"
            >
              ADD
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

function MenuSidebar({ categories, activeSlug, onSelect }) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-[112px] flow-card overflow-hidden rounded-[18px] p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-hint)]">Categories</p>
        <div className="mt-3 space-y-1">
          {categories.map((category) => (
            <button
              key={category.slug}
              type="button"
              onClick={() => onSelect(category.slug)}
              className={`flex w-full items-center gap-3 border-l-2 px-3 py-3 text-left text-[13px] transition ${
                activeSlug === category.slug
                  ? 'border-[var(--gold)] bg-[rgba(212,160,23,0.06)] text-[var(--text-primary)]'
                  : 'border-transparent text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[rgba(255,255,255,0.02)] hover:text-[var(--text-primary)]'
              }`}
            >
              {category.icon ? (
                (() => {
                  const CategoryIcon = getMenuCategoryIcon(category.icon)
                  return <CategoryIcon className="h-4 w-4 shrink-0 text-[var(--gold)]" />
                })()
              ) : (
                <ChefHat className="h-4 w-4 shrink-0 text-[var(--gold)]" />
              )}
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}

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

        if (!isMounted) {
          return
        }

        setMenuGroups(response.data.groupedItems || { all: [] })
        setCategoryList(response.data.categories || [])
        setMenuNotice(response.meta?.degraded ? response.meta?.degradedMessage || 'Menu temporarily unavailable' : '')
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

    const handleChange = (event) => {
      setVisibleCount(event.matches ? 6 : Number.POSITIVE_INFINITY)
    }

    handleChange(mediaQuery)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const categoryEntries = useMemo(
    () => (Array.isArray(categoryList) ? categoryList.filter((category) => category?.slug) : []),
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
    if (isAuthenticated) {
      navigate('/profile')
      return
    }

    navigateToLoginWithRedirect(navigate, PROFILE_ROUTE, 'profile')
  }

  const handleTrackClick = () => {
    if (isAuthenticated) {
      navigate('/profile?tab=orders')
      return
    }

    navigateToLoginWithRedirect(navigate, PROFILE_ORDERS_ROUTE, 'profile')
  }

  const filteredSections = useMemo(() => {
    const query = search.trim().toLowerCase()

    return categoryEntries
      .map((category) => {
        const items = (menuGroups[category.slug] || []).filter((item) => {
          const matchesCategory = categoryFilter === 'all' || category.slug === categoryFilter
          const matchesDiet =
            dietFilter === 'all' ||
            (dietFilter === 'veg' ? isVegItem(item) : !isVegItem(item))
          const matchesSearch =
            !query ||
            item.name.toLowerCase().includes(query) ||
            (item.desc || item.description || '').toLowerCase().includes(query) ||
            (item.category?.name || '').toLowerCase().includes(query)

          return matchesCategory && matchesDiet && matchesSearch
        })

        return {
          ...category,
          items,
        }
      })
      .filter((section) => section.items.length > 0)
  }, [categoryEntries, categoryFilter, dietFilter, menuGroups, search])

  const totalFilteredItems = useMemo(
    () => filteredSections.reduce((count, section) => count + section.items.length, 0),
    [filteredSections],
  )

  const visibleSections = useMemo(() => {
    let remaining = visibleCount

    if (!isMobile) {
      return filteredSections.map((section) => ({ ...section, visibleItems: section.items }))
    }

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
  const hasActiveFilters = categoryFilter !== 'all' || dietFilter !== 'all' || Boolean(search.trim())

  useEffect(() => {
    if (categoryFilter !== 'all') {
      setActiveSidebarSlug(categoryFilter)
    } else if (visibleSections[0]?.slug) {
      setActiveSidebarSlug(visibleSections[0].slug)
    }
  }, [categoryFilter, visibleSections])

  useEffect(() => {
    if (categoryFilter !== 'all') {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const intersectingEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0]

        if (intersectingEntry?.target?.id) {
          setActiveSidebarSlug(intersectingEntry.target.id.replace('menu-section-', ''))
        }
      },
      {
        rootMargin: '-20% 0px -55% 0px',
        threshold: [0.15, 0.35, 0.6],
      },
    )

    visibleSections.forEach((section) => {
      const sectionElement = sectionRefs.current[section.slug]
      if (sectionElement) {
        observer.observe(sectionElement)
      }
    })

    return () => observer.disconnect()
  }, [categoryFilter, visibleSections])

  const getItemQuantity = (itemId) => cartItems.find((item) => item.id === itemId)?.quantity || 0

  const handleUpdateQuantity = (item, nextQuantity) => {
    updateQuantity(item.id, Math.max(0, nextQuantity))
  }

  const scrollToCategory = (slug) => {
    setActiveSidebarSlug(slug)
    setCategoryFilter('all')

    const element = sectionRefs.current[slug]
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }

  const handleClearFilters = () => {
    setSearch('')
    setDietFilter('all')
    setCategoryFilter('all')
  }

  return (
    <div className="flow-page flow-page-enter pb-24">
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[rgba(26,18,8,0.94)] backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-3 px-4 md:h-16">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex min-w-0 items-center gap-3 text-left"
          >
            <LogoMark logoUrl={siteSettings?.logoUrl} restaurantName={siteSettings?.restaurantName} />
            <div className="min-w-0">
              <p className="truncate text-[clamp(1rem,2vw,1.15rem)] font-medium text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-display)' }}>
                {siteSettings?.restaurantName || 'Palavu Centre'}
              </p>
              <p className="truncate text-[11px] uppercase tracking-[0.16em] text-[var(--text-hint)]">
                Konaseema kitchen
              </p>
            </div>
          </button>

          <div className="hidden rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-2 text-[13px] text-[var(--text-secondary)] md:flex md:items-center md:gap-2">
            <MapPin className="h-4 w-4 text-[var(--gold)]" />
            <span>{locationLabel}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => searchInputRef.current?.focus()}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
              aria-label="Focus search"
            >
              <Search className="h-4 w-4" />
            </button>
            <HeaderAction icon={Clock3} label="Track" onClick={handleTrackClick} />
            <AccountAvatar
              initials={accountInitials}
              label={isAuthenticated ? 'Open profile' : 'Login to continue'}
              onClick={handleAccountClick}
            />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1200px] px-4 py-6">
        <div className="mb-6 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
          <div className="space-y-3">
            <SearchField value={search} onChange={setSearch} inputRef={searchInputRef} />
            <div className="flex flex-wrap gap-2">
              <FilterChip active={dietFilter === 'veg'} onClick={() => setDietFilter(dietFilter === 'veg' ? 'all' : 'veg')}>
                Veg
              </FilterChip>
              <FilterChip active={dietFilter === 'nonveg'} onClick={() => setDietFilter(dietFilter === 'nonveg' ? 'all' : 'nonveg')}>
                Non-Veg
              </FilterChip>
              {categoryEntries.map((category) => (
                <FilterChip
                  key={category.slug}
                  active={categoryFilter === category.slug}
                  onClick={() => setCategoryFilter(categoryFilter === category.slug ? 'all' : category.slug)}
                >
                  {category.name}
                </FilterChip>
              ))}
            </div>
          </div>

          {hasActiveFilters ? (
            <button type="button" onClick={handleClearFilters} className="flow-outline-btn h-12 px-5">
              Clear Filters
            </button>
          ) : (
            <div className="hidden md:block" />
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <MenuSidebar categories={categoryEntries} activeSlug={activeSidebarSlug} onSelect={scrollToCategory} />

          <div className="min-w-0 space-y-8">
            {!isLoading && !error && !hasActiveFilters && popularItems.length > 0 ? (
              <section>
                <div className="mb-4 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-hint)]">Chef edits</p>
                    <h2 className="mt-2 text-[22px] font-medium text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-body)' }}>
                      Popular picks
                    </h2>
                  </div>
                </div>
                <div className="scrollbar-hide flex snap-x gap-3 overflow-x-auto pb-2">
                  {popularItems.map((item) => (
                    <FavouriteCard
                      key={item.id}
                      item={item}
                      quantity={getItemQuantity(item.id)}
                      onAdd={addToCart}
                      onUpdateQuantity={handleUpdateQuantity}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {menuNotice ? (
              <div className="flow-card rounded-[14px] border-l-[3px] border-l-[var(--gold)] bg-[var(--bg-elevated)] px-4 py-3 text-[13px] text-[var(--text-secondary)]">
                {menuNotice}
              </div>
            ) : null}

            {isLoading ? (
              <div className="flow-card rounded-[18px] px-6 py-16 text-center text-[var(--text-secondary)]">Loading menu...</div>
            ) : error ? (
              <div className="flow-card rounded-[18px] border border-[rgba(198,40,40,0.4)] px-6 py-16 text-center text-[var(--danger-text)]">
                {error}
              </div>
            ) : visibleSections.length === 0 ? (
              <div className="flow-card rounded-[18px] px-6 py-16 text-center">
                <p className="text-[22px] font-medium text-[var(--text-primary)]">No items found</p>
                <p className="mt-2 text-[13px] text-[var(--text-secondary)]">Try another search or filter.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {visibleSections.map((section) => {
                  const CategoryIcon = getMenuCategoryIcon(section.icon)

                  return (
                    <section
                      key={section.slug}
                      id={`menu-section-${section.slug}`}
                      ref={(element) => {
                        sectionRefs.current[section.slug] = element
                      }}
                    >
                      <div className="mb-4 flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--gold-surface)] text-[var(--gold)]">
                          <CategoryIcon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <h2 className="text-[16px] font-medium text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-body)' }}>
                            {section.name}
                          </h2>
                          <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--text-hint)]">
                            {section.visibleItems.length} dishes
                          </p>
                        </div>
                        <div className="h-px flex-1 bg-[linear-gradient(90deg,var(--border-strong),transparent)]" />
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
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

                {hasMoreItems ? (
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((current) => current + 6)}
                      className="flow-outline-btn h-11 px-5"
                    >
                      Load More
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}
