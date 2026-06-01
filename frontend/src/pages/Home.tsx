import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from 'framer-motion'
import { Star, MapPin, Phone, Clock, ChevronDown, Quote } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import ScrollReveal from '../components/ScrollReveal'
import { menuData } from '../lib/menuData'
import type { Language } from '../lib/types'

const HERO_BG = 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1800&q=80'

const LANG_CYCLE: Language[] = ['mr', 'hi', 'en', 'kn']

const HERO_TAGLINES: Record<Language, string> = {
  mr: 'महाराष्ट्राची खरी चव',
  hi: 'महाराष्ट्र का असली स्वाद',
  en: 'The Real Taste of Maharashtra',
  kn: 'ಮಹಾರಾಷ್ಟ್ರದ ನಿಜವಾದ ರುಚಿ',
}
const HERO_SUBTITLES: Record<Language, string> = {
  mr: 'थाली हाऊसमध्ये अस्सल महाराष्ट्रीयन थाळी अनुभवा',
  hi: 'थाली हाउस में प्रामाणिक महाराष्ट्रीयन थाली का आनंद लें',
  en: 'Experience authentic Maharashtrian Thali at Thali House, Ichalkaranji',
  kn: 'ಥಾಲಿ ಹೌಸ್‌ನಲ್ಲಿ ಅಸಲಿ ಮಹಾರಾಷ್ಟ್ರೀಯನ್ ಥಾಲಿ ಅನುಭವಿಸಿ',
}

const SIGNATURE_ITEMS = [
  menuData.find((m) => m.id === 'thali-005')!,
  menuData.find((m) => m.id === 'thali-009')!,
  menuData.find((m) => m.id === 'thali-002')!,
]

const REVIEWS = [
  {
    name: 'Rahul Patil',
    rating: 5,
    text: 'Best thali in Ichalkaranji! The Alani Mutton Thali is absolutely incredible. The rassa is perfectly spiced and the bhakri is fresh. Highly recommended!',
    date: '2 weeks ago',
  },
  {
    name: 'Priya Kulkarni',
    rating: 5,
    text: 'Amazing food and great value. The Veg Special Bhakri Thali with pithle and thecha is out of this world. Love the authentic taste!',
    date: '1 month ago',
  },
  {
    name: 'Aditya Desai',
    rating: 4,
    text: 'Great ambience and wonderful food. The Chicken Fry Thali with Pandhra Rassa is a must-try. Will definitely visit again with family.',
    date: '3 weeks ago',
  },
]

const MENU_PREVIEW_IDS = ['thali-002', 'thali-009', 'main-007', 'main-005']

// Counter hook
function useCounter(target: number, isVisible: boolean, duration = 1800) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!isVisible) return
    let start = 0
    const step = Math.ceil(target / (duration / 16))
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(start)
      }
    }, 16)
    return () => clearInterval(timer)
  }, [isVisible, target, duration])
  return count
}

function StatCounter({ target, suffix }: { target: number; suffix: string }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.5 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  const count = useCounter(target, visible)
  return (
    <div ref={ref} className="font-dmserif text-4xl text-saffron">
      {count}{suffix}
    </div>
  )
}

