import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, RefreshCw, Check, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

interface Reservation {
  id: string
  booking_ref: string
  customer_name: string
  customer_phone: string
  whatsapp_number: string
  date: string
  time: string
  guests: number
  occasion: string
  status: string
  special_requests: string
  confirmed_by: string
  created_at: string
}

const STATUS_OPTIONS = ['pending', 'confirmed', 'cancelled', 'completed']

function statusColor(s: string) {
  const map: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-500',
    completed: 'bg-gray-100 text-gray-600',
  }
  return map[s] ?? 'bg-gray-100 text-gray-600'
}

export default function ReservationsAdmin() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')
  const [selected, setSelected] = useState<Reservation | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)

  // Add form state
  const [addForm, setAddForm] = useState({ customer_name: '', whatsapp_number: '', date: '', time: '', guests: '2', occasion: 'none', special_requests: '' })

  const fetchReservations = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('reservations').select('*').order('date', { ascending: false }).order('time').limit(200)
    if (statusFilter !== 'all') q = q.eq('status', statusFilter)
    if (dateFilter) q = q.eq('date', dateFilter)
    const { data } = await q
    setReservations(data ?? [])
    setLoading(false)
  }, [statusFilter, dateFilter])

  useEffect(() => { fetchReservations() }, [fetchReservations])

  const filtered = reservations.filter(r =>
    !search || r.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.booking_ref?.toLowerCase().includes(search.toLowerCase()) ||
    (r.whatsapp_number || r.customer_phone)?.includes(search)
  )

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id)
    const { error } = await supabase.from('reservations').update({ status: newStatus, updated_at: new Date().toISOString(), confirmed_by: newStatus === 'confirmed' ? 'admin' : undefined }).eq('id', id)
    if (error) { toast.error('Failed to update') } else {
      toast.success(`Reservation ${newStatus}`)
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r))
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, status: newStatus } : null)
    }
    setUpdatingId(null)
  }

  const addReservation = async () => {
    if (!addForm.customer_name || !addForm.date || !addForm.time) { toast.error('Fill required fields'); return }
    const ref = 'TH-RES-' + Math.floor(10000 + Math.random() * 90000)
    const { error } = await supabase.from('reservations').insert({
      booking_ref: ref, customer_name: addForm.customer_name,
      customer_phone: addForm.whatsapp_number, whatsapp_number: addForm.whatsapp_number,
      date: addForm.date, time: addForm.time, guests: parseInt(addForm.guests) || 2,
      occasion: addForm.occasion, special_requests: addForm.special_requests, status: 'confirmed', confirmed_by: 'admin'
    })
    if (error) { toast.error('Failed to add') } else { toast.success('Reservation added!'); setShowAdd(false); fetchReservations() }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-playfair font-bold text-2xl text-charcoal">Reservations</h1>
          <p className="text-charcoal/50 text-sm">{filtered.length} reservations</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchReservations} className="p-2 rounded-xl bg-white border border-gray-200 text-charcoal/50 hover:text-charcoal"><RefreshCw size={16} /></button>
          <button onClick={() => setShowAdd(v => !v)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#C0272D] text-white text-sm font-semibold shadow-md shadow-[#C0272D]/20">
            <Plus size={15} /> Add Reservation
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="bg-white rounded-2xl p-5 border border-[#C0272D]/20 shadow-sm mb-5">
          <h3 className="font-semibold text-charcoal mb-4">New Reservation</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Customer Name *', key: 'customer_name', type: 'text' },
              { label: 'WhatsApp', key: 'whatsapp_number', type: 'tel' },
              { label: 'Date *', key: 'date', type: 'date' },
              { label: 'Time *', key: 'time', type: 'time' },
              { label: 'Guests', key: 'guests', type: 'number' },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-charcoal/60 mb-1">{label}</label>
                <input type={type} value={(addForm as Record<string, string>)[key]}
                  onChange={e => setAddForm(prev => ({ ...prev, [key]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C0272D]/50" />
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={addReservation} className="px-4 py-2 bg-[#C0272D] text-white text-sm font-semibold rounded-xl">Add</button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 border border-gray-200 text-charcoal/60 text-sm rounded-xl">Cancel</button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, ref, phone..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:border-[#C0272D]/50" />
        </div>
        <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:border-[#C0272D]/50" />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none cursor-pointer">
          <option value="all">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className={`${selected ? 'lg:col-span-2' : 'lg:col-span-3'} bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden`}>
          {loading ? <div className="p-10 text-center text-charcoal/30">Loading...</div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Ref', 'Customer', 'Date', 'Time', 'Guests', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-charcoal/50 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(r => (
                    <tr key={r.id} onClick={() => setSelected(selected?.id === r.id ? null : r)} className="hover:bg-gray-50 cursor-pointer">
                      <td className="px-4 py-3 font-semibold text-[#C0272D] text-xs">{r.booking_ref}</td>
                      <td className="px-4 py-3 text-charcoal">{r.customer_name}</td>
                      <td className="px-4 py-3 text-charcoal/70">{r.date}</td>
                      <td className="px-4 py-3 text-charcoal/70">{r.time}</td>
                      <td className="px-4 py-3 text-charcoal/70">{r.guests}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor(r.status)}`}>{r.status}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                          {r.status === 'pending' && <>
                            <button onClick={() => updateStatus(r.id, 'confirmed')} disabled={updatingId === r.id}
                              className="p-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200"><Check size={13} /></button>
                            <button onClick={() => updateStatus(r.id, 'cancelled')} disabled={updatingId === r.id}
                              className="p-1.5 rounded-lg bg-red-100 text-red-500 hover:bg-red-200"><X size={13} /></button>
                          </>}
                          {r.status === 'confirmed' && (
                            <button onClick={() => updateStatus(r.id, 'completed')} disabled={updatingId === r.id}
                              className="px-2 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200">Done</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && <div className="p-8 text-center text-charcoal/30">No reservations found</div>}
            </div>
          )}
        </div>

        {selected && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-playfair font-semibold text-charcoal">Details</h3>
              <button onClick={() => setSelected(null)} className="text-charcoal/30 hover:text-charcoal text-lg">×</button>
            </div>
            <div className="space-y-2 text-sm">
              {[['Ref', selected.booking_ref], ['Name', selected.customer_name], ['Phone', selected.whatsapp_number || selected.customer_phone], ['Date', selected.date], ['Time', selected.time], ['Guests', selected.guests], ['Occasion', selected.occasion], ['Status', selected.status]].map(([k, v]) => (
                <div key={k as string} className="flex justify-between"><span className="text-charcoal/50">{k}</span><span className="font-semibold">{v}</span></div>
              ))}
              {selected.special_requests && <div className="mt-3 bg-offwhite rounded-xl p-3 text-xs text-charcoal/60"><span className="font-semibold">Requests: </span>{selected.special_requests}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
