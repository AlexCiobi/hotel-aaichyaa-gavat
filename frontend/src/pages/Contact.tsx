import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, MapPin, Clock, Copy, Check, MessageCircle } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import ScrollReveal from '../components/ScrollReveal'

function isOpenNow(): boolean {
  const now = new Date()
  const h = now.getHours()
  const m = now.getMinutes()
  const minutes = h * 60 + m
  return minutes >= 11 * 60 && minutes < 23 * 60
}

export default function Contact() {
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)
  const [openNow, setOpenNow] = useState(isOpenNow())
  const [formName, setFormName] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formMessage, setFormMessage] = useState('')
  const [formSent, setFormSent] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setOpenNow(isOpenNow()), 60000)
    return () => clearInterval(timer)
  }, [])

  const address = 'Bavaskar Building, RB Road, Kagwade Mala, Ichalkaranji, Maharashtra 416115'

  function handleCopy() {
    navigator.clipboard.writeText(address).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault()
    console.log('Contact form submitted:', { name: formName, phone: formPhone, message: formMessage })
    setFormSent(true)
    setFormName('')
    setFormPhone('')
    setFormMessage('')
    setTimeout(() => setFormSent(false), 4000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="page-wrapper pt-16 pb-20 bg-offwhite min-h-screen"
    >
      {/* Hero */}
      <div className="relative h-44 sm:h-56 flex items-center justify-center overflow-hidden bg-charcoal">
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal to-brown/80" />
        <div className="relative z-10 text-center px-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            className="flex items-center justify-center mb-3"
          >
            <div className="w-12 h-12 bg-saffron/20 rounded-full flex items-center justify-center">
              <MapPin size={24} className="text-saffron" />
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-playfair font-bold text-3xl sm:text-4xl text-white"
          >
            {t('sections.contactUs')}
          </motion.h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left column */}
          <div className="space-y-8">
            {/* Map */}
            <ScrollReveal direction="left">
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="rounded-2xl overflow-hidden shadow-xl"
                style={{ height: 400 }}
              >
                <iframe
                  title="Thali House Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3824.234!2d74.4697!3d16.6887!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc1001!2sThali+House!5e0!3m2!1sen!2sin!4v1!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </motion.div>
            </ScrollReveal>

            {/* Address with copy */}
            <ScrollReveal direction="left" delay={0.1}>
              <div className="bg-white rounded-2xl p-5 shadow-sm flex items-start gap-4">
                <div className="w-11 h-11 bg-saffron/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin size={20} className="text-saffron" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-charcoal text-sm mb-1">{t('contact.address')}</h4>
                  <p className="text-charcoal/60 text-sm leading-relaxed">{address}</p>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-saffron hover:text-orange-600 transition-colors duration-200"
                  >
                    <AnimatePresence mode="wait">
                      {copied ? (
                        <motion.span
                          key="check"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="flex items-center gap-1 text-green-600"
                        >
                          <Check size={13} />
                          {t('general.copied')}
                        </motion.span>
                      ) : (
                        <motion.span
                          key="copy"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="flex items-center gap-1"
                        >
                          <Copy size={13} />
                          {t('general.copyAddress')}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Call button */}
            <ScrollReveal direction="right">
              <motion.a
                href="tel:+918888377788"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                animate={{ boxShadow: ['0 0 0px rgba(255,107,0,0)', '0 0 24px rgba(255,107,0,0.35)', '0 0 0px rgba(255,107,0,0)'] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex items-center gap-4 bg-saffron hover:bg-orange-600 text-white p-5 rounded-2xl shadow-lg shadow-saffron/30 transition-colors duration-200 group"
              >
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Phone size={24} />
                </div>
                <div>
                  <div className="text-sm font-semibold opacity-80 mb-0.5">{t('buttons.callNow')}</div>
                  <div className="font-dmserif text-2xl">+91 88883 77788</div>
                </div>
              </motion.a>
            </ScrollReveal>

            {/* WhatsApp button */}
            <ScrollReveal direction="right" delay={0.08}>
              <motion.a
                href="https://wa.me/918888377788"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-4 bg-[#25D366] hover:bg-green-500 text-white p-5 rounded-2xl shadow-lg shadow-green-500/25 transition-colors duration-200"
              >
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <MessageCircle size={24} />
                </div>
                <div>
                  <div className="text-sm font-semibold opacity-80 mb-0.5">{t('buttons.whatsapp')}</div>
                  <div className="font-semibold text-lg">Chat on WhatsApp</div>
                </div>
              </motion.a>
            </ScrollReveal>

            {/* Hours */}
            <ScrollReveal direction="right" delay={0.14}>
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 bg-saffron/10 rounded-xl flex items-center justify-center">
                    <Clock size={20} className="text-saffron" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-charcoal text-sm">{t('contact.hours')}</h4>
                    <AnimatePresence>
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full mt-0.5 ${
                          openNow
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${openNow ? 'bg-green-500' : 'bg-red-500'}`} />
                        {openNow ? t('contact.openNow') : 'Closed Now'}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    'Monday', 'Tuesday', 'Wednesday', 'Thursday',
                    'Friday', 'Saturday', 'Sunday',
                  ].map((day, i) => (
                    <motion.div
                      key={day}
                      initial={{ opacity: 0, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between py-1.5 border-b border-offwhite last:border-0"
                    >
                      <span className="text-charcoal/70 text-sm">{day}</span>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        <span className="text-charcoal text-sm font-medium">11:00 AM – 11:00 PM</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Contact form */}
            <ScrollReveal direction="right" delay={0.2}>
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h3 className="font-playfair font-semibold text-base text-charcoal mb-4">Send us a Message</h3>
                <AnimatePresence>
                  {formSent ? (
                    <motion.div
                      key="sent"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="text-center py-6"
                    >
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Check size={24} className="text-green-600" />
                      </div>
                      <p className="text-charcoal font-semibold text-sm">Message sent!</p>
                      <p className="text-charcoal/50 text-xs mt-1">We'll get back to you soon.</p>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleFormSubmit}
                      className="space-y-3"
                    >
                      <input
                        type="text"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="Your name"
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-transparent focus:border-saffron/50 bg-offwhite text-sm focus:outline-none transition-colors duration-200"
                      />
                      <input
                        type="tel"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        placeholder="Phone number"
                        className="w-full px-4 py-2.5 rounded-xl border border-transparent focus:border-saffron/50 bg-offwhite text-sm focus:outline-none transition-colors duration-200"
                      />
                      <textarea
                        value={formMessage}
                        onChange={(e) => setFormMessage(e.target.value)}
                        placeholder="Your message..."
                        required
                        rows={3}
                        className="w-full px-4 py-2.5 rounded-xl border border-transparent focus:border-saffron/50 bg-offwhite text-sm focus:outline-none transition-colors duration-200 resize-none"
                      />
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        type="submit"
                        className="w-full bg-saffron hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl transition-all duration-200 text-sm"
                      >
                        Send Message
                      </motion.button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
