import { Link } from 'react-router-dom'
import { Instagram, Facebook } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-bg-page py-16 px-4 border-t-2 border-gold-dim">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-[18px] text-gold mb-4" style={{fontFamily: 'Playfair Display, serif', fontWeight: 700}}>Rajamahendravaram Pulav Centre</h3>
            <p className="text-text-secondary text-sm mb-2">Rooted in Konaseema, Served in Hyderabad</p>
            <p className="text-text-dim text-xs">Authentic Godavari heritage cuisine bringing traditional flavors to your table.</p>
          </div>

          <div>
            <h4 className="font-bold text-gold mb-4 uppercase text-xs tracking-[3px] pb-3 border-b border-gold-dim" style={{fontFamily: 'Inter, sans-serif'}}>Quick Links</h4>
            <ul className="space-y-2 text-text-secondary text-sm">
              <li><Link to="/menu" className="hover:text-gold hover:pl-2 transition-all duration-200">Menu</Link></li>
              <li><Link to="/gallery" className="hover:text-gold hover:pl-2 transition-all duration-200">Gallery</Link></li>
              <li><Link to="/catering" className="hover:text-gold hover:pl-2 transition-all duration-200">Catering</Link></li>
              <li><Link to="/franchise" className="hover:text-gold hover:pl-2 transition-all duration-200">Franchise</Link></li>
              <li><Link to="/contact" className="hover:text-gold hover:pl-2 transition-all duration-200">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gold mb-4 uppercase text-xs tracking-[3px] pb-3 border-b border-gold-dim" style={{fontFamily: 'Inter, sans-serif'}}>Contact Us</h4>
            <ul className="space-y-2 text-text-secondary text-sm">
              <li><a href="tel:9966655997" className="hover:text-gold transition-colors duration-200">📞 9966655997</a></li>
              <li><a href="mailto:rajamahendravarampalavu@gmail.com" className="hover:text-gold transition-colors duration-200 break-all">✉️ rajamahendravarampalavu@gmail.com</a></li>
              <li className="pt-2">🕒 12:00 PM – 11:00 PM<br /><span className="ml-4">Monday – Sunday</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gold mb-4 uppercase text-xs tracking-[3px] pb-3 border-b border-gold-dim" style={{fontFamily: 'Inter, sans-serif'}}>Follow Us</h4>
            <div className="flex gap-4">
              <a href="https://instagram.com/palavucentre" target="_blank" rel="noopener noreferrer" className="w-11 h-11 bg-transparent border-[1.5px] border-gold-dim rounded-full hover:bg-gold transition-all duration-200 flex items-center justify-center group">
                <Instagram className="w-5 h-5 text-gold group-hover:text-bg-page" />
              </a>
              <a href="https://facebook.com/palavucentre" target="_blank" rel="noopener noreferrer" className="w-11 h-11 bg-transparent border-[1.5px] border-gold-dim rounded-full hover:bg-gold transition-all duration-200 flex items-center justify-center group">
                <Facebook className="w-5 h-5 text-gold group-hover:text-bg-page" />
              </a>
            </div>
            <p className="text-text-secondary text-sm mt-4">@palavucentre</p>
          </div>
        </div>

        <div className="bg-bg-section -mx-4 px-4 py-6 text-center text-text-dim text-sm mt-12 pt-6 border-t border-gold-dim">
          <p>&copy; {new Date().getFullYear()} Rajamahendravaram Pulav Centre. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
