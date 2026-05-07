import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Award, Camera, Leaf, Minus, PartyPopper, Plus, Store, UtensilsCrossed, Users } from 'lucide-react'

import Contact from '../components/Contact'
import Reviews from '../components/Reviews'
import { useCart } from '../context/CartContext'
import { useSiteSettings } from '../context/SiteContext'
import { publicApi } from '../lib/api'
import { formatCurrency } from '../lib/formatters'

const quickLinks = [
  { icon: UtensilsCrossed, label: 'Our Menu', path: '/menu' },
  { icon: PartyPopper, label: 'Catering', path: '/catering' },
  { icon: Camera, label: 'Gallery', path: '/gallery' },
  { icon: Store, label: 'Franchise', path: '/franchise' },
]

const values = [
  {
    icon: Award,
    title: 'Heritage Recipes',
    desc: 'Traditional Godavari recipes served with the same warmth and depth people expect from home food.',
  },
  {
    icon: Leaf,
    title: 'Village Flavours',
    desc: 'A bold Konaseema-style profile across biryanis, curries, fries, and catering menus.',
  },
  {
    icon: Users,
    title: 'Family Feasts',
    desc: 'Built for dine-in, takeaway, and event orders with hearty portions and familiar favourites.',
  },
]

const heroStats = (menuItemCount) => [
  { value: '2K+', label: 'Daily Customers' },
  { value: '4.8', label: 'Rating' },
  { value: '100%', label: 'Quality' },
]

function getHeroLines(name) {
  const brandName = String(name || 'RajaMahendravaram Palavu Centre').trim()
  const exactBrandMatch = brandName.match(/^(.*)\s+(Palavu\s*Centre)$/i)

  if (exactBrandMatch) {
    return [exactBrandMatch[1], exactBrandMatch[2]]
  }

  const words = brandName.split(/\s+/).filter(Boolean)
  const midpoint = Math.ceil(words.length / 2)
  return [words.slice(0, midpoint).join(' '), words.slice(midpoint).join(' ')]
}

function isVegItem(item) {
  return item?.veg === true || item?.isVeg === true
}

function HeroVideoCard({ restaurantName, phone, mobile = false }) {
  return (
    <div className={`relative mx-auto w-full ${mobile ? 'max-w-[360px]' : 'max-w-[520px] lg:mx-0'}`}>
      <div className={`absolute ${mobile ? '-inset-3' : '-inset-6'} rounded-[40px] bg-gold/10 blur-3xl`}></div>
      <div className="relative overflow-hidden rounded-[32px] border-2 border-gold/40 bg-black shadow-[0_30px_70px_rgba(0,0,0,0.9)]">
        <video autoPlay loop muted playsInline className="aspect-[4/5] w-full object-cover">
          <source src="/Video-797.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent"></div>
        <div
          className={`absolute rounded-full bg-[#FFD700] text-black shadow-xl ${
            mobile
              ? 'right-3 top-3 px-4 py-2 text-[10px] tracking-[2px]'
              : 'right-4 top-4 px-5 py-2 text-[11px] tracking-[3px]'
          } font-black uppercase`}
        >
          Franchise Open
        </div>
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-black/45 px-5 py-4 backdrop-blur">
          <p className="text-[11px] font-bold uppercase tracking-[3px] text-gold/70">{restaurantName}</p>
          <p className="mt-2 text-sm text-text-secondary">{phone}</p>
        </div>
      </div>
    </div>
  )
}

