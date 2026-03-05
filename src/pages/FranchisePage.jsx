import { useState } from 'react'
import { Check, TrendingUp, Users, Award, MapPin, Headphones, Shield } from 'lucide-react'

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

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setForm({ name: '', city: '', phone: '', email: '', budget: '', message: '' })
    }, 3000)
  }

  return (
    <div className="pt-20 min-h-screen bg-earth-dark animate-fadeIn">
      <div className="relative h-96 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920" alt="Franchise" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-earth-dark/80 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-turmeric mb-4">Own a Palavu Centre</h1>
            <p className="text-xl text-gray-300">Bring authentic Godavari cuisine to your city</p>
          </div>
        </div>
      </div>

      <div className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-turmeric">Why Partner With Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {benefits.map((item, idx) => (
              <div key={idx} className="bg-earth-brown/50 p-8 rounded-lg hover:shadow-2xl transition transform hover:-translate-y-1">
                <item.icon className="w-12 h-12 mb-4 text-turmeric" />
                <h3 className="text-xl font-bold mb-3 text-turmeric">{item.title}</h3>
                <p className="text-gray-300">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-turmeric/20 to-earth-brown/50 p-12 rounded-lg border border-turmeric/30 mb-20 text-center">
            <h3 className="text-3xl font-bold mb-4 text-turmeric">Investment Range</h3>
            <p className="text-5xl font-bold text-gray-200 mb-2">₹25 - 50 Lakhs</p>
            <p className="text-gray-400">Varies based on location and size</p>
          </div>

          <h2 className="text-4xl font-bold text-center mb-12 text-turmeric">3-Step Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {[
              { step: '01', title: 'Apply', desc: 'Submit your franchise inquiry' },
              { step: '02', title: 'Review', desc: 'We evaluate and discuss details' },
              { step: '03', title: 'Launch', desc: 'Setup and grand opening' },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="text-6xl font-bold text-turmeric/30 mb-4">{item.step}</div>
                <h3 className="text-2xl font-bold mb-3 text-turmeric">{item.title}</h3>
                <p className="text-gray-300">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-turmeric">Ready to Start?</h2>
              <p className="text-gray-300 mb-6 text-lg">Join the Palavu Centre family and be part of preserving and sharing authentic Godavari heritage cuisine. Our proven model and comprehensive support system ensure your success.</p>
              <ul className="space-y-4">
                {['Low initial investment', 'High ROI potential', 'Established brand recognition', 'Complete operational support'].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-turmeric mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-earth-brown/50 p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-6 text-turmeric">Express Your Interest</h3>
              {submitted ? (
                <div className="bg-green-900/50 border border-green-500 text-green-200 p-4 rounded-lg text-center">
                  Thank you! Our team will contact you soon.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input type="text" required placeholder="Name *" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full px-4 py-3 rounded-lg bg-earth-dark border border-turmeric/30 focus:border-turmeric outline-none" />
                  <input type="text" required placeholder="City *" value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} className="w-full px-4 py-3 rounded-lg bg-earth-dark border border-turmeric/30 focus:border-turmeric outline-none" />
                  <input type="tel" required placeholder="Phone *" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="w-full px-4 py-3 rounded-lg bg-earth-dark border border-turmeric/30 focus:border-turmeric outline-none" />
                  <input type="email" required placeholder="Email *" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="w-full px-4 py-3 rounded-lg bg-earth-dark border border-turmeric/30 focus:border-turmeric outline-none" />
                  <select required value={form.budget} onChange={(e) => setForm({...form, budget: e.target.value})} className="w-full px-4 py-3 rounded-lg bg-earth-dark border border-turmeric/30 focus:border-turmeric outline-none">
                    <option value="">Investment Budget *</option>
                    <option value="25-35">₹25-35 Lakhs</option>
                    <option value="35-50">₹35-50 Lakhs</option>
                    <option value="50+">₹50+ Lakhs</option>
                  </select>
                  <textarea rows="3" placeholder="Tell us about your background..." value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} className="w-full px-4 py-3 rounded-lg bg-earth-dark border border-turmeric/30 focus:border-turmeric outline-none resize-none"></textarea>
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
