import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Minus, Plus, Search, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import { menuData } from '../lib/menuData'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import type { MenuCategory, OrderItem, OrderType } from '../lib/types'

type Step = 1 | 2 | 3

const CATEGORIES: (MenuCategory | 'ALL')[] = [
  'ALL', 'THALI', 'STARTERS', 'MAIN_COURSE', 'BREADS', 'RICE', 'BEVERAGES', 'SNACKS',
]

const TABLE_ZONES = ['Main', 'Window', 'Private', 'Outdoor'] as const
const OCCUPIED_TABLES = [3, 7, 12]
const TABLES_PER_ZONE = 5

function generateTables() {
  return Array.from({ length: 20 }, (_, i) => {
    const n = i + 1
    const zoneIdx = Math.floor(i / TABLES_PER_ZONE)
    return {
      number: n,
      zone: TABLE_ZONES[zoneIdx],
      status: OCCUPIED_TABLES.includes(n) ? 'occupied' : 'available',
    }
  })
}

const ALL_TABLES = generateTables()

function generateOrderNumber() {
  return `TH-${Math.floor(100000 + Math.random() * 900000)}`
}

export default function Order() {
  const { t, language } = useLanguage()
  const { profile } = useAuth()
  const [step, setStep] = useState<Step>(1)
  const [cart, setCart] = useState<OrderItem[]>([])
  const [activeCategory, setActiveCategory] = useState<MenuCategory | 'ALL'>('ALL')
  const [search, setSearch] = useState('')

  // Step 2
  const [orderType, setOrderType] = useState<OrderType>('dine-in')
  const [selectedTable, setSelectedTable] = useState<number | null>(null)
  const [customerName, setCustomerName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [specialInstructions, setSpecialInstructions] = useState('')

  // Pre-fill from auth profile
  useEffect(() => {
    if (profile) {
      if (profile.full_name && !customerName) setCustomerName(profile.full_name)
      if (profile.whatsapp_number && !whatsapp) {
        const num = profile.whatsapp_number.replace('+91', '').replace(/\D/g, '')
        setWhatsapp(num)
      }
    }
  }, [profile])

  // Step 3
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const filteredItems = useMemo(() => {
    return menuData.filter((item) => {
      if (activeCategory !== 'ALL' && item.category !== activeCategory) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        const name = (item[`name_${language}` as keyof typeof item] as string).toLowerCase()
        if (!name.includes(q) && !item.name_en.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [activeCategory, search, language])

  const subtotal = cart.reduce((sum, ci) => sum + ci.menuItem.price * ci.quantity, 0)
  const totalItems = cart.reduce((sum, ci) => sum + ci.quantity, 0)

  function updateCart(item: typeof menuData[0], delta: number) {
    setCart((prev) => {
      const idx = prev.findIndex((ci) => ci.menuItem.id === item.id)
      if (idx === -1) {
        if (delta > 0) return [...prev, { menuItem: item, quantity: 1 }]
        return prev
      }
      const newQty = prev[idx].quantity + delta
      if (newQty <= 0) return prev.filter((_, i) => i !== idx)
      const next = [...prev]
      next[idx] = { ...next[idx], quantity: newQty }
      return next
    })
  }

  function getQty(id: string) {
    return cart.find((ci) => ci.menuItem.id === id)?.quantity ?? 0
  }

  function validateStep2() {
    const errs: Record<string, string> = {}
    if (!customerName.trim()) errs.customerName = 'Name is required'
    if (!whatsapp.trim() || whatsapp.replace(/\D/g, '').length < 10)
      errs.whatsapp = 'Valid WhatsApp number required'
    if (orderType === 'dine-in' && !selectedTable)
      errs.table = 'Please select a table'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handlePlaceOrder() {
    setSubmitting(true)
    const num = generateOrderNumber()
    setOrderNumber(num)
    const whatsappFull = '+91' + whatsapp.replace(/\D/g, '')
    const { error } = await supabase.from('orders').insert({
      order_number: num,
      customer_name: customerName,
      customer_phone: whatsappFull,
      whatsapp_number: whatsappFull,
      order_type: orderType,
      items: cart.map((ci) => ({ id: ci.menuItem.id, name: ci.menuItem.name_en, qty: ci.quantity, price: ci.menuItem.price })),
      subtotal,
      total: subtotal,
      special_instructions: specialInstructions,
      payment_method: 'cod',
      order_status: 'placed',
    })
    setSubmitting(false)
    if (error) {
      console.error('Order insert error:', error)
    }
    toast.success('Order placed successfully!')
    setOrderSuccess(true)
  }

  const STEPS = [
    { n: 1, label: t('orderPage.selectItems') },
    { n: 2, label: t('orderPage.yourDetails') },
    { n: 3, label: t('orderPage.reviewOrder') },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="page-wrapper pt-20 pb-20 lg:pb-20 bg-offwhite min-h-screen"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-playfair font-bold text-3xl sm:text-4xl text-charcoal">
            {t('buttons.placeOrder')}
          </h1>
          <p className="text-charcoal/50 text-sm mt-2">Ichalkaranji's favourite Thali</p>
        </div>

        {/* Progress bar */}
        <div className="flex items-center justify-center gap-0 mb-10 max-w-md mx-auto">
          {STEPS.map((s, i) => (
            <div key={s.n} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    step > s.n
                      ? 'bg-saffron text-white'
                      : step === s.n
                      ? 'bg-saffron text-white ring-4 ring-saffron/25'
                      : 'bg-white border-2 border-charcoal/20 text-charcoal/40'
                  }`}
                >
                  {step > s.n ? <Check size={16} /> : s.n}
                </div>
                <span className={`text-xs mt-1 font-medium text-center leading-tight max-w-[70px] ${
                  step === s.n ? 'text-saffron' : 'text-charcoal/40'
                }`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 mx-1 transition-all duration-300 ${step > s.n ? 'bg-saffron' : 'bg-charcoal/15'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Success screen */}
        <AnimatePresence>
          {orderSuccess && (
            <motion.div
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl shadow-xl p-10 text-center max-w-lg mx-auto"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Check size={40} className="text-green-600" />
              </motion.div>
              <h2 className="font-playfair font-bold text-2xl text-charcoal mb-2">Order Placed!</h2>
              <p className="text-charcoal/50 text-sm mb-4">Your order has been received</p>
              <div className="bg-offwhite rounded-xl p-4 mb-6">
                <div className="text-xs text-charcoal/40 mb-1">Order Number</div>
                <div className="font-dmserif text-2xl text-saffron">{orderNumber}</div>
              </div>
              <p className="text-charcoal/50 text-sm mb-6">
                We will confirm your order via WhatsApp on +91 {whatsapp}
              </p>
              <a
                href={`https://wa.me/918888377788?text=Hi! I just placed order ${orderNumber}. Can you confirm?`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] text-white font-semibold px-6 py-3 rounded-full shadow"
              >
                Confirm on WhatsApp
              </a>
            </motion.div>
          )}
        </AnimatePresence>

        {!orderSuccess && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2">
              {/* STEP 1 */}
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Category tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setActiveCategory(cat)}
                          className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                            activeCategory === cat
                              ? 'bg-saffron text-white'
                              : 'bg-white text-charcoal/60 hover:bg-saffron/10'
                          }`}
                        >
                          {cat === 'ALL' ? 'All' : cat === 'MAIN_COURSE' ? 'Main' : cat.charAt(0) + cat.slice(1).toLowerCase()}
                        </button>
                      ))}
                    </div>

                    {/* Search */}
                    <div className="relative mb-5">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t('menu.searchPlaceholder')}
                        className="w-full pl-9 pr-4 py-2.5 text-sm bg-white rounded-full border border-transparent focus:border-saffron/50 focus:outline-none"
                      />
                    </div>

                    {/* Items grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {filteredItems.map((item) => {
                        const name = item[`name_${language}` as keyof typeof item] as string
                        const qty = getQty(item.id)
                        return (
                          <motion.div
                            key={item.id}
                            layout
                            className="bg-white rounded-xl overflow-hidden flex shadow-sm hover:shadow-md transition-shadow duration-200"
                          >
                            <div className="w-24 h-full flex-shrink-0 overflow-hidden">
                              <img
                                src={item.image_url}
                                alt={name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </div>
                            <div className="flex-1 p-3 flex flex-col justify-between">
                              <div>
                                <div className="flex items-start gap-1 mb-0.5">
                                  <span
                                    className={`flex-shrink-0 w-3.5 h-3.5 mt-0.5 rounded-sm border flex items-center justify-center ${
                                      item.is_veg ? 'border-green-600' : 'border-red-600'
                                    }`}
                                  >
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full ${
                                        item.is_veg ? 'bg-green-600' : 'bg-red-600'
                                      }`}
                                    />
                                  </span>
                                  <span className="font-semibold text-sm text-charcoal leading-tight line-clamp-2">
                                    {name}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <span className="font-dmserif text-lg text-saffron">₹{item.price}</span>
                                {qty === 0 ? (
                                  <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => updateCart(item, 1)}
                                    className="bg-saffron/10 hover:bg-saffron text-saffron hover:text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-200"
                                  >
                                    Add
                                  </motion.button>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <motion.button
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => updateCart(item, -1)}
                                      className="w-6 h-6 rounded-full bg-saffron/10 hover:bg-saffron/20 flex items-center justify-center"
                                    >
                                      <Minus size={12} className="text-saffron" />
                                    </motion.button>
                                    <span className="font-bold text-sm text-charcoal w-4 text-center">{qty}</span>
                                    <motion.button
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => updateCart(item, 1)}
                                      className="w-6 h-6 rounded-full bg-saffron flex items-center justify-center"
                                    >
                                      <Plus size={12} className="text-white" />
                                    </motion.button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Order type */}
                    <div>
                      <h3 className="font-semibold text-charcoal mb-3">{t('orderPage.orderType')}</h3>
                      <div className="grid grid-cols-3 gap-3">
                        {(['dine-in', 'takeaway', 'preorder'] as OrderType[]).map((type) => {
                          const labels: Record<OrderType, string> = {
                            'dine-in': t('orderPage.dineIn'),
                            takeaway: t('orderPage.takeaway'),
                            preorder: t('orderPage.preorder'),
                          }
                          const icons: Record<OrderType, string> = {
                            'dine-in': '🍽️',
                            takeaway: '🥡',
                            preorder: '📅',
                          }
                          return (
                            <motion.button
                              key={type}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => setOrderType(type)}
                              className={`p-4 rounded-xl border-2 text-center transition-all duration-200 ${
                                orderType === type
                                  ? 'border-saffron bg-saffron/5'
                                  : 'border-charcoal/15 bg-white hover:border-saffron/40'
                              }`}
                            >
                              <div className="text-2xl mb-1">{icons[type]}</div>
                              <div className={`text-xs font-semibold ${orderType === type ? 'text-saffron' : 'text-charcoal/70'}`}>
                                {labels[type]}
                              </div>
                            </motion.button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Table selector (dine-in) */}
                    {orderType === 'dine-in' && (
                      <div>
                        <h3 className="font-semibold text-charcoal mb-3">Select Table</h3>
                        {errors.table && <p className="text-red-500 text-xs mb-2">{errors.table}</p>}
                        <div className="space-y-4">
                          {TABLE_ZONES.map((zone) => (
                            <div key={zone}>
                              <div className="text-xs font-semibold text-charcoal/50 uppercase tracking-wider mb-2">{zone} Zone</div>
                              <div className="grid grid-cols-5 gap-2">
                                {ALL_TABLES.filter((t) => t.zone === zone).map((table) => (
                                  <motion.button
                                    key={table.number}
                                    whileTap={{ scale: 0.9 }}
                                    disabled={table.status === 'occupied'}
                                    onClick={() => setSelectedTable(table.number)}
                                    className={`py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                                      table.status === 'occupied'
                                        ? 'bg-red-100 text-red-400 cursor-not-allowed'
                                        : selectedTable === table.number
                                        ? 'bg-saffron text-white shadow-md shadow-saffron/30'
                                        : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                                    }`}
                                    style={selectedTable === table.number ? { boxShadow: '0 0 12px rgba(255,107,0,0.4)' } : {}}
                                  >
                                    T{table.number}
                                  </motion.button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-xs text-charcoal/50">
                          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-100 border border-green-200" />Available</span>
                          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-100" />Occupied</span>
                          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-saffron" />Selected</span>
                        </div>
                      </div>
                    )}

                    {/* Customer details */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-charcoal mb-1.5">{t('reservationPage.yourName')}</label>
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Your full name"
                          className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors duration-200 bg-white ${
                            errors.customerName ? 'border-red-400' : 'border-charcoal/20 focus:border-saffron/60'
                          }`}
                        />
                        {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-charcoal mb-1.5">{t('reservationPage.yourWhatsApp')}</label>
                        <div className="flex items-center gap-2">
                          <span className="bg-offwhite border border-charcoal/20 px-3 py-3 rounded-xl text-sm text-charcoal/60 font-semibold flex-shrink-0">+91</span>
                          <input
                            type="tel"
                            value={whatsapp}
                            onChange={(e) => setWhatsapp(e.target.value)}
                            placeholder="88883 77788"
                            className={`flex-1 px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors duration-200 bg-white ${
                              errors.whatsapp ? 'border-red-400' : 'border-charcoal/20 focus:border-saffron/60'
                            }`}
                          />
                        </div>
                        {errors.whatsapp && <p className="text-red-500 text-xs mt-1">{errors.whatsapp}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-charcoal mb-1.5">{t('orderPage.specialInstructions')}</label>
                        <textarea
                          value={specialInstructions}
                          onChange={(e) => setSpecialInstructions(e.target.value)}
                          placeholder="Any allergies, preferences, or requests..."
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl border border-charcoal/20 focus:border-saffron/60 text-sm focus:outline-none transition-colors duration-200 bg-white resize-none"
                        />
                      </div>
                    </div>

                    {/* Est. time */}
                    <div className="bg-saffron/5 border border-saffron/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-sm text-charcoal/70">
                        <span className="text-lg">⏱️</span>
                        <span>
                          Estimated time:{' '}
                          <strong className="text-saffron">
                            {orderType === 'dine-in' ? '10-15 min' : orderType === 'takeaway' ? '10-15 min' : '20-30 min'}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-5"
                  >
                    <div className="bg-white rounded-2xl p-5 shadow-sm">
                      <h3 className="font-playfair font-semibold text-lg text-charcoal mb-4">{t('orderPage.reviewOrder')}</h3>
                      <div className="space-y-3 mb-4">
                        {cart.map((ci) => {
                          const name = ci.menuItem[`name_${language}` as keyof typeof ci.menuItem] as string
                          return (
                            <div key={ci.menuItem.id} className="flex items-center justify-between py-2 border-b border-offwhite last:border-0">
                              <div className="flex items-center gap-3">
                                <img src={ci.menuItem.image_url} alt={name} className="w-10 h-10 rounded-lg object-cover" />
                                <div>
                                  <div className="text-sm font-semibold text-charcoal line-clamp-1">{name}</div>
                                  <div className="text-xs text-charcoal/50">₹{ci.menuItem.price} × {ci.quantity}</div>
                                </div>
                              </div>
                              <div className="font-dmserif text-saffron font-semibold">₹{ci.menuItem.price * ci.quantity}</div>
                            </div>
                          )
                        })}
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-charcoal/10">
                        <span className="font-semibold text-charcoal">{t('orderPage.total')}</span>
                        <span className="font-dmserif text-2xl text-saffron">₹{subtotal}</span>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-5 shadow-sm">
                      <h3 className="font-semibold text-charcoal mb-3">Order Info</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-charcoal/50">Type</span><span className="font-semibold capitalize">{orderType}</span></div>
                        {orderType === 'dine-in' && selectedTable && (
                          <div className="flex justify-between"><span className="text-charcoal/50">Table</span><span className="font-semibold">T{selectedTable}</span></div>
                        )}
                        <div className="flex justify-between"><span className="text-charcoal/50">Name</span><span className="font-semibold">{customerName}</span></div>
                        <div className="flex justify-between"><span className="text-charcoal/50">WhatsApp</span><span className="font-semibold">+91 {whatsapp}</span></div>
                      </div>
                    </div>

                    {/* Payment */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm">
                      <h3 className="font-semibold text-charcoal mb-3">Payment Method</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="border-2 border-saffron bg-saffron/5 rounded-xl p-4 text-center">
                          <div className="text-xl mb-1">💵</div>
                          <div className="text-sm font-semibold text-saffron">{t('orderPage.codOption')}</div>
                        </div>
                        <div className="border-2 border-charcoal/10 rounded-xl p-4 text-center opacity-60">
                          <div className="text-xl mb-1">💳</div>
                          <div className="text-sm font-semibold text-charcoal">Razorpay</div>
                          <span className="text-xs bg-charcoal/10 text-charcoal/50 px-2 py-0.5 rounded-full mt-1 inline-block">Coming Soon</span>
                        </div>
                      </div>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handlePlaceOrder}
                      disabled={submitting}
                      className="w-full bg-saffron hover:bg-orange-600 disabled:bg-saffron/60 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-saffron/30 transition-all duration-200"
                    >
                      {submitting ? 'Placing Order...' : t('buttons.placeOrder')} — ₹{subtotal}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation */}
              {!orderSuccess && (
                <div className="flex items-center justify-between mt-8">
                  {step > 1 ? (
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setStep((s) => (s - 1) as Step)}
                      className="flex items-center gap-2 text-charcoal/60 hover:text-charcoal font-semibold px-5 py-2.5 rounded-xl hover:bg-white transition-all duration-200"
                    >
                      <ChevronLeft size={18} />
                      Previous
                    </motion.button>
                  ) : <div />}
                  {step < 3 && (
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        if (step === 1 && cart.length === 0) return
                        if (step === 2 && !validateStep2()) return
                        setStep((s) => (s + 1) as Step)
                      }}
                      className={`flex items-center gap-2 font-semibold px-6 py-2.5 rounded-xl transition-all duration-200 ${
                        (step === 1 && cart.length === 0)
                          ? 'bg-charcoal/15 text-charcoal/30 cursor-not-allowed'
                          : 'bg-saffron hover:bg-orange-600 text-white shadow-md'
                      }`}
                    >
                      Next
                      <ChevronRight size={18} />
                    </motion.button>
                  )}
                </div>
              )}
            </div>

            {/* Cart sidebar — hidden on mobile (replaced by sticky bottom bar) */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-36 bg-white rounded-2xl shadow-md p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-playfair font-semibold text-base text-charcoal">Your Order</h3>
                  {totalItems > 0 && (
                    <span className="bg-saffron text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </div>
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">🛒</div>
                    <p className="text-charcoal/40 text-sm">Your cart is empty</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                      {cart.map((ci) => {
                        const name = ci.menuItem[`name_${language}` as keyof typeof ci.menuItem] as string
                        return (
                          <div key={ci.menuItem.id} className="flex items-center justify-between text-sm">
                            <span className="text-charcoal/70 line-clamp-1 flex-1">{name}</span>
                            <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                              <button onClick={() => updateCart(ci.menuItem, -1)} className="w-5 h-5 rounded-full bg-offwhite flex items-center justify-center">
                                <Minus size={10} />
                              </button>
                              <span className="text-xs font-bold w-4 text-center">{ci.quantity}</span>
                              <button onClick={() => updateCart(ci.menuItem, 1)} className="w-5 h-5 rounded-full bg-saffron flex items-center justify-center">
                                <Plus size={10} className="text-white" />
                              </button>
                              <span className="text-saffron font-semibold text-xs w-16 text-right">₹{ci.menuItem.price * ci.quantity}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div className="border-t border-offwhite pt-4 flex justify-between items-center">
                      <span className="font-semibold text-charcoal text-sm">{t('orderPage.total')}</span>
                      <span className="font-dmserif text-xl text-saffron">₹{subtotal}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile sticky cart bar — only visible on mobile when items in cart */}
      <AnimatePresence>
        {!orderSuccess && cart.length > 0 && step === 1 && (
          <motion.div
            key="mobile-cart"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-charcoal/10 shadow-2xl px-4 pt-3 pb-safe"
            style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
          >
            <div className="flex items-center justify-between max-w-lg mx-auto">
              <div>
                <p className="text-xs text-charcoal/50 font-medium">{totalItems} item{totalItems !== 1 ? 's' : ''} in cart</p>
                <p className="font-dmserif text-xl text-saffron leading-none">₹{subtotal}</p>
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setStep(2)}
                className="flex items-center gap-2 bg-saffron text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-saffron/30 mr-16"
              >
                Next
                <ChevronRight size={16} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