function QuantityControl({ quantity, onDecrease, onIncrease, compact = false }) {
  return (
    <div
      className={`flex items-center rounded-full border border-[#D6B154]/35 bg-[#1A0A04] shadow-[0_12px_30px_rgba(0,0,0,0.28)] ${
        compact ? 'gap-2 px-2 py-1.5' : 'justify-between px-3 py-2'
      }`}
    >
      <button
        onClick={onDecrease}
        className={`flex items-center justify-center rounded-full bg-white/5 text-gold transition hover:bg-gold/15 ${
          compact ? 'h-8 w-8' : 'h-10 w-10'
        }`}
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className={`${compact ? 'w-6 text-sm' : 'text-lg'} text-center font-black text-gold`}>{quantity}</span>
      <button
        onClick={onIncrease}
        className={`flex items-center justify-center rounded-full bg-gold text-[#160500] transition hover:bg-gold-bright ${
          compact ? 'h-8 w-8' : 'h-10 w-10'
        }`}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}

function HomeMenuItemCard({ item, quantity, onAdd, onUpdateQuantity }) {
  const unavailable = item.available === false

  return (
    <article className="relative flex items-center gap-3 overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.04)] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.3)] transition duration-200 hover:border-[rgba(212,175,55,0.2)]">
      <div className="flex min-w-0 flex-1 flex-col gap-1 self-stretch">
        <p className="text-[10px] font-black uppercase tracking-[2px] text-[#D4AF37] leading-none">
          {(item.category?.name || 'Special').toUpperCase()}
        </p>
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
            <span className="rounded-full bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[2px] text-text-dim">
              Unavailable
            </span>
          ) : quantity === 0 ? (
            <button
              onClick={() => onAdd(item)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D4AF37] text-[#120805] shadow-md transition hover:brightness-110"
            >
              <Plus className="h-4 w-4" />
            </button>
          ) : (
            <QuantityControl
              compact
              quantity={quantity}
              onDecrease={() => onUpdateQuantity(item, quantity - 1)}
              onIncrease={() => onUpdateQuantity(item, quantity + 1)}
            />
          )}
        </div>
      </div>

      <div className="relative h-[124px] w-[124px] flex-shrink-0 overflow-hidden rounded-xl sm:h-[132px] sm:w-[132px]">
        <img src={item.img || '/hero-bg.jpg'} alt={item.name} className="h-full w-full object-cover object-center" />
        <div className="absolute left-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-sm border border-white/20 bg-black/50">
          <span className={`h-3 w-3 rounded-sm ${isVegItem(item) ? 'bg-veg' : 'bg-red-urgent'}`}></span>
        </div>
      </div>
    </article>
  )
}

