import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, User, LogOut, ShoppingBag, Calendar } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import type { Language } from '../lib/types'

const LANGS: { code: Language; label: string }[] = [
  { code: 'mr', label: 'MR' },
  { code: 'hi', label: 'HI' },
  { code: 'en', label: 'EN' },
  { code: 'kn', label: 'KN' },
]

const NAV_LINKS = [
  { to: '/menu', key: 'nav.menu' },
  { to: '/order', key: 'nav.order' },
  { to: '/reservation', key: 'nav.reserve' },
  { to: '/offers', key: 'nav.offers' },
  { to: '/contact', key: 'nav.contact' },
]

export default function Nav() {
  const { t, language, setLanguage } = useLanguage()
  const { session, profile } = useAuth()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  const displayName = profile?.full_name || session?.user?.email?.split('@')[0] || null

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || menuOpen
            ? 'bg-charcoal/95 backdrop-blur-md shadow-lg'
            : 'bg-gradient-to-b from-black/60 to-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-saffron flex items-center justify-center">
                <span className="text-white font-playfair font-bold text-sm">TH</span>
              </div>
              <span className="font-playfair font-bold text-xl text-white">
                Thali <span className="text-saffron">House</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map(({ to, key }, i) => {
                const isActive = location.pathname === to
                return (
                  <motion.div key={to} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.07 }}>
                    <Link to={to} className={`relative px-4 py-2 text-sm font-medium transition-colors duration-200 ${isActive ? 'text-saffron' : 'text-white/80 hover:text-white'}`}>
                      {t(key)}
                      {isActive && <motion.span layoutId="nav-underline" className="absolute bottom-0 left-3 right-3 h-0.5 bg-saffron rounded-full" />}
                    </Link>
                  </motion.div>
                )
              })}
            </div>

            {/* Right: language + user + hamburger */}
            <div className="flex items-center gap-2">
              {/* Language switcher */}
              <div className="flex items-center gap-0.5 bg-white/10 rounded-full px-1 py-1">
                {LANGS.map(({ code, label }) => (
                  <button key={code} onClick={() => setLanguage(code)}
                    className={`text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-full transition-all duration-200 ${language === code ? 'bg-saffron text-white' : 'text-white/70 hover:text-white'}`}>
                    {label}
                  </button>
                ))}
              </div>

              {/* User menu (desktop) */}
              {session && displayName ? (
                <div className="hidden lg:block relative">
                  <button onClick={() => setUserMenuOpen(v => !v)}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-3 py-1.5 rounded-full transition-all duration-200">
                    <div className="w-6 h-6 rounded-full bg-saffron flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{displayName[0]?.toUpperCase()}</span>
                    </div>
                    <span className="max-w-[100px] truncate">{displayName}</span>
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                        <Link to="/auth/profile" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-3 text-sm text-charcoal hover:bg-offwhite transition-colors">
                          <User size={15} className="text-saffron" /> My Profile
                        </Link>
                        <Link to="/order" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-3 text-sm text-charcoal hover:bg-offwhite transition-colors">
                          <ShoppingBag size={15} className="text-saffron" /> My Orders
                        </Link>
                        <Link to="/reservation" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-3 text-sm text-charcoal hover:bg-offwhite transition-colors">
                          <Calendar size={15} className="text-saffron" /> My Reservations
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden lg:flex items-center gap-2">
                  <Link to="/auth/login" className="text-white/70 hover:text-white text-sm font-medium px-3 py-1.5 rounded-full hover:bg-white/10 transition-all duration-200">
                    Sign In
                  </Link>
                  <Link to="/auth/signup" className="bg-saffron hover:bg-orange-600 text-white text-sm font-semibold px-4 py-1.5 rounded-full transition-all duration-200">
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Hamburger */}
              <button onClick={() => setMenuOpen(v => !v)} className="lg:hidden text-white p-1.5 rounded-md hover:bg-white/10 transition" aria-label="Toggle menu">
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div key="mobile-drawer" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="fixed top-16 left-0 right-0 z-40 bg-charcoal/98 backdrop-blur-md overflow-hidden">
            <div className="px-4 py-4 flex flex-col gap-1">
              {NAV_LINKS.map(({ to, key }, i) => {
                const isActive = location.pathname === to
                return (
                  <motion.div key={to} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                    <Link to={to} className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 ${isActive ? 'bg-saffron/20 text-saffron' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                      {t(key)}
                    </Link>
                  </motion.div>
                )
              })}
              <div className="border-t border-white/10 mt-2 pt-2">
                {session && displayName ? (
                  <>
                    <Link to="/auth/profile" className="flex items-center gap-2 px-4 py-3 rounded-lg text-white/80 hover:bg-white/10">
                      <User size={16} /> {displayName}
                    </Link>
                  </>
                ) : (
                  <div className="flex gap-2 px-4 pt-2">
                    <Link to="/auth/login" className="flex-1 text-center py-2.5 rounded-xl border border-white/20 text-white/70 font-medium text-sm">Sign In</Link>
                    <Link to="/auth/signup" className="flex-1 text-center py-2.5 rounded-xl bg-saffron text-white font-semibold text-sm">Sign Up</Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close user menu */}
      {userMenuOpen && <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />}
    </>
  )
}
