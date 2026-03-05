import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { UtensilsCrossed, PartyPopper, Camera, ShoppingBag, Award, Leaf, Users, Instagram } from 'lucide-react'
import Reviews from '../components/Reviews'

const heroImages = [
  'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1920&q=80',
  'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=1920&q=80',
  'https://images.unsplash.com/photo-1574484284002-952d92456975?w=1920&q=80',
  'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1920&q=80',
  'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=1920&q=80',
]

const featured = [
  { id: 7, name: 'Natu Kodi Biryani', desc: 'Country chicken biryani with aromatic spices', price: 350, img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600', veg: false },
  { id: 2, name: 'Royyala Vepudu', desc: 'Spicy Godavari-style prawn fry', price: 280, img: 'https://images.unsplash.com/photo-1633504581786-316c8002b1b9?w=600', veg: false },
  { id: 4, name: 'Natu Kodi Pulusu', desc: 'Country chicken curry with traditional spices', price: 320, img: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=600', veg: false },
]

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="animate-fadeIn">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {heroImages.map((img, idx) => (
          <div key={idx} className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
            <img src={img} alt="Hero" className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{background: 'linear-gradient(to bottom, rgba(8,5,1,0.50) 0%, rgba(8,5,1,0.40) 30%, rgba(8,5,1,0.75) 70%, rgba(8,5,1,0.95) 100%)'}}></div>
          </div>
        ))}

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-20">
          <div className="mb-6">
            <div className="w-16 h-[1px] bg-gold mx-auto mb-6 opacity-60"></div>
            <span className="inline-block text-[14px] uppercase tracking-[4px] text-gold-bright mb-8" style={{fontFamily: 'Inter, sans-serif', fontWeight: 500}}>Authentic Godavari Cuisine</span>
          </div>
          
          <h1 className="text-[72px] md:text-[96px] lg:text-[110px] leading-[0.9] mb-8" style={{fontFamily: 'Playfair Display, serif', fontWeight: 900, letterSpacing: '-2px'}}>Palavu Centre</h1>
          
          <p className="text-[22px] md:text-[26px] mb-4 text-gold" style={{fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontWeight: 400}}>From Konaseema's Soil to Your Table</p>
          
          <p className="text-[14px] md:text-[16px] text-text-dim mb-12 max-w-[520px] mx-auto leading-relaxed px-4" style={{fontFamily: 'Inter, sans-serif', fontWeight: 300}}>
            Experience the rich heritage of Godavari delta cuisine, crafted with traditional recipes passed down through generations
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center items-center">
            <Link to="/menu" className="group relative overflow-hidden" style={{border: '2px solid #C9A84C', background: 'transparent', color: '#C9A84C', padding: '14px 32px', borderRadius: '999px', fontFamily: 'Inter', fontWeight: 600, fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase', textDecoration: 'none', display: 'inline-block', transition: 'all 0.3s'}}>
              <span className="relative z-10 group-hover:text-bg-page transition-colors duration-300">Explore Menu</span>
              <div className="absolute inset-0 bg-gold transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </Link>
            <Link to="/menu" style={{background: '#C9A84C', color: '#080501', padding: '14px 32px', borderRadius: '999px', fontFamily: 'Inter', fontWeight: 700, fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase', border: 'none', cursor: 'pointer', textDecoration: 'none', display: 'inline-block', animation: 'goldPulse 2.5s infinite'}}>
              Order Now
            </Link>
            <a href="tel:9966655997" style={{background: '#B33A3A', color: '#EDE0C4', padding: '14px 32px', borderRadius: '999px', fontFamily: 'Inter', fontWeight: 700, fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase', border: 'none', cursor: 'pointer', textDecoration: 'none', display: 'inline-block'}}>
              Call Now
            </a>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2.5">
          {heroImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`rounded-full transition-all duration-300 ${
                idx === currentSlide ? 'bg-gold w-8 h-2' : 'bg-gold-dim/40 w-2 h-2 hover:bg-gold-dim'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-[#100C02] border-t border-b border-[#2E2200] py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {[
            { num: '10K+', label: 'Customers' },
            { num: '50+', label: 'Dishes' },
            { num: '4.8★', label: 'Rating' },
            { num: '5+', label: 'Years' },
          ].map((stat, idx) => (
            <div key={idx} className="text-center relative">
              {idx > 0 && <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-[1px] h-12 bg-[#2E2200]"></div>}
              <div className="text-[32px] md:text-[40px] font-bold text-gold mb-1" style={{fontFamily: 'Playfair Display, serif', fontWeight: 700}}>{stat.num}</div>
              <div className="text-[10px] md:text-[11px] uppercase tracking-[2px] md:tracking-[3px] text-text-secondary" style={{fontFamily: 'Inter, sans-serif', fontWeight: 500}}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Nav */}
      <section className="py-8 md:py-10 px-4 bg-bg-section border-t border-b border-gold-dim">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { icon: UtensilsCrossed, label: 'Our Menu', path: '/menu' },
            { icon: PartyPopper, label: 'Catering', path: '/catering' },
            { icon: Camera, label: 'Gallery', path: '/gallery' },
            { icon: ShoppingBag, label: 'Order Now', path: '/order' },
          ].map((item, idx) => (
            <Link key={idx} to={item.path} className="flex flex-col items-center text-center group cursor-pointer transition-all duration-300 hover:-translate-y-1.5">
              <div className="w-14 h-14 rounded-full border-[1.5px] border-gold-dim bg-bg-card flex items-center justify-center mb-3 group-hover:bg-[rgba(201,168,76,0.15)] group-hover:border-gold group-hover:shadow-[0_0_20px_rgba(201,168,76,0.35)] transition-all duration-300">
                <item.icon className="w-7 h-7 text-gold" />
              </div>
              <span className="text-[11px] uppercase tracking-[3px] text-text-secondary group-hover:text-gold transition-colors duration-300" style={{fontFamily: 'Inter, sans-serif', fontWeight: 500}}>{item.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Why Palavu Centre */}
      <section className="py-24 md:py-32 px-4 bg-bg-page">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center section-title-treatment">Why Palavu Centre</h2>
          <p className="tagline text-center max-w-xl mx-auto">Authentic flavors rooted in tradition and heritage</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            {[
              { icon: Award, title: 'Heritage Recipes', desc: 'Authentic Godavari recipes passed down through generations' },
              { icon: Leaf, title: 'Farm Fresh', desc: 'Ingredients sourced directly from Konaseema farms' },
              { icon: Users, title: 'Village Flavors', desc: 'Traditional cooking methods preserving authentic taste' },
            ].map((item, idx) => (
              <div key={idx} className="bg-bg-card border border-gold-dim rounded-2xl p-10 relative overflow-hidden hover:-translate-y-1.5 hover:border-gold hover:shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_0_1px_#C9A84C] transition-all duration-300">
                <div style={{height: '3px', background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)', margin: '-1px -1px 24px -1px'}}></div>
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[rgba(201,168,76,0.1)] border-[1.5px] border-gold flex items-center justify-center">
                  <item.icon className="w-8 h-8 text-gold" />
                </div>
                <h3 className="text-center mb-3">{item.title}</h3>
                <p className="text-center text-[14px] text-text-secondary">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-24 md:py-32 px-4 bg-bg-card">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center section-title-treatment">Best Sellers</h2>
          <p className="tagline text-center max-w-xl mx-auto">Our most loved dishes crafted with passion</p>
          
          <div className="mt-16 overflow-x-auto md:overflow-visible scrollbar-hide">
            <div className="flex md:grid md:grid-cols-3 gap-6 md:gap-8 pb-4 md:pb-0" style={{scrollSnapType: 'x mandatory'}}>
            {featured.map(item => (
              <div key={item.id} className="bg-bg-section rounded-2xl overflow-hidden hover:shadow-[0_24px_64px_rgba(0,0,0,0.7)] transition-all duration-300 group min-w-[280px] md:min-w-0 flex-shrink-0" style={{scrollSnapAlign: 'start'}}>
                <div className="relative aspect-[3/2] overflow-hidden">
                  <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg-section"></div>
                  <div style={{position: 'absolute', top: '12px', right: '12px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: item.veg ? '#3D9970' : '#C0392B', border: '2px solid white', zIndex: 10}}></div>
                </div>
                <div className="px-5 pt-4 pb-0">
                  <h3 className="mb-1">{item.name}</h3>
                  <p className="text-[22px] font-bold text-gold mb-1" style={{fontFamily: 'Inter, sans-serif'}}>₹{item.price}</p>
                  <p className="text-[13px] text-text-dim line-clamp-2 mb-4">{item.desc}</p>
                </div>
                <Link to="/order" className="block w-full bg-gold text-bg-page py-3 text-center text-[13px] uppercase tracking-[2px] hover:bg-gold-bright transition-colors duration-200" style={{fontFamily: 'Inter, sans-serif', fontWeight: 700, borderRadius: 0}}>
                  Order Now
                </Link>
              </div>
            ))}
            </div>
          </div>
          <p className="text-center text-[11px] text-text-dim mt-4 md:hidden" style={{fontFamily: 'Inter, sans-serif'}}>← Swipe to see more →</p>
          
          <div className="text-center mt-12">
            <Link to="/menu" className="inline-block border-2 border-gold text-gold px-12 py-4 rounded-full text-[13px] uppercase tracking-[2px] font-semibold hover:bg-gold hover:text-bg-page transition-all duration-200" style={{fontFamily: 'Inter, sans-serif'}}>
              View Full Menu
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 md:py-32 px-4 relative overflow-hidden" style={{background: 'linear-gradient(135deg, #1A1000 0%, #2E1F00 50%, #1A1000 100%)'}}>
        <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'repeating-linear-gradient(45deg, rgba(201,168,76,0.03) 0px, rgba(201,168,76,0.03) 1px, transparent 1px, transparent 12px)'}}></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="block text-[28px] text-gold opacity-80 mb-4">✦</span>
          <h2 className="text-[56px] leading-tight mb-6" style={{fontFamily: 'Playfair Display, serif', fontWeight: 900, color: '#E8C96A'}}>
            Experience Konaseema in Hyderabad
          </h2>
          <p className="tagline text-[20px] mb-8">Authentic flavors, traditional recipes, unforgettable taste</p>
          <Link to="/order" className="inline-block border-2 border-gold bg-transparent text-gold px-12 py-4 text-[13px] uppercase tracking-[2px] font-semibold hover:bg-gold hover:text-bg-page transition-all duration-200" style={{fontFamily: 'Inter, sans-serif', borderRadius: '2px'}}>
            Order Now
          </Link>
        </div>
      </section>

      {/* Customer Reviews */}
      <Reviews />

      {/* Special Offers */}
      <section className="py-16 md:py-24 lg:py-32 px-4 bg-bg-section relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, #C9A84C 1px, transparent 0)', backgroundSize: '40px 40px'}}></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <h2 className="text-center section-title-treatment">Special Offers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
            <div className="bg-[#1A1400] rounded-2xl border border-[#2E2200] overflow-hidden group hover:-translate-y-1 hover:border-gold hover:shadow-[0_20px_60px_rgba(0,0,0,0.7)] transition-all duration-300">
              <div className="h-1 bg-[#B33A3A]"></div>
              <div className="p-8">
                <span style={{display: 'inline-block', background: '#B33A3A', color: 'white', fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', padding: '4px 12px', borderRadius: '999px', marginBottom: '12px'}}>Limited Time</span>
                <h3 className="text-[28px] mb-3" style={{fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#E8C96A'}}>Family Feast</h3>
                <p className="text-text-secondary mb-4 leading-relaxed" style={{fontFamily: 'Inter, sans-serif'}}>Order any 2 biryanis and get complimentary Punugulu & Raita</p>
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-[32px] font-bold text-gold" style={{fontFamily: 'Inter, sans-serif', fontWeight: 700}}>₹599</span>
                  <span className="text-[18px] text-[#5C4F35] line-through" style={{fontFamily: 'Inter, sans-serif'}}>₹750</span>
                </div>
                <Link to="/menu" style={{width: '100%', padding: '12px', background: '#C9A84C', color: '#080501', border: 'none', borderRadius: '8px', fontFamily: 'Inter', fontWeight: 700, fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', textDecoration: 'none', display: 'block', textAlign: 'center'}}>Order Now</Link>
              </div>
            </div>
            <div className="bg-[#1A1400] rounded-2xl border border-[#2E2200] overflow-hidden group hover:-translate-y-1 hover:border-gold hover:shadow-[0_20px_60px_rgba(0,0,0,0.7)] transition-all duration-300">
              <div className="h-1 bg-gold"></div>
              <div className="p-8">
                <span style={{display: 'inline-block', background: '#C9A84C', color: '#080501', fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', padding: '4px 12px', borderRadius: '999px', marginBottom: '12px'}}>Weekend Special</span>
                <h3 className="text-[28px] mb-3" style={{fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#E8C96A'}}>Veg Thali</h3>
                <p className="text-text-secondary mb-4 leading-relaxed" style={{fontFamily: 'Inter, sans-serif'}}>Complete traditional meal with 5 curries, rice, roti & dessert</p>
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-[32px] font-bold text-gold" style={{fontFamily: 'Inter, sans-serif', fontWeight: 700}}>₹249</span>
                  <span className="text-[18px] text-[#5C4F35] line-through" style={{fontFamily: 'Inter, sans-serif'}}>₹320</span>
                </div>
                <Link to="/menu" style={{width: '100%', padding: '12px', background: '#C9A84C', color: '#080501', border: 'none', borderRadius: '8px', fontFamily: 'Inter', fontWeight: 700, fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', textDecoration: 'none', display: 'block', textAlign: 'center'}}>Order Now</Link>
              </div>
            </div>
          </div>
          <p className="text-center text-[11px] text-text-dim mt-4 md:hidden" style={{fontFamily: 'Inter, sans-serif'}}>← Swipe to see more →</p>
        </div>
      </section>

      {/* Stats Counter - REMOVED DUPLICATE */}

      {/* Instagram */}
      <section className="py-24 md:py-32 px-4 bg-bg-page pb-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center section-title-treatment">Follow Us on Instagram</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-12 mb-8">
            {[
              'photo-1585937421612-70a008356fbe',
              'photo-1589302168068-964664d93dc0',
              'photo-1574484284002-952d92456975',
              'photo-1601050690597-df0568f70950',
              'photo-1534422298391-e4f8c172dddb',
              'photo-1606313564200-e75d5e30476c'
            ].map((id, i) => (
              <div key={i} className="aspect-square rounded-lg overflow-hidden group relative cursor-pointer">
                <img src={`https://images.unsplash.com/${id}?w=300&h=300&fit=crop`} alt="Instagram" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-[rgba(8,5,1,0.7)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center">
                  <Instagram className="w-8 h-8 text-white mb-2" />
                  <span className="text-white text-sm">View Post</span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <a href="https://instagram.com/palavucentre" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200" style={{fontFamily: 'Inter, sans-serif'}}>
              <Instagram className="w-5 h-5" />
              @palavucentre
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
