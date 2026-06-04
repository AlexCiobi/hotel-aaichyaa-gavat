import { useState, useEffect, useCallback } from 'react'
import { Search, Download, RefreshCw, FileText, Printer, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_phone: string
  whatsapp_number: string
  order_type: string
  order_status: string
  subtotal: number
  payment_method: string
  payment_status?: string
  special_instructions: string
  created_at: string
  arrival_date?: string
  arrival_time?: string
  guests?: number
  items: Array<{ id: string; name: string; qty: number; price: number }>
}

const STATUS_OPTIONS = ['placed', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']

function statusColor(s: string) {
  const map: Record<string, string> = {
    placed: 'bg-gray-100 text-gray-600',
    confirmed: 'bg-blue-100 text-blue-600',
    preparing: 'bg-yellow-100 text-yellow-700',
    ready: 'bg-green-100 text-green-700',
    delivered: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-500',
  }
  return map[s] ?? 'bg-gray-100 text-gray-600'
}

function InvoiceModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const printInvoice = () => window.print()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Modal controls — hidden on print */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 print:hidden">
          <h2 className="font-playfair font-bold text-lg text-charcoal">Invoice</h2>
          <div className="flex items-center gap-2">
            <button onClick={printInvoice}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#C0272D] text-white text-sm font-semibold hover:bg-[#9e1f25] transition-colors">
              <Printer size={15} /> Print
            </button>
            <button onClick={onClose} className="p-2 rounded-xl text-charcoal/40 hover:text-charcoal hover:bg-gray-100 transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Invoice body — print-friendly */}
        <div id="invoice-print" className="p-6">
          {/* Header */}
          <div className="text-center mb-6 pb-5 border-b-2 border-[#C0272D]">
            <img src="/logo.png" alt="Hotel Aaichyaa Gavat" className="w-12 h-12 rounded-full object-cover mx-auto mb-2" />
            <h1 className="font-playfair font-bold text-2xl text-charcoal">Hotel Aaichyaa Gavat</h1>
            <p className="text-charcoal/50 text-xs mt-0.5">Bavaskar Building, RB Road, Kagwade Mala, Ichalkaranji 416115</p>
            <p className="text-charcoal/50 text-xs">+91 88883 77788</p>
          </div>

          {/* Invoice title + number */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-xs text-charcoal/40 uppercase tracking-wider font-semibold">Invoice</div>
              <div className="font-playfair font-bold text-xl text-[#C0272D]">{order.order_number}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-charcoal/40">Date</div>
              <div className="text-sm font-semibold text-charcoal">
                {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
              <div className="text-xs text-charcoal/50">
                {new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>

          {/* Customer + Order info */}
          <div className="grid grid-cols-2 gap-4 mb-5 bg-gray-50 rounded-xl p-4">
            <div>
              <div className="text-xs text-charcoal/40 uppercase tracking-wider font-semibold mb-1">Customer</div>
              <div className="text-sm font-semibold text-charcoal">{order.customer_name}</div>
              <div className="text-xs text-charcoal/50">{order.whatsapp_number || order.customer_phone}</div>
            </div>
            <div>
              <div className="text-xs text-charcoal/40 uppercase tracking-wider font-semibold mb-1">Order Info</div>
              <div className="text-sm font-semibold capitalize text-charcoal">{order.order_type?.replace('_', '-')}</div>
              {order.order_type === 'preorder' && order.arrival_date && (
                <div className="text-xs text-charcoal/50">
                  {order.arrival_date} at {order.arrival_time} · {order.guests} guests
                </div>
              )}
              <div className="text-xs text-charcoal/50 capitalize">{order.payment_method}</div>
            </div>
          </div>

          {/* Items table */}
          <div className="mb-5">
            <div className="text-xs text-charcoal/40 uppercase tracking-wider font-semibold mb-2">Items</div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-xs font-semibold text-charcoal/50">Item</th>
                  <th className="text-center py-2 text-xs font-semibold text-charcoal/50">Qty</th>
                  <th className="text-right py-2 text-xs font-semibold text-charcoal/50">Price</th>
                  <th className="text-right py-2 text-xs font-semibold text-charcoal/50">Amount</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(order.items) && order.items.map((item, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-2 text-charcoal">{item.name}</td>
                    <td className="py-2 text-center text-charcoal/60">{item.qty}</td>
                    <td className="py-2 text-right text-charcoal/60">Rs.{item.price}</td>
                    <td className="py-2 text-right font-semibold text-charcoal">Rs.{item.price * item.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="border-t-2 border-charcoal/10 pt-3 mb-5">
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg text-charcoal">Total</span>
              <span className="font-playfair font-bold text-2xl text-[#C0272D]">Rs.{order.subtotal}</span>
            </div>
          </div>

          {/* Payment status */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3 mb-4">
            <span className="text-sm text-charcoal/60">Payment Status</span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${
              order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
            }`}>
              {order.payment_status ?? 'pending'}
            </span>
          </div>

          {/* Special instructions */}
          {order.special_instructions && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4">
              <div className="text-xs font-semibold text-yellow-800 mb-1">Special Instructions</div>
              <div className="text-xs text-yellow-700">{order.special_instructions}</div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-xs text-charcoal/30 pt-4 border-t border-gray-100">
            Thank you for dining at Hotel Aaichyaa Gavat · Est. 2019 · Ichalkaranji
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OrdersAdmin() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState<Order | null>(null)
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(200)
    if (statusFilter !== 'all') q = q.eq('order_status', statusFilter)
    const { data } = await q
    setOrders(data ?? [])
    setLoading(false)
  }, [statusFilter])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const filtered = orders.filter(o =>
    !search ||
    o.order_number?.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    (o.whatsapp_number || o.customer_phone)?.includes(search)
  )

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id)
    const { error } = await supabase.from('orders').update({ order_status: newStatus, updated_at: new Date().toISOString() }).eq('id', id)
    if (error) {
      toast.error('Failed to update')
    } else {
      toast.success('Status updated')
      setOrders(prev => prev.map(o => o.id === id ? { ...o, order_status: newStatus } : o))
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, order_status: newStatus } : null)
      await supabase.from('order_status_history').insert({ order_id: id, status: newStatus, changed_by: 'admin' })
    }
    setUpdatingId(null)
  }

  const exportCSV = () => {
    const rows = [['Order #', 'Customer', 'Phone', 'Type', 'Status', 'Amount', 'Payment', 'Date']]
    filtered.forEach(o => rows.push([
      o.order_number, o.customer_name, o.whatsapp_number || o.customer_phone,
      o.order_type, o.order_status, String(o.subtotal), o.payment_method, o.created_at
    ]))
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'orders.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      {/* Print styles injected globally */}
      <style>{`
        @media print {
          body > *:not(#invoice-print),
          .print\\:hidden { display: none !important; }
          #invoice-print { display: block !important; }
        }
      `}</style>

      {invoiceOrder && <InvoiceModal order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />}

      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-playfair font-bold text-2xl text-charcoal">Orders</h1>
            <p className="text-charcoal/50 text-sm">{filtered.length} orders</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchOrders} className="p-2 rounded-xl bg-white border border-gray-200 text-charcoal/50 hover:text-charcoal">
              <RefreshCw size={16} />
            </button>
            <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-charcoal/70 hover:text-charcoal">
              <Download size={15} /> Export CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search order #, name, phone..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:border-[#C0272D]/50" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none cursor-pointer">
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Orders table */}
          <div className={`${selected ? 'lg:col-span-2' : 'lg:col-span-3'} bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden`}>
            {loading ? (
              <div className="p-10 text-center text-charcoal/30">Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Order #', 'Customer', 'Type', 'Status', 'Amount', 'Time', 'Invoice', ''].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-charcoal/50 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map(o => (
                      <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-[#C0272D] cursor-pointer" onClick={() => setSelected(selected?.id === o.id ? null : o)}>
                          {o.order_number}
                        </td>
                        <td className="px-4 py-3 text-charcoal cursor-pointer" onClick={() => setSelected(selected?.id === o.id ? null : o)}>
                          {o.customer_name}
                        </td>
                        <td className="px-4 py-3 text-charcoal/60 capitalize cursor-pointer" onClick={() => setSelected(selected?.id === o.id ? null : o)}>
                          {o.order_type?.replace('_', '-')}
                        </td>
                        <td className="px-4 py-3 cursor-pointer" onClick={() => setSelected(selected?.id === o.id ? null : o)}>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor(o.order_status)}`}>{o.order_status}</span>
                        </td>
                        <td className="px-4 py-3 font-semibold cursor-pointer" onClick={() => setSelected(selected?.id === o.id ? null : o)}>
                          Rs.{o.subtotal}
                        </td>
                        <td className="px-4 py-3 text-charcoal/50 text-xs cursor-pointer" onClick={() => setSelected(selected?.id === o.id ? null : o)}>
                          {new Date(o.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={e => { e.stopPropagation(); setInvoiceOrder(o) }}
                            className="flex items-center gap-1 text-xs font-semibold text-[#C0272D] hover:text-[#9e1f25] px-2 py-1 rounded-lg hover:bg-[#C0272D]/10 transition-colors"
                          >
                            <FileText size={13} /> Invoice
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <select value={o.order_status} onClick={e => e.stopPropagation()}
                            onChange={e => updateStatus(o.id, e.target.value)}
                            disabled={updatingId === o.id}
                            className="text-xs px-2 py-1 rounded-lg border border-gray-200 bg-white cursor-pointer focus:outline-none">
                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && <div className="p-8 text-center text-charcoal/30">No orders found</div>}
              </div>
            )}
          </div>

          {/* Order Detail panel */}
          {selected && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-playfair font-semibold text-charcoal">Order Details</h3>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setInvoiceOrder(selected)}
                    className="flex items-center gap-1 text-xs font-semibold text-[#C0272D] hover:text-[#9e1f25] px-2 py-1 rounded-lg hover:bg-[#C0272D]/10 transition-colors">
                    <FileText size={13} /> Invoice
                  </button>
                  <button onClick={() => setSelected(null)} className="text-charcoal/30 hover:text-charcoal text-lg px-1">×</button>
                </div>
              </div>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between"><span className="text-charcoal/50">Order #</span><span className="font-semibold text-[#C0272D]">{selected.order_number}</span></div>
                <div className="flex justify-between"><span className="text-charcoal/50">Customer</span><span className="font-semibold">{selected.customer_name}</span></div>
                <div className="flex justify-between"><span className="text-charcoal/50">Phone</span><span>{selected.whatsapp_number || selected.customer_phone}</span></div>
                <div className="flex justify-between"><span className="text-charcoal/50">Type</span><span className="capitalize">{selected.order_type}</span></div>
                {selected.order_type === 'preorder' && selected.arrival_date && (
                  <>
                    <div className="flex justify-between"><span className="text-charcoal/50">Arrival</span><span className="font-semibold">{selected.arrival_date} {selected.arrival_time}</span></div>
                    <div className="flex justify-between"><span className="text-charcoal/50">Guests</span><span className="font-semibold">{selected.guests}</span></div>
                  </>
                )}
                <div className="flex justify-between"><span className="text-charcoal/50">Payment</span><span className="capitalize">{selected.payment_method}</span></div>
                <div className="flex justify-between">
                  <span className="text-charcoal/50">Pay Status</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${selected.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {selected.payment_status ?? 'pending'}
                  </span>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-3 mb-3">
                <div className="text-xs font-semibold text-charcoal/50 mb-2">ITEMS</div>
                {Array.isArray(selected.items) && selected.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm py-1">
                    <span className="text-charcoal/70">{item.name} × {item.qty}</span>
                    <span className="font-semibold">Rs.{item.price * item.qty}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold text-base border-t border-gray-100 pt-2">
                <span>Total</span><span className="text-[#C0272D]">Rs.{selected.subtotal}</span>
              </div>
              {selected.special_instructions && (
                <div className="mt-3 bg-offwhite rounded-xl p-3 text-xs text-charcoal/60">
                  <span className="font-semibold">Note: </span>{selected.special_instructions}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
