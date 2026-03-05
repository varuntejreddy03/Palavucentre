import { useState } from 'react'

const menuData = {
  starters: [
    { id: 1, name: 'Punugulu', desc: 'Crispy rice fritters with ginger & green chili', price: 120, img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400' },
    { id: 2, name: 'Royyala Vepudu', desc: 'Spicy Godavari-style prawn fry', price: 280, img: 'https://images.unsplash.com/photo-1633504581786-316c8002b1b9?w=400' },
    { id: 3, name: 'Gongura Chicken', desc: 'Tangy sorrel leaves chicken curry', price: 240, img: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400' },
  ],
  mains: [
    { id: 4, name: 'Natu Kodi Pulusu', desc: 'Country chicken curry with traditional spices', price: 320, img: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400' },
    { id: 5, name: 'Chepala Pulusu', desc: 'Tangy fish curry with tamarind', price: 280, img: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400' },
    { id: 6, name: 'Gutti Vankaya', desc: 'Stuffed brinjal curry', price: 180, img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400' },
  ],
  biryani: [
    { id: 7, name: 'Natu Kodi Biryani', desc: 'Country chicken biryani with aromatic spices', price: 350, img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400' },
    { id: 8, name: 'Royyala Biryani', desc: 'Prawn biryani with coastal flavors', price: 380, img: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400' },
    { id: 9, name: 'Veg Biryani', desc: 'Mixed vegetable biryani', price: 220, img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400' },
  ],
  desserts: [
    { id: 10, name: 'Ariselu', desc: 'Traditional rice flour sweet', price: 80, img: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400' },
    { id: 11, name: 'Pootharekulu', desc: 'Paper-thin sweet with ghee & sugar', price: 100, img: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400' },
  ],
  beverages: [
    { id: 12, name: 'Nannari Sarbath', desc: 'Traditional herbal cooler', price: 60, img: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400' },
    { id: 13, name: 'Buttermilk', desc: 'Spiced yogurt drink', price: 40, img: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400' },
  ],
}

export default function Menu({ addToCart }) {
  const [activeTab, setActiveTab] = useState('starters')
  const [search, setSearch] = useState('')

  const categories = {
    starters: 'Starters',
    mains: 'Main Course',
    biryani: 'Biryani & Specials',
    desserts: 'Desserts',
    beverages: 'Beverages'
  }

  const filteredItems = menuData[activeTab].filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.desc.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <section id="menu" className="py-20 px-4 bg-earth-brown/30">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-turmeric">Our Menu</h2>
        <p className="text-center text-gray-300 mb-12 max-w-2xl mx-auto">
          Authentic Godavari flavors crafted with traditional recipes passed down through generations
        </p>

        {/* Search Bar */}
        <div className="mb-8 max-w-md mx-auto">
          <input
            type="text"
            placeholder="Search dishes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 rounded-full bg-earth-dark border border-turmeric/30 focus:border-turmeric outline-none text-gray-100"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12 sticky top-20 bg-earth-brown/95 backdrop-blur-sm py-4 z-40">
          {Object.entries(categories).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-6 py-2 rounded-full font-semibold transition ${
                activeTab === key
                  ? 'bg-turmeric text-earth-dark'
                  : 'bg-earth-dark text-gray-300 hover:bg-turmeric/20'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <div key={item.id} className="bg-earth-dark rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition transform hover:scale-105">
              <img src={item.img} alt={item.name} className="w-full h-48 object-cover" loading="lazy" />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-turmeric">{item.name}</h3>
                <p className="text-gray-400 mb-4 text-sm">{item.desc}</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-turmeric">₹{item.price}</span>
                  <button
                    onClick={() => addToCart(item)}
                    className="bg-turmeric text-earth-dark px-6 py-2 rounded-full font-semibold hover:bg-yellow-600 transition"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <p className="text-center text-gray-400 py-12">No items found matching your search.</p>
        )}
      </div>
    </section>
  )
}
