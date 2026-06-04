import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

interface Offer {
  id: string
  title_en: string
  title_mr: string
  title_hi: string
  title_kn: string
  description_en: string
  description_mr: string
  description_hi: string
  description_kn: string
  discount_percent: number
  valid_until: string
  is_active: boolean
  image_url: string
  badge_color: string
}

const EMPTY: Omit<Offer, 'id'> = {
  title_en: '', title_mr: '', title_hi: '', title_kn: '',
  description_en: '', description_mr: '', description_hi: '', description_kn: '',
  discount_percent: 10, valid_until: '', is_active: true, image_url: '', badge_color: '#C0272D',
}

export default function OffersAdmin() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Offer | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState<Omit<Offer, 'id'>>(EMPTY)
  const [saving, setSaving] = useState(false)

  const fetch = async () => {
    setLoading(true)
    const { data } = await supabase.from('offers').select('*').order('created_at', { ascending: false })
    setOffers(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])

  const toggleActive = async (offer: Offer) => {
    const { error } = await supabase.from('offers').update({ is_active: !offer.is_active }).eq('id', offer.id)
    if (error) { toast.error('Failed') } else {
      setOffers(prev => prev.map(o => o.id === offer.id ? { ...o, is_active: !o.is_active } : o))
    }
  }

  const saveNew = async () => {
    if (!form.title_en) { toast.error('English title required'); return }
    setSaving(true)
    const { error } = await supabase.from('offers').insert(form)
    setSaving(false)
    if (error) { toast.error('Failed to add') } else { toast.success('Offer created!'); setShowAdd(false); setForm(EMPTY); fetch() }
  }

  const saveEdit = async () => {
    if (!editing) return
    setSaving(true)
    const { id, ...rest } = editing
    const { error } = await supabase.from('offers').update(rest).eq('id', id)
    setSaving(false)
    if (error) { toast.error('Failed') } else { toast.success('Updated!'); setEditing(null); fetch() }
  }

  const deleteOffer = async (id: string) => {
    if (!confirm('Delete this offer?')) return
    const { error } = await supabase.from('offers').delete().eq('id', id)
    if (error) { toast.error('Failed') } else { toast.success('Deleted'); fetch() }
  }

  const OfferForm = ({ data, setData, onSave, onCancel }: { data: Partial<Offer>; setData: (v: Partial<Offer>) => void; onSave: () => void; onCancel: () => void }) => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {(['title_en', 'title_mr', 'title_hi', 'title_kn'] as const).map(f => (
          <div key={f}>
            <label className="block text-xs font-semibold text-charcoal/60 mb-1">{f}</label>
            <input value={data[f] ?? ''} onChange={e => setData({ ...data, [f]: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {(['description_en', 'description_mr'] as const).map(f => (
          <div key={f}>
            <label className="block text-xs font-semibold text-charcoal/60 mb-1">{f}</label>
            <textarea value={data[f] ?? ''} onChange={e => setData({ ...data, [f]: e.target.value })} rows={2}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none resize-none" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-charcoal/60 mb-1">Discount %</label>
          <input type="number" value={data.discount_percent ?? 0} onChange={e => setData({ ...data, discount_percent: parseInt(e.target.value) })}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-charcoal/60 mb-1">Valid Until</label>
          <input type="datetime-local" value={data.valid_until ?? ''} onChange={e => setData({ ...data, valid_until: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-charcoal/60 mb-1">Badge Color</label>
          <input type="color" value={data.badge_color ?? '#C0272D'} onChange={e => setData({ ...data, badge_color: e.target.value })}
            className="w-full h-10 rounded-xl border border-gray-200 cursor-pointer" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-charcoal/60 mb-1">Image URL</label>
        <input value={data.image_url ?? ''} onChange={e => setData({ ...data, image_url: e.target.value })}
          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none" />
      </div>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={data.is_active ?? true} onChange={e => setData({ ...data, is_active: e.target.checked })} className="accent-[#C0272D]" />
        Active
      </label>
      <div className="flex gap-2 pt-2">
        <button onClick={onSave} disabled={saving} className="px-4 py-2 bg-[#C0272D] text-white text-sm font-semibold rounded-xl disabled:opacity-60">
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button onClick={onCancel} className="px-4 py-2 border border-gray-200 text-charcoal/60 text-sm rounded-xl">Cancel</button>
      </div>
    </div>
  )

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-playfair font-bold text-2xl text-charcoal">Offers</h1>
          <p className="text-charcoal/50 text-sm">{offers.length} offers</p>
        </div>
        <button onClick={() => setShowAdd(v => !v)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#C0272D] text-white text-sm font-semibold shadow-md shadow-[#C0272D]/20">
          <Plus size={15} /> New Offer
        </button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-2xl p-5 border border-[#C0272D]/20 shadow-sm mb-5">
          <h3 className="font-semibold text-charcoal mb-4">New Offer</h3>
          <OfferForm data={form as Partial<Offer>} setData={v => setForm(v as Omit<Offer, 'id'>)} onSave={saveNew} onCancel={() => setShowAdd(false)} />
        </div>
      )}

      {loading ? <div className="text-center py-10 text-charcoal/30">Loading...</div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {offers.map(offer => (
            <div key={offer.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {editing?.id === offer.id ? (
                <div className="p-5">
                  <h3 className="font-semibold text-charcoal mb-4">Edit Offer</h3>
                  <OfferForm data={editing as Partial<Offer>}
                    setData={v => setEditing(v as Offer)}
                    onSave={saveEdit} onCancel={() => setEditing(null)} />
                </div>
              ) : (
                <>
                  {offer.image_url && (
                    <div className="h-36 overflow-hidden">
                      <img src={offer.image_url} alt={offer.title_en} className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-playfair font-semibold text-charcoal">{offer.title_en}</div>
                        {offer.discount_percent > 0 && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white mt-1 inline-block"
                            style={{ backgroundColor: offer.badge_color }}>
                            {offer.discount_percent}% OFF
                          </span>
                        )}
                      </div>
                      <button onClick={() => toggleActive(offer)}
                        className={`w-10 h-5 rounded-full transition-colors duration-200 relative flex-shrink-0 ${offer.is_active ? 'bg-green-500' : 'bg-gray-300'}`}>
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${offer.is_active ? 'left-5' : 'left-0.5'}`} />
                      </button>
                    </div>
                    {offer.description_en && <p className="text-xs text-charcoal/60 mb-3 line-clamp-2">{offer.description_en}</p>}
                    {offer.valid_until && <p className="text-xs text-charcoal/40 mb-3">Valid until: {new Date(offer.valid_until).toLocaleDateString('en-IN')}</p>}
                    <div className="flex gap-2">
                      <button onClick={() => setEditing(offer)} className="flex-1 flex items-center justify-center gap-1 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-semibold hover:bg-blue-100">
                        <Edit2 size={12} /> Edit
                      </button>
                      <button onClick={() => deleteOffer(offer.id)} className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-50 text-red-500 rounded-xl text-xs font-semibold hover:bg-red-100">
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
          {offers.length === 0 && <div className="col-span-full text-center py-10 text-charcoal/30">No offers yet</div>}
        </div>
      )}
    </div>
  )
}
