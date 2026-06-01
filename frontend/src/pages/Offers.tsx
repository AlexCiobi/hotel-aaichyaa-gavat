import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Share2, Clock, Star, Gift, Trophy } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import ScrollReveal from '../components/ScrollReveal'

interface OfferData {
  id: string
  discount: string
  title: Record<string, string>
  description: Record<string, string>
  badge: string
  gradient: string
  validUntil?: Date
  icon: string
  applicable: string
}

const OFFERS: OfferData[] = [
  {
    id: 'offer-1',
    discount: '20% OFF',
    title: {
      mr: 'सर्व थाळ्यांवर सूट',
      hi: 'सभी थालियों पर छूट',
      en: 'All Thali Discount',
      kn: 'ಎಲ್ಲಾ ಥಾಲಿಗಳ ಮೇಲೆ ರಿಯಾಯಿತಿ',
    },
    description: {
      mr: 'कोणत्याही थाळी ऑर्डरवर २०% सूट. फक्त डाइन-इनसाठी.',
      hi: 'किसी भी थाली ऑर्डर पर 20% छूट। केवल डाइन-इन के लिए।',
      en: '20% discount on any thali order. Valid for dine-in only. Limited time!',
      kn: 'ಯಾವುದೇ ಥಾಲಿ ಆರ್ಡರ್‌ನಲ್ಲಿ 20% ರಿಯಾಯಿತಿ. ಕೇವಲ ಡೈನ್-ಇನ್‌ಗೆ.',
    },
    badge: 'HOT DEAL',
    gradient: 'from-saffron to-orange-600',
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    icon: '🔥',
    applicable: 'All Thalis · Dine-In Only',
  },
  {
    id: 'offer-2',
    discount: '₹499',
    title: {
      mr: 'कॉम्बो मील डील',
      hi: 'कॉम्बो मील डील',
      en: 'Combo Meal Deal',
      kn: 'ಕಾಂಬೋ ಮೀಲ್ ಡೀಲ್',
    },
    description: {
      mr: 'सोमवार ते शुक्रवार — २ जणांसाठी विशेष जेवण फक्त ₹४९९ मध्ये.',
      hi: 'सोमवार से शुक्रवार — 2 लोगों के लिए विशेष भोजन ₹499 में।',
      en: 'Monday–Friday special: Full meal for 2 people at just ₹499. Includes thali + beverages.',
      kn: 'ಸೋಮವಾರ–ಶುಕ್ರವಾರ ವಿಶೇಷ: 2 ಜನರಿಗೆ ₹499ಕ್ಕೆ.',
    },
    badge: 'WEEKDAY',
    gradient: 'from-maroon to-red-900',
    icon: '🍽️',
    applicable: 'Mon–Fri · Any Order Type',
  },
  {
    id: 'offer-3',
    discount: 'FREE',
    title: {
      mr: 'वाढदिवस विशेष',
      hi: 'जन्मदिन विशेष',
      en: 'Birthday Special',
      kn: 'ಹುಟ್ಟುಹಬ್ಬ ವಿಶೇಷ',
    },
    description: {
      mr: 'तुमच्या वाढदिवसाच्या दिवशी मोफत मिठाई आणि विशेष शुभेच्छा!',
      hi: 'अपने जन्मदिन पर मुफ्त मिठाई और विशेष शुभकामनाएं पाएं!',
      en: 'Get a free dessert on your birthday! Show your ID and celebrate with us.',
      kn: 'ನಿಮ್ಮ ಹುಟ್ಟುಹಬ್ಬದಂದು ಉಚಿತ ಸಿಹಿ ತಿಂಡಿ ಪಡೆಯಿರಿ!',
    },
    badge: 'BIRTHDAY',
    gradient: 'from-purple-700 to-pink-600',
    icon: '🎂',
    applicable: 'Birthday · Show Valid ID',
  },
  {
    id: 'offer-4',
    discount: 'COMING',
    title: {
      mr: 'लॉयल्टी प्रोग्राम',
      hi: 'लॉयल्टी प्रोग्राम',
      en: 'Loyalty Program',
      kn: 'ಲಾಯಲ್ಟಿ ಪ್ರೋಗ್ರಾಮ್',
    },
    description: {
      mr: 'प्रत्येक ऑर्डरवर पॉइंट्स मिळवा आणि मोफत थाळी जिंका!',
      hi: 'हर ऑर्डर पर पॉइंट्स कमाएं और मुफ्त थाली जीतें!',
      en: 'Earn points on every order. Redeem for free thalis, discounts and more. Coming soon!',
      kn: 'ಪ್ರತಿ ಆರ್ಡರ್‌ನಲ್ಲಿ ಅಂಕಗಳನ್ನು ಗಳಿಸಿ ಮತ್ತು ಉಚಿತ ಥಾಲಿ ಗೆಲ್ಲಿ!',
    },
    badge: 'SOON',
    gradient: 'from-amber-700 to-gold',
    icon: '⭐',
    applicable: 'All Orders · Launching Soon',
  },
]

