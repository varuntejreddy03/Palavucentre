import { useState } from 'react'
import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'

import { useSiteSettings } from '../context/SiteContext'
import { publicApi } from '../lib/api'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const { siteSettings } = useSiteSettings()
  const contact = siteSettings?.contact || {}
  const whatsappLink = contact.whatsappNumber ? `https://wa.me/${contact.whatsappNumber}` : 'https://wa.me/919966655997'

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      setIsSubmitting(true)
      setError('')
      await publicApi.submitContact(form)
      setSubmitted(true)
      setForm({ name: '', phone: '', email: '', message: '' })
      window.setTimeout(() => setSubmitted(false), 3000)
    } catch (requestError) {
      setError(requestError.message || "Couldn't send your message")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-page pt-20 animate-fadeIn">
      <div className="px-4 py-12 md:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <p className="text-[11px] font-black uppercase tracking-[3px] text-gold/70">Visit Us</p>
            <h1 className="mt-4 text-center text-[42px] leading-none md:text-[64px]">Contact RajaMahendravaram PalavuCentre</h1>
            <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-8 text-text-secondary">
              Reach out for table-side questions, takeaway support, catering plans, or location help. We respond across
              call, WhatsApp, and email.
            </p>
          </div>

          <div className="mb-8 grid gap-5 md:grid-cols-3">
            <a
              href={`tel:${contact.phone || '9966655997'}`}
              className="brand-panel rounded-[28px] px-6 py-8 text-center transition hover:-translate-y-1 hover:border-gold/40"
            >
              <Phone className="mx-auto h-12 w-12 text-gold" />
              <h3 className="mt-5 text-[28px] text-gold-bright">Call Us</h3>
              <p className="mt-2 text-sm text-text-secondary">{contact.phone || '9966655997'}</p>
            </a>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="brand-panel rounded-[28px] px-6 py-8 text-center transition hover:-translate-y-1 hover:border-gold/40"
            >
              <MessageCircle className="mx-auto h-12 w-12 text-gold" />
              <h3 className="mt-5 text-[28px] text-gold-bright">WhatsApp</h3>
              <p className="mt-2 text-sm text-text-secondary">Fastest way to reach the team</p>
            </a>
            <a
              href={`mailto:${contact.email || 'rajamahendravarampalavu@gmail.com'}`}
              className="brand-panel rounded-[28px] px-6 py-8 text-center transition hover:-translate-y-1 hover:border-gold/40"
            >
              <Mail className="mx-auto h-12 w-12 text-gold" />
              <h3 className="mt-5 text-[28px] text-gold-bright">Email</h3>
              <p className="mt-2 break-all text-sm text-text-secondary">
                {contact.email || 'rajamahendravarampalavu@gmail.com'}
              </p>
            </a>
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="space-y-6">
              <div className="brand-panel rounded-[32px] p-8">
                <h3 className="text-[30px] text-gold-bright">Contact Details</h3>
                <div className="mt-8 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl bg-gold/10 p-3 text-gold">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[2px] text-text-dim">Phone</p>
                      <a href={`tel:${contact.phone || '9966655997'}`} className="mt-1 block text-base font-semibold text-text-primary hover:text-gold">
                        {contact.phone || '9966655997'}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl bg-gold/10 p-3 text-gold">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[2px] text-text-dim">Email</p>
                      <a
                        href={`mailto:${contact.email || 'rajamahendravarampalavu@gmail.com'}`}
                        className="mt-1 block break-all text-base font-semibold text-text-primary hover:text-gold"
                      >
                        {contact.email || 'rajamahendravarampalavu@gmail.com'}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl bg-gold/10 p-3 text-gold">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[2px] text-text-dim">Hours</p>
                      <p className="mt-1 text-base text-text-secondary">
                        {contact.hours || 'Monday - Sunday, 12:00 PM - 11:00 PM'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl bg-gold/10 p-3 text-gold">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[2px] text-text-dim">Location</p>
                      <p className="mt-1 text-base text-text-secondary">
                        {contact.address || 'Hyderabad, Telangana'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="brand-panel rounded-[32px] p-8 md:p-10">
              <p className="text-[11px] font-black uppercase tracking-[3px] text-gold/70">Quick Inquiry</p>
              <h3 className="mt-4 text-[32px] text-gold-bright">Send Us a Message</h3>
              <p className="mt-3 text-sm leading-7 text-text-secondary">
                Share what you need and we&apos;ll get back with the right contact or next step.
              </p>
              {submitted ? (
                <div className="mt-8 rounded-[24px] border border-green-500/30 bg-green-950/30 p-5 text-center text-green-100 animate-fadeIn">
                  Thank you! We&apos;ll get back to you soon.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                  {error && (
                    <div className="rounded-[24px] border border-red-500/30 bg-red-950/30 p-4 text-center text-red-100">
                      {error}
                    </div>
                  )}
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-[2px] text-text-dim">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(event) => setForm({ ...form, name: event.target.value })}
                      className="brand-input"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-[2px] text-text-dim">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(event) => setForm({ ...form, phone: event.target.value })}
                      className="brand-input"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-[2px] text-text-dim">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(event) => setForm({ ...form, email: event.target.value })}
                      className="brand-input"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-[2px] text-text-dim">
                      Message *
                    </label>
                    <textarea
                      required
                      rows="5"
                      value={form.message}
                      onChange={(event) => setForm({ ...form, message: event.target.value })}
                      className="brand-input resize-none"
                    ></textarea>
                  </div>
                  <button type="submit" disabled={isSubmitting} className="brand-primary-btn w-full px-6 py-4 text-[12px]">
                    {isSubmitting ? 'Sending...' : 'Send Message'}
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