export default function Home() {
  const { siteSettings } = useSiteSettings()
  const { addToCart, cartItems, updateQuantity } = useCart()
  const [menuItems, setMenuItems] = useState([])
  const [offers, setOffers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadHomeData = async () => {
      try {
        setIsLoading(true)
        setError('')

        const [menuResponse, offersResponse] = await Promise.all([
          publicApi.getMenu(),
          publicApi.getOffers(),
        ])

        if (!isMounted) {
          return
        }

        setMenuItems(menuResponse.data.items || [])
        setOffers(offersResponse.data.items || [])
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.message || 'Failed to load homepage content')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadHomeData()

    return () => {
      isMounted = false
    }
  }, [])

  const restaurantName = siteSettings?.restaurantName || 'RajaMahendravaram Palavu Centre'
  const heroLines = getHeroLines(restaurantName)
  const contact = siteSettings?.contact || {}
  const primaryCta = siteSettings?.cta?.primary || { label: 'Order Online', href: '/menu' }
  const secondaryCta = siteSettings?.cta?.secondary || { label: 'Contact Us', href: '/contact' }
  const city = siteSettings?.seo?.city || 'Hyderabad'
  const homeMenuItems = useMemo(() => {
    const availableItems = menuItems.filter((item) => item.available !== false)
    const bestSellerItems = availableItems.filter((item) => item.bestseller)

    return (bestSellerItems.length > 0 ? bestSellerItems : availableItems).slice(0, 5)
  }, [menuItems])
  const hasBestSellers = homeMenuItems.some((item) => item.bestseller)
  const stats = heroStats(menuItems.length)

  const getItemQuantity = (itemId) => {
    const item = cartItems.find((cartItem) => cartItem.id === itemId)
    return item ? item.quantity : 0
  }

  const handleUpdateQuantity = (item, nextQuantity) => {
    if (nextQuantity <= 0) {
      updateQuantity(item.id, 0)
      return
    }

    updateQuantity(item.id, nextQuantity)
  }

  const renderHeroBackdrop = () => (
    <>
      <img src="/hero-bg.jpg" alt="Rajamahendravaram bridge" className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,1,0,0.92)_0%,rgba(5,1,0,0.68)_40%,rgba(5,1,0,0.88)_100%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,168,76,0.14),transparent_28%)]"></div>
    </>
  )

  return (
    <div className="animate-fadeIn">
      <section className="pt-16 lg:pt-[70px]">
        <div className="lg:hidden">
          <div className="relative overflow-hidden border-b border-gold/15">
            <div className="absolute inset-0">{renderHeroBackdrop()}</div>
            <div className="relative z-10 px-4 pb-10 pt-6">
              <div className="mx-auto max-w-[340px] text-center">
                <h1 className="brand-logo-hero" style={{ fontSize: 'clamp(21px, 6.4vw, 30px)', lineHeight: '0.98', letterSpacing: '0px' }}>
                  <span className="block">{heroLines[0]}</span>
                  <span className="block">{heroLines[1]}</span>
                </h1>

                <div className="mt-5 flex items-center justify-center gap-3">
                  <div className="h-px w-8 bg-[#E8C84A]/50"></div>
                  <span className="text-[10px] font-bold uppercase tracking-[4px] text-[#E8C84A]">
                    Authentic Godavari Cuisine
                  </span>
                  <div className="h-px w-8 bg-[#E8C84A]/50"></div>
                </div>

                <p className="mt-7 text-[16px] italic text-[#F5ECD7] sm:text-[20px]">
                  Experience Konaseema in {city}
                </p>
                <p className="mt-4 text-[15px] leading-8 text-[rgba(245,236,215,0.82)]">
                  {siteSettings?.restaurantDescription || 'Authentic flavors, traditional recipes, unforgettable taste.'}
                </p>

                <div className="mt-8 grid grid-cols-2 gap-3">
                  <Link
                    to={primaryCta.href || '/menu'}
                    className="shimmer-btn rounded-[50px] bg-gradient-to-br from-[#C9A84C] to-[#A07830] px-4 py-4 text-center text-[11px] font-black uppercase tracking-[2px] text-[#1A0500] transition hover:scale-[1.02] hover:shadow-[0_10px_40px_rgba(201,168,76,0.35)]"
                  >
                    {primaryCta.label || 'Order Online'}
                  </Link>
                  <Link
                    to={secondaryCta.href || '/contact'}
                    className="rounded-[50px] border-2 border-[#C9A84C] bg-white/5 px-4 py-4 text-center text-[11px] font-black uppercase tracking-[2px] text-[#C9A84C] transition hover:bg-[#C9A84C] hover:text-[#1A0500]"
                  >
                    {secondaryCta.label || 'Contact Us'}
                  </Link>
                </div>

                <div className="mt-10 grid grid-cols-3 gap-x-5 gap-y-7">
                  {stats.map((stat, index) => (
                    <div key={stat.label} className={index === 3 ? 'col-span-3 text-center' : 'text-center'}>
                      <p className="text-[22px] font-black text-[#E8C84A]">{stat.value}</p>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-[2px] text-white/60">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#050100] px-4 py-5">
            <HeroVideoCard
              restaurantName={restaurantName}
              phone={contact.phone || '9966655997'}
              mobile
            />
          </div>
        </div>

        <div className="relative hidden overflow-hidden lg:block">
          <div className="absolute inset-0">{renderHeroBackdrop()}</div>
          <div className="relative z-10 mx-auto flex min-h-[calc(100vh-70px)] max-w-7xl items-center px-4 py-12">
            <div className="flex w-full flex-col gap-10 lg:flex-row lg:items-center">
              <div className="lg:w-[62%] lg:pl-[40px]">
                <h1 className="brand-logo-hero home-hero-title text-left">
                  <span className="block">{heroLines[0]}</span>
                  <span className="block">{heroLines[1]}</span>
                </h1>

                <div className="mt-7 flex items-center gap-4">
                  <div className="h-px w-10 bg-[#E8C84A]/50"></div>
                  <span className="text-[13px] font-bold uppercase tracking-[6px] text-[#E8C84A]">
                    AUTHENTIC GODAVARI CUISINE
                  </span>
                  <div className="h-px w-10 bg-[#E8C84A]/50"></div>
                </div>

                <p className="mt-10 text-[20px] italic text-[#F5ECD7] md:text-[28px]">
                  Experience Konaseema in {city}
                </p>
                <p className="mt-5 max-w-[640px] text-[15px] leading-8 text-[rgba(245,236,215,0.82)] md:text-[17px]">
                  {siteSettings?.restaurantDescription || 'Authentic flavors, traditional recipes, unforgettable taste.'}
                </p>

                <div className="mt-9 flex gap-4">
                  <Link
                    to={primaryCta.href || '/menu'}
                    className="shimmer-btn rounded-[50px] bg-gradient-to-br from-[#C9A84C] to-[#A07830] px-8 py-4 text-center text-[14px] font-black uppercase tracking-[3px] text-[#1A0500] transition hover:scale-[1.02] hover:shadow-[0_10px_40px_rgba(201,168,76,0.35)]"
                  >
                    {primaryCta.label || 'Order Online'}
                  </Link>
                  <Link
                    to={secondaryCta.href || '/contact'}
                    className="rounded-[50px] border-2 border-[#C9A84C] bg-white/5 px-8 py-4 text-center text-[14px] font-black uppercase tracking-[3px] text-[#C9A84C] transition hover:bg-[#C9A84C] hover:text-[#1A0500]"
                  >
                    {secondaryCta.label || 'Contact Us'}
                  </Link>
                </div>

                <div className="mt-12 flex flex-wrap gap-8 md:gap-12">
                  {stats.map((stat) => (
                    <div key={stat.label} className="relative pr-8 last:pr-0">
                      <p className="text-4xl font-black text-[#E8C84A]">{stat.value}</p>
                      <p className="mt-2 text-[11px] font-bold uppercase tracking-[3px] text-white/60">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:flex lg:w-[38%] lg:justify-end">
                <HeroVideoCard restaurantName={restaurantName} phone={contact.phone || '9966655997'} />
              </div>
            </div>
          </div>
        </div>

        <section className="relative z-10 hidden md:block border-y border-gold/20 bg-black/20 px-4 py-5 backdrop-blur-sm">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 md:grid-cols-4">
            {quickLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="group flex flex-col items-center rounded-2xl border border-gold/10 bg-white/[0.03] px-4 py-5 text-center transition hover:-translate-y-1 hover:border-gold/30 hover:bg-gold/5"
              >
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-gold/20 bg-gold/10">
                  <item.icon className="h-6 w-6 text-gold" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-[3px] text-text-secondary transition group-hover:text-gold">
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </section>

      {!isLoading && !error && homeMenuItems.length > 0 && (
        <section
          id="menu"
          className="relative overflow-hidden bg-[radial-gradient(circle_at_top,#2A1007_0%,#120703_45%,#080301_100%)] px-4 py-14 md:py-20"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(214,177,84,0.14),transparent_30%)]"></div>
          <div className="mx-auto max-w-7xl">
            <div className="relative z-10 mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="section-title-treatment text-left">Best Sellers</h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[#E5D8BC]/78">
                  {hasBestSellers
                    ? 'Fast-moving dishes customers keep coming back for, presented with quicker actions and cleaner card layouts.'
                    : 'Our top menu picks with quicker actions and cleaner card layouts, ready for faster ordering.'}
                </p>
              </div>
              <Link
                to="/menu"
                className="inline-flex rounded-full border border-gold/20 bg-white/[0.03] px-6 py-3 text-[12px] font-bold uppercase tracking-[3px] text-gold transition hover:bg-gold hover:text-bg-page"
              >
                View Full Menu
              </Link>
            </div>

            <div className="relative z-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {homeMenuItems.map((item) => (
                <HomeMenuItemCard
                  key={item.id}
                  item={item}
                  quantity={getItemQuantity(item.id)}
                  onAdd={addToCart}
                  onUpdateQuantity={handleUpdateQuantity}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {!isLoading && error && (
        <section className="bg-black/10 px-4 py-14 md:py-20">
          <div className="mx-auto max-w-7xl rounded-2xl border border-red-500/30 bg-red-950/30 px-5 py-4 text-center text-red-100">
            {error}
          </div>
        </section>
      )}

      <section className="bg-bg-even px-4 py-14 md:py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="section-title-treatment text-center">Why Choose Us</h2>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {values.map((item) => (
              <div
                key={item.title}
                className="rounded-[28px] border border-gold/15 bg-bg-card p-8 transition hover:-translate-y-1 hover:border-gold/35 hover:shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
              >
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-gold/25 bg-gold/10">
                  <item.icon className="h-7 w-7 text-gold" />
                </div>
                <h3 className="text-[28px] font-semibold text-gold-bright">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-text-secondary">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {offers.length > 0 && (
        <section className="gold-texture relative overflow-hidden bg-[linear-gradient(135deg,#2D0808,#1A0505)] px-4 py-14 md:py-20">
          <div className="mx-auto max-w-7xl">
            <h2 className="section-title-treatment text-center">Special Offers</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {offers.slice(0, 2).map((offer) => (
                <div key={offer.id} className="overflow-hidden rounded-[28px] border border-gold/20 bg-black/30 backdrop-blur-sm">
                  {offer.imageUrl && <img src={offer.imageUrl} alt={offer.title} className="h-52 w-full object-cover" />}
                  <div className="p-6">
                    <div className="mb-3 inline-flex rounded-full bg-gold px-3 py-1 text-[10px] font-black uppercase tracking-[2px] text-bg-page">
                      {offer.status}
                    </div>
                    <h3 className="text-[28px] font-semibold text-gold-bright">{offer.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-text-secondary">{offer.description}</p>
                    <Link
                      to={offer.ctaHref || '/menu'}
                      className="mt-6 inline-flex rounded-full border border-gold/20 px-4 py-2 text-[12px] font-bold uppercase tracking-[3px] text-gold transition hover:bg-gold hover:text-bg-page"
                    >
                      {offer.ctaLabel || 'Explore Offer'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Reviews />
      <Contact />
    </div>
  )
}
