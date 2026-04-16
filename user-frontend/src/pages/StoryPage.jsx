import { Award, Leaf, Quote, Users } from 'lucide-react'

export default function StoryPage() {
  return (
    <div className="pt-24 pb-16 px-4 animate-fadeIn">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-center mb-4 text-gold-bright" style={{ fontFamily: 'Playfair Display, serif' }}>
          Our Story
        </h1>
        <p className="tagline text-center mb-12">Authentic Godavari Heritage in the Heart of the City</p>

        <div className="prose prose-invert mx-auto">
          <div className="relative mb-16 rounded-3xl overflow-hidden aspect-video shadow-2xl gold-border">
            <img
              src="https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200"
              alt="Restaurant Interior"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h2 className="text-3xl text-gold mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                The Legacy of Konaseema
              </h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                Born in the lush green landscapes of Godavari&apos;s Konaseema, RajaMahendravaram PalavuCentre was
                founded on a simple promise: to bring the true, unadulterated flavors of our village to every plate.
              </p>
              <p className="text-text-secondary leading-relaxed">
                Our journey started in the traditional kitchens of Rajahmundry, where recipes were perfected over
                generations using hand-ground spices and local ingredients. Today, we carry that same heritage into
                every dish we serve.
              </p>
            </div>
            <div className="bg-bg-card p-8 rounded-2xl border border-gold/20 relative">
              <Quote className="absolute -top-4 -left-4 w-12 h-12 text-gold/20" />
              <p className="text-lg text-gold-bright mb-4" style={{ fontFamily: 'var(--font-body)' }}>
                "Food isn't just about nutrition; it's about the stories, the heritage, and the warmth of the people
                who cooked it for generations."
              </p>
              <span className="text-sm font-bold uppercase tracking-widest text-white/60">- Our Founder</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {[
              {
                icon: Award,
                title: 'Generational Recipes',
                desc: 'Passed down through families with meticulous care for every spice ratio.',
              },
              {
                icon: Leaf,
                title: 'Purity First',
                desc: 'We source our cold-pressed oils and key spices directly from the farmers of Konaseema.',
              },
              {
                icon: Users,
                title: 'People Powered',
                desc: 'Our chefs are traditional specialists who understand the soul of Godavari cooking.',
              },
            ].map((item, idx) => (
              <div key={idx} className="text-center p-6 bg-white/5 rounded-xl border border-white/5">
                <item.icon className="w-10 h-10 text-gold mx-auto mb-4" />
                <h3 className="text-xl mb-2 text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {item.title}
                </h3>
                <p className="text-sm text-text-secondary">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center bg-gold/10 p-12 rounded-[40px] border-2 border-gold/30">
            <h2 className="text-4xl text-gold mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
              A Taste of Heritage
            </h2>
            <p className="text-lg text-text-primary max-w-2xl mx-auto mb-8 leading-relaxed">
              We invite you to join us on this culinary journey. From the aromatic Palavu to the spicy Natu Kodi
              Pulusu, every bite is a tribute to the beautiful land of the Godavari.
            </p>
            <div className="w-20 h-1 bg-gold/40 mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
