import { useState } from 'react'
import { Award, Headphones, MapPin, Shield, TrendingUp, Users } from 'lucide-react'

import { publicApi } from '../lib/api'

const benefits = [
  { icon: Award, title: 'Proven Business Model', desc: 'Authentic heritage cuisine with strong market demand' },
  { icon: Headphones, title: 'Comprehensive Training', desc: 'Complete training and ongoing support' },
  { icon: TrendingUp, title: 'Marketing Support', desc: 'Branding and marketing assistance' },
  { icon: Users, title: 'Supply Chain Access', desc: 'Vendor network and ingredient sourcing' },
  { icon: MapPin, title: 'Site Selection', desc: 'Location analysis and setup guidance' },
  { icon: Shield, title: 'Territory Rights', desc: 'Exclusive territory protection' },
]

export default function FranchisePage() {
  const [form, setForm] = useState({ name: '', city: '', phone: '', email: '', budget: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      setIsSubmitting(true)
      setError('')
      await publicApi.submitFranchise(form)
      setSubmitted(true)
      setForm({ name: '', city: '', phone: '', email: '', budget: '', message: '' })
      window.setTimeout(() => setSubmitted(false), 3000)
    } catch (requestError) {
      setError(requestError.message || "Couldn't submit your inquiry")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-page pt-20 animate-fadeIn">
      <div className="relative h-96 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920"
          alt="Franchise"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(180deg,rgba(8,5,1,0.6)_0%,rgba(8,5,1,0.84)_100%)]">
          <div className="px-4 text-center">
            <p className="text-[11px] font-black uppercase tracking-[3px] text-gold/70">Franchise</p>
            <h1 className="mb-2 mt-4 text-center text-[42px] leading-none md:text-[68px]">
              Own a RajaMahendravaram PalavuCentre
            </h1>
            <p className="text-[16px] text-text-secondary md:text-xl">Bring authentic Godavari cuisine to your city</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-8 md:py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-6 text-center text-3xl md:mb-10 md:text-4xl">
            Why Partner With Us?
          </h2>
          <div className="mb-10 grid grid-cols-1 gap-6 md:mb-16 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
            {benefits.map((item, index) => (
              <div
                key={index}
                className="brand-panel rounded-[28px] p-8 transition hover:-translate-y-1 hover:border-gold/35"
              >
                <item.icon className="mb-4 h-12 w-12 text-gold" />
                <h3 className="mb-3 text-[28px] text-gold-bright">{item.title}</h3>
                <p className="text-sm leading-7 text-text-secondary">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="brand-panel mb-10 rounded-[32px] border-gold/25 bg-[linear-gradient(135deg,rgba(212,168,83,0.12)_0%,rgba(61,10,10,0.28)_100%)] p-8 text-center md:mb-16 md:p-12">
            <h3 className="mb-3 text-[32px] text-gold-bright">Investment Range</h3>
            <p className="mb-1 text-4xl font-black text-text-primary md:text-5xl">Rs. 25 - 50 Lakhs</p>
            <p className="text-sm text-text-secondary md:text-base">Varies based on location and size</p>
          </div>

          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[3px] text-gold/70">Growth Opportunity</p>
              <h2 className="mt-4 text-left text-3xl md:text-[44px]">Ready to Start?</h2>
              <p className="mb-6 mt-4 max-w-xl text-lg leading-8 text-text-secondary">
                Join the RajaMahendravaram PalavuCentre family and be part of preserving and sharing authentic
                Godavari heritage cuisine.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  'Brand-led launch support',
                  'Operations and kitchen training',
                  'Menu standardization and sourcing guidance',
                  'Marketing help for the first phase',
                ].map((item) => (
                  <div key={item} className="brand-panel-soft rounded-[22px] px-4 py-4 text-sm text-text-secondary">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="brand-panel rounded-[32px] p-8 md:p-10">
              <p className="text-[11px] font-black uppercase tracking-[3px] text-gold/70">Inquiry Form</p>
              <h3 className="mt-4 text-[32px] text-gold-bright">Express Your Interest</h3>
              {submitted ? (
                <div className="mt-8 rounded-[24px] border border-green-500/30 bg-green-950/30 p-4 text-center text-green-200">
                  Thank you! Our team will contact you soon.
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
                    placeholder="City *"
                    value={form.city}
                    onChange={(event) => setForm({ ...form, city: event.target.value })}
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
                    required
                    placeholder="Email *"
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    className="brand-input"
                  />
                  <select
                    required
                    value={form.budget}
                    onChange={(event) => setForm({ ...form, budget: event.target.value })}
                    className="brand-input"
                  >
                    <option value="">Investment Budget *</option>
                    <option value="25-35">Rs. 25-35 Lakhs</option>
                    <option value="35-50">Rs. 35-50 Lakhs</option>
                    <option value="50+">Rs. 50+ Lakhs</option>
                  </select>
                  <textarea
                    rows="3"
                    placeholder="Tell us about your background..."
                    value={form.message}
                    onChange={(event) => setForm({ ...form, message: event.target.value })}
                    className="brand-input resize-none"
                  ></textarea>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="brand-primary-btn w-full px-6 py-4 text-[12px]"
                  >
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
