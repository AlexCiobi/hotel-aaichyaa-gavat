import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Minus, Plus } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { supabase } from '../lib/supabase'
import type { OccasionType } from '../lib/types'
import ScrollReveal from '../components/ScrollReveal'

const OCCUPIED_TABLES = [3, 7, 12]

function generateTimeSlots(): string[] {
  const slots: string[] = []
  for (let h = 11; h <= 22; h++) {
    for (const m of [0, 30]) {
      if (h === 22 && m === 30) continue
      const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h
      const ampm = h < 12 ? 'AM' : 'PM'
      slots.push(`${hour12}:${m.toString().padStart(2, '0')} ${ampm}`)
    }
  }
  return slots
}

const TIME_SLOTS = generateTimeSlots()

const OCCASIONS: { id: OccasionType; emoji: string; key: string }[] = [
  { id: 'none', emoji: '🍽️', key: 'None' },
  { id: 'birthday', emoji: '🎂', key: 'reservationPage.birthdayOccasion' },
  { id: 'anniversary', emoji: '💑', key: 'reservationPage.anniversaryOccasion' },
  { id: 'business', emoji: '💼', key: 'reservationPage.businessOccasion' },
  { id: 'other', emoji: '✨', key: 'reservationPage.otherOccasion' },
]

function generateBookingRef() {
  return `TH-RES-${Math.floor(10000 + Math.random() * 90000)}`
}

