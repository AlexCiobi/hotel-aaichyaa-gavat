import { useState, useEffect } from 'react'
import { Search, Star } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

interface Customer {
  id: string
  full_name: string
  name: string
  email: string
  phone: string
  whatsapp_number: string
  language_preference: string
  total_orders: number
  loyalty_points: number
  created_at: string
}

export default function CustomersAdmin() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Customer | null>(null)
  const [editPoints, setEditPoints] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('users').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setCustomers(data ?? []); setLoading(false) })
  }, [])

  const filtered = customers.filter(c => {
    if (!search) return true
    const s = search.toLowerCase()
    return (c.full_name || c.name)?.toLowerCase().includes(s) ||
      c.email?.toLowerCase().includes(s) ||
      (c.phone || c.whatsapp_number)?.includes(s)
  })

  const savePoints = async () => {
    if (!selected) return
    setSaving(true)
    const pts = parseInt(editPoints)
    if (isNaN(pts)) { toast.error('Invalid points'); setSaving(false); return }
    const { error } = await supabase.from('users').update({ loyalty_points: pts }).eq('id', selected.id)
    setSaving(false)
    if (error) { toast.error('Failed') } else {
      toast.success('Points updated!')
      setCustomers(prev => prev.map(c => c.id === selected.id ? { ...c, loyalty_points: pts } : c))
      setSelected(prev => prev ? { ...prev, loyalty_points: pts } : null)
    }
  }

  const displayName = (c: Customer) => c.full_name || c.name || 'Unknown'

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="font-playfair font-bold text-2xl text-charcoal">Customers</h1>
        <p className="text-charcoal/50 text-sm">{filtered.length} registered customers</p>
      </div>

      <div className="relative mb-5 max-w-md">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, phone..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:border-[#C0272D]/50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className={`${selected ? 'lg:col-span-2' : 'lg:col-span-3'} bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden`}>
          {loading ? <div className="p-10 text-center text-charcoal/30">Loading...</div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Customer', 'Phone', 'Language', 'Orders', 'Points', 'Joined'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-charcoal/50 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(c => (
                    <tr key={c.id} onClick={() => { setSelected(selected?.id === c.id ? null : c); setEditPoints(String(c.loyalty_points ?? 0)) }}
                      className="hover:bg-gray-50 cursor-pointer">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#C0272D]/10 flex items-center justify-center text-[#C0272D] font-bold text-sm flex-shrink-0">
                            {displayName(c)[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-charcoal">{displayName(c)}</div>
                            <div className="text-xs text-charcoal/50">{c.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-charcoal/70">{c.phone || c.whatsapp_number || '—'}</td>
                      <td className="px-4 py-3 text-charcoal/70 uppercase text-xs font-semibold">{c.language_preference}</td>
                      <td className="px-4 py-3 font-semibold">{c.total_orders ?? 0}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-gold font-semibold">
                          <Star size={12} fill="currentColor" /> {c.loyalty_points ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-charcoal/50 text-xs">{new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && <div className="p-8 text-center text-charcoal/30">No customers found</div>}
            </div>
          )}
        </div>

        {selected && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-playfair font-semibold text-charcoal">Customer Details</h3>
              <button onClick={() => setSelected(null)} className="text-charcoal/30 hover:text-charcoal text-lg">×</button>
            </div>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-14 h-14 rounded-full bg-[#C0272D]/10 flex items-center justify-center">
                <span className="text-[#C0272D] font-playfair font-bold text-xl">{displayName(selected)[0]?.toUpperCase()}</span>
              </div>
              <div>
                <div className="font-playfair font-bold text-charcoal">{displayName(selected)}</div>
                <div className="text-charcoal/50 text-sm">{selected.email}</div>
              </div>
            </div>

            <div className="space-y-2 text-sm mb-5">
              {[['Phone', selected.phone || selected.whatsapp_number || '—'], ['Language', selected.language_preference], ['Total Orders', selected.total_orders ?? 0], ['Joined', new Date(selected.created_at).toLocaleDateString('en-IN')]].map(([k, v]) => (
                <div key={k as string} className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-charcoal/50">{k}</span>
                  <span className="font-semibold">{v}</span>
                </div>
              ))}
            </div>

            {/* Edit loyalty points */}
            <div className="bg-gold/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Star size={16} className="text-gold" fill="currentColor" />
                <span className="font-semibold text-charcoal text-sm">Loyalty Points</span>
              </div>
              <div className="flex gap-2">
                <input type="number" value={editPoints} onChange={e => setEditPoints(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none" />
                <button onClick={savePoints} disabled={saving}
                  className="px-3 py-2 bg-[#C0272D] text-white text-sm font-semibold rounded-xl disabled:opacity-60">
                  {saving ? '...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
