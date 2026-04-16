import { useState } from 'react'

const benefits = [
  'Proven business model with authentic heritage cuisine',
  'Comprehensive training and ongoing support',
  'Marketing and branding assistance',
  'Supply chain and vendor network access',
  'Site selection and setup guidance',
  'Exclusive territory rights',
]

export default function Franchise() {
  const [formData, setFormData] = useState({ name: '', city: '', phone: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    console.log('Franchise inquiry:', formData)
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFormData({ name: '', city: '', phone: '', email: '', message: '' })
    }, 3000)
  }

  return (
    <section id="franchise" className="py-20 px-4 bg-earth-dark">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-turmeric">Franchise Opportunities</h2>
        <p className="text-center text-gray-300 mb-12 max-w-2xl mx-auto">
          Join the RajaMahendravaram PalavuCentre family and bring authentic Godavari cuisine to your city
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="bg-earth-brown/50 p-8 rounded-lg mb-8">
              <h3 className="text-2xl font-bold mb-6 text-turmeric">Why Partner With Us?</h3>
              <ul className="space-y-4">
                {benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-turmeric mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-300">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-turmeric/20 to-earth-brown/50 p-8 rounded-lg border border-turmeric/30">
              <h3 className="text-xl font-bold mb-4 text-turmeric">Investment Range</h3>
              <p className="text-3xl font-bold text-gray-200 mb-2">Rs. 25 - 50 Lakhs</p>
              <p className="text-gray-400 text-sm">Varies based on location and size</p>
            </div>
          </div>

          <div className="bg-earth-brown/50 p-8 rounded-lg">
            <h3 className="text-2xl font-bold mb-6 text-turmeric">Express Your Interest</h3>

            {submitted ? (
              <div className="bg-green-900/50 border border-green-500 text-green-200 p-4 rounded-lg text-center">
                Thank you for your interest! Our team will contact you soon.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
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
                  <label className="block text-gray-300 mb-2">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(event) => setFormData({ ...formData, city: event.target.value })}
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
                  <label className="block text-gray-300 mb-2">Message</label>
                  <textarea
                    rows="3"
                    value={formData.message}
                    onChange={(event) => setFormData({ ...formData, message: event.target.value })}
                    placeholder="Tell us about your background and interest..."
                    className="w-full px-4 py-3 rounded-lg bg-earth-dark border border-turmeric/30 focus:border-turmeric outline-none text-gray-100 resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-turmeric text-earth-dark py-4 rounded-full font-bold text-lg hover:bg-yellow-600 transition"
                >
                  Submit Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
