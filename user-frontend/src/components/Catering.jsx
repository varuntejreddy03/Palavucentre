const packages = [
  {
    id: 1,
    name: 'Basic Package',
    price: '₹299/person',
    items: ['2 Starters', '2 Main Course', 'Rice/Biryani', '1 Dessert', 'Beverages'],
    minOrder: 'Min 25 people'
  },
  {
    id: 2,
    name: 'Premium Package',
    price: '₹499/person',
    items: ['3 Starters', '3 Main Course', 'Special Biryani', '2 Desserts', 'Welcome Drink', 'Beverages'],
    minOrder: 'Min 50 people',
    featured: true
  },
  {
    id: 3,
    name: 'Deluxe Package',
    price: '₹699/person',
    items: ['4 Starters', '4 Main Course', 'Premium Biryani', '3 Desserts', 'Welcome Drink', 'Live Counter', 'Beverages'],
    minOrder: 'Min 100 people'
  },
]

export default function Catering() {
  return (
    <section id="catering" className="py-20 px-4 bg-earth-brown/30">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-turmeric">Catering & Events</h2>
        <p className="text-center text-gray-300 mb-12 max-w-2xl mx-auto">
          Make your special occasions memorable with authentic Godavari cuisine. Perfect for weddings, corporate events, and celebrations.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {packages.map(pkg => (
            <div
              key={pkg.id}
              className={`bg-earth-dark rounded-lg p-8 shadow-lg ${
                pkg.featured ? 'ring-4 ring-turmeric transform scale-105' : ''
              }`}
            >
              {pkg.featured && (
                <span className="bg-turmeric text-earth-dark px-4 py-1 rounded-full text-sm font-bold inline-block mb-4">
                  Most Popular
                </span>
              )}
              <h3 className="text-2xl font-bold mb-2 text-turmeric">{pkg.name}</h3>
              <p className="text-3xl font-bold mb-4 text-gray-200">{pkg.price}</p>
              <p className="text-sm text-gray-500 mb-6">{pkg.minOrder}</p>
              
              <ul className="space-y-3 mb-8">
                {pkg.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-turmeric mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>

              <button className="w-full bg-turmeric text-earth-dark py-3 rounded-full font-semibold hover:bg-yellow-600 transition">
                Inquire Now
              </button>
            </div>
          ))}
        </div>

        <div className="bg-earth-dark rounded-lg p-8 max-w-3xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4 text-turmeric">Custom Catering Solutions</h3>
          <p className="text-gray-300 mb-6">
            Need something specific? We can customize menus for your event. Contact us for a personalized quote.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:9966655997"
              className="bg-turmeric text-earth-dark px-8 py-3 rounded-full font-semibold hover:bg-yellow-600 transition inline-block"
            >
              Call: 9966655997
            </a>
            <a
              href="https://wa.me/919966655997?text=Hi, I'm interested in catering services"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-700 transition inline-block"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
