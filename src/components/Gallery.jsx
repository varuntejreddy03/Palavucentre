import { useState } from 'react'

const galleryImages = [
  { id: 1, url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800', alt: 'Traditional South Indian thali' },
  { id: 2, url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800', alt: 'Biryani platter' },
  { id: 3, url: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=800', alt: 'Curry dishes' },
  { id: 4, url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800', alt: 'Crispy snacks' },
  { id: 5, url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800', alt: 'Fish curry' },
  { id: 6, url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800', alt: 'Vegetable curry' },
  { id: 7, url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800', alt: 'Traditional sweets' },
  { id: 8, url: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=800', alt: 'Refreshing beverages' },
]

export default function Gallery() {
  const [lightbox, setLightbox] = useState(null)

  return (
    <section id="gallery" className="py-20 px-4 bg-earth-dark">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-turmeric">Gallery</h2>
        <p className="text-center text-gray-300 mb-12">A visual journey through our culinary heritage</p>

        {/* Admin Note: Replace placeholder images with actual restaurant photos */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {galleryImages.map(img => (
            <div
              key={img.id}
              onClick={() => setLightbox(img)}
              className="relative overflow-hidden rounded-lg cursor-pointer group aspect-square"
            >
              <img
                src={img.url}
                alt={img.alt}
                className="w-full h-full object-cover transition transform group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <svg className="w-12 h-12 text-turmeric" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Instagram Feed */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold mb-6 text-turmeric">Follow Us on Instagram</h3>
          <a
            href="https://instagram.com/palavucentre"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            @palavucentre
          </a>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 text-white hover:text-turmeric"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img src={lightbox.url} alt={lightbox.alt} className="max-w-full max-h-full object-contain" />
        </div>
      )}
    </section>
  )
}
