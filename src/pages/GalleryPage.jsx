import { useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect } from 'react'

const defaultImages = [
  { id: 1, url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800', category: 'food' },
  { id: 2, url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800', category: 'food' },
  { id: 3, url: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=800', category: 'food' },
  { id: 4, url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800', category: 'food' },
  { id: 5, url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800', category: 'food' },
  { id: 6, url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800', category: 'food' },
  { id: 7, url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800', category: 'food' },
  { id: 8, url: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=800', category: 'food' },
  { id: 9, url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800', category: 'ambience' },
  { id: 10, url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800', category: 'ambience' },
  { id: 11, url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', category: 'events' },
  { id: 12, url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800', category: 'events' },
]

export default function GalleryPage() {
  const [filter, setFilter] = useState('all')
  const [lightbox, setLightbox] = useState(null)
  const [galleryImages, setGalleryImages] = useState(defaultImages)

  useEffect(() => {
    // Load images from localStorage if admin has updated them
    const saved = localStorage.getItem('galleryImages')
    if (saved) {
      setGalleryImages(JSON.parse(saved))
    }
  }, [])

  const filtered = filter === 'all' ? galleryImages : galleryImages.filter(img => img.category === filter)

  const openLightbox = (img) => {
    setLightbox(filtered.findIndex(i => i.id === img.id))
  }

  const navigate = (dir) => {
    setLightbox((prev) => {
      const next = prev + dir
      if (next < 0) return filtered.length - 1
      if (next >= filtered.length) return 0
      return next
    })
  }

  return (
    <div className="pt-20 min-h-screen bg-bg-page animate-fadeIn">
      <div className="py-12 md:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-center section-title-treatment text-[40px] md:text-[52px]">Gallery</h1>
          <p className="tagline text-center text-[18px] md:text-[22px]">A visual journey through our culinary heritage</p>

          <div className="flex justify-center gap-2 md:gap-4 mb-8 md:mb-12 flex-wrap mt-8 md:mt-12">
            {['all', 'food', 'ambience', 'events'].map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 md:px-6 py-2 rounded-full text-[12px] md:text-[14px] font-semibold transition ${
                  filter === cat ? 'bg-gold text-bg-page' : 'bg-bg-card text-text-secondary border border-gold-dim hover:border-gold'
                }`}
                style={{fontFamily: 'Inter, sans-serif'}}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          <div className="columns-2 md:columns-3 lg:columns-4 gap-2 md:gap-4 space-y-2 md:space-y-4">
            {filtered.map(img => (
              <div
                key={img.id}
                onClick={() => openLightbox(img)}
                className="break-inside-avoid cursor-pointer group relative overflow-hidden rounded-lg"
              >
                <img src={img.url} alt="Gallery" className="w-full rounded-lg transition transform group-hover:scale-110" loading="lazy" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <span className="text-gold text-4xl">+</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {lightbox !== null && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
          <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 text-white hover:text-gold">
            <X className="w-8 h-8" />
          </button>
          <button onClick={() => navigate(-1)} className="absolute left-4 text-white hover:text-gold">
            <ChevronLeft className="w-12 h-12" />
          </button>
          <button onClick={() => navigate(1)} className="absolute right-4 text-white hover:text-gold">
            <ChevronRight className="w-12 h-12" />
          </button>
          <img src={filtered[lightbox].url} alt="Lightbox" className="max-w-full max-h-full object-contain" />
        </div>
      )}
    </div>
  )
}
