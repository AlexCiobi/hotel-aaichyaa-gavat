import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Phone, Mail, Star, ShoppingBag, Calendar, Edit2, Check, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { useLanguage } from '../../context/LanguageContext'
import ScrollReveal from '../../components/ScrollReveal'
import toast from 'react-hot-toast'

interface OrderRecord {
  id: string
  order_number: string
  order_status: string
  subtotal: number
  created_at: string
}

interface ReservationRecord {
  id: string
  booking_ref: string
  date: string
  time: string
  guests: number
  status: string
}

export default function Profile() {
  const { profile, user, signOut, refreshProfile } = useAuth()
  const { language } = useLanguage()
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [reservations, setReservations] = useState<ReservationRecord[]>([])
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!profile?.whatsapp_number) return
    supabase.from('orders').select('id,order_number,order_status,subtotal,created_at')
      .eq('whatsapp_number', profile.whatsapp_number)
      .order('created_at', { ascending: false }).limit(10)
      .then(({ data }) => setOrders(data ?? []))

    supabase.from('reservations').select('id,booking_ref,date,time,guests,status')
      .eq('whatsapp_number', profile.whatsapp_number)
      .order('created_at', { ascending: false }).limit(10)
      .then(({ data }) => setReservations(data ?? []))
  }, [profile])

  const saveEdit = async () => {
    if (!user) return
    setSaving(true)
    const { error } = await supabase.from('users').update({ full_name: editName }).eq('auth_id', user.id)
    setSaving(false)
    if (error) { toast.error('Failed to update') } else { await refreshProfile(); setEditing(false); toast.success('Updated!') }
  }

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Guest'
  const langLabel: Record<string, string> = { mr: 'मराठी', hi: 'हिंदी', en: 'English', kn: 'ಕನ್ನಡ' }

  return (
    <motion.div initial={false} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }} className="page-wrapper pt-20 pb-20 bg-offwhite min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Profile Header */}
        <ScrollReveal>
          <div className="bg-white rounded-3xl shadow-md p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#C0272D]/10 flex items-center justify-center">
                  <span className="font-playfair font-bold text-2xl text-[#C0272D]">{displayName[0]?.toUpperCase()}</span>
                </div>
                <div>
                  {editing ? (
                    <div className="flex items-center gap-2">
                      <input value={editName} onChange={e => setEditName(e.target.value)}
                        className="font-playfair font-bold text-xl text-charcoal border-b-2 border-[#C0272D] focus:outline-none bg-transparent" autoFocus />
                      <button onClick={saveEdit} disabled={saving} className="text-green-600"><Check size={18} /></button>
                      <button onClick={() => setEditing(false)} className="text-red-400"><X size={18} /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h1 className="font-playfair font-bold text-xl text-charcoal">{displayName}</h1>
                      <button onClick={() => { setEditName(displayName); setEditing(true) }}
                        className="text-charcoal/30 hover:text-[#C0272D]"><Edit2 size={14} /></button>
                    </div>
                  )}
                  <p className="text-charcoal/50 text-sm mt-0.5">
                    Member since {profile?.created_at ? new Date(profile.created_at).getFullYear() : new Date().getFullYear()}
                  </p>
                </div>
              </div>
              <button onClick={signOut} className="text-sm text-charcoal/40 hover:text-red-500 font-semibold">Sign Out</button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-offwhite rounded-xl p-3 text-center">
                <div className="font-dmserif text-2xl text-[#C0272D]">{profile?.total_orders ?? 0}</div>
                <div className="text-xs text-charcoal/50 mt-0.5">Orders</div>
              </div>
              <div className="bg-offwhite rounded-xl p-3 text-center">
                <div className="font-dmserif text-2xl text-gold flex items-center justify-center gap-1">
                  <Star size={14} fill="currentColor" /> {profile?.loyalty_points ?? 0}
                </div>
                <div className="text-xs text-charcoal/50 mt-0.5">Points</div>
              </div>
              <div className="bg-offwhite rounded-xl p-3 text-center col-span-2">
                <div className="text-sm font-semibold text-charcoal">{langLabel[profile?.language_preference ?? language]}</div>
                <div className="text-xs text-charcoal/50 mt-0.5">Language</div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Contact Info */}
        <ScrollReveal delay={0.05}>
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-5">
            <h2 className="font-playfair font-semibold text-lg text-charcoal mb-4">Contact Info</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail size={16} className="text-[#C0272D]" />
                <span className="text-charcoal/70">{user?.email}</span>
              </div>
              {profile?.whatsapp_number && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone size={16} className="text-[#C0272D]" />
                  <span className="text-charcoal/70">{profile.whatsapp_number}</span>
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>

        {/* Orders */}
        <ScrollReveal delay={0.1}>
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-5">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBag size={18} className="text-[#C0272D]" />
              <h2 className="font-playfair font-semibold text-lg text-charcoal">My Orders</h2>
            </div>
            {orders.length === 0 ? (
              <p className="text-charcoal/40 text-sm text-center py-4">No orders yet.</p>
            ) : (
              <div className="space-y-3">
                {orders.map(order => (
                  <div key={order.id} className="flex items-center justify-between py-3 border-b border-offwhite last:border-0">
                    <div>
                      <div className="font-semibold text-sm text-charcoal font-dmserif">{order.order_number}</div>
                      <div className="text-xs text-charcoal/50">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-dmserif text-lg text-[#C0272D]">₹{order.subtotal}</div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${order.order_status === 'delivered' ? 'bg-green-100 text-green-700' : order.order_status === 'cancelled' ? 'bg-red-100 text-red-500' : 'bg-[#C0272D]/10 text-[#C0272D]'}`}>
                        {order.order_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* Reservations */}
        <ScrollReveal delay={0.15}>
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={18} className="text-[#C0272D]" />
              <h2 className="font-playfair font-semibold text-lg text-charcoal">My Reservations</h2>
            </div>
            {reservations.length === 0 ? (
              <p className="text-charcoal/40 text-sm text-center py-4">No reservations yet.</p>
            ) : (
              <div className="space-y-3">
                {reservations.map(res => (
                  <div key={res.id} className="flex items-center justify-between py-3 border-b border-offwhite last:border-0">
                    <div>
                      <div className="font-semibold text-sm text-charcoal font-dmserif">{res.booking_ref}</div>
                      <div className="text-xs text-charcoal/50">{res.date} at {res.time} · {res.guests} guests</div>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${res.status === 'confirmed' ? 'bg-green-100 text-green-700' : res.status === 'cancelled' ? 'bg-red-100 text-red-500' : 'bg-[#C0272D]/10 text-[#C0272D]'}`}>
                      {res.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>
    </motion.div>
  )
}
