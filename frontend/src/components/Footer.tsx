import { Link } from 'react-router-dom'
import { MapPin, Phone, Clock } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="bg-[#080808] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-full bg-saffron flex items-center justify-center">
                <span className="text-white font-playfair font-bold text-sm">TH</span>
              </div>
              <span className="font-playfair font-bold text-xl">
                Thali <span className="text-saffron">House</span>
              </span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-5 font-devanagari">
              {t('footer.tagline')}
            </p>
            <a
              href="https://wa.me/918888377788"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] text-sm font-semibold px-4 py-2 rounded-full transition-colors duration-200"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp Us
            </a>
            <p className="text-white/30 text-xs mt-4">
              &copy; {new Date().getFullYear()} Thali House. All rights reserved.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="font-playfair font-semibold text-base mb-4 text-gold">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'Home' },
                { to: '/menu', label: t('nav.menu') },
                { to: '/order', label: t('nav.order') },
                { to: '/reservation', label: t('nav.reserve') },
                { to: '/offers', label: t('nav.offers') },
                { to: '/contact', label: t('nav.contact') },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-white/60 text-sm hover:text-saffron transition-all duration-200 hover:translate-x-1 inline-block"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Categories */}
          <div>
            <h4 className="font-playfair font-semibold text-base mb-4 text-gold">
              {t('footer.categories')}
            </h4>
            <ul className="space-y-2">
              {['Thali', 'Starters', 'Main Course', 'Breads', 'Rice', 'Beverages', 'Snacks'].map(
                (cat) => (
                  <li key={cat}>
                    <Link
                      to="/menu"
                      className="text-white/60 text-sm hover:text-saffron transition-all duration-200 hover:translate-x-1 inline-block"
                    >
                      {cat}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Col 4: Contact */}
          <div>
            <h4 className="font-playfair font-semibold text-base mb-4 text-gold">
              {t('footer.contact')}
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-saffron mt-0.5 flex-shrink-0" />
                <span className="text-white/60 text-sm leading-relaxed">
                  Bavaskar Building, RB Road, Kagwade Mala, Ichalkaranji, Maharashtra 416115
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-saffron flex-shrink-0" />
                <a
                  href="tel:+918888377788"
                  className="text-white/60 text-sm hover:text-saffron transition-colors duration-200"
                >
                  +91 88883 77788
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock size={16} className="text-saffron flex-shrink-0" />
                <span className="text-white/60 text-sm">11:00 AM – 11:00 PM, Every Day</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-saffron font-devanagari text-sm font-medium">
            आस्वाद घ्या, आनंद घ्या
          </p>
          <p className="text-white/30 text-xs">Est. 2019 · Ichalkaranji, Maharashtra</p>
        </div>
      </div>
    </footer>
  )
}
