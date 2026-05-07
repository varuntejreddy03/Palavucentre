import { useState } from 'react'

import { useSiteSettings } from '../context/SiteContext'
import { publicApi } from '../lib/api'

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' })
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
      await publicApi.submitContact(formData)
      setSubmitted(true)
      setFormData({ name: '', phone: '', email: '', message: '' })

      window.setTimeout(() => {
        setSubmitted(false)
      }, 3000)
    } catch (requestError) {
      setError(requestError.message || "Couldn't send your message")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contact" className="py-8 md:py-12 px-4 bg-earth-dark">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="bg-earth-brown/50 p-8 rounded-lg mb-6">
              <h3 className="text-2xl font-bold mb-6 text-turmeric">Get in Touch</h3>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <svg className="w-6 h-6 text-turmeric mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-300">Phone</p>
                    <a href={`tel:${contact.phone || '9966655997'}`} className="text-turmeric hover:underline">
                      {contact.phone || '9966655997'}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <svg className="w-6 h-6 text-turmeric mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-300">Email</p>
                    <a href={`mailto:${contact.email || 'rajamahendravarampalavu@gmail.com'}`} className="text-turmeric hover:underline break-all">
                      {contact.email || 'rajamahendravarampalavu@gmail.com'}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <svg className="w-6 h-6 text-turmeric mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-300">Hours</p>
                    <p className="text-gray-400">{contact.hours || 'Monday - Sunday, 12:00 PM - 11:00 PM'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <svg className="w-6 h-6 text-turmeric mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-300">Location</p>
                    <p className="text-gray-400">{contact.address || 'Hyderabad, Telangana'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-earth-brown/50 p-8 rounded-lg">
            <h3 className="text-2xl font-bold mb-6 text-turmeric">Send Us a Message</h3>

            {submitted ? (
              <div className="bg-green-900/50 border border-green-500 text-green-200 p-4 rounded-lg text-center">
                Thank you! We&apos;ll get back to you soon.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg text-center">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-gray-300 mb-2">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-earth-dark border border-turmeric/30 focus:border-turmeric outline-none text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-earth-dark border border-turmeric/30 focus:border-turmeric outline-none text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-earth-dark border border-turmeric/30 focus:border-turmeric outline-none text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Message *</label>
                  <textarea
                    required
                    rows="4"
                    value={formData.message}
                    onChange={(event) => setFormData({ ...formData, message: event.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-earth-dark border border-turmeric/30 focus:border-turmeric outline-none text-gray-100 resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-turmeric text-earth-dark py-4 rounded-full font-bold text-lg hover:bg-yellow-600 transition"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
