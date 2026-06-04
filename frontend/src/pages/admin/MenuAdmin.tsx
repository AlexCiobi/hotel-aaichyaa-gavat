import { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, Check, X, RefreshCw } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

interface MenuItem {
  id: string
  category: string
  price: number
  is_veg: boolean
  is_available: boolean
  image_url: string
  name_mr: string
  name_hi: string
  name_en: string
  name_kn: string
  description_en: string
}

const CATEGORIES = ['thali', 'starters', 'main_course', 'breads', 'rice', 'beverages', 'snacks']

const EMPTY_FORM: Omit<MenuItem, 'id'> = {
  category: 'thali', price: 0, is_veg: true, is_available: true,
  image_url: '', name_mr: '', name_hi: '', name_en: '', name_kn: '', description_en: '',
}

export default function MenuAdmin() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [editing, setEditing] = useState<MenuItem | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState<Omit<MenuItem, 'id'>>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const fetch = async () => {
    setLoading(true)
    const { data } = await supabase.from('menu_items').select('*').order('category').order('name_en')
    setItems(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetch()
    // Realtime subscription
    const channel = supabase.channel('menu_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, () => fetch())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const filtered = items.filter(i =>
    (catFilter === 'all' || i.category === catFilter) &&
    (!search || i.name_en.toLowerCase().includes(search.toLowerCase()))
  )

  const toggleAvailability = async (item: MenuItem) => {
    const { error } = await supabase.from('menu_items').update({ is_available: !item.is_available }).eq('id', item.id)
    if (error) { toast.error('Failed') } else {
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_available: !i.is_available } : i))
    }
  }

  const saveEdit = async () => {
    if (!editing) return
    setSaving(true)
    const { error } = await supabase.from('menu_items').update({
      name_mr: editing.name_mr, name_hi: editing.name_hi, name_en: editing.name_en, name_kn: editing.name_kn,
      price: editing.price, category: editing.category, is_veg: editing.is_veg,
      is_available: editing.is_available, image_url: editing.image_url,
    }).eq('id', editing.id)
    setSaving(false)
    if (error) { toast.error('Failed to save') } else { toast.success('Updated!'); setEditing(null); fetch() }
  }

  const addItem = async () => {
    if (!form.name_en) { toast.error('English name required'); return }
    setSaving(true)
    const { error } = await supabase.from('menu_items').insert(form)
    setSaving(false)
    if (error) { toast.error('Failed to add') } else { toast.success('Item added!'); setShowAdd(false); setForm(EMPTY_FORM); fetch() }
  }

  const deleteItem = async (id: string) => {
    if (!confirm('Delete this item?')) return
    const { error } = await supabase.from('menu_items').delete().eq('id', id)
    if (error) { toast.error('Failed to delete') } else { toast.success('Deleted'); fetch() }
  }

  const F = ({ label, field, type = 'text', obj, setObj }: { label: string; field: string; type?: string; obj: Record<string, unknown>; setObj: (v: Record<string, unknown>) => void }) => (
    <div>
      <label className="block text-xs font-semibold text-charcoal/60 mb-1">{label}</label>
      <input type={type} value={String(obj[field] ?? '')} onChange={e => setObj({ ...obj, [field]: type === 'number' ? Number(e.target.value) : e.target.value })}
        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C0272D]/50" />
    </div>
  )

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-playfair font-bold text-2xl text-charcoal">Menu Management</h1>
          <p className="text-charcoal/50 text-sm">{filtered.length} items · changes reflect live</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetch} className="p-2 rounded-xl bg-white border border-gray-200 text-charcoal/50 hover:text-charcoal"><RefreshCw size={16} /></button>
          <button onClick={() => setShowAdd(v => !v)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#C0272D] text-white text-sm font-semibold shadow-md shadow-[#C0272D]/20">
            <Plus size={15} /> Add Item
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="bg-white rounded-2xl p-5 border border-[#C0272D]/20 shadow-sm mb-5">
          <h3 className="font-semibold text-charcoal mb-4">New Menu Item</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <F label="English Name *" field="name_en" obj={form as unknown as Record<string, unknown>} setObj={v => setForm(v as typeof form)} />
            <F label="Marathi Name" field="name_mr" obj={form as unknown as Record<string, unknown>} setObj={v => setForm(v as typeof form)} />
            <F label="Hindi Name" field="name_hi" obj={form as unknown as Record<string, unknown>} setObj={v => setForm(v as typeof form)} />
            <F label="Kannada Name" field="name_kn" obj={form as unknown as Record<string, unknown>} setObj={v => setForm(v as typeof form)} />
            <F label="Price (₹)" field="price" type="number" obj={form as unknown as Record<string, unknown>} setObj={v => setForm(v as typeof form)} />
            <F label="Image URL" field="image_url" obj={form as unknown as Record<string, unknown>} setObj={v => setForm(v as typeof form)} />
            <div>
              <label className="block text-xs font-semibold text-charcoal/60 mb-1">Category</label>
              <select value={form.category} onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-4 pt-5">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.is_veg} onChange={e => setForm(prev => ({ ...prev, is_veg: e.target.checked }))} className="accent-green-600" /> Veg
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.is_available} onChange={e => setForm(prev => ({ ...prev, is_available: e.target.checked }))} className="accent-[#C0272D]" /> Available
              </label>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={addItem} disabled={saving} className="px-4 py-2 bg-[#C0272D] text-white text-sm font-semibold rounded-xl disabled:opacity-60">
              {saving ? 'Adding...' : 'Add Item'}
            </button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 border border-gray-200 text-charcoal/60 text-sm rounded-xl">Cancel</button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:border-[#C0272D]/50" />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none cursor-pointer">
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? <div className="text-center py-10 text-charcoal/30">Loading...</div> : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Item', 'Category', 'Price', 'Veg', 'Available', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-charcoal/50 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(item => (
                  <tr key={item.id}>
                    {editing?.id === item.id ? (
                      <td colSpan={6} className="px-4 py-3">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                          {(['name_en', 'name_mr', 'name_hi', 'name_kn'] as const).map(f => (
                            <div key={f}>
                              <label className="block text-xs text-charcoal/50 mb-1">{f}</label>
                              <input value={editing[f]} onChange={e => setEditing({ ...editing, [f]: e.target.value })}
                                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none" />
                            </div>
                          ))}
                          <div>
                            <label className="block text-xs text-charcoal/50 mb-1">price</label>
                            <input type="number" value={editing.price} onChange={e => setEditing({ ...editing, price: Number(e.target.value) })}
                              className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none" />
                          </div>
                          <div>
                            <label className="block text-xs text-charcoal/50 mb-1">image_url</label>
                            <input value={editing.image_url} onChange={e => setEditing({ ...editing, image_url: e.target.value })}
                              className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none" />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={saveEdit} disabled={saving} className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-semibold">
                            <Check size={14} /> Save
                          </button>
                          <button onClick={() => setEditing(null)} className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm">
                            <X size={14} /> Cancel
                          </button>
                        </div>
                      </td>
                    ) : (
                      <>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img src={item.image_url} alt={item.name_en} className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                              onError={e => { (e.target as HTMLImageElement).src = '/images/veg-thali.jpg' }} />
                            <span className="font-medium text-charcoal line-clamp-1">{item.name_en}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-charcoal/60 capitalize">{item.category}</td>
                        <td className="px-4 py-3 font-semibold">₹{item.price}</td>
                        <td className="px-4 py-3">
                          <span className={`w-5 h-5 rounded-sm border-2 flex items-center justify-center ${item.is_veg ? 'border-green-600' : 'border-red-600'}`}>
                            <span className={`w-2.5 h-2.5 rounded-full ${item.is_veg ? 'bg-green-600' : 'bg-red-600'}`} />
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => toggleAvailability(item)}
                            className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${item.is_available ? 'bg-green-500' : 'bg-gray-300'}`}>
                            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200 ${item.is_available ? 'left-6' : 'left-0.5'}`} />
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => setEditing(item)} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"><Edit2 size={13} /></button>
                            <button onClick={() => deleteItem(item.id)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"><Trash2 size={13} /></button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="p-8 text-center text-charcoal/30">No items found</div>}
          </div>
        </div>
      )}
    </div>
  )
}
