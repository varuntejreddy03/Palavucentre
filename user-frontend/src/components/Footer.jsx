import { Facebook, Instagram, Linkedin, MapPin, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useSiteSettings } from '../context/SiteContext'
import { STORE_LOCATIONS } from '../../../shared/store-locations'

const socialIcons = {
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
  whatsapp: MessageCircle,
}

const socialToneClasses = {
  instagram: 'hover:border-pink-400/70 hover:bg-pink-500/15 hover:text-pink-300',
  facebook: 'hover:border-blue-400/70 hover:bg-blue-500/15 hover:text-blue-300',
  linkedin: 'hover:border-sky-400/70 hover:bg-sky-500/15 hover:text-sky-300',
  whatsapp: 'hover:border-green-400/70 hover:bg-green-500/15 hover:text-green-300',
}

function getBrandLines(name) {
  const normalized = String(name || 'RajaMahendravaram PalavuCentre').trim()
  const exactBrandMatch = normalized.match(/^(.*)\s+(PalavuCentre)$/i)

  if (exactBrandMatch) {
    return [exactBrandMatch[1], exactBrandMatch[2]]
  }

  const words = normalized.split(/\s+/).filter(Boolean)
  if (words.length <= 1) {
    return [normalized]
  }

  const midpoint = Math.ceil(words.length / 2)
  return [words.slice(0, midpoint).join(' '), words.slice(midpoint).join(' ')]
}

export default function Footer() {
  const { siteSettings } = useSiteSettings()
  const restaurantName = siteSettings?.restaurantName || 'RajaMahendravaram PalavuCentre'
  const tagline = siteSettings?.tagline || 'Rooted in Konaseema, Served in Hyderabad'
  const description =
    siteSettings?.restaurantDescription ||
    'Authentic Godavari heritage cuisine bringing traditional flavors to your table.'
  const phone = siteSettings?.contact?.phone || '9966655997'
  const email = siteSettings?.contact?.email || 'rajamahendravarampalavu@gmail.com'
  const hours = siteSettings?.contact?.hours || 'Monday - Sunday, 12:00 PM - 11:00 PM'
  const socialLinks = (siteSettings?.socialLinks || []).filter((link) => link.isActive !== false)
  const brandLines = getBrandLines(restaurantName)

  return (
    <footer className="relative bg-[#040100] px-4 py-16 border-t border-gold/25 md:py-[72px]">
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(240,165,0,0.75),transparent)]" aria-hidden="true" />
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10 lg:gap-12">
          <div>
            <h3 className="brand-logo-text text-[18px] mb-4 leading-[0.9]">
              {brandLines.map((part, index) => (
                <span key={`${part}-${index}`} className="block">
                  {part}
                </span>
              ))}
            </h3>
            <p className="text-text-secondary text-sm mb-2 font-light">{tagline}</p>
            <p className="text-text-dim text-xs font-light">{description}</p>
          </div>

          <div>
            <h4
              className="font-bold text-gold mb-4 uppercase text-xs tracking-[3px] pb-3 border-b border-gold-dim"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Quick Links
            </h4>
            <ul className="space-y-2 text-text-secondary text-sm">
              <li>
                <Link to="/menu" className="hover:text-gold hover:pl-2 transition-all duration-200">
                  Menu
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-gold hover:pl-2 transition-all duration-200">
                  Gallery
                </Link>
              </li>
              <li>
                <Link to="/catering" className="hover:text-gold hover:pl-2 transition-all duration-200">
                  Catering
                </Link>
              </li>
              <li>
                <Link to="/franchise" className="hover:text-gold hover:pl-2 transition-all duration-200">
                  Franchise
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-gold hover:pl-2 transition-all duration-200">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4
              className="font-bold text-gold mb-4 uppercase text-xs tracking-[3px] pb-3 border-b border-gold-dim"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Contact Us
            </h4>
            <ul className="space-y-2 text-text-secondary text-sm">
              <li>
                <a href={`tel:${phone}`} className="hover:text-gold transition-colors duration-200">
                  {phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${email}`} className="hover:text-gold transition-colors duration-200 break-all">
                  {email}
                </a>
              </li>
              <li className="pt-2">{hours}</li>
            </ul>
          </div>

          <div>
            <h4
              className="font-bold text-gold mb-4 uppercase text-xs tracking-[3px] pb-3 border-b border-gold-dim"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Follow Us
            </h4>
            <div className="flex gap-4">
              {socialLinks.length > 0
                ? socialLinks.map((link) => {
                    const Icon = socialIcons[link.platform] || Instagram
                    const toneClass = socialToneClasses[link.platform] || 'hover:border-gold/70 hover:bg-gold/10 hover:text-gold'
                    return (
                      <a
                        key={link.id || link.platform}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-11 h-11 bg-transparent border-[1.5px] border-gold-dim rounded-full transition-all duration-200 flex items-center justify-center text-gold hover:-translate-y-1 ${toneClass}`}
                      >
                        <Icon className="w-5 h-5" />
                      </a>
                    )
                  })
                : (
                  <a
                    href="https://instagram.com/palavucentre"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 bg-transparent border-[1.5px] border-gold-dim rounded-full transition-all duration-200 flex items-center justify-center text-gold hover:-translate-y-1 hover:border-pink-400/70 hover:bg-pink-500/15 hover:text-pink-300"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
            </div>
            <p className="text-text-secondary text-sm mt-4">{siteSettings?.seo?.city || 'Hyderabad'}</p>
          </div>
        </div>

        {/* Store Locations Maps */}
        <div className="mb-10 mt-2">
          <h4
            className="font-bold text-gold mb-6 uppercase text-xs tracking-[3px] pb-3 border-b border-gold-dim text-center"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Our Locations
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {STORE_LOCATIONS.map((loc) => (
              <div key={loc.id} className="rounded-2xl overflow-hidden border border-gold/15 bg-[#0D0C09]">
                <iframe
                  src={loc.embedUrl}
                  width="100%"
                  height="250"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`${loc.name} location`}
                />
                <div className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin className="h-4 w-4 shrink-0 text-gold" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{loc.name}</p>
                      <p className="text-xs text-text-secondary truncate">{loc.address}</p>
                    </div>
                  </div>
                  <a
                    href={loc.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 rounded-lg border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs font-semibold text-gold transition hover:bg-gold/20"
                  >
                    Directions
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-bg-section -mx-4 px-4 py-7 text-center text-text-dim text-sm mt-10 pt-8 border-t border-gold/25">
          <p>&copy; {new Date().getFullYear()} {restaurantName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
