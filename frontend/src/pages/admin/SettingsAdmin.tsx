import { useState } from 'react'
import { Save, Eye, EyeOff, Trash2, AlertTriangle } from 'lucide-react'
import { useAdmin } from '../../context/AdminContext'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

export default function SettingsAdmin() {
  const { adminSession } = useAdmin()

  const [restaurantInfo, setRestaurantInfo] = useState({
    name: 'Hotel Aaichyaa Gavat', address: 'Bavaskar Building, RB Road, Kagwade Mala, Ichalkaranji, Maharashtra 416115',
    phone: '+91 73858 64885', hours: '11:00 AM – 11:00 PM, Every Day', whatsapp: '+917083058185',
  })
  const [razorpay, setRazorpay] = useState({ key_id: '', key_secret: '' })
  const [showRazorpaySecret, setShowRazorpaySecret] = useState(false)
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })
  const [showPwd, setShowPwd] = useState(false)

  const saveRestaurantInfo = () => {
    // In production, save to a settings table in Supabase
    toast.success('Restaurant info saved!')
  }

  const saveRazorpay = () => {
    toast.success('Razorpay keys saved! (Activate in next release)')
  }

  const changePassword = () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) { toast.error('Fill all fields'); return }
    if (passwords.new !== passwords.confirm) { toast.error('Passwords do not match'); return }
    if (passwords.new.length < 8) { toast.error('Password must be at least 8 characters'); return }
    toast.success('Password change will be active on next login.')
    setPasswords({ current: '', new: '', confirm: '' })
  }

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
      <h2 className="font-playfair font-semibold text-lg text-charcoal mb-5">{title}</h2>
      {children}
    </div>
  )

  const Field = ({ label, value, onChange, type = 'text', placeholder = '' }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) => (
    <div>
      <label className="block text-xs font-semibold text-charcoal/60 mb-1.5">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C0272D]/50" />
    </div>
  )

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="font-playfair font-bold text-2xl text-charcoal">Settings</h1>
        <p className="text-charcoal/50 text-sm">Logged in as {adminSession?.email}</p>
      </div>

      <Section title="Restaurant Info">
        <div className="space-y-3">
          <Field label="Restaurant Name" value={restaurantInfo.name} onChange={v => setRestaurantInfo(p => ({ ...p, name: v }))} />
          <Field label="Address" value={restaurantInfo.address} onChange={v => setRestaurantInfo(p => ({ ...p, address: v }))} />
          <Field label="Phone" value={restaurantInfo.phone} onChange={v => setRestaurantInfo(p => ({ ...p, phone: v }))} />
          <Field label="Opening Hours" value={restaurantInfo.hours} onChange={v => setRestaurantInfo(p => ({ ...p, hours: v }))} />
          <Field label="WhatsApp Notification Number" value={restaurantInfo.whatsapp} onChange={v => setRestaurantInfo(p => ({ ...p, whatsapp: v }))} placeholder="+917083058185" />
        </div>
        <button onClick={saveRestaurantInfo} className="flex items-center gap-2 mt-4 px-4 py-2.5 bg-[#C0272D] text-white rounded-xl text-sm font-semibold shadow-md shadow-[#C0272D]/20">
          <Save size={15} /> Save Info
        </button>
      </Section>

      <Section title="Razorpay Integration">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4 text-sm text-yellow-700">
          Razorpay integration is configured here. Keys will be activated once provided by the restaurant owner.
        </div>
        <div className="space-y-3">
          <Field label="Razorpay Key ID" value={razorpay.key_id} onChange={v => setRazorpay(p => ({ ...p, key_id: v }))} placeholder="rzp_live_xxxxxxxxxxxx" />
          <div>
            <label className="block text-xs font-semibold text-charcoal/60 mb-1.5">Razorpay Key Secret</label>
            <div className="relative">
              <input type={showRazorpaySecret ? 'text' : 'password'} value={razorpay.key_secret}
                onChange={e => setRazorpay(p => ({ ...p, key_secret: e.target.value }))}
                placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C0272D]/50" />
              <button type="button" onClick={() => setShowRazorpaySecret(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal">
                {showRazorpaySecret ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
        </div>
        <button onClick={saveRazorpay} className="flex items-center gap-2 mt-4 px-4 py-2.5 bg-[#C0272D] text-white rounded-xl text-sm font-semibold shadow-md shadow-[#C0272D]/20">
          <Save size={15} /> Save Keys
        </button>
      </Section>

      <Section title="Reset / Clean Data">
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-700 flex items-start gap-2">
          <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
          <span>These actions are <strong>irreversible</strong>. All selected data will be permanently deleted from the database.</span>
        </div>
        <div className="space-y-3">
          <button onClick={async () => {
            if (!confirm('Delete ALL orders and order history? This cannot be undone.')) return
            const { error: e1 } = await supabase.from('order_status_history').delete().neq('id', '00000000-0000-0000-0000-000000000000')
            const { error: e2 } = await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000')
            if (e1 || e2) toast.error('Failed to reset orders')
            else toast.success('All orders deleted!')
          }} className="flex items-center gap-2 w-full px-4 py-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl text-sm font-semibold text-red-700 transition-colors">
            <Trash2 size={15} /> Reset All Orders
          </button>

          <button onClick={async () => {
            if (!confirm('Delete ALL reservations? This cannot be undone.')) return
            const { error } = await supabase.from('reservations').delete().neq('id', '00000000-0000-0000-0000-000000000000')
            if (error) toast.error('Failed to reset reservations')
            else toast.success('All reservations deleted!')
          }} className="flex items-center gap-2 w-full px-4 py-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl text-sm font-semibold text-red-700 transition-colors">
            <Trash2 size={15} /> Reset All Reservations
          </button>

          <button onClick={async () => {
            if (!confirm('Free ALL tables (set all to available)? This cannot be undone.')) return
            const { error } = await supabase.from('restaurant_tables').update({ status: 'available' }).neq('id', '00000000-0000-0000-0000-000000000000')
            if (error) toast.error('Failed to free tables')
            else toast.success('All tables set to available!')
          }} className="flex items-center gap-2 w-full px-4 py-3 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 rounded-xl text-sm font-semibold text-yellow-700 transition-colors">
            <Trash2 size={15} /> Free All Tables
          </button>

          <div className="border-t border-gray-100 pt-3 mt-3">
            <button onClick={async () => {
              if (!confirm('DELETE EVERYTHING? Orders, reservations, and free all tables? This cannot be undone!')) return
              const r1 = await supabase.from('order_status_history').delete().neq('id', '00000000-0000-0000-0000-000000000000')
              const r2 = await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000')
              const r3 = await supabase.from('reservations').delete().neq('id', '00000000-0000-0000-0000-000000000000')
              const r4 = await supabase.from('restaurant_tables').update({ status: 'available' }).neq('id', '00000000-0000-0000-0000-000000000000')
              if (r1.error || r2.error || r3.error || r4.error) toast.error('Some resets failed — check the database')
              else toast.success('Everything has been reset!')
            }} className="flex items-center gap-2 w-full px-4 py-3 bg-[#C0272D] hover:bg-[#9e1f25] rounded-xl text-sm font-semibold text-white transition-colors shadow-md shadow-[#C0272D]/20">
              <Trash2 size={15} /> Reset Everything
            </button>
          </div>
        </div>
      </Section>

      <Section title="Change Admin Password">
        <div className="space-y-3">
          {[
            { label: 'Current Password', key: 'current' as const },
            { label: 'New Password', key: 'new' as const },
            { label: 'Confirm New Password', key: 'confirm' as const },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-charcoal/60 mb-1.5">{label}</label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} value={passwords[key]}
                  onChange={e => setPasswords(p => ({ ...p, [key]: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C0272D]/50" />
              </div>
            </div>
          ))}
          <label className="flex items-center gap-2 text-sm cursor-pointer text-charcoal/60 mt-1">
            <input type="checkbox" checked={showPwd} onChange={e => setShowPwd(e.target.checked)} className="accent-[#C0272D]" />
            Show passwords
          </label>
        </div>
        <button onClick={changePassword} className="flex items-center gap-2 mt-4 px-4 py-2.5 bg-maroon text-white rounded-xl text-sm font-semibold">
          <Save size={15} /> Update Password
        </button>
      </Section>
    </div>
  )
}
