import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { UtensilsCrossed, PartyPopper, Camera, Store, Award, Leaf, Users, Instagram } from 'lucide-react'
import Reviews from '../components/Reviews'

const featured = [
  { id: 7, name: 'Natu Kodi Biryani', desc: 'Country chicken biryani with aromatic spices', price: 350, img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600', veg: false },
  { id: 2, name: 'Royyala Vepudu', desc: 'Spicy Godavari-style prawn fry', price: 280, img: 'https://images.unsplash.com/photo-1633504581786-316c8002b1b9?w=600', veg: false },
  { id: 4, name: 'Natu Kodi Pulusu', desc: 'Country chicken curry with traditional spices', price: 320, img: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=600', veg: false },
]

export default function Home() {

  return (
    <div className="animate-fadeIn">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Full-length Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/Video-797.mp4" type="video/mp4" />
          </video>
          {/* Gradients and Overlays for Readability */}
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-black/20"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-20 w-full relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <div className="mb-6 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
              <div className="w-16 h-[1px] bg-gold mx-auto mb-6 opacity-60"></div>
              <span className="inline-block text-[14px] uppercase tracking-[6px] text-gold mb-8" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>AUTHENTIC GODAVARI CUISINE</span>
            </div>

            <h1 className="mb-6 md:text-[42px] lg:text-[72px] leading-[1.1] animate-fadeIn text-white shadow-text" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 900, letterSpacing: '-0.5px', fontSize: 'clamp(32px, 10vw, 42px)', animationDelay: '0.2s' }}>RajaMahendravaram PalavuCentre</h1>

            <p className="text-[20px] md:text-[24px] mb-4 text-gold animate-fadeIn" style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontWeight: 600, animationDelay: '0.3s' }}>From Konaseema's Soil to Your Table</p>

            <p className="text-[14px] md:text-[18px] text-gray-200 mb-10 max-w-[620px] mx-auto leading-relaxed animate-fadeIn" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, animationDelay: '0.4s' }}>
              Experience the rich heritage of Godavari delta cuisine, crafted with traditional recipes passed down through generations
            </p>

            <div className="grid grid-cols-2 gap-4 w-full max-w-md mx-auto animate-fadeIn" style={{ animationDelay: '0.5s' }}>
              <Link to="/menu" className="flex items-center justify-center text-center" style={{ background: '#D4A853', color: '#080501', padding: '16px 0', borderRadius: '999px', fontFamily: 'Inter', fontWeight: 700, fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase', border: 'none', cursor: 'pointer', textDecoration: 'none', animation: 'goldPulse 2.5s infinite' }}>
                Order Now
              </Link>
              <a href="tel:9966655997" className="flex items-center justify-center text-center" style={{ background: '#B33A3A', color: '#FFFBEB', padding: '16px 0', borderRadius: '999px', fontFamily: 'Inter', fontWeight: 700, fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase', border: 'none', cursor: 'pointer', textDecoration: 'none' }}>
                Call Now
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-bg-even backdrop-blur-sm border-t border-b border-gold/10 py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {[
            { num: '10K+', label: 'Customers' },
            { num: '50+', label: 'Dishes' },
            { num: '4.8★', label: 'Rating' },
            { num: '5+', label: 'Years' },
          ].map((stat, idx) => (
            <div key={idx} className="text-center relative">
              {idx > 0 && <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-[1px] h-12 bg-[#2E2200]"></div>}
              <div className="text-[32px] md:text-[40px] font-bold text-gold mb-1" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>{stat.num}</div>
              <div className="text-[10px] md:text-[11px] uppercase tracking-[2px] md:tracking-[3px] text-text-secondary" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Nav */}
      <section className="py-8 md:py-10 px-4 bg-bg-section border-t border-b border-gold/20 shadow-inner" style={{ background: 'rgba(30,5,5,0.8)' }}>
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { icon: UtensilsCrossed, label: 'Our Menu', path: '/menu' },
            { icon: PartyPopper, label: 'Catering', path: '/catering' },
            { icon: Camera, label: 'Gallery', path: '/gallery' },
            { icon: Store, label: 'Franchise', path: '/franchise' },
          ].map((item, idx) => (
            <Link key={idx} to={item.path} className="flex flex-col items-center text-center group cursor-pointer transition-all duration-300 hover:-translate-y-1.5">
              <div className="w-14 h-14 rounded-full border-[1.5px] border-gold/30 bg-[rgba(212,168,83,0.08)] flex items-center justify-center mb-3 group-hover:bg-[rgba(201,168,76,0.15)] group-hover:border-gold group-hover:shadow-[0_0_20px_rgba(201,168,76,0.35)] transition-all duration-300">
                <item.icon className="w-6 h-6 text-gold" />
              </div>
              <span className="text-[11px] uppercase tracking-[3px] text-text-secondary group-hover:text-gold transition-colors duration-300" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>{item.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 md:py-32 px-4 bg-bg-even">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center section-title-treatment">Why Choose Us</h2>
          <p className="tagline text-center max-w-xl mx-auto text-[20px]">Authentic flavors rooted in tradition and heritage</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            {[
              { icon: Award, title: 'Heritage Recipes', desc: 'Authentic Godavari recipes passed down through generations' },
              { icon: Leaf, title: 'Farm Fresh', desc: 'Ingredients sourced directly from Konaseema farms' },
              { icon: Users, title: 'Village Flavors', desc: 'Traditional cooking methods preserving authentic taste' },
            ].map((item, idx) => (
              <div key={idx} className="bg-bg-card gold-border rounded-2xl p-10 relative overflow-hidden hover:-translate-y-1.5 hover:border-gold hover:shadow-[0_20px_60px_rgba(0,0,0,0.6)] transition-all duration-300">
                <div style={{ height: '3px', background: 'linear-gradient(90deg, transparent, #EAB308, transparent)', margin: '-1px -1px 24px -1px' }}></div>
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[rgba(234,179,8,0.1)] border-[1.5px] border-gold flex items-center justify-center">
                  <item.icon className="w-8 h-8 text-gold" />
                </div>
                <h3 className="text-center mb-3 text-gold-bright" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>{item.title}</h3>
                <p className="text-center text-[14px] text-text-secondary leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-24 md:py-32 px-4 bg-black/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center section-title-treatment">Best Sellers</h2>
          <p className="tagline text-center max-w-xl mx-auto">Our most loved dishes crafted with passion</p>

          <div className="mt-16 overflow-x-auto md:overflow-visible scrollbar-hide">
            <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-8 pb-4 md:pb-0 px-4 md:px-0" style={{ scrollSnapType: 'x mandatory' }}>
              {featured.map(item => (
                <div key={item.id} className="bg-bg-card gold-border rounded-xl overflow-hidden shadow-2xl transition-all duration-500 group min-w-[260px] max-w-[260px] md:min-w-0 md:max-w-none flex-shrink-0 flex flex-col" style={{ scrollSnapAlign: 'start' }}>
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-bottom from-transparent via-transparent to-[rgba(26,5,5,0.95)]" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(26,5,5,0.95) 100%)' }}></div>
                    <div style={{ position: 'absolute', top: '10px', right: '10px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.veg ? '#3D9970' : '#C0392B', border: '2px solid white', zIndex: 10 }}></div>
                    {item.name === 'Natu Kodi Biryani' && (
                      <div className="absolute top-3 left-3 bg-gold text-bg-page px-2 py-0.5 rounded-full text-[9px] uppercase tracking-[1.5px] font-black" style={{ fontFamily: 'Inter, sans-serif' }}>Bestseller</div>
                    )}
                  </div>
                  <div className="px-5 pt-4 pb-4 flex-grow">
                    <h3 className="mb-2 text-[20px] text-text-primary leading-tight font-bold" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{item.name}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[18px] font-black text-gold" style={{ fontFamily: 'Inter, sans-serif' }}>₹{item.price}</span>
                    </div>
                    <p className="text-[13px] text-text-dim/80 line-clamp-2 leading-relaxed">{item.desc}</p>
                  </div>
                  <Link to="/menu" className="block w-full bg-gold text-bg-page py-4 text-center text-[12px] uppercase tracking-[3px] font-black hover:bg-gold-bright transition-all duration-300" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Order Now
                  </Link>
                </div>
              ))}
            </div>
          </div>
          <p className="text-center text-[11px] text-text-dim mt-4 md:hidden" style={{ fontFamily: 'Inter, sans-serif' }}>← Swipe to see more →</p>

          <div className="text-center mt-12">
            <Link to="/menu" className="inline-block border-2 border-gold text-gold px-12 py-4 rounded-full text-[13px] uppercase tracking-[2px] font-semibold hover:bg-gold hover:text-bg-page transition-all duration-200" style={{ fontFamily: 'Inter, sans-serif' }}>
              Order Now
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 md:py-32 px-4 relative overflow-hidden bg-bg-even gold-texture" style={{ background: 'linear-gradient(135deg, #2D0808, #1A0505)' }}>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="block text-[28px] text-gold opacity-80 mb-4">✦</span>
          <h2 className="text-[56px] leading-tight mb-6" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 900, color: '#D4A853' }}>
            Experience Konaseema in Hyderabad
          </h2>
          <p className="tagline text-[22px] mb-8 font-bold" style={{ color: '#F0C060' }}>Authentic flavors, traditional recipes, unforgettable taste</p>
          <Link to="/menu" className="inline-block border-2 border-gold bg-transparent text-gold px-12 py-4 text-[13px] uppercase tracking-[3px] font-black hover:bg-gold hover:text-bg-page transition-all duration-300" style={{ fontFamily: 'Inter, sans-serif', borderRadius: '0px' }}>
            Order Now
          </Link>
        </div>
      </section>

      {/* Customer Reviews */}
      <Reviews />

      {/* Special Offers */}
      <section className="py-16 md:py-24 lg:py-32 px-4 bg-bg-section relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #C9A84C 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <h2 className="text-center section-title-treatment">Special Offers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
            <div className="bg-bg-card rounded-2xl gold-border overflow-hidden group hover:-translate-y-1 hover:border-gold hover:shadow-[0_20px_60px_rgba(0,0,0,0.7)] transition-all duration-300">
              <div className="h-1 bg-[#B33A3A]"></div>
              <div className="p-8">
                <span style={{ display: 'inline-block', background: '#B33A3A', color: 'white', fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', padding: '4px 12px', borderRadius: '999px', marginBottom: '12px' }}>Limited Time</span>
                <h3 className="text-[28px] mb-3" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#FDE047' }}>Family Feast</h3>
                <p className="text-text-secondary mb-4 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>Order any 2 biryanis and get complimentary Punugulu & Raita</p>
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-[32px] font-bold text-gold" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>₹599</span>
                  <span className="text-[18px] text-text-dim line-through" style={{ fontFamily: 'Inter, sans-serif' }}>₹750</span>
                </div>
                <Link to="/menu" style={{ width: '100%', padding: '12px', background: '#EAB308', color: '#080501', border: 'none', borderRadius: '8px', fontFamily: 'Inter', fontWeight: 700, fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', textDecoration: 'none', display: 'block', textAlign: 'center' }}>Order Now</Link>
              </div>
            </div>
            <div className="bg-bg-card rounded-2xl gold-border overflow-hidden group hover:-translate-y-1 hover:border-gold hover:shadow-[0_20px_60px_rgba(0,0,0,0.7)] transition-all duration-300">
              <div className="h-1 bg-gold"></div>
              <div className="p-8">
                <span style={{ display: 'inline-block', background: '#EAB308', color: '#080501', fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', padding: '4px 12px', borderRadius: '999px', marginBottom: '12px' }}>Weekend Special</span>
                <h3 className="text-[28px] mb-3" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#FDE047' }}>Veg Thali</h3>
                <p className="text-text-secondary mb-4 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>Complete traditional meal with 5 curries, rice, roti & dessert</p>
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-[32px] font-bold text-gold" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>₹249</span>
                  <span className="text-[18px] text-text-dim line-through" style={{ fontFamily: 'Inter, sans-serif' }}>₹320</span>
                </div>
                <Link to="/menu" style={{ width: '100%', padding: '12px', background: '#EAB308', color: '#080501', border: 'none', borderRadius: '8px', fontFamily: 'Inter', fontWeight: 700, fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', textDecoration: 'none', display: 'block', textAlign: 'center' }}>Order Now</Link>
              </div>
            </div>
          </div>
          <p className="text-center text-[11px] text-text-dim mt-4 md:hidden" style={{ fontFamily: 'Inter, sans-serif' }}>← Swipe to see more →</p>
        </div>
      </section>

      {/* Stats Counter - REMOVED DUPLICATE */}

      {/* Instagram */}
      <section className="pt-[60px] pb-24 md:pb-32 px-4 bg-bg-even border-t border-gold/15">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center section-title-treatment">Follow Us on Instagram</h2>
          <p className="tagline text-center max-w-xl mx-auto text-[20px] mb-8">Join our community of food lovers</p>
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
            <a href="https://instagram.com/palavucentre" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200" style={{ fontFamily: 'Inter, sans-serif' }}>
              <Instagram className="w-5 h-5" />
              @palavucentre
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