export default function Reservation() {
  const { t } = useLanguage()

  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [guestCount, setGuestCount] = useState(2)
  const [occasion, setOccasion] = useState<OccasionType>('none')
  const [preferredTable, setPreferredTable] = useState<number | null>(null)
  const [customerName, setCustomerName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [specialRequests, setSpecialRequests] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)
  const [bookingRef, setBookingRef] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  function validate() {
    const errs: Record<string, string> = {}
    if (!date) errs.date = 'Please select a date'
    if (!time) errs.time = 'Please select a time'
    if (!customerName.trim()) errs.customerName = 'Name is required'
    if (!whatsapp.trim() || whatsapp.replace(/\D/g, '').length < 10)
      errs.whatsapp = 'Valid WhatsApp number required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    setSubmitting(true)
    const ref = generateBookingRef()
    setBookingRef(ref)
    try {
      await supabase.from('reservations').insert({
        booking_ref: ref,
        customer_name: customerName,
        whatsapp_number: '+91' + whatsapp.replace(/\D/g, ''),
        date,
        time,
        guest_count: guestCount,
        occasion,
        preferred_table: preferredTable,
        special_requests: specialRequests,
        status: 'pending',
      })
    } catch {
      // Silently ignore
    }
    setSubmitting(false)
    setSuccess(true)
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
      <div className="relative h-48 sm:h-60 flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=1400&q=80"
          alt="Reserve a table"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-maroon/80 to-charcoal/90" />
        <div className="relative z-10 text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gold text-xs font-semibold uppercase tracking-[0.2em] block mb-2"
          >
            Thali House
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-playfair font-bold text-3xl sm:text-4xl text-white"
          >
            {t('reservationPage.bookATable')}
          </motion.h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AnimatePresence>
          {success ? (
            <motion.div
              key="success"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18 }}
              className="bg-white rounded-3xl shadow-xl p-10 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.15 }}
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Check size={40} className="text-green-600" />
              </motion.div>
              <h2 className="font-playfair font-bold text-2xl text-charcoal mb-2">Reservation Confirmed!</h2>
              <p className="text-charcoal/50 text-sm mb-6">Your table has been reserved</p>

              <div className="bg-offwhite rounded-2xl p-5 mb-6 text-left space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-charcoal/50">Booking Ref</span>
                  <span className="font-bold text-saffron font-dmserif">{bookingRef}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-charcoal/50">Date & Time</span>
                  <span className="font-semibold">{date} at {time}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-charcoal/50">Guests</span>
                  <span className="font-semibold">{guestCount} people</span>
                </div>
                {occasion !== 'none' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-charcoal/50">Occasion</span>
                    <span className="font-semibold capitalize">{occasion}</span>
                  </div>
                )}
                {preferredTable && (
                  <div className="flex justify-between text-sm">
                    <span className="text-charcoal/50">Preferred Table</span>
                    <span className="font-semibold">T{preferredTable}</span>
                  </div>
                )}
              </div>

              <p className="text-charcoal/50 text-sm mb-6">
                We will confirm your reservation via WhatsApp on +91 {whatsapp}
              </p>
              <a
                href={`https://wa.me/918888377788?text=Hi! I just made a reservation (Ref: ${bookingRef}) for ${date} at ${time} for ${guestCount} guests.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] text-white font-semibold px-6 py-3 rounded-full shadow"
              >
                Confirm on WhatsApp
              </a>
            </motion.div>
          ) : (
            <motion.div key="form" className="space-y-6">
              {/* Date */}
              <ScrollReveal delay={0.05}>
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="font-playfair font-semibold text-lg text-charcoal mb-4">{t('reservationPage.selectDate')}</h3>
                  <input
                    type="date"
                    value={date}
                    min={today}
                    onChange={(e) => setDate(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors duration-200 bg-offwhite cursor-pointer ${
                      errors.date ? 'border-red-400' : 'border-transparent focus:border-saffron/60'
                    }`}
                  />
                  {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                </div>
              </ScrollReveal>

              {/* Time */}
              <ScrollReveal delay={0.1}>
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="font-playfair font-semibold text-lg text-charcoal mb-4">{t('reservationPage.selectTime')}</h3>
                  {errors.time && <p className="text-red-500 text-xs mb-3">{errors.time}</p>}
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {TIME_SLOTS.map((slot) => (
                      <motion.button
                        key={slot}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setTime(slot)}
                        className={`py-2 px-1 rounded-xl text-xs font-semibold text-center transition-all duration-200 ${
                          time === slot
                            ? 'bg-saffron text-white shadow-md'
                            : 'bg-offwhite text-charcoal/70 hover:bg-saffron/10 hover:text-saffron'
                        }`}
                      >
                        {slot}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </ScrollReveal>

              {/* Guest count */}
              <ScrollReveal delay={0.15}>
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="font-playfair font-semibold text-lg text-charcoal mb-4">{t('reservationPage.guestCount')}</h3>
                  <div className="flex items-center justify-center gap-6">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setGuestCount((n) => Math.max(1, n - 1))}
                      className="w-12 h-12 rounded-full bg-saffron/10 hover:bg-saffron/20 flex items-center justify-center text-saffron"
                    >
                      <Minus size={20} />
                    </motion.button>
                    <motion.span
                      key={guestCount}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="font-dmserif text-4xl text-charcoal w-12 text-center"
                    >
                      {guestCount}
                    </motion.span>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setGuestCount((n) => Math.min(20, n + 1))}
                      className="w-12 h-12 rounded-full bg-saffron flex items-center justify-center text-white"
                    >
                      <Plus size={20} />
                    </motion.button>
                  </div>
                  <p className="text-center text-charcoal/40 text-xs mt-3">
                    {guestCount} {guestCount === 1 ? 'guest' : 'guests'}
                  </p>
                </div>
              </ScrollReveal>

              {/* Occasion */}
              <ScrollReveal delay={0.2}>
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="font-playfair font-semibold text-lg text-charcoal mb-4">{t('reservationPage.occasion')}</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {OCCASIONS.map(({ id, emoji, key }) => (
                      <motion.button
                        key={id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setOccasion(id)}
                        className={`p-3 rounded-xl border-2 text-center transition-all duration-200 ${
                          occasion === id
                            ? 'border-saffron bg-saffron/5 shadow-md'
                            : 'border-charcoal/10 hover:border-saffron/30'
                        }`}
                        style={occasion === id ? { boxShadow: '0 0 12px rgba(255,107,0,0.15)' } : {}}
                      >
                        <div className="text-2xl mb-1">{emoji}</div>
                        <div className={`text-xs font-semibold ${occasion === id ? 'text-saffron' : 'text-charcoal/60'}`}>
                          {id === 'none' ? 'None' : t(key)}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </ScrollReveal>

              {/* Floor plan */}
              <ScrollReveal delay={0.25}>
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="font-playfair font-semibold text-lg text-charcoal mb-2">Preferred Table (Optional)</h3>
                  <p className="text-charcoal/40 text-xs mb-4">Click a table to select your preference</p>
                  {/* Simple floor plan SVG */}
                  <div className="bg-offwhite rounded-xl p-4 mb-4">
                    <div className="grid grid-cols-4 gap-2">
                      {Array.from({ length: 20 }, (_, i) => {
                        const n = i + 1
                        const isOccupied = OCCUPIED_TABLES.includes(n)
                        const isSelected = preferredTable === n
                        return (
                          <motion.button
                            key={n}
                            whileTap={{ scale: 0.9 }}
                            disabled={isOccupied}
                            onClick={() => setPreferredTable(isSelected ? null : n)}
                            className={`relative py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                              isOccupied
                                ? 'bg-red-100 text-red-400 cursor-not-allowed'
                                : isSelected
                                ? 'bg-saffron text-white shadow-md'
                                : 'bg-white text-charcoal/60 hover:bg-saffron/10 hover:text-saffron border border-charcoal/10'
                            }`}
                          >
                            T{n}
                            {isSelected && (
                              <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                <Check size={8} className="text-white" />
                              </span>
                            )}
                          </motion.button>
                        )
                      })}
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-charcoal/50">
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-white border border-charcoal/10" />Available</span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-100" />Occupied</span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-saffron" />Selected</span>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Customer info */}
              <ScrollReveal delay={0.3}>
                <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="font-playfair font-semibold text-lg text-charcoal">Your Details</h3>
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-1.5">{t('reservationPage.yourName')}</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Full name"
                      className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors duration-200 bg-offwhite ${
                        errors.customerName ? 'border-red-400' : 'border-transparent focus:border-saffron/60'
                      }`}
                    />
                    {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-1.5">{t('reservationPage.yourWhatsApp')}</label>
                    <div className="flex items-center gap-2">
                      <span className="bg-white border border-charcoal/20 px-3 py-3 rounded-xl text-sm text-charcoal/60 font-semibold flex-shrink-0">+91</span>
                      <input
                        type="tel"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="88883 77788"
                        className={`flex-1 px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors duration-200 bg-offwhite ${
                          errors.whatsapp ? 'border-red-400' : 'border-transparent focus:border-saffron/60'
                        }`}
                      />
                    </div>
                    {errors.whatsapp && <p className="text-red-500 text-xs mt-1">{errors.whatsapp}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-1.5">Special Requests</label>
                    <textarea
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="Any special arrangements, dietary requirements..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-transparent focus:border-saffron/60 text-sm focus:outline-none transition-colors duration-200 bg-offwhite resize-none"
                    />
                  </div>
                </div>
              </ScrollReveal>

              {/* Submit */}
              <ScrollReveal delay={0.35}>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full bg-saffron hover:bg-orange-600 disabled:bg-saffron/60 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-saffron/30 transition-all duration-200"
                >
                  {submitting ? 'Confirming...' : t('reservationPage.confirmBooking')}
                </motion.button>
              </ScrollReveal>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
