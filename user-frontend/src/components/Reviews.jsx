import { useEffect, useState } from 'react'

import { publicApi } from '../lib/api'

export default function Reviews() {
  const [reviews, setReviews] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState('')
  const [form, setForm] = useState({
    name: '',
    rating: 0,
    text: '',
  })

  useEffect(() => {
    let isMounted = true

    const loadReviews = async () => {
      try {
        setError('')
        setIsLoading(true)
        const response = await publicApi.getReviews()
        if (isMounted) {
          setReviews(response.data.items || [])
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.message || 'Failed to load reviews')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadReviews()

    return () => {
      isMounted = false
    }
  }, [])

  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : 0

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleRatingChange = (rating) => {
    setForm((prev) => ({ ...prev, rating }))
  }

  const handleSubmitReview = async (event) => {
    event.preventDefault()
    setSubmitError('')
    setSubmitSuccess('')

    if (form.rating < 1 || form.rating > 5) {
      setSubmitError('Please select a rating between 1 and 5 stars.')
      return
    }

    try {
      setIsSubmitting(true)
      await publicApi.submitReview({
        name: form.name.trim(),
        rating: form.rating,
        text: form.text.trim(),
      })

      setForm({ name: '', rating: 0, text: '' })
      setSubmitSuccess('Thanks for rating.')
    } catch (requestError) {
      setSubmitError(requestError.message || 'Failed to submit your rating. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const StarRating = ({ rating }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
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

  const StarPicker = ({ rating, onChange }) => (
    <fieldset>
      <legend className="sr-only">Select your rating</legend>
      <div className="flex items-center gap-2" role="radiogroup" aria-label="Your rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <label
            key={star}
            htmlFor={`rating-${star}`}
            className="cursor-pointer rounded-md p-1 transition hover:scale-105 focus-within:outline focus-within:outline-2 focus-within:outline-gold/60"
            aria-label={`Set rating to ${star} star${star > 1 ? 's' : ''}`}
          >
            <input
              id={`rating-${star}`}
              type="radio"
              name="rating"
              value={star}
              checked={rating === star}
              onChange={(event) => onChange(Number(event.target.value))}
              className="sr-only"
            />
            <svg
              className={`h-7 w-7 ${star <= rating ? 'text-[#D6B154]' : 'text-[#5C4F35]'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </label>
        ))}
      </div>
    </fieldset>
  )

  return (
    <section id="reviews" className="py-12 md:py-16 px-4 bg-bg-card">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-center section-title-treatment">What Our Guests Say</h2>

        {isLoading ? (
          <div className="text-center text-text-secondary mt-8">Loading reviews...</div>
        ) : error ? (
          <div className="text-center text-red-300 mt-8">{error}</div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-4xl font-bold text-gold">{avgRating}</span>
                <StarRating rating={Math.round(avgRating)} />
              </div>
              <p className="text-text-secondary">Based on {reviews.length} reviews</p>
            </div>

            <div className="mb-10 rounded-2xl border border-gold/20 bg-bg-section p-5 md:p-6">
              <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <h3 className="text-[22px] font-semibold text-gold-bright">Rate Your Experience</h3>
                <p className="text-sm text-text-secondary">Your review will be visible after moderation.</p>
              </div>

              <form onSubmit={handleSubmitReview} className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="reviewName" className="mb-2 block text-[11px] font-bold uppercase tracking-[2px] text-gold/80">
                    Your Name
                  </label>
                  <input
                    id="reviewName"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    required
                    minLength={2}
                    maxLength={80}
                    placeholder="Enter your name"
                    className="w-full rounded-xl border border-gold/20 bg-black/30 px-4 py-3 text-text-primary outline-none transition focus:border-gold/50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[11px] font-bold uppercase tracking-[2px] text-gold/80">Your Rating</label>
                  <div className="rounded-xl border border-gold/20 bg-black/30 px-4 py-3">
                    <StarPicker rating={form.rating} onChange={handleRatingChange} />
                    <p className={`mt-2 text-xs ${form.rating > 0 ? 'text-green-300' : 'text-[#B28A4A]'}`}>
                      {form.rating > 0
                        ? `Selected rating: ${form.rating} star${form.rating > 1 ? 's' : ''}`
                        : 'No rating selected yet'}
                    </p>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="reviewText" className="mb-2 block text-[11px] font-bold uppercase tracking-[2px] text-gold/80">
                    Your Feedback
                  </label>
                  <textarea
                    id="reviewText"
                    name="text"
                    value={form.text}
                    onChange={handleInputChange}
                    required
                    minLength={5}
                    maxLength={500}
                    rows={4}
                    placeholder="Share your experience"
                    className="w-full rounded-xl border border-gold/20 bg-black/30 px-4 py-3 text-text-primary outline-none transition focus:border-gold/50"
                  />
                </div>

                {submitError && <p className="md:col-span-2 text-sm text-red-300">{submitError}</p>}
                {submitSuccess && <p className="md:col-span-2 text-sm text-green-300">{submitSuccess}</p>}

                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex rounded-full bg-gradient-to-r from-[#D6B154] to-[#B88728] px-6 py-3 text-[12px] font-black uppercase tracking-[2px] text-[#180600] shadow-[0_10px_30px_rgba(201,168,76,0.24)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Rating'}
                  </button>
                </div>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-bg-section p-6 rounded-xl gold-border relative overflow-hidden hover:border-gold hover:-translate-y-0.5 transition-all duration-300">
                  <div className="absolute top-0 left-3 text-[80px] leading-none text-gold opacity-[0.12] pointer-events-none" style={{ fontFamily: 'Playfair Display, serif' }}>&ldquo;</div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-[18px] text-gold-bright mb-1" style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontStyle: 'normal' }}>{review.name}</h3>
                        <p className="text-[11px] text-[#5C4F35]" style={{ fontFamily: 'var(--font-body)' }}>
                          {review.date ? new Date(review.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                        </p>
                      </div>
                      <StarRating rating={review.rating} />
                    </div>
                    <p className="text-[14px] text-text-secondary leading-[1.8]" style={{ fontFamily: 'var(--font-body)' }}>{review.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
