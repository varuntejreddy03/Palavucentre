import { useState } from 'react'
import { Briefcase, Cake, Check, Users } from 'lucide-react'

import { useSiteSettings } from '../context/SiteContext'
import { publicApi } from '../lib/api'

const packages = [
  {
    name: 'Basic',
    price: 'Rs. 299/person',
    items: ['2 Starters', '2 Main Course', 'Rice/Biryani', '1 Dessert', 'Beverages'],
    min: 'Min 25 people',
  },
  {
    name: 'Premium',
    price: 'Rs. 499/person',
    items: ['3 Starters', '3 Main Course', 'Special Biryani', '2 Desserts', 'Welcome Drink', 'Beverages'],
    min: 'Min 50 people',
    featured: true,
  },
  {
    name: 'Deluxe',
    price: 'Rs. 699/person',
    items: ['4 Starters', '4 Main Course', 'Premium Biryani', '3 Desserts', 'Welcome Drink', 'Live Counter', 'Beverages'],
    min: 'Min 100 people',
  },
]

export default function CateringPage() {
  const [form, setForm] = useState({ name: '', eventType: '', date: '', guests: '', phone: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const { siteSettings } = useSiteSettings()
  const contact = siteSettings?.contact || {}

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      setIsSubmitting(true)
      setError('')
      await publicApi.submitCatering(form)
      setSubmitted(true)
      setForm({ name: '', eventType: '', date: '', guests: '', phone: '', email: '', message: '' })
      window.setTimeout(() => setSubmitted(false), 3000)
    } catch (requestError) {
      setError(requestError.message || "Couldn't submit your request")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-page pt-20 animate-fadeIn">
      <div className="relative h-64 overflow-hidden md:h-96">
        <img
          src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1920"
          alt="Catering"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(180deg,rgba(8,5,1,0.58)_0%,rgba(8,5,1,0.86)_100%)]">
          <div className="px-4 text-center">
            <p className="text-[11px] font-black uppercase tracking-[3px] text-gold/70">Catering</p>
            <h1 className="mt-4 text-center text-[38px] leading-none md:text-[68px]">Catering & Events</h1>
            <p className="mt-3 text-[14px] text-text-secondary md:text-xl">
              Make your celebrations memorable with authentic Godavari cuisine
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 md:py-10">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-6 text-center text-3xl md:mb-10 md:text-4xl">Our Packages</h2>
          <div className="mb-10 grid grid-cols-1 gap-4 md:mb-16 md:grid-cols-3 md:gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg.name}
                className={`brand-panel rounded-[28px] p-6 transition hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_20px_60px_rgba(0,0,0,0.7)] md:p-8 ${
                  pkg.featured ? 'ring-2 ring-gold md:scale-105' : ''
                }`}
              >
                {pkg.featured && (
                  <span className="mb-4 inline-block rounded-full bg-gold px-3 py-1 text-[11px] font-bold uppercase tracking-[2px] text-bg-page">
                    Most Popular
                  </span>
                )}
                <h3 className="mb-2 text-[28px] text-gold-bright">{pkg.name}</h3>
                <p className="mb-3 text-[28px] font-black text-text-primary md:text-3xl">{pkg.price}</p>
                <p className="mb-6 text-sm text-text-dim">{pkg.min}</p>
                <ul className="space-y-3">
                  {pkg.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold" />
                      <span className="text-sm leading-7 text-text-secondary">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <h2 className="mb-6 text-center text-3xl md:mb-8 md:text-4xl">Perfect For</h2>
          <div className="mb-12 grid grid-cols-1 gap-6 md:mb-16 md:grid-cols-3">
            {[
              { icon: Users, title: 'Weddings', desc: 'Traditional feasts for your special day' },
              { icon: Briefcase, title: 'Corporate Events', desc: 'Professional catering for business gatherings' },
              { icon: Cake, title: 'Celebrations', desc: 'Birthdays, anniversaries, and family events' },
            ].map((item) => (
              <div
                key={item.title}
                className="brand-panel rounded-[28px] p-8 text-center transition hover:-translate-y-1 hover:border-gold/40"
              >
                <item.icon className="mx-auto mb-4 h-16 w-16 text-gold" />
                <h3 className="mb-4 text-[28px] text-gold-bright">{item.title}</h3>
                <p className="text-sm leading-7 text-text-secondary">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[3px] text-gold/70">Tailored Events</p>
              <h2 className="mt-4 text-left text-3xl md:text-[44px]">Custom Catering Solutions</h2>
              <p className="mt-4 max-w-xl text-lg leading-8 text-text-secondary">
                Need something specific? We can customize menus for your event. Our team will work with you to create
                the right dining experience for the scale and tone of your celebration.
              </p>

              <div className="mt-8 space-y-4">
                <a
                  href={`tel:${contact.phone || '9966655997'}`}
                  className="brand-primary-btn flex w-full px-8 py-4 text-center text-[12px] sm:w-fit"
                >
                  Call: {contact.phone || '9966655997'}
                </a>
                <a
                  href={`https://wa.me/${contact.whatsappNumber || '919966655997'}?text=Hi, I'm interested in catering services`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="brand-secondary-btn flex w-full border-green-600/40 px-8 py-4 text-center text-[12px] text-white hover:border-green-500 hover:bg-green-700/20 sm:w-fit"
                >
                  WhatsApp Us
                </a>
              </div>
            </div>

            <div className="brand-panel rounded-[32px] p-8 md:p-10">
              <p className="text-[11px] font-black uppercase tracking-[3px] text-gold/70">Inquiry Form</p>
              <h3 className="mt-4 text-[32px] text-gold-bright">Request a Quote</h3>
              {submitted ? (
                <div className="mt-8 rounded-[24px] border border-green-500/30 bg-green-950/30 p-4 text-center text-green-200">
                  Thank you! We&apos;ll contact you soon.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                  {error && (
                    <div className="rounded-[24px] border border-red-500/30 bg-red-950/30 p-4 text-center text-red-200">
                      {error}
                    </div>
                  )}
                  <input
                    type="text"
                    required
                    placeholder="Name *"
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    className="brand-input"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Event Type *"
                    value={form.eventType}
                    onChange={(event) => setForm({ ...form, eventType: event.target.value })}
                    className="brand-input"
                  />
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(event) => setForm({ ...form, date: event.target.value })}
                    className="brand-input"
                  />
                  <input
                    type="number"
                    required
                    placeholder="Guest Count *"
                    value={form.guests}
                    onChange={(event) => setForm({ ...form, guests: event.target.value })}
                    className="brand-input"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Phone *"
                    value={form.phone}
                    onChange={(event) => setForm({ ...form, phone: event.target.value })}
                    className="brand-input"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    className="brand-input"
                  />
                  <textarea
                    rows="4"
                    placeholder="Message"
                    value={form.message}
                    onChange={(event) => setForm({ ...form, message: event.target.value })}
                    className="brand-input resize-none"
                  ></textarea>
                  <button type="submit" disabled={isSubmitting} className="brand-primary-btn w-full px-6 py-4 text-[12px]">
                    {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
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
