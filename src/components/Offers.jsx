const offers = [
  {
    id: 1,
    title: 'Weekend Special',
    desc: 'Get 20% off on all Biryani orders',
    badge: 'Limited Time',
    validity: 'Valid on Sat & Sun',
    img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600'
  },
  {
    id: 2,
    title: 'Family Combo',
    desc: '₹999 for 4 people - Includes starters, mains & dessert',
    badge: 'Best Value',
    validity: 'All days',
    img: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600'
  },
  {
    id: 3,
    title: 'First Order Discount',
    desc: 'Flat ₹150 off on orders above ₹500',
    badge: 'New Customer',
    validity: 'One time use',
    img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600'
  },
]

export default function Offers() {
  return (
    <section id="offers" className="py-20 px-4 bg-earth-dark">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-turmeric">Special Offers</h2>
        <p className="text-center text-gray-300 mb-12">Don't miss out on our exclusive deals</p>

        {/* Admin Note: Offers can be updated seasonally */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {offers.map(offer => (
            <div key={offer.id} className="bg-earth-brown/50 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition transform hover:scale-105">
              <div className="relative">
                <img src={offer.img} alt={offer.title} className="w-full h-48 object-cover" loading="lazy" />
                <span className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {offer.badge}
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2 text-turmeric">{offer.title}</h3>
                <p className="text-gray-300 mb-4">{offer.desc}</p>
                <p className="text-sm text-gray-500 mb-4">{offer.validity}</p>
                <button className="w-full bg-turmeric text-earth-dark py-3 rounded-full font-semibold hover:bg-yellow-600 transition">
                  Order Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
