import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Upload, Trash2, X, Image as ImageIcon, MessageSquare } from 'lucide-react'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('gallery')
  const [gallery, setGallery] = useState([])
  const [reviews, setReviews] = useState([])
  const [newImageUrl, setNewImageUrl] = useState('')

  useEffect(() => {
    if (localStorage.getItem('adminAuth') !== 'true') {
      navigate('/admin/login')
      return
    }
    
    // Load gallery from localStorage
    const savedGallery = localStorage.getItem('galleryImages')
    if (savedGallery) {
      setGallery(JSON.parse(savedGallery))
    } else {
      // Default images
      const defaultGallery = [
        { id: 1, url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800', category: 'food' },
        { id: 2, url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800', category: 'food' },
        { id: 3, url: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=800', category: 'food' },
        { id: 4, url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800', category: 'food' },
        { id: 5, url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800', category: 'food' },
        { id: 6, url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800', category: 'food' },
      ]
      setGallery(defaultGallery)
      localStorage.setItem('galleryImages', JSON.stringify(defaultGallery))
    }

    // Load reviews from localStorage
    const savedReviews = localStorage.getItem('reviews')
    if (savedReviews) {
      setReviews(JSON.parse(savedReviews))
    } else {
      // Default reviews
      const defaultReviews = [
        { id: 1, name: 'Rajesh Kumar', rating: 5, text: 'Authentic Godavari flavors! The Natu Kodi Biryani reminded me of my grandmother\'s cooking.', date: '2024-02-15', visible: true },
        { id: 2, name: 'Priya Sharma', rating: 5, text: 'Best traditional Andhra food in Hyderabad. The Gongura Chicken is a must-try.', date: '2024-02-10', visible: true },
        { id: 3, name: 'Venkat Reddy', rating: 4, text: 'Loved the authentic taste and presentation. Prices are reasonable for the quality.', date: '2024-02-05', visible: true },
      ]
      setReviews(defaultReviews)
      localStorage.setItem('reviews', JSON.stringify(defaultReviews))
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('adminAuth')
    navigate('/admin/login')
  }

  const addImage = () => {
    if (!newImageUrl) return
    const newImage = {
      id: Date.now(),
      url: newImageUrl,
      category: 'food'
    }
    const updated = [...gallery, newImage]
    setGallery(updated)
    localStorage.setItem('galleryImages', JSON.stringify(updated))
    setNewImageUrl('')
  }

  const deleteImage = (id) => {
    const updated = gallery.filter(img => img.id !== id)
    setGallery(updated)
    localStorage.setItem('galleryImages', JSON.stringify(updated))
  }

  const toggleReviewVisibility = (id) => {
    const updated = reviews.map(r => r.id === id ? {...r, visible: !r.visible} : r)
    setReviews(updated)
    localStorage.setItem('reviews', JSON.stringify(updated))
  }

  const deleteReview = (id) => {
    const updated = reviews.filter(r => r.id !== id)
    setReviews(updated)
    localStorage.setItem('reviews', JSON.stringify(updated))
  }

  return (
    <div className="min-h-screen bg-bg-page pt-20 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gold" style={{fontFamily: 'Playfair Display, serif'}}>Admin Dashboard</h1>
          <div className="flex gap-4">
            <Link to="/" className="text-text-secondary hover:text-gold transition">View Site</Link>
            <button onClick={handleLogout} className="bg-red-urgent text-white px-6 py-2 rounded-full hover:bg-[#9A2F2F] transition">
              Logout
            </button>
          </div>
        </div>

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-6 py-3 rounded-full font-semibold transition ${
              activeTab === 'gallery' ? 'bg-gold text-bg-page' : 'bg-bg-card text-text-secondary border border-gold-dim'
            }`}
          >
            <ImageIcon className="w-5 h-5 inline mr-2" />
            Gallery Management
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-6 py-3 rounded-full font-semibold transition ${
              activeTab === 'reviews' ? 'bg-gold text-bg-page' : 'bg-bg-card text-text-secondary border border-gold-dim'
            }`}
          >
            <MessageSquare className="w-5 h-5 inline mr-2" />
            Review Management
          </button>
        </div>

        {activeTab === 'gallery' && (
          <div>
            <div className="bg-bg-card p-6 rounded-2xl border border-gold-dim mb-8">
              <h2 className="text-2xl font-bold text-gold mb-4" style={{fontFamily: 'Playfair Display, serif'}}>Add New Image</h2>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Enter image URL (e.g., https://images.unsplash.com/...)"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-lg bg-bg-section border border-gold-dim focus:border-gold outline-none text-text-primary"
                />
                <button onClick={addImage} className="bg-gold text-bg-page px-8 py-3 rounded-full font-semibold hover:bg-gold-bright transition flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Add Image
                </button>
              </div>
              <p className="text-text-dim text-sm mt-2">Tip: Use Unsplash URLs or upload to image hosting service</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {gallery.map(img => (
                <div key={img.id} className="relative group bg-bg-card rounded-lg overflow-hidden border border-gold-dim">
                  <img src={img.url} alt="Gallery" className="w-full aspect-square object-cover" />
                  <button
                    onClick={() => deleteImage(img.id)}
                    className="absolute top-2 right-2 bg-red-urgent text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-[#9A2F2F]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review.id} className={`bg-bg-card p-6 rounded-2xl border ${review.visible ? 'border-gold-dim' : 'border-red-urgent'}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-xl font-bold text-gold">{review.name}</h3>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < review.rating ? 'text-gold' : 'text-text-dim'}>★</span>
                        ))}
                      </div>
                      <span className="text-text-dim text-sm">{review.date}</span>
                    </div>
                    <p className="text-text-secondary">{review.text}</p>
                    {!review.visible && (
                      <p className="text-red-urgent text-sm mt-2">⚠️ Hidden from public view</p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => toggleReviewVisibility(review.id)}
                      className={`px-4 py-2 rounded-full font-semibold transition ${
                        review.visible ? 'bg-bg-section text-text-secondary border border-gold-dim' : 'bg-gold text-bg-page'
                      }`}
                    >
                      {review.visible ? 'Hide' : 'Show'}
                    </button>
                    <button
                      onClick={() => deleteReview(review.id)}
                      className="bg-red-urgent text-white px-4 py-2 rounded-full hover:bg-[#9A2F2F] transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
