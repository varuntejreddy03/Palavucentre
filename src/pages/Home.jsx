import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { UtensilsCrossed, PartyPopper, Camera, Store, Award, Leaf, Users, Instagram, Phone, Mail, Clock, MapPin } from 'lucide-react'
import Reviews from '../components/Reviews'
import Contact from '../components/Contact'

const featured = [
  { id: 7, name: 'Natu Kodi Biryani', desc: 'Country chicken biryani with aromatic spices', price: 350, img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600', veg: false },
  { id: 2, name: 'Royyala Vepudu', desc: 'Spicy Godavari-style prawn fry', price: 280, img: 'https://images.unsplash.com/photo-1633504581786-316c8002b1b9?w=600', veg: false },
  { id: 4, name: 'Natu Kodi Pulusu', desc: 'Country chicken curry with traditional spices', price: 320, img: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=600', veg: false },
]

export default function Home() {

  return (
    <div className="animate-fadeIn">
      {/* Hero */}
      <section className="hero-section min-h-screen flex items-center pt-20 lg:pt-[70px] pb-12 lg:pb-0">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/hero-bg.png" 
            alt="Palavu Centre Background" 
            className="w-full h-full object-cover"
          />
          {/* Overlays for Readability - NEW CINEMATIC GRADIENT */}
          <div className="absolute inset-0 z-10 mobile-overlay" style={{ background: 'linear-gradient(to right, rgba(5, 1, 0, 0.82) 0%, rgba(5, 1, 0, 0.45) 50%, rgba(5, 1, 0, 0.15) 100%)' }}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#050100] via-transparent to-transparent lg:hidden z-10"></div>
        </div>

        <div className="max-w-7xl mx-auto w-full relative z-20">
          <div className="flex hero-layout items-center">
            
            {/* Left Content Column */}
            <div className="hero-left lg:w-[62%] lg:pl-[60px] flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="mb-4 flex items-center gap-4" style={{ animation: 'fadeInUp 0.6s ease-out 0.2s both' }}>
                <div className="w-1 px-[1px] h-6 bg-[#E8C84A]"></div>
                <span className="inline-block text-[13px] md:text-[14px] uppercase tracking-[6px] text-[#E8C84A]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>AUTHENTIC GODAVARI CUISINE</span>
              </div>

              <h1 className="mb-4 brand-logo-hero hero-headline" style={{ animation: 'fadeInUp 0.8s ease-out both' }}>
                <span className="block">RAJAMAHENDRAVARAM</span>
                <span className="block">PALAVUCENTRE</span>
              </h1>

              <p className="text-[20px] md:text-[26px] mb-3 font-serif italic text-[#F5ECD7] px-4 lg:px-0" style={{ animation: 'fadeInUp 0.6s ease-out 0.4s both', textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>Experience Konaseema in Hyderabad</p>

              <p className="text-[15px] md:text-[17px] text-[rgba(245,236,215,0.85)] mb-8 max-w-[580px] lg:mx-0 mx-auto leading-[1.7] px-4 lg:px-0" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, animation: 'fadeInUp 0.6s ease-out 0.6s both' }}>
                Authentic flavors, traditional recipes, unforgettable taste
              </p>

              <div className="w-full px-4 lg:px-0 flex flex-nowrap items-center justify-center lg:justify-start gap-3 sm:gap-5" style={{ animation: 'fadeInUp 0.6s ease-out 0.8s both' }}>
                <Link
                  to="/menu"
                  className="shimmer-btn bg-gradient-to-br from-[#C9A84C] to-[#A07830] text-[#1A0500] flex-1 sm:flex-none px-6 sm:px-12 py-4 rounded-[50px] font-bold transition-all transform hover:scale-[1.04] hover:shadow-[0_10px_40px_rgba(201,168,76,0.4)] text-[13px] sm:text-[15px] uppercase tracking-widest text-center min-w-[130px]"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Order Online
                </Link>
                <Link
                  to="/contact"
                  className="bg-white/5 hover:bg-[#C9A84C] backdrop-blur-md border-2 border-[#C9A84C] text-[#C9A84C] hover:text-[#1A0500] flex-1 sm:flex-none px-6 sm:px-12 py-4 rounded-[50px] font-bold transition-all text-[13px] sm:text-[15px] uppercase tracking-widest text-center min-w-[130px]"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Contact Us
                </Link>
              </div>

              {/* Stats Bar */}
              <div className="mt-10 lg:mt-12 flex flex-wrap justify-center lg:justify-start gap-8 md:gap-12 w-full px-4 lg:px-0" style={{ animation: 'fadeInUp 0.6s ease-out 1s both' }}>
                <div className="flex flex-col">
                  <span className="text-2xl md:text-3xl font-bold text-[#E8C84A]">10K+</span>
                  <span className="text-[11px] uppercase tracking-[2px] text-white/60 font-medium">Customers</span>
                </div>
                <div className="w-[1px] h-10 bg-white/10 hidden sm:block"></div>
                <div className="flex flex-col">
                  <span className="text-2xl md:text-3xl font-bold text-[#E8C84A]">50+</span>
                  <span className="text-[11px] uppercase tracking-[2px] text-white/60 font-medium">Dishes</span>
                </div>
                <div className="w-[1px] h-10 bg-white/10 hidden sm:block"></div>
                <div className="flex flex-col">
                  <span className="text-2xl md:text-3xl font-bold text-[#E8C84A]">4.8</span>
                  <span className="text-[11px] uppercase tracking-[2px] text-white/60 font-medium">Rating</span>
                </div>
                <div className="w-[1px] h-10 bg-white/10 hidden sm:block"></div>
                <div className="flex flex-col">
                  <span className="text-2xl md:text-3xl font-bold text-[#E8C84A]">100%</span>
                  <span className="text-[11px] uppercase tracking-[2px] text-white/60 font-medium">Quality</span>
                </div>
              </div>
            </div>

            {/* Right Column Layout */}
            <div className="hidden lg:flex lg:w-[38%] relative justify-end">
              <div className="hero-right-card relative group ml-auto" style={{ animation: 'fadeInRight 0.8s ease-out 0.5s both' }}>
                {/* Refined Decorative Frame - Subtler glow */}
                <div className="absolute -inset-10 bg-gold/10 blur-3xl rounded-full opacity-40 group-hover:opacity-70 transition-opacity duration-1000"></div>
                
                <div className="relative rounded-[32px] overflow-hidden border-2 border-gold/40 shadow-[0_30px_70px_rgba(0,0,0,0.9)] bg-black">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full aspect-[4/5] object-cover"
                  >
                    <source src="/Video-797.mp4" type="video/mp4" />
                  </video>
                  {/* Subtle video overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                  
                  {/* Premium Franchise Badge - Top Right */}
                  <div className="franchise-badge absolute top-4 right-4 z-10">
                    <div className="bg-gradient-to-br from-[#FFD700] to-[#B8860B] text-black px-5 py-2 rounded-full text-[10px] font-black tracking-[2px] uppercase shadow-2xl border border-white/20">
                      Franchise Open
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Video Banner - ONLY VISIBLE ON MOBILE */}
            <div className="lg:hidden w-full hero-right-card relative order-1">
              <div className="relative h-[280px] w-full overflow-hidden">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  >
                    <source src="/Video-797.mp4" type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-black/40"></div>
                  <div className="franchise-badge absolute top-3 right-3 z-10">
                    <div className="bg-[#B8860B] text-white px-3 py-1 rounded-full text-[12px] font-bold tracking-[2px] uppercase shadow-xl">
                      Franchise Open
                    </div>
                  </div>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* Quick Nav */}
      <section className="py-4 md:py-6 px-4 bg-bg-section border-t border-b border-gold/20 shadow-inner" style={{ background: 'rgba(30,5,5,0.8)' }}>
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
      <section className="py-12 md:py-16 px-4 bg-bg-even">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center section-title-treatment">Why Choose Us</h2>
          <p className="tagline text-center max-w-xl mx-auto text-[20px]">Authentic flavors rooted in tradition and heritage</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
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
      <section className="py-12 md:py-16 px-4 bg-black/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center section-title-treatment">Best Sellers</h2>
          <p className="tagline text-center max-w-xl mx-auto">Our most loved dishes crafted with passion</p>

          <div className="mt-10 overflow-x-auto md:overflow-visible scrollbar-hide">
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
                    Add to Order
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
      <section className="py-12 md:py-16 px-4 relative overflow-hidden bg-bg-even gold-texture" style={{ background: 'linear-gradient(135deg, #2D0808, #1A0505)' }}>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="block text-[28px] text-gold opacity-80 mb-4">✦</span>
          <h2 className="text-[56px] leading-tight mb-6" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 900, color: '#D4A853' }}>
            Experience Konaseema in Hyderabad
          </h2>
          <p className="tagline text-[22px] mb-8 font-bold" style={{ color: '#F0C060' }}>Authentic flavors, traditional recipes, unforgettable taste</p>
          <Link to="/menu" className="inline-block border-2 border-gold bg-transparent text-gold px-12 py-4 text-[13px] uppercase tracking-[3px] font-black hover:bg-gold hover:text-bg-page transition-all duration-300" style={{ fontFamily: 'Inter, sans-serif', borderRadius: '0px' }}>
            Start Your Order
          </Link>
        </div>
      </section>

      {/* Customer Reviews */}
      <Reviews />

      {/* Special Offers */}
      <section className="py-10 md:py-16 px-4 bg-bg-section relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #C9A84C 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <h2 className="text-center section-title-treatment">Special Offers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
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
                <Link to="/menu" style={{ width: '100%', padding: '12px', background: '#EAB308', color: '#080501', border: 'none', borderRadius: '8px', fontFamily: 'Inter', fontWeight: 700, fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', textDecoration: 'none', display: 'block', textAlign: 'center' }}>Claim Offer</Link>
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
                <Link to="/menu" style={{ width: '100%', padding: '12px', background: '#EAB308', color: '#080501', border: 'none', borderRadius: '8px', fontFamily: 'Inter', fontWeight: 700, fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', textDecoration: 'none', display: 'block', textAlign: 'center' }}>Claim Offer</Link>
              </div>
            </div>
          </div>
          <p className="text-center text-[11px] text-text-dim mt-4 md:hidden" style={{ fontFamily: 'Inter, sans-serif' }}>← Swipe to see more →</p>
        </div>
      </section>

      {/* Stats Counter - REMOVED DUPLICATE */}

      {/* Instagram */}
      <section className="pt-[30px] pb-12 md:pb-20 px-4 bg-bg-even border-t border-gold/15">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center section-title-treatment">Follow Us on Instagram</h2>
          <p className="tagline text-center max-w-xl mx-auto text-[20px] mb-8">Join our community of food lovers</p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-8 mb-8">
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

      {/* Contact Section */}
      <Contact />
    </div>
  )
}
