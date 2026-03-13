import { useState } from 'react'
import { Check, Users, Briefcase, Cake } from 'lucide-react'

const packages = [
  { name: 'Basic', price: '₹299/person', items: ['2 Starters', '2 Main Course', 'Rice/Biryani', '1 Dessert', 'Beverages'], min: 'Min 25 people' },
  { name: 'Premium', price: '₹499/person', items: ['3 Starters', '3 Main Course', 'Special Biryani', '2 Desserts', 'Welcome Drink', 'Beverages'], min: 'Min 50 people', featured: true },
  { name: 'Deluxe', price: '₹699/person', items: ['4 Starters', '4 Main Course', 'Premium Biryani', '3 Desserts', 'Welcome Drink', 'Live Counter', 'Beverages'], min: 'Min 100 people' },
]

export default function CateringPage() {
  const [form, setForm] = useState({ name: '', eventType: '', date: '', guests: '', phone: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setForm({ name: '', eventType: '', date: '', guests: '', phone: '', message: '' })
    }, 3000)
  }

  return (
    <div className="pt-20 min-h-screen bg-bg-page animate-fadeIn">
      <div className="relative h-64 md:h-96 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1920" alt="Catering" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-bg-page/80 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-[36px] md:text-6xl font-bold text-gold mb-1 md:mb-2" style={{fontFamily: 'Playfair Display, serif'}}>Catering & Events</h1>
            <p className="text-[14px] md:text-xl text-text-secondary" style={{fontFamily: 'Inter, sans-serif'}}>Make your celebrations memorable with authentic Godavari cuisine</p>
          </div>
        </div>
      </div>

      <div className="py-6 md:py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 md:mb-10 text-gold" style={{fontFamily: 'Playfair Display, serif'}}>Our Packages</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-10 md:mb-16">
            {packages.map((pkg, idx) => (
              <div key={idx} className={`bg-bg-card border border-gold-dim rounded-2xl p-6 md:p-8 ${pkg.featured ? 'ring-2 ring-gold transform md:scale-105' : ''} hover:shadow-[0_20px_60px_rgba(0,0,0,0.7)] transition hover:-translate-y-1`}>
                {pkg.featured && <span className="bg-gold text-bg-page px-3 py-1 rounded-full text-[11px] font-bold inline-block mb-4" style={{fontFamily: 'Inter, sans-serif'}}>Most Popular</span>}
                <h3 className="text-[24px] md:text-2xl font-bold mb-2 text-gold" style={{fontFamily: 'Playfair Display, serif'}}>{pkg.name}</h3>
                <p className="text-[28px] md:text-3xl font-bold mb-3 md:mb-4 text-text-primary" style={{fontFamily: 'Inter, sans-serif'}}>{pkg.price}</p>
                <p className="text-[12px] md:text-sm text-text-dim mb-4 md:mb-6" style={{fontFamily: 'Inter, sans-serif'}}>{pkg.min}</p>
                <ul className="space-y-3 mb-8">
                  {pkg.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-turmeric mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
                <button className="w-full bg-gold text-bg-page py-3 rounded-lg text-[13px] font-bold uppercase tracking-[1px] hover:bg-gold-bright transition" style={{fontFamily: 'Inter, sans-serif'}}>
                  Inquire Now
                </button>
              </div>
            ))}
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 md:mb-8 text-turmeric" style={{fontFamily: 'Playfair Display, serif'}}>Perfect For</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 md:mb-16">
            {[
              { icon: Users, title: 'Weddings', desc: 'Traditional feasts for your special day' },
              { icon: Briefcase, title: 'Corporate Events', desc: 'Professional catering for business gatherings' },
              { icon: Cake, title: 'Celebrations', desc: 'Birthdays, anniversaries, and family events' },
            ].map((item, idx) => (
              <div key={idx} className="bg-earth-brown/50 p-8 rounded-lg text-center hover:shadow-2xl transition transform hover:-translate-y-1">
                <item.icon className="w-16 h-16 mx-auto mb-4 text-turmeric" />
                <h3 className="text-2xl font-bold mb-4 text-turmeric">{item.title}</h3>
                <p className="text-gray-300">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-turmeric">Custom Catering Solutions</h2>
              <p className="text-gray-300 mb-6 text-lg">Need something specific? We can customize menus for your event. Our team will work with you to create the perfect dining experience.</p>
              <div className="space-y-4">
                <a href="tel:9966655997" className="block bg-turmeric text-earth-dark px-8 py-4 rounded-full font-semibold hover:bg-yellow-600 transition text-center">
                  Call: 9966655997
                </a>
                <a href="https://wa.me/919966655997?text=Hi, I'm interested in catering services" target="_blank" rel="noopener noreferrer" className="block bg-green-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-green-700 transition text-center">
                  WhatsApp Us
                </a>
              </div>
            </div>

            <div className="bg-earth-brown/50 p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-6 text-turmeric">Request a Quote</h3>
              {submitted ? (
                <div className="bg-green-900/50 border border-green-500 text-green-200 p-4 rounded-lg text-center">
                  Thank you! We'll contact you soon.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input type="text" required placeholder="Name *" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full px-4 py-3 rounded-lg bg-earth-dark border border-turmeric/30 focus:border-turmeric outline-none" />
                  <input type="text" required placeholder="Event Type *" value={form.eventType} onChange={(e) => setForm({...form, eventType: e.target.value})} className="w-full px-4 py-3 rounded-lg bg-earth-dark border border-turmeric/30 focus:border-turmeric outline-none" />
                  <input type="date" required value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} className="w-full px-4 py-3 rounded-lg bg-earth-dark border border-turmeric/30 focus:border-turmeric outline-none" />
                  <input type="number" required placeholder="Guest Count *" value={form.guests} onChange={(e) => setForm({...form, guests: e.target.value})} className="w-full px-4 py-3 rounded-lg bg-earth-dark border border-turmeric/30 focus:border-turmeric outline-none" />
                  <input type="tel" required placeholder="Phone *" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="w-full px-4 py-3 rounded-lg bg-earth-dark border border-turmeric/30 focus:border-turmeric outline-none" />
                  <textarea rows="3" placeholder="Message" value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} className="w-full px-4 py-3 rounded-lg bg-earth-dark border border-turmeric/30 focus:border-turmeric outline-none resize-none"></textarea>
                  <button type="submit" className="w-full bg-turmeric text-earth-dark py-4 rounded-full font-bold text-lg hover:bg-yellow-600 transition">
                    Submit Inquiry
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
