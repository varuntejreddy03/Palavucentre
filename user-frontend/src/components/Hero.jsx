export default function Hero() {
  return (
    <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1920&q=80" 
          alt="Traditional South Indian cuisine"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 hero-gradient"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-turmeric">RajaMahendravaram PalavuCentre</h1>
        <p className="text-2xl md:text-3xl mb-4 text-gray-200">From Konaseema's Soil to Your Table</p>
        <p className="text-lg md:text-xl mb-8 text-gray-300 max-w-2xl mx-auto">
          Experience authentic Godavari heritage cuisine in the heart of Hyderabad
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-turmeric text-earth-dark px-8 py-4 rounded-full font-semibold text-lg hover:bg-yellow-600 transition transform hover:scale-105"
          >
            View Menu
          </button>
          <button 
            onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-transparent border-2 border-turmeric text-turmeric px-8 py-4 rounded-full font-semibold text-lg hover:bg-turmeric hover:text-earth-dark transition transform hover:scale-105"
          >
            Order Online
          </button>
          <a 
            href="tel:9966655997"
            className="bg-transparent border-2 border-gray-300 text-gray-300 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-300 hover:text-earth-dark transition transform hover:scale-105"
          >
            Call Now
          </a>
        </div>

        {/* Feature Cards Preview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
          <div className="bg-earth-brown/60 backdrop-blur-sm p-4 rounded-lg hover:bg-earth-brown/80 transition cursor-pointer" onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}>
            <div className="text-3xl mb-2">🍽️</div>
            <h3 className="font-semibold text-turmeric">Our Menu</h3>
          </div>
          <div className="bg-earth-brown/60 backdrop-blur-sm p-4 rounded-lg hover:bg-earth-brown/80 transition cursor-pointer" onClick={() => document.getElementById('catering')?.scrollIntoView({ behavior: 'smooth' })}>
            <div className="text-3xl mb-2">🎉</div>
            <h3 className="font-semibold text-turmeric">Catering</h3>
          </div>
          <div className="bg-earth-brown/60 backdrop-blur-sm p-4 rounded-lg hover:bg-earth-brown/80 transition cursor-pointer" onClick={() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' })}>
            <div className="text-3xl mb-2">📸</div>
            <h3 className="font-semibold text-turmeric">Gallery</h3>
          </div>
          <div className="bg-earth-brown/60 backdrop-blur-sm p-4 rounded-lg hover:bg-earth-brown/80 transition cursor-pointer" onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}>
            <div className="text-3xl mb-2">🛒</div>
            <h3 className="font-semibold text-turmeric">Order Now</h3>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-turmeric" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  )
}
