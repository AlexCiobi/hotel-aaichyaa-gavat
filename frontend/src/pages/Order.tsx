import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Minus, Plus, Search, ChevronLeft, ChevronRight, Check, Users, Calendar, Clock } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import { menuData } from '../lib/menuData'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import type { MenuCategory, OrderItem, OrderType } from '../lib/types'

declare global {
  interface Window {
    Razorpay: new (opts: Record<string, unknown>) => { open(): void }
  }
}

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID ?? ''
const RAZORPAY_ACTIVE = Boolean(RAZORPAY_KEY && RAZORPAY_KEY !== 'rzp_test_placeholder')
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

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

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

export default function Order() {
  const { t, language } = useLanguage()
  const { profile } = useAuth()
  const [step, setStep] = useState<Step>(1)
  const [cart, setCart] = useState<OrderItem[]>([])
  const [activeCategory, setActiveCategory] = useState<MenuCategory | 'ALL'>('ALL')
  const [search, setSearch] = useState('')

  const [orderType, setOrderType] = useState<OrderType>('dine-in')
  const [selectedTable, setSelectedTable] = useState<number | null>(null)
  const [customerName, setCustomerName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [specialInstructions, setSpecialInstructions] = useState('')

  // Pre-order only fields
  const [arrivalDate, setArrivalDate] = useState('')
  const [arrivalTime, setArrivalTime] = useState('13:00')
  const [guests, setGuests] = useState(2)

  useEffect(() => {
    if (profile) {
      if (profile.full_name && !customerName) setCustomerName(profile.full_name)
      if (profile.whatsapp_number && !whatsapp) {
        const num = profile.whatsapp_number.replace('+91', '').replace(/\D/g, '')
        setWhatsapp(num)
      }
    }
  }, [profile])

  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay'>('cod')

  useEffect(() => {
    if (!RAZORPAY_ACTIVE) return
    if (document.getElementById('razorpay-script')) return
    const s = document.createElement('script')
    s.id = 'razorpay-script'
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.async = true
    document.body.appendChild(s)
  }, [])

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
    if (orderType === 'preorder') {
      if (!arrivalDate) errs.arrivalDate = 'Arrival date is required'
      if (!arrivalTime) errs.arrivalTime = 'Arrival time is required'
      if (guests < 1 || guests > 20) errs.guests = 'Please select 1-20 guests'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function sendOrderEmail(orderNum: string) {
    const customerEmail = profile?.email
    if (!customerEmail) return
    supabase.functions.invoke('send-order-email', {
      body: {
        customer_email: customerEmail,
        customer_name: customerName,
        order_number: orderNum,
        items: cart.map((ci) => ({ name: ci.menuItem.name_en, qty: ci.quantity, price: ci.menuItem.price })),
        subtotal,
        order_type: orderType,
        ...(selectedTable ? { table_number: String(selectedTable) } : {}),
      },
    }).catch(() => { /* silently ignore */ })
  }

  function sendWhatsAppReceipt(orderNum: string, whatsappFull: string) {
    const itemsList = cart
      .map((ci) => `${ci.quantity}x ${ci.menuItem.name_en} - Rs.${ci.menuItem.price * ci.quantity}`)
      .join(', ')
    const preorderLine = orderType === 'preorder' && arrivalDate
      ? `\nArrival: ${arrivalDate} at ${arrivalTime}, ${guests} guests`
      : ''

    const payload = {
      order_number: orderNum,
      customer_name: customerName,
      whatsapp_number: whatsappFull,
      order_type: orderType,
      items: cart.map((ci) => ({
        id: ci.menuItem.id,
        name: ci.menuItem.name_en,
        qty: ci.quantity,
        price: ci.menuItem.price,
      })),
      total: subtotal,
      ...(selectedTable ? { table_number: String(selectedTable) } : {}),
      ...(orderType === 'preorder' ? { arrival_date: arrivalDate, arrival_time: arrivalTime, guests } : {}),
    }

    fetch(`${API_URL}/notify/order-placed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {
      console.log(
        `[WhatsApp Receipt - backend offline]\n` +
        `Your Hotel Aaichyaa Gavat Order Receipt\n` +
        `Order #${orderNum}\n` +
        `Items: ${itemsList}\n` +
        `Total: Rs.${subtotal}\n` +
        `Payment: ${paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online'}\n` +
        `Estimated time: 20-30 min${preorderLine}\n` +
        `Thank you for ordering from Hotel Aaichyaa Gavat!`
      )
    })
  }

  async function handlePlaceOrder() {
    setSubmitting(true)
    const num = generateOrderNumber()
    setOrderNumber(num)
    const whatsappFull = '+91' + whatsapp.replace(/\D/g, '')

    const insertPayload: Record<string, unknown> = {
      order_number: num,
      customer_name: customerName,
      customer_phone: whatsappFull,
      whatsapp_number: whatsappFull,
      order_type: orderType,
      items: cart.map((ci) => ({ id: ci.menuItem.id, name: ci.menuItem.name_en, qty: ci.quantity, price: ci.menuItem.price })),
      subtotal,
      total: subtotal,
      special_instructions: specialInstructions,
      payment_method: paymentMethod,
      payment_status: 'pending',
      order_status: 'placed',
    }

    if (orderType === 'preorder') {
      insertPayload.arrival_date = arrivalDate
      insertPayload.arrival_time = arrivalTime
      insertPayload.guests = guests
    }

    const { data: orderData, error } = await supabase
      .from('orders')
      .insert(insertPayload)
      .select('id')
      .single()

    setSubmitting(false)

    if (error) {
      console.error('Order insert error:', error)
      toast.error('Failed to place order. Please try again.')
      return
    }

    if (paymentMethod === 'razorpay' && RAZORPAY_ACTIVE && window.Razorpay) {
      const rzp = new window.Razorpay({
        key: RAZORPAY_KEY,
        amount: subtotal * 100,
        currency: 'INR',
        name: 'Hotel Aaichyaa Gavat',
        description: `Order ${num}`,
        handler: async (response: Record<string, string>) => {
          await supabase.from('orders').update({
            payment_status: 'paid',
            razorpay_payment_id: response.razorpay_payment_id,
          }).eq('id', orderData.id)
          toast.success('Payment successful!')
          sendWhatsAppReceipt(num, whatsappFull)
          sendOrderEmail(num)
          setOrderSuccess(true)
        },
        prefill: { name: customerName, contact: whatsappFull },
        theme: { color: '#C0272D' },
        modal: {
          ondismiss: async () => {
            await supabase.from('orders').update({ payment_status: 'failed' }).eq('id', orderData.id)
            toast.error('Payment cancelled')
          },
        },
      } as Record<string, unknown>)
      rzp.open()
      return
    }

    sendWhatsAppReceipt(num, whatsappFull)
    sendOrderEmail(num)
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
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="page-wrapper pt-20 pb-20 lg:pb-20 bg-offwhite min-h-screen"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  step > s.n ? 'bg-[#C0272D] text-white' : step === s.n ? 'bg-[#C0272D] text-white ring-4 ring-[#C0272D]/25' : 'bg-white border-2 border-charcoal/20 text-charcoal/40'
                }`}>
                  {step > s.n ? <Check size={16} /> : s.n}
                </div>
                <span className={`text-xs mt-1 font-medium text-center leading-tight max-w-[70px] ${step === s.n ? 'text-[#C0272D]' : 'text-charcoal/40'}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 mx-1 transition-all duration-300 ${step > s.n ? 'bg-[#C0272D]' : 'bg-charcoal/15'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Success screen */}
        <AnimatePresence>
          {orderSuccess && (
            <motion.div key="success" initial={false} animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl shadow-xl p-10 text-center max-w-lg mx-auto">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check size={40} className="text-green-600" />
              </div>
              <h2 className="font-playfair font-bold text-2xl text-charcoal mb-2">Order Placed!</h2>
              <p className="text-charcoal/50 text-sm mb-4">Your order has been received</p>
              <div className="bg-offwhite rounded-xl p-4 mb-4">
                <div className="text-xs text-charcoal/40 mb-1">Order Number</div>
                <div className="font-dmserif text-2xl text-[#C0272D]">{orderNumber}</div>
              </div>
              {orderType === 'preorder' && arrivalDate && (
                <div className="bg-[#C0272D]/5 border border-[#C0272D]/20 rounded-xl p-3 mb-4 text-sm text-left">
                  <div className="font-semibold text-charcoal mb-1">Pre-Order Details</div>
                  <div className="text-charcoal/60">Arrival: {arrivalDate} at {arrivalTime}</div>
                  <div className="text-charcoal/60">Guests: {guests}</div>
                </div>
              )}
              <p className="text-charcoal/50 text-sm mb-6">
                We will confirm your order via WhatsApp on +91 {whatsapp}
              </p>
              <a href={`https://wa.me/917083058185?text=Hi! I just placed order ${orderNumber}. Can you confirm?`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] text-white font-semibold px-6 py-3 rounded-full shadow">
                Confirm on WhatsApp
              </a>
            </motion.div>
          )}
        </AnimatePresence>

        {!orderSuccess && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {/* STEP 1 */}
                {step === 1 && (
                  <motion.div key="step1" initial={false} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                    <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
                      {CATEGORIES.map((cat) => (
                        <button key={cat} onClick={() => setActiveCategory(cat)}
                          className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                            activeCategory === cat ? 'bg-[#C0272D] text-white' : 'bg-white text-charcoal/60 hover:bg-[#C0272D]/10'
                          }`}>
                          {cat === 'ALL' ? 'All' : cat === 'MAIN_COURSE' ? 'Main' : cat.charAt(0) + cat.slice(1).toLowerCase()}
                        </button>
                      ))}
                    </div>
                    <div className="relative mb-5">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
                      <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                        placeholder={t('menu.searchPlaceholder')}
                        className="w-full pl-9 pr-4 py-2.5 text-sm bg-white rounded-full border border-transparent focus:border-[#C0272D]/50 focus:outline-none" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {filteredItems.map((item) => {
                        const name = item[`name_${language}` as keyof typeof item] as string
                        const qty = getQty(item.id)
                        return (
                          <motion.div key={item.id} layout className="bg-white rounded-xl overflow-hidden flex shadow-sm hover:shadow-md transition-shadow duration-200">
                            <div className="w-24 h-full flex-shrink-0 overflow-hidden">
                              <img src={item.image_url} alt={name} className="w-full h-full object-cover" loading="lazy"
                                onError={(e) => { e.currentTarget.src = '/images/default-food.jpg' }} />
                            </div>
                            <div className="flex-1 p-3 flex flex-col justify-between">
                              <div className="flex items-start gap-1 mb-0.5">
                                <span className={`flex-shrink-0 w-3.5 h-3.5 mt-0.5 rounded-sm border flex items-center justify-center ${item.is_veg ? 'border-green-600' : 'border-red-600'}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${item.is_veg ? 'bg-green-600' : 'bg-red-600'}`} />
                                </span>
                                <span className="font-semibold text-sm text-charcoal leading-tight line-clamp-2">{name}</span>
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <span className="font-dmserif text-lg text-[#C0272D]">Rs.{item.price}</span>
                                {qty === 0 ? (
                                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => updateCart(item, 1)}
                                    className="bg-[#C0272D]/10 hover:bg-[#C0272D] text-[#C0272D] hover:text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-200">Add</motion.button>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => updateCart(item, -1)}
                                      className="w-6 h-6 rounded-full bg-[#C0272D]/10 hover:bg-[#C0272D]/20 flex items-center justify-center">
                                      <Minus size={12} className="text-[#C0272D]" />
                                    </motion.button>
                                    <span className="font-bold text-sm text-charcoal w-4 text-center">{qty}</span>
                                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => updateCart(item, 1)}
                                      className="w-6 h-6 rounded-full bg-[#C0272D] flex items-center justify-center">
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
                  <motion.div key="step2" initial={false} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }} className="space-y-6">
                    {/* Order type */}
                    <div>
                      <h3 className="font-semibold text-charcoal mb-3">{t('orderPage.orderType')}</h3>
                      <div className="grid grid-cols-3 gap-3">
                        {(['dine-in', 'takeaway', 'preorder'] as OrderType[]).map((type) => {
                          const labels: Record<OrderType, string> = { 'dine-in': t('orderPage.dineIn'), takeaway: t('orderPage.takeaway'), preorder: t('orderPage.preorder') }
                          const icons: Record<OrderType, string> = { 'dine-in': '🍽️', takeaway: '🥡', preorder: '📅' }
                          return (
                            <motion.button key={type} whileTap={{ scale: 0.97 }} onClick={() => setOrderType(type)}
                              className={`p-4 rounded-xl border-2 text-center transition-all duration-200 ${orderType === type ? 'border-[#C0272D] bg-[#C0272D]/5' : 'border-charcoal/15 bg-white hover:border-[#C0272D]/40'}`}>
                              <div className="text-2xl mb-1">{icons[type]}</div>
                              <div className={`text-xs font-semibold ${orderType === type ? 'text-[#C0272D]' : 'text-charcoal/70'}`}>{labels[type]}</div>
                            </motion.button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Table selector — dine-in only */}
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
                                  <motion.button key={table.number} whileTap={{ scale: 0.9 }}
                                    disabled={table.status === 'occupied'} onClick={() => setSelectedTable(table.number)}
                                    className={`py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                                      table.status === 'occupied' ? 'bg-red-100 text-red-400 cursor-not-allowed'
                                        : selectedTable === table.number ? 'bg-[#C0272D] text-white shadow-md shadow-[#C0272D]/30'
                                        : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                                    }`}
                                    style={selectedTable === table.number ? { boxShadow: '0 0 12px rgba(192,39,45,0.4)' } : {}}>
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
                          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#C0272D]" />Selected</span>
                        </div>
                      </div>
                    )}

                    {/* Pre-order fields — only when preorder selected */}
                    {orderType === 'preorder' && (
                      <div className="bg-[#C0272D]/5 border border-[#C0272D]/20 rounded-2xl p-5 space-y-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">📅</span>
                          <h3 className="font-semibold text-charcoal">Pre-Order Details</h3>
                        </div>
                        {/* Arrival Date */}
                        <div>
                          <label className="block text-sm font-semibold text-charcoal mb-1.5">
                            <span className="flex items-center gap-1.5"><Calendar size={14} className="text-[#C0272D] inline" /> Arrival Date</span>
                          </label>
                          <input type="date" value={arrivalDate} min={todayISO()}
                            onChange={(e) => setArrivalDate(e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors bg-white ${errors.arrivalDate ? 'border-red-400' : 'border-charcoal/20 focus:border-[#C0272D]/60'}`} />
                          {errors.arrivalDate && <p className="text-red-500 text-xs mt-1">{errors.arrivalDate}</p>}
                        </div>
                        {/* Arrival Time */}
                        <div>
                          <label className="block text-sm font-semibold text-charcoal mb-1.5">
                            <span className="flex items-center gap-1.5"><Clock size={14} className="text-[#C0272D] inline" /> Arrival Time</span>
                          </label>
                          <input type="time" value={arrivalTime} min="11:00" max="23:00"
                            onChange={(e) => setArrivalTime(e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors bg-white ${errors.arrivalTime ? 'border-red-400' : 'border-charcoal/20 focus:border-[#C0272D]/60'}`} />
                          <p className="text-xs text-charcoal/40 mt-1">Restaurant hours: 11:00 AM – 11:00 PM</p>
                          {errors.arrivalTime && <p className="text-red-500 text-xs mt-1">{errors.arrivalTime}</p>}
                        </div>
                        {/* Number of Guests */}
                        <div>
                          <label className="block text-sm font-semibold text-charcoal mb-1.5">
                            <span className="flex items-center gap-1.5"><Users size={14} className="text-[#C0272D] inline" /> Number of Guests</span>
                          </label>
                          <div className="flex items-center gap-4">
                            <motion.button whileTap={{ scale: 0.9 }} type="button" onClick={() => setGuests((g) => Math.max(1, g - 1))}
                              className="w-10 h-10 rounded-full bg-white border border-charcoal/20 flex items-center justify-center hover:border-[#C0272D]/60 transition-colors">
                              <Minus size={16} className="text-charcoal/60" />
                            </motion.button>
                            <div className="flex-1 text-center">
                              <span className="font-bold text-2xl text-charcoal">{guests}</span>
                              <span className="text-charcoal/50 text-sm ml-1">guest{guests !== 1 ? 's' : ''}</span>
                            </div>
                            <motion.button whileTap={{ scale: 0.9 }} type="button" onClick={() => setGuests((g) => Math.min(20, g + 1))}
                              className="w-10 h-10 rounded-full bg-[#C0272D] flex items-center justify-center shadow-sm">
                              <Plus size={16} className="text-white" />
                            </motion.button>
                          </div>
                          {errors.guests && <p className="text-red-500 text-xs mt-1">{errors.guests}</p>}
                        </div>
                      </div>
                    )}

                    {/* Customer details */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-charcoal mb-1.5">{t('reservationPage.yourName')}</label>
                        <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Your full name"
                          className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors bg-white ${errors.customerName ? 'border-red-400' : 'border-charcoal/20 focus:border-[#C0272D]/60'}`} />
                        {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-charcoal mb-1.5">{t('reservationPage.yourWhatsApp')}</label>
                        <div className="flex items-center gap-2">
                          <span className="bg-offwhite border border-charcoal/20 px-3 py-3 rounded-xl text-sm text-charcoal/60 font-semibold flex-shrink-0">+91</span>
                          <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="73858 64885"
                            className={`flex-1 px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors bg-white ${errors.whatsapp ? 'border-red-400' : 'border-charcoal/20 focus:border-[#C0272D]/60'}`} />
                        </div>
                        {errors.whatsapp && <p className="text-red-500 text-xs mt-1">{errors.whatsapp}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-charcoal mb-1.5">{t('orderPage.specialInstructions')}</label>
                        <textarea value={specialInstructions} onChange={(e) => setSpecialInstructions(e.target.value)}
                          placeholder="Any allergies, preferences, or requests..." rows={3}
                          className="w-full px-4 py-3 rounded-xl border border-charcoal/20 focus:border-[#C0272D]/60 text-sm focus:outline-none transition-colors bg-white resize-none" />
                      </div>
                    </div>

                    <div className="bg-[#C0272D]/5 border border-[#C0272D]/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-sm text-charcoal/70">
                        <span className="text-lg">⏱️</span>
                        <span>Estimated time: <strong className="text-[#C0272D]">{orderType === 'dine-in' ? '10-15 min' : orderType === 'takeaway' ? '10-15 min' : '20-30 min'}</strong></span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                  <motion.div key="step3" initial={false} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }} className="space-y-5">
                    <div className="bg-white rounded-2xl p-5 shadow-sm">
                      <h3 className="font-playfair font-semibold text-lg text-charcoal mb-4">{t('orderPage.reviewOrder')}</h3>
                      <div className="space-y-3 mb-4">
                        {cart.map((ci) => {
                          const name = ci.menuItem[`name_${language}` as keyof typeof ci.menuItem] as string
                          return (
                            <div key={ci.menuItem.id} className="flex items-center justify-between py-2 border-b border-offwhite last:border-0">
                              <div className="flex items-center gap-3">
                                <img src={ci.menuItem.image_url} alt={name} className="w-10 h-10 rounded-lg object-cover"
                                  onError={(e) => { e.currentTarget.src = '/images/default-food.jpg' }} />
                                <div>
                                  <div className="text-sm font-semibold text-charcoal line-clamp-1">{name}</div>
                                  <div className="text-xs text-charcoal/50">Rs.{ci.menuItem.price} x {ci.quantity}</div>
                                </div>
                              </div>
                              <div className="font-dmserif text-[#C0272D] font-semibold">Rs.{ci.menuItem.price * ci.quantity}</div>
                            </div>
                          )
                        })}
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-charcoal/10">
                        <span className="font-semibold text-charcoal">{t('orderPage.total')}</span>
                        <span className="font-dmserif text-2xl text-[#C0272D]">Rs.{subtotal}</span>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-5 shadow-sm">
                      <h3 className="font-semibold text-charcoal mb-3">Order Info</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-charcoal/50">Type</span><span className="font-semibold capitalize">{orderType}</span></div>
                        {orderType === 'dine-in' && selectedTable && (
                          <div className="flex justify-between"><span className="text-charcoal/50">Table</span><span className="font-semibold">T{selectedTable}</span></div>
                        )}
                        {orderType === 'preorder' && arrivalDate && (
                          <>
                            <div className="flex justify-between"><span className="text-charcoal/50">Arrival</span><span className="font-semibold">{arrivalDate} at {arrivalTime}</span></div>
                            <div className="flex justify-between"><span className="text-charcoal/50">Guests</span><span className="font-semibold">{guests}</span></div>
                          </>
                        )}
                        <div className="flex justify-between"><span className="text-charcoal/50">Name</span><span className="font-semibold">{customerName}</span></div>
                        <div className="flex justify-between"><span className="text-charcoal/50">WhatsApp</span><span className="font-semibold">+91 {whatsapp}</span></div>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-5 shadow-sm">
                      <h3 className="font-semibold text-charcoal mb-3">Payment Method</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <motion.button whileTap={{ scale: 0.97 }} onClick={() => setPaymentMethod('cod')}
                          className={`border-2 rounded-xl p-4 text-center transition-all duration-200 ${paymentMethod === 'cod' ? 'border-[#C0272D] bg-[#C0272D]/5' : 'border-charcoal/10 bg-white hover:border-[#C0272D]/30'}`}>
                          <div className="text-xl mb-1">💵</div>
                          <div className={`text-sm font-semibold ${paymentMethod === 'cod' ? 'text-[#C0272D]' : 'text-charcoal/70'}`}>{t('orderPage.codOption')}</div>
                        </motion.button>
                        {RAZORPAY_ACTIVE ? (
                          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setPaymentMethod('razorpay')}
                            className={`border-2 rounded-xl p-4 text-center transition-all duration-200 ${paymentMethod === 'razorpay' ? 'border-blue-500 bg-blue-50' : 'border-charcoal/10 bg-white hover:border-blue-300'}`}>
                            <div className="text-xl mb-1">💳</div>
                            <div className={`text-sm font-semibold ${paymentMethod === 'razorpay' ? 'text-blue-600' : 'text-charcoal/70'}`}>Pay Online</div>
                          </motion.button>
                        ) : (
                          <div className="border-2 border-charcoal/10 rounded-xl p-4 text-center opacity-50 cursor-not-allowed">
                            <div className="text-xl mb-1">💳</div>
                            <div className="text-sm font-semibold text-charcoal/50">Razorpay</div>
                            <span className="text-xs bg-charcoal/10 text-charcoal/40 px-2 py-0.5 rounded-full mt-1 inline-block">Coming Soon</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <motion.button whileTap={{ scale: 0.97 }} onClick={handlePlaceOrder} disabled={submitting}
                      className="w-full bg-[#C0272D] hover:bg-[#9e1f25] disabled:bg-[#C0272D]/60 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-[#C0272D]/30 transition-all duration-200">
                      {submitting ? 'Placing Order...' : paymentMethod === 'razorpay' ? `Pay Rs.${subtotal} Online` : `${t('buttons.placeOrder')} — Rs.${subtotal}`}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation */}
              {!orderSuccess && (
                <div className="flex items-center justify-between mt-8">
                  {step > 1 ? (
                    <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep((s) => (s - 1) as Step)}
                      className="flex items-center gap-2 text-charcoal/60 hover:text-charcoal font-semibold px-5 py-2.5 rounded-xl hover:bg-white transition-all duration-200">
                      <ChevronLeft size={18} /> Previous
                    </motion.button>
                  ) : <div />}
                  {step < 3 && (
                    <motion.button whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        if (step === 1 && cart.length === 0) return
                        if (step === 2 && !validateStep2()) return
                        setStep((s) => (s + 1) as Step)
                      }}
                      className={`flex items-center gap-2 font-semibold px-6 py-2.5 rounded-xl transition-all duration-200 ${
                        (step === 1 && cart.length === 0) ? 'bg-charcoal/15 text-charcoal/30 cursor-not-allowed' : 'bg-[#C0272D] hover:bg-[#9e1f25] text-white shadow-md'
                      }`}>
                      Next <ChevronRight size={18} />
                    </motion.button>
                  )}
                </div>
              )}
            </div>

            {/* Cart sidebar */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-36 bg-white rounded-2xl shadow-md p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-playfair font-semibold text-base text-charcoal">Your Order</h3>
                  {totalItems > 0 && <span className="bg-[#C0272D] text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">{totalItems}</span>}
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
                              <button onClick={() => updateCart(ci.menuItem, -1)} className="w-5 h-5 rounded-full bg-offwhite flex items-center justify-center"><Minus size={10} /></button>
                              <span className="text-xs font-bold w-4 text-center">{ci.quantity}</span>
                              <button onClick={() => updateCart(ci.menuItem, 1)} className="w-5 h-5 rounded-full bg-[#C0272D] flex items-center justify-center"><Plus size={10} className="text-white" /></button>
                              <span className="text-[#C0272D] font-semibold text-xs w-16 text-right">Rs.{ci.menuItem.price * ci.quantity}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div className="border-t border-offwhite pt-4 flex justify-between items-center">
                      <span className="font-semibold text-charcoal text-sm">{t('orderPage.total')}</span>
                      <span className="font-dmserif text-xl text-[#C0272D]">Rs.{subtotal}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile sticky cart bar */}
      <AnimatePresence>
        {!orderSuccess && cart.length > 0 && step === 1 && (
          <motion.div key="mobile-cart" initial={false} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-charcoal/10 shadow-2xl px-4 pt-3 pb-safe"
            style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
            <div className="flex items-center justify-between max-w-lg mx-auto">
              <div>
                <p className="text-xs text-charcoal/50 font-medium">{totalItems} item{totalItems !== 1 ? 's' : ''} in cart</p>
                <p className="font-dmserif text-xl text-[#C0272D] leading-none">Rs.{subtotal}</p>
              </div>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep(2)}
                className="flex items-center gap-2 bg-[#C0272D] text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-[#C0272D]/30 mr-16">
                Next <ChevronRight size={16} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