export default function Home() {
  const { t, language } = useLanguage()
  const [langIndex, setLangIndex] = useState(0)
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const yParallax = useTransform(scrollY, [0, 600], [0, 180])

  // Cycle language for hero
  useEffect(() => {
    const timer = setInterval(() => {
      setLangIndex((i) => (i + 1) % LANG_CYCLE.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  const currentLang = LANG_CYCLE[langIndex]

  const previewItems = MENU_PREVIEW_IDS.map((id) => menuData.find((m) => m.id === id)!).filter(Boolean)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="page-wrapper"
    >
      {/* Floating particles style tag */}
      <style>{`
        .particle { position: absolute; border-radius: 50%; animation: floatParticle linear infinite; }
      `}</style>

      {/* ========== HERO ========== */}
      <section
        ref={heroRef}
        className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden"
      >
        {/* Parallax BG */}
        <motion.div
          style={{ y: yParallax }}
          className="absolute inset-0 scale-110"
        >
          <img
            src={HERO_BG}
            alt="Thali House Hero"
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
        </motion.div>

        {/* Rotating mandala */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          aria-hidden
        >
          <svg
            className="animate-mandala w-[700px] h-[700px] opacity-[0.04]"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {[...Array(12)].map((_, i) => (
              <g key={i} transform={`rotate(${i * 30} 100 100)`}>
                <ellipse cx="100" cy="40" rx="8" ry="22" fill="white" />
                <circle cx="100" cy="18" r="4" fill="white" />
              </g>
            ))}
            <circle cx="100" cy="100" r="18" fill="none" stroke="white" strokeWidth="2" />
            <circle cx="100" cy="100" r="35" fill="none" stroke="white" strokeWidth="1" />
            <circle cx="100" cy="100" r="55" fill="none" stroke="white" strokeWidth="0.5" />
          </svg>
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
          {[...Array(18)].map((_, i) => {
            const colors = ['#FF6B00', '#D4A017', '#8B1A1A', '#FDF6EC', '#FF8C38']
            const size = Math.random() * 8 + 4
            const left = Math.random() * 100
            const delay = Math.random() * 8
            const dur = Math.random() * 10 + 8
            return (
              <span
                key={i}
                className="particle"
                style={{
                  width: size,
                  height: size,
                  left: `${left}%`,
                  bottom: '-5%',
                  background: colors[i % colors.length],
                  animationDelay: `${delay}s`,
                  animationDuration: `${dur}s`,
                  opacity: 0.6,
                }}
              />
            )
          })}
        </div>

        {/* Hero content */}
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 mb-6"
          >
            <span className="relative overflow-hidden bg-saffron/20 border border-saffron/40 text-saffron/90 text-xs font-semibold px-4 py-1.5 rounded-full tracking-wide uppercase">
              Established 2019 · Ichalkaranji, Maharashtra
              <span className="absolute inset-0 animate-shimmer-sweep" />
            </span>
          </motion.div>

          {/* Cycling tagline */}
          <div className="overflow-hidden mb-4 min-h-[60px] sm:min-h-[70px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.h1
                key={currentLang}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.55, ease: 'easeInOut' }}
                className={`font-playfair font-bold text-3xl sm:text-5xl lg:text-6xl text-white leading-tight ${
                  currentLang === 'mr' || currentLang === 'hi' ? 'font-devanagari' : ''
                } ${currentLang === 'kn' ? 'font-kannada' : ''}`}
              >
                {HERO_TAGLINES[currentLang]}
              </motion.h1>
            </AnimatePresence>
          </div>

          {/* Cycling subtitle */}
          <div className="overflow-hidden mb-8 min-h-[40px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={`sub-${currentLang}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: 'easeInOut', delay: 0.08 }}
                className={`text-white/75 text-base sm:text-lg ${
                  currentLang === 'mr' || currentLang === 'hi' ? 'font-devanagari' : ''
                } ${currentLang === 'kn' ? 'font-kannada' : ''}`}
              >
                {HERO_SUBTITLES[currentLang]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.div whileTap={{ scale: 0.97 }}>
              <Link
                to="/order"
                className="inline-flex items-center gap-2 bg-saffron hover:bg-orange-600 text-white font-semibold px-8 py-3.5 rounded-full transition-all duration-200 shadow-lg shadow-saffron/30 text-base"
              >
                {t('hero.orderNow')}
              </Link>
            </motion.div>
            <motion.div whileTap={{ scale: 0.97 }}>
              <Link
                to="/reservation"
                className="inline-flex items-center gap-2 border-2 border-white/60 hover:border-white text-white font-semibold px-8 py-3.5 rounded-full transition-all duration-200 backdrop-blur-sm text-base"
              >
                {t('hero.reserveTable')}
              </Link>
            </motion.div>
          </motion.div>

          {/* Language pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center justify-center gap-2 mt-8"
          >
            {LANG_CYCLE.map((lang) => (
              <span
                key={lang}
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold transition-all duration-300 ${
                  lang === currentLang
                    ? 'bg-saffron text-white scale-110'
                    : 'text-white/40 border border-white/20'
                }`}
              >
                {lang.toUpperCase()}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 right-8 flex flex-col items-center gap-1 text-white/50">
          <span className="text-xs uppercase tracking-widest text-white/40 rotate-90 mb-2">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent animate-scroll-bounce" />
          <ChevronDown size={14} className="animate-bounce" />
        </div>
      </section>

      {/* ========== SIGNATURE DISHES ========== */}
      <section className="py-20 bg-offwhite">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-14">
              <span className="text-saffron text-xs font-semibold uppercase tracking-[0.2em] mb-3 block">
                Thali House Favourites
              </span>
              <h2 className="font-playfair font-bold text-3xl sm:text-4xl text-charcoal">
                {t('sections.signatureDishes')}
              </h2>
              <div className="w-16 h-1 bg-saffron mx-auto mt-4 rounded-full" />
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {SIGNATURE_ITEMS.map((item, i) => {
              const name = item[`name_${language}` as keyof typeof item] as string
              const desc = item[`description_${language}` as keyof typeof item] as string
              return (
                <ScrollReveal key={item.id} delay={i * 0.12} direction="up">
                  <motion.div
                    whileHover={{ scale: 1.02, y: -4 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group"
                  >
                    <div className="relative overflow-hidden h-52">
                      <motion.img
                        whileHover={{ scale: 1.08 }}
                        transition={{ duration: 0.4 }}
                        src={item.image_url}
                        alt={name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <span className="absolute top-3 left-3 bg-white text-xs font-semibold px-2.5 py-1 rounded-full text-charcoal shadow">
                        {item.category === 'THALI' ? 'Signature Thali' : item.category}
                      </span>
                      <span
                        className={`absolute top-3 right-3 w-5 h-5 rounded-sm border-2 flex items-center justify-center ${
                          item.is_veg ? 'border-green-600' : 'border-red-600'
                        }`}
                      >
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            item.is_veg ? 'bg-green-600' : 'bg-red-600'
                          }`}
                        />
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="font-playfair font-semibold text-lg text-charcoal mb-2 leading-tight">
                        {name}
                      </h3>
                      <p className="text-charcoal/60 text-sm leading-relaxed mb-4 line-clamp-2">
                        {desc}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="font-dmserif text-2xl text-saffron">
                          ₹{item.price}
                        </span>
                        <motion.div whileTap={{ scale: 0.97 }}>
                          <Link
                            to="/order"
                            className="bg-saffron/10 hover:bg-saffron text-saffron hover:text-white text-sm font-semibold px-4 py-2 rounded-full transition-all duration-200"
                          >
                            {t('hero.orderNow')}
                          </Link>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ========== OUR STORY ========== */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            {/* Text */}
            <ScrollReveal direction="left">
              <span className="text-saffron text-xs font-semibold uppercase tracking-[0.2em] mb-3 block">
                Since 2019
              </span>
              <h2 className="font-playfair font-bold text-3xl sm:text-4xl text-charcoal mb-6">
                {t('sections.ourStory')}
              </h2>
              <p className={`text-charcoal/70 text-base leading-relaxed mb-8 ${
                language === 'mr' || language === 'hi' ? 'font-devanagari' : ''
              } ${language === 'kn' ? 'font-kannada' : ''}`}>
                {t('story.text')}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {[
                  { target: 967, suffix: '+', label: t('general.reviews') },
                  { target: 40, suffix: '★', label: t('general.rating'), divisor: 10 },
                  { target: 7, suffix: '', label: t('general.years') },
                  { target: 25, suffix: '+', label: t('general.items') },
                ].map(({ target, suffix, label, divisor }, i) => (
                  <div key={i} className="text-center">
                    <div className="font-dmserif text-3xl sm:text-4xl text-saffron">
                      {divisor ? (
                        <StatCounter target={target} suffix={suffix} />
                      ) : (
                        <StatCounter target={target} suffix={suffix} />
                      )}
                    </div>
                    <div className="text-charcoal/60 text-xs mt-1 font-medium">{label}</div>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            {/* Image */}
            <ScrollReveal direction="right">
              <div className="relative">
                <motion.img
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  src="https://images.unsplash.com/photo-1567188040759-fb8a883dc6d6?w=800&q=80"
                  alt="Our kitchen"
                  className="w-full rounded-2xl shadow-2xl object-cover h-96 sm:h-[480px]"
                  loading="lazy"
                />
                <div className="absolute -bottom-5 -left-5 bg-saffron text-white rounded-2xl p-4 shadow-xl">
                  <div className="font-dmserif text-2xl">4.0★</div>
                  <div className="text-xs font-semibold opacity-90">967+ Reviews</div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ========== MENU PREVIEW ========== */}
      <section className="py-20 bg-charcoal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-14">
              <span className="text-saffron text-xs font-semibold uppercase tracking-[0.2em] mb-3 block">
                Popular Picks
              </span>
              <h2 className="font-playfair font-bold text-3xl sm:text-4xl text-white">
                {t('sections.exploreMenu')}
              </h2>
              <div className="w-16 h-1 bg-saffron mx-auto mt-4 rounded-full" />
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {previewItems.map((item, i) => {
              const name = item[`name_${language}` as keyof typeof item] as string
              const desc = item[`description_${language}` as keyof typeof item] as string
              return (
                <ScrollReveal key={item.id} delay={i * 0.1} direction="up">
                  <motion.div
                    whileHover={{ scale: 1.02, y: -4 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="glass rounded-2xl overflow-hidden group cursor-pointer"
                  >
                    <div className="relative overflow-hidden h-40">
                      <motion.img
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.4 }}
                        src={item.image_url}
                        alt={name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <span
                        className={`absolute bottom-2 left-2 w-4 h-4 rounded-sm border flex items-center justify-center ${
                          item.is_veg ? 'border-green-500' : 'border-red-500'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            item.is_veg ? 'bg-green-500' : 'bg-red-500'
                          }`}
                        />
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-semibold text-sm mb-1 line-clamp-1">{name}</h3>
                      <p className="text-white/50 text-xs mb-3 line-clamp-2">{desc}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-dmserif text-xl text-saffron">₹{item.price}</span>
                        <Link
                          to="/order"
                          className="text-xs text-saffron hover:text-white transition-colors duration-200 font-semibold"
                        >
                          Order →
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                </ScrollReveal>
              )
            })}
          </div>

          <ScrollReveal>
            <div className="text-center">
              <motion.div whileTap={{ scale: 0.97 }}>
                <Link
                  to="/menu"
                  className="inline-flex items-center gap-2 bg-saffron hover:bg-orange-600 text-white font-semibold px-8 py-3.5 rounded-full transition-all duration-200 shadow-lg shadow-saffron/30"
                >
                  {t('buttons.viewFullMenu')}
                </Link>
              </motion.div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ========== OFFERS BANNER ========== */}
      <section className="py-16 relative overflow-hidden bg-maroon">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)`,
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="scale">
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative bg-gradient-to-r from-saffron/20 to-gold/20 border border-saffron/30 rounded-3xl p-8 sm:p-12 text-center overflow-hidden"
              style={{ boxShadow: '0 0 60px rgba(255,107,0,0.2)' }}
            >
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                <span className="font-dmserif text-[200px] text-saffron leading-none">%</span>
              </div>
              <span className="text-gold text-xs font-semibold uppercase tracking-[0.2em] mb-3 block">
                {t('sections.todaySpecial')}
              </span>
              <h2 className="font-dmserif text-4xl sm:text-6xl text-white mb-3">20% OFF</h2>
              <p className="text-white/70 text-base sm:text-lg mb-8 max-w-lg mx-auto">
                On all Thali orders. Valid for dine-in only. Limited time offer!
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.div whileTap={{ scale: 0.97 }}>
                  <Link
                    to="/offers"
                    className="inline-flex items-center gap-2 bg-saffron hover:bg-orange-600 text-white font-semibold px-7 py-3 rounded-full transition-all duration-200 shadow-lg"
                  >
                    View All Offers
                  </Link>
                </motion.div>
                <motion.div whileTap={{ scale: 0.97 }}>
                  <Link
                    to="/order"
                    className="inline-flex items-center gap-2 border-2 border-white/40 hover:border-white text-white font-semibold px-7 py-3 rounded-full transition-all duration-200"
                  >
                    {t('buttons.placeOrder')}
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </ScrollReveal>
        </div>
      </section>

      {/* ========== REVIEWS ========== */}
      <section className="py-20 bg-brown">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-14">
              <span className="text-saffron text-xs font-semibold uppercase tracking-[0.2em] mb-3 block">
                Testimonials
              </span>
              <h2 className="font-playfair font-bold text-3xl sm:text-4xl text-white">
                {t('sections.whatGuestsSay')}
              </h2>
              <div className="w-16 h-1 bg-saffron mx-auto mt-4 rounded-full" />
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {REVIEWS.map((review, i) => (
              <ScrollReveal key={i} delay={i * 0.12} direction="up">
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden"
                >
                  <Quote
                    size={40}
                    className="absolute top-4 right-4 text-saffron/20"
                  />
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(review.rating)].map((_, j) => (
                      <Star key={j} size={14} fill="#D4A017" stroke="#D4A017" />
                    ))}
                  </div>
                  <p className="text-white/75 text-sm leading-relaxed mb-5 italic">
                    "{review.text}"
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-semibold text-sm">{review.name}</div>
                      <div className="text-white/40 text-xs">{review.date}</div>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-saffron/20 flex items-center justify-center">
                      <span className="text-saffron font-bold text-sm">
                        {review.name[0]}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ========== LOCATION ========== */}
      <section className="py-20 bg-offwhite">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-14">
              <span className="text-saffron text-xs font-semibold uppercase tracking-[0.2em] mb-3 block">
                Where To Find Us
              </span>
              <h2 className="font-playfair font-bold text-3xl sm:text-4xl text-charcoal">
                {t('sections.visitUs')}
              </h2>
              <div className="w-16 h-1 bg-saffron mx-auto mt-4 rounded-full" />
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            {/* Map */}
            <ScrollReveal direction="left">
              <div className="map-container rounded-2xl overflow-hidden shadow-xl h-64 sm:h-80">
                <iframe
                  title="Thali House Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3824.234!2d74.4697!3d16.6887!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc1001!2sThali+House!5e0!3m2!1sen!2sin!4v1!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </ScrollReveal>

            {/* Contact info */}
            <ScrollReveal direction="right">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-saffron/10 flex items-center justify-center flex-shrink-0">
                    <MapPin size={22} className="text-saffron" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-charcoal mb-1">{t('contact.address')}</h4>
                    <p className="text-charcoal/60 text-sm leading-relaxed">
                      Bavaskar Building, RB Road, Kagwade Mala,<br />
                      Ichalkaranji, Maharashtra 416115
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-saffron/10 flex items-center justify-center flex-shrink-0">
                    <Phone size={22} className="text-saffron" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-charcoal mb-1">{t('contact.phone')}</h4>
                    <a href="tel:+918888377788" className="text-saffron font-semibold hover:underline">
                      +91 88883 77788
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-saffron/10 flex items-center justify-center flex-shrink-0">
                    <Clock size={22} className="text-saffron" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-charcoal mb-1">{t('contact.hours')}</h4>
                    <p className="text-charcoal/60 text-sm">11:00 AM – 11:00 PM, Every Day</p>
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-0.5 rounded-full mt-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      {t('contact.openNow')}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <motion.div whileTap={{ scale: 0.97 }}>
                    <a
                      href="tel:+918888377788"
                      className="flex items-center gap-2 bg-saffron hover:bg-orange-600 text-white font-semibold px-5 py-3 rounded-full transition-all duration-200 text-sm"
                    >
                      <Phone size={16} />
                      {t('buttons.callNow')}
                    </a>
                  </motion.div>
                  <motion.div whileTap={{ scale: 0.97 }}>
                    <a
                      href="https://wa.me/918888377788"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 border-2 border-saffron text-saffron hover:bg-saffron hover:text-white font-semibold px-5 py-3 rounded-full transition-all duration-200 text-sm"
                    >
                      {t('buttons.whatsapp')}
                    </a>
                  </motion.div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </motion.div>
  )
}
