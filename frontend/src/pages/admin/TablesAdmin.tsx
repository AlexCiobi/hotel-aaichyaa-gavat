import { useState, useEffect } from 'react'
import { Plus, Edit2, Check, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

interface Table {
  id: string
  table_number: string
  capacity: number
  zone: string
  status: string
}

const STATUS_OPTIONS = ['available', 'occupied', 'reserved', 'maintenance']
const ZONE_OPTIONS = ['main', 'window', 'private', 'outdoor']

function statusColor(s: string) {
  const map: Record<string, string> = {
    available: 'bg-green-100 text-green-700 border-green-200',
    occupied: 'bg-red-100 text-red-600 border-red-200',
    reserved: 'bg-[#C0272D]/10 text-[#C0272D] border-[#C0272D]/20',
    maintenance: 'bg-gray-100 text-gray-500 border-gray-200',
  }
  return map[s] ?? 'bg-gray-100 text-gray-500'
}

export default function TablesAdmin() {
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Table>>({})
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState({ table_number: '', capacity: '4', zone: 'main' })

  const fetch = async () => {
    setLoading(true)
    const { data } = await supabase.from('restaurant_tables').select('*').order('table_number')
    setTables(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('restaurant_tables').update({ status }).eq('id', id)
    if (error) { toast.error('Failed') } else {
      setTables(prev => prev.map(t => t.id === id ? { ...t, status } : t))
    }
  }

  const saveEdit = async (id: string) => {
    const { error } = await supabase.from('restaurant_tables').update(editData).eq('id', id)
    if (error) { toast.error('Failed') } else { toast.success('Saved!'); setEditing(null); fetch() }
  }

  const addTable = async () => {
    if (!addForm.table_number) { toast.error('Table number required'); return }
    const { error } = await supabase.from('restaurant_tables').insert({
      table_number: addForm.table_number, capacity: parseInt(addForm.capacity) || 4, zone: addForm.zone, status: 'available'
    })
    if (error) { toast.error(error.message) } else { toast.success('Table added!'); setShowAdd(false); setAddForm({ table_number: '', capacity: '4', zone: 'main' }); fetch() }
  }

  const countByStatus = (s: string) => tables.filter(t => t.status === s).length

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-playfair font-bold text-2xl text-charcoal">Tables</h1>
          <p className="text-charcoal/50 text-sm">{tables.length} tables total</p>
        </div>
        <button onClick={() => setShowAdd(v => !v)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#C0272D] text-white text-sm font-semibold shadow-md shadow-[#C0272D]/20">
          <Plus size={15} /> Add Table
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {STATUS_OPTIONS.map(s => (
          <div key={s} className={`rounded-xl p-3 text-center border ${statusColor(s)}`}>
            <div className="font-bold text-2xl">{countByStatus(s)}</div>
            <div className="text-xs font-semibold mt-0.5 capitalize">{s}</div>
          </div>
        ))}
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="bg-white rounded-2xl p-5 border border-[#C0272D]/20 shadow-sm mb-5">
          <h3 className="font-semibold text-charcoal mb-4">Add New Table</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal/60 mb-1">Table Number *</label>
              <input value={addForm.table_number} onChange={e => setAddForm(prev => ({ ...prev, table_number: e.target.value }))}
                placeholder="T21" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal/60 mb-1">Capacity</label>
              <input type="number" value={addForm.capacity} onChange={e => setAddForm(prev => ({ ...prev, capacity: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal/60 mb-1">Zone</label>
              <select value={addForm.zone} onChange={e => setAddForm(prev => ({ ...prev, zone: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none">
                {ZONE_OPTIONS.map(z => <option key={z} value={z}>{z}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={addTable} className="px-4 py-2 bg-[#C0272D] text-white text-sm font-semibold rounded-xl">Add</button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 border border-gray-200 text-charcoal/60 text-sm rounded-xl">Cancel</button>
          </div>
        </div>
      )}

      {/* Tables Grid */}
      {loading ? <div className="text-center py-10 text-charcoal/30">Loading...</div> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {tables.map(table => (
            <div key={table.id} className={`bg-white rounded-2xl p-4 border shadow-sm transition-all duration-200 ${statusColor(table.status).replace('text-', 'border-')}`}>
              {editing === table.id ? (
                <div className="space-y-2">
                  <input value={editData.capacity ?? table.capacity} type="number"
                    onChange={e => setEditData(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                    className="w-full px-2 py-1 text-sm rounded-lg border border-gray-200 focus:outline-none" placeholder="Capacity" />
                  <select value={editData.zone ?? table.zone} onChange={e => setEditData(prev => ({ ...prev, zone: e.target.value }))}
                    className="w-full px-2 py-1 text-sm rounded-lg border border-gray-200 focus:outline-none">
                    {ZONE_OPTIONS.map(z => <option key={z} value={z}>{z}</option>)}
                  </select>
                  <div className="flex gap-1">
                    <button onClick={() => saveEdit(table.id)} className="flex-1 p-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1">
                      <Check size={12} /> Save
                    </button>
                    <button onClick={() => setEditing(null)} className="flex-1 p-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs flex items-center justify-center">
                      <X size={12} />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-bold text-charcoal text-lg">{table.table_number}</span>
                    <button onClick={() => { setEditing(table.id); setEditData({}) }}
                      className="text-charcoal/30 hover:text-charcoal"><Edit2 size={13} /></button>
                  </div>
                  <div className="text-xs text-charcoal/50 mb-1">{table.capacity} seats · {table.zone}</div>
                  <select value={table.status} onChange={e => updateStatus(table.id, e.target.value)}
                    className={`w-full text-xs font-semibold px-2 py-1 rounded-lg border cursor-pointer focus:outline-none ${statusColor(table.status)}`}>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