function Countdown({ target }: { target: Date }) {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 })

  useEffect(() => {
    const calc = () => {
      const diff = target.getTime() - Date.now()
      if (diff <= 0) return
      setTimeLeft({
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((diff % (1000 * 60)) / 1000),
      })
    }
    calc()
    const t = setInterval(calc, 1000)
    return () => clearInterval(t)
  }, [target])

  return (
    <div className="flex items-center gap-2 mt-3">
      <Clock size={12} className="text-white/60" />
      <div className="flex items-center gap-1 text-xs">
        {[
          { v: timeLeft.d, l: 'd' },
          { v: timeLeft.h, l: 'h' },
          { v: timeLeft.m, l: 'm' },
          { v: timeLeft.s, l: 's' },
        ].map(({ v, l }, i) => (
          <span key={l}>
            <span className="bg-black/30 px-1.5 py-0.5 rounded font-mono font-bold text-white">
              {String(v).padStart(2, '0')}
            </span>
            <span className="text-white/50 mx-0.5">{l}</span>
            {i < 3 && <span className="text-white/50">:</span>}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Offers() {
  const { language } = useLanguage()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="page-wrapper pt-16 pb-20 min-h-screen"
    >
      {/* Hero */}
      <div className="relative py-20 overflow-hidden bg-charcoal">
        {/* Particle BG */}
        <style>{`
          @keyframes floatUp2 { 0%{transform:translateY(100px);opacity:0} 10%{opacity:.6} 90%{opacity:.2} 100%{transform:translateY(-200px);opacity:0} }
        `}</style>
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
          {[...Array(20)].map((_, i) => (
            <span
              key={i}
              style={{
                position: 'absolute',
                width: Math.random() * 8 + 3,
                height: Math.random() * 8 + 3,
                left: `${Math.random() * 100}%`,
                bottom: '0',
                borderRadius: '50%',
                background: ['#FF6B00', '#D4A017', '#8B1A1A'][i % 3],
                animation: `floatUp2 ${Math.random() * 8 + 6}s linear ${Math.random() * 8}s infinite`,
              }}
            />
          ))}
        </div>
        <div className="relative z-10 text-center px-4">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-saffron text-xs font-semibold uppercase tracking-[0.2em] block mb-3"
          >
            Thali House
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-playfair font-bold text-4xl sm:text-5xl text-white mb-3"
          >
            Today's Offers
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-white/50 text-sm"
          >
            Exclusive deals for our valued guests
          </motion.p>
        </div>
      </div>

      {/* Offers grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {OFFERS.map((offer, i) => {
            const title = offer.title[language] || offer.title.en
            const desc = offer.description[language] || offer.description.en
            return (
              <ScrollReveal key={offer.id} delay={i * 0.1} direction="up">
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className={`relative bg-gradient-to-br ${offer.gradient} rounded-3xl overflow-hidden p-7 shadow-xl`}
                >
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-40 h-40 opacity-10 pointer-events-none">
                    <div className="w-full h-full rounded-full bg-white/30 translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 opacity-5 pointer-events-none">
                    <div className="w-full h-full rounded-full bg-white" />
                  </div>

                  <div className="relative z-10">
                    {/* Badge */}
                    <span className="inline-flex items-center gap-1 bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
                      {offer.icon} {offer.badge}
                    </span>

                    {/* Discount */}
                    <div className="font-dmserif text-5xl sm:text-6xl text-white mb-2 leading-none">
                      {offer.discount}
                    </div>

                    <h3 className="font-playfair font-bold text-xl text-white mb-2">{title}</h3>
                    <p className="text-white/75 text-sm leading-relaxed mb-4">{desc}</p>

                    {/* Applicable */}
                    <div className="text-white/60 text-xs font-semibold mb-3 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
                      {offer.applicable}
                    </div>

                    {/* Countdown */}
                    {offer.validUntil && <Countdown target={offer.validUntil} />}

                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-5">
                      <Link
                        to="/order"
                        className="flex-1 bg-white/15 hover:bg-white/25 text-white font-semibold text-sm py-2.5 rounded-xl text-center transition-all duration-200"
                      >
                        Order Now
                      </Link>
                      <motion.a
                        whileTap={{ scale: 0.97 }}
                        href={`https://wa.me/?text=Check out this amazing offer at Thali House! ${title} — ${offer.applicable}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-[#25D366]/80 hover:bg-[#25D366] text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all duration-200"
                      >
                        <Share2 size={14} />
                        Share
                      </motion.a>
                    </div>
                  </div>
                </motion.div>
              </ScrollReveal>
            )
          })}
        </div>

        {/* Loyalty teaser */}
        <ScrollReveal delay={0.15} direction="up">
          <div className="mt-14 bg-charcoal rounded-3xl p-8 sm:p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="absolute" style={{ left: `${i * 20}%`, top: '50%', transform: 'translateY(-50%)' }}>
                  <Star size={60} className="text-gold" fill="#D4A017" />
                </div>
              ))}
            </div>
            <div className="relative z-10">
              <Trophy size={40} className="text-gold mx-auto mb-4" />
              <h3 className="font-playfair font-bold text-2xl text-white mb-3">Loyalty Program — Coming Soon</h3>
              <p className="text-white/60 text-sm leading-relaxed max-w-lg mx-auto mb-6">
                Earn 1 point per ₹10 spent. 100 points = ₹50 off. Exclusive member offers, birthday rewards, and priority booking.
              </p>
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6">
                {[
                  { pts: '10', label: 'Points per order' },
                  { pts: '100', label: 'Points = ₹50 off' },
                  { pts: '500', label: 'Points = Free Thali' },
                ].map(({ pts, label }) => (
                  <div key={label} className="bg-white/5 rounded-xl p-3 text-center">
                    <div className="font-dmserif text-2xl text-gold">{pts}</div>
                    <div className="text-white/50 text-xs mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
              <span className="inline-flex items-center gap-2 bg-gold/20 text-gold text-sm font-semibold px-5 py-2.5 rounded-full">
                <Gift size={16} />
                Register your interest
              </span>
            </div>
          </div>
        </ScrollReveal>

        {/* WhatsApp exclusive */}
        <ScrollReveal delay={0.2} direction="up">
          <div className="mt-8 rounded-2xl overflow-hidden bg-gradient-to-r from-green-900/40 to-green-800/30 border border-green-700/30 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-playfair font-bold text-xl text-white mb-2">WhatsApp Exclusive Offers</h3>
              <p className="text-white/60 text-sm">
                Follow us on WhatsApp for daily specials, flash deals and early access to new menu items.
              </p>
            </div>
            <motion.a
              whileTap={{ scale: 0.97 }}
              href="https://wa.me/918888377788?text=Hi! I want to receive daily offers from Thali House."
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 flex items-center gap-2 bg-[#25D366] hover:bg-green-500 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Get Daily Offers
            </motion.a>
          </div>
        </ScrollReveal>
      </div>
    </motion.div>
  )
}
