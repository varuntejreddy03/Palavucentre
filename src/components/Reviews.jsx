import { useState, useEffect } from 'react'

const defaultReviews = [
  { id: 1, name: 'Rajesh Kumar', rating: 5, text: 'Authentic Godavari flavors! The Natu Kodi Biryani reminded me of my grandmother\'s cooking. Absolutely delicious!', date: '2024-02-15', visible: true },
  { id: 2, name: 'Priya Sharma', rating: 5, text: 'Best traditional Andhra food in Hyderabad. The Gongura Chicken is a must-try. Great ambiance and service.', date: '2024-02-10', visible: true },
  { id: 3, name: 'Venkat Reddy', rating: 4, text: 'Loved the authentic taste and presentation. Prices are reasonable for the quality. Will definitely visit again.', date: '2024-02-05', visible: true },
  { id: 4, name: 'Lakshmi Devi', rating: 5, text: 'The Punugulu and Royyala Vepudu were outstanding. Takes me back to my village days. Highly recommended!', date: '2024-01-28', visible: true },
  { id: 5, name: 'Anil Varma', rating: 5, text: 'Exceptional food quality and taste. The staff is very courteous. A hidden gem for authentic Konaseema cuisine.', date: '2024-01-20', visible: true },
  { id: 6, name: 'Swathi Reddy', rating: 4, text: 'Great experience overall. The fish curry was perfectly spiced. Loved the traditional serving style.', date: '2024-01-15', visible: true },
]

export default function Reviews() {
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    const saved = localStorage.getItem('reviews')
    if (saved) {
      setReviews(JSON.parse(saved).filter(r => r.visible))
    } else {
      setReviews(defaultReviews.filter(r => r.visible))
      localStorage.setItem('reviews', JSON.stringify(defaultReviews))
    }
  }, [])

  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0

  const StarRating = ({ rating }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <svg
          key={star}
          className={`w-5 h-5 ${star <= rating ? 'text-gold' : 'text-text-dim'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )

  return (
    <section id="reviews" className="py-20 px-4 bg-bg-card">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-center section-title-treatment">What Our Guests Say</h2>
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-4xl font-bold text-gold">{avgRating}</span>
            <StarRating rating={Math.round(avgRating)} />
          </div>
          <p className="text-text-secondary">Based on {reviews.length} reviews</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map(review => (
            <div key={review.id} className="bg-bg-section p-6 rounded-xl gold-border relative overflow-hidden hover:border-gold hover:-translate-y-0.5 transition-all duration-300">
              <div className="absolute top-0 left-3 text-[80px] leading-none text-gold opacity-[0.12] pointer-events-none" style={{ fontFamily: 'Playfair Display, serif' }}>&ldquo;</div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-[18px] text-gold-bright mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontStyle: 'italic' }}>{review.name}</h3>
                    <p className="text-[11px] text-[#5C4F35]" style={{ fontFamily: 'Inter, sans-serif' }}>{new Date(review.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <StarRating rating={review.rating} />
                </div>
                <p className="text-[14px] text-text-secondary leading-[1.8]" style={{ fontFamily: 'Inter, sans-serif' }}>{review.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="https://g.page/r/YOUR_GOOGLE_BUSINESS_ID/review"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border border-[#2E2200] text-text-secondary px-7 py-2.5 rounded-full text-[13px] uppercase tracking-[2px] font-semibold hover:border-gold hover:text-gold transition-all duration-200"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Write a Review
          </a>
        </div>
      </div>
    </section>
  )
}
