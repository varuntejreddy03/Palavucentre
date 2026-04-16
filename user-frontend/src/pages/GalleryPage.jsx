import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

import { publicApi } from '../lib/api'

export default function GalleryPage() {
  const [filter, setFilter] = useState('all')
  const [lightbox, setLightbox] = useState(null)
  const [galleryImages, setGalleryImages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadGallery = async () => {
      try {
        setIsLoading(true)
        setError('')
        const response = await publicApi.getGallery()
        if (isMounted) {
          setGalleryImages(response.data.items || [])
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.message || 'Failed to load gallery')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadGallery()

    return () => {
      isMounted = false
    }
  }, [])

  const visibleGalleryImages = galleryImages.filter((item) => item.url)
  const categories = ['all', ...new Set(visibleGalleryImages.map((item) => item.category))]
  const filtered = filter === 'all' ? visibleGalleryImages : visibleGalleryImages.filter((img) => img.category === filter)

  const openLightbox = (img) => {
    setLightbox(filtered.findIndex((item) => item.id === img.id))
  }

  const navigate = (direction) => {
    setLightbox((current) => {
      const next = current + direction
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
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-4 md:px-6 py-2 rounded-full text-[12px] md:text-[14px] font-semibold transition ${
                  filter === category ? 'bg-gold text-bg-page' : 'bg-bg-card text-text-secondary border border-gold-dim hover:border-gold'
                }`}
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="text-center text-text-secondary py-20">Loading gallery...</div>
          ) : error ? (
            <div className="text-center text-red-300 py-20">{error}</div>
          ) : (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-2 md:gap-4 space-y-2 md:space-y-4">
              {filtered.map((img) => (
                <div
                  key={img.id}
                  onClick={() => openLightbox(img)}
                  className="break-inside-avoid cursor-pointer group relative overflow-hidden rounded-lg"
                >
                  <img src={img.url} alt={img.altText || img.title || 'Gallery'} className="w-full rounded-lg transition transform group-hover:scale-110" loading="lazy" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <span className="text-gold text-4xl">+</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {lightbox !== null && filtered[lightbox] && (
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
          <img src={filtered[lightbox].url} alt={filtered[lightbox].altText || filtered[lightbox].title || 'Gallery'} className="max-w-full max-h-full object-contain" />
        </div>
      )}
    </div>
  )
}
