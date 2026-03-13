import { useState } from 'react'
import { Phone, Mail, MessageCircle, Clock, MapPin } from 'lucide-react'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setForm({ name: '', phone: '', email: '', message: '' })
    }, 3000)
  }

  return (
    <div className="pt-20 min-h-screen bg-earth-dark animate-fadeIn">
      <div className="py-12 md:py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold text-center mb-2 text-turmeric" style={{ fontFamily: 'Playfair Display, serif' }}>Visit Us</h1>
          <p className="text-center text-gray-300 mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>We'd love to serve you authentic Godavari cuisine</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <a href="tel:9966655997" className="bg-earth-brown/50 p-8 rounded-lg text-center hover:shadow-2xl transition transform hover:-translate-y-1">
              <Phone className="w-12 h-12 mx-auto mb-4 text-turmeric" />
              <h3 className="font-bold text-turmeric mb-2">Call Us</h3>
              <p className="text-gray-300">9966655997</p>
            </a>
            <a href="https://wa.me/919966655997" target="_blank" rel="noopener noreferrer" className="bg-earth-brown/50 p-8 rounded-lg text-center hover:shadow-2xl transition transform hover:-translate-y-1">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-turmeric" />
              <h3 className="font-bold text-turmeric mb-2">WhatsApp</h3>
              <p className="text-gray-300">Chat with us</p>
            </a>
            <a href="mailto:rajamahendravarampalavu@gmail.com" className="bg-earth-brown/50 p-8 rounded-lg text-center hover:shadow-2xl transition transform hover:-translate-y-1">
              <Mail className="w-12 h-12 mx-auto mb-4 text-turmeric" />
              <h3 className="font-bold text-turmeric mb-2">Email</h3>
              <p className="text-gray-300 text-sm break-all">rajamahendravarampalavu@gmail.com</p>
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <div className="bg-earth-brown/50 p-8 rounded-lg mb-6 shadow-xl">
                <h3 className="text-2xl font-bold mb-6 text-turmeric" style={{ fontFamily: 'Playfair Display, serif' }}>Contact Details</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <Phone className="w-6 h-6 text-turmeric mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-300">Phone</p>
                      <a href="tel:9966655997" className="text-turmeric hover:underline transition-colors">9966655997</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Mail className="w-6 h-6 text-turmeric mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-300">Email</p>
                      <a href="mailto:rajamahendravarampalavu@gmail.com" className="text-turmeric hover:underline break-all transition-colors">
                        rajamahendravarampalavu@gmail.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Clock className="w-6 h-6 text-turmeric mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-300 mb-2">Hours</p>
                      <div className="space-y-1 text-gray-400">
                        <p>Monday - Sunday</p>
                        <p className="text-turmeric font-semibold">12:00 PM – 11:00 PM</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <MapPin className="w-6 h-6 text-turmeric mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-300">Location</p>
                      <p className="text-gray-400">Hyderabad, Telangana</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-earth-brown/50 rounded-lg overflow-hidden h-80 shadow-2xl">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d243647.3160399884!2d78.24323!3d17.412608!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb99daeaebd2c7%3A0xae93b78392bafbc2!2sHyderabad%2C%20Telangana!5e0!3m2!1sen!2sin!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="RajaMahendravaram PalavuCentre Location"
                ></iframe>
              </div>
            </div>

            <div className="bg-earth-brown/50 p-8 rounded-lg shadow-xl">
              <h3 className="text-2xl font-bold mb-6 text-turmeric" style={{ fontFamily: 'Playfair Display, serif' }}>Send Us a Message</h3>
              {submitted ? (
                <div className="bg-green-900/50 border border-green-500 text-green-200 p-4 rounded-lg text-center animate-fadeIn">
                  Thank you! We'll get back to you soon.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-2 text-sm">Name *</label>
                    <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 rounded-lg bg-earth-dark border border-turmeric/30 focus:border-turmeric outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2 text-sm">Phone *</label>
                    <input type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-3 rounded-lg bg-earth-dark border border-turmeric/30 focus:border-turmeric outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2 text-sm">Email *</label>
                    <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 rounded-lg bg-earth-dark border border-turmeric/30 focus:border-turmeric outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2 text-sm">Message *</label>
                    <textarea required rows="4" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full px-4 py-3 rounded-lg bg-earth-dark border border-turmeric/30 focus:border-turmeric outline-none resize-none transition-all"></textarea>
                  </div>
                  <button type="submit" className="w-full bg-turmeric text-earth-dark py-4 rounded-full font-bold text-lg hover:bg-yellow-600 transition-all active:scale-[0.98]">
                    Send Message
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

