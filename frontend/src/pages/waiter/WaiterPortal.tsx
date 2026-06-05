import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { ChefHat, LogOut, Search, ShoppingCart, Minus, Plus, Trash2, Send, X, Clock, CheckCircle, AlertCircle } from 'lucide-react'

interface Table {
  id: string
  table_number: string
  capacity: number
  zone: string
  status: string
}

interface MenuItem {
  id: string
  category: string
  price: number
  is_veg: boolean
  is_available: boolean
  name_en: string
  name_mr: string
}

interface CartItem {
  menuItem: MenuItem
  quantity: number
}

interface OrderRecord {
  id: string
  order_number: string
  customer_name: string
  order_status: string
  table_id: string | null
  items: { name: string; qty: number; price: number }[]
  subtotal: number
  total: number
  created_at: string
  special_instructions: string
}

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'thali', label: 'Thali' },
  { key: 'starters', label: 'Starters' },
  { key: 'main_course', label: 'Main Course' },
  { key: 'breads', label: 'Breads' },
  { key: 'rice', label: 'Rice' },
  { key: 'beverages', label: 'Beverages' },
  { key: 'snacks', label: 'Snacks' },
]

function statusColor(s: string) {
  const map: Record<string, string> = {
    placed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    confirmed: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    preparing: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    ready: 'bg-green-500/10 text-green-400 border-green-500/20',
    delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  }
  return map[s] ?? 'bg-white/5 text-white/50 border-white/10'
}

export default function WaiterPortal() {
  const navigate = useNavigate()
  const waiterData = JSON.parse(localStorage.getItem('th_waiter') || '{}')
  const waiterName = waiterData.name || 'Waiter'

  const [tables, setTables] = useState<Table[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [instructions, setInstructions] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [view, setView] = useState<'tables' | 'menu' | 'orders'>('tables')
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchData = useCallback(async () => {
    const [{ data: t }, { data: m }, { data: o }] = await Promise.all([
      supabase.from('restaurant_tables').select('*').order('table_number'),
      supabase.from('menu_items').select('*').eq('is_available', true).order('category'),
      supabase.from('orders').select('*').in('order_status', ['placed', 'confirmed', 'preparing', 'ready']).order('created_at', { ascending: false }).limit(50),
    ])
    setTables(t ?? [])
    setMenuItems(m ?? [])
    setOrders(o ?? [])
  }, [])

  useEffect(() => {
    if (!waiterData.loggedInAt) { navigate('/waiter/login'); return }
    fetchData()
  }, [fetchData, navigate, waiterData.loggedInAt])

  // Real-time order updates
  useEffect(() => {
    const channel = supabase
      .channel('waiter-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchData()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchData])

  const filteredMenu = menuItems.filter(item => {
    if (category !== 'all' && item.category !== category) return false
    if (search && !item.name_en.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.menuItem.id === item.id)
      if (existing) return prev.map(c => c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c)
      return [...prev, { menuItem: item, quantity: 1 }]
    })
  }

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(c => c.menuItem.id === id ? { ...c, quantity: Math.max(0, c.quantity + delta) } : c).filter(c => c.quantity > 0))
  }

  const cartTotal = cart.reduce((sum, c) => sum + c.menuItem.price * c.quantity, 0)
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0)

  const submitOrder = async () => {
    if (!selectedTable || cart.length === 0) return
    setSubmitting(true)

    const orderData = {
      customer_name: `Table ${selectedTable.table_number} (${waiterName})`,
      customer_phone: '+910000000000',
      whatsapp_number: '+910000000000',
      order_type: 'dine-in',
      table_id: selectedTable.id,
      items: cart.map(c => ({ id: c.menuItem.id, name: c.menuItem.name_en, qty: c.quantity, price: c.menuItem.price })),
      subtotal: cartTotal,
      total: cartTotal,
      payment_method: 'cod',
      payment_status: 'pending',
      order_status: 'placed',
      special_instructions: instructions || null,
    }

    const { error } = await supabase.from('orders').insert(orderData)

    if (error) {
      showToast('Failed to place order: ' + error.message, 'error')
    } else {
      // Mark table as occupied
      await supabase.from('restaurant_tables').update({ status: 'occupied' }).eq('id', selectedTable.id)
      showToast(`Order sent to kitchen for Table ${selectedTable.table_number}!`)
      setCart([])
      setInstructions('')
      setView('orders')
      fetchData()
    }
    setSubmitting(false)
  }

  const logout = () => {
    localStorage.removeItem('th_waiter')
    navigate('/waiter/login')
  }

  const tableForId = (id: string | null) => tables.find(t => t.id === id)

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold shadow-2xl animate-[slideIn_0.3s_ease] ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-[#0F0F0F]/95 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#C0272D] flex items-center justify-center">
              <ChefHat size={18} />
            </div>
            <div>
              <h1 className="font-bold text-sm">Waiter Portal</h1>
              <p className="text-white/30 text-[11px]">{waiterName}</p>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-xs">
            <LogOut size={14} /> Logout
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-t border-white/5">
          {(['tables', 'menu', 'orders'] as const).map(tab => (
            <button key={tab} onClick={() => setView(tab)}
              className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors relative ${view === tab ? 'text-[#C0272D]' : 'text-white/30 hover:text-white/50'}`}>
              {tab === 'menu' && cartCount > 0 && (
                <span className="absolute top-1.5 right-1/4 w-4 h-4 bg-[#C0272D] rounded-full text-[9px] flex items-center justify-center font-bold">{cartCount}</span>
              )}
              {tab}
              {view === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C0272D]" />}
            </button>
          ))}
        </div>
      </header>

      <main className="p-4 pb-32">
        {/* ============ TABLES VIEW ============ */}
        {view === 'tables' && (
          <div>
            <h2 className="text-lg font-bold mb-4">Select a Table</h2>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {tables.map(table => {
                const isSelected = selectedTable?.id === table.id
                const occupied = table.status === 'occupied'
                const reserved = table.status === 'reserved'
                return (
                  <button key={table.id}
                    onClick={() => { setSelectedTable(table); setView('menu') }}
                    className={`relative aspect-square rounded-xl border-2 flex flex-col items-center justify-center gap-0.5 transition-all text-center
                      ${isSelected ? 'border-[#C0272D] bg-[#C0272D]/10 scale-105' : occupied ? 'border-orange-500/30 bg-orange-500/5' : reserved ? 'border-purple-500/30 bg-purple-500/5' : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'}`}>
                    <span className="text-lg font-bold">{table.table_number}</span>
                    <span className="text-[9px] text-white/30">{table.capacity} seats</span>
                    {occupied && <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full" />}
                    {reserved && <span className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full" />}
                  </button>
                )
              })}
            </div>
            <div className="flex gap-4 mt-4 text-[10px] text-white/30">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500/50 rounded-full" /> Available</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-orange-500 rounded-full" /> Occupied</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-purple-500 rounded-full" /> Reserved</span>
            </div>
          </div>
        )}

        {/* ============ MENU VIEW ============ */}
        {view === 'menu' && (
          <div>
            {selectedTable && (
              <div className="flex items-center gap-2 mb-4 bg-[#C0272D]/10 border border-[#C0272D]/20 rounded-xl px-3 py-2">
                <span className="text-[#C0272D] font-bold text-sm">Table {selectedTable.table_number}</span>
                <span className="text-white/30 text-xs">({selectedTable.capacity} seats, {selectedTable.zone})</span>
                <button onClick={() => { setSelectedTable(null); setView('tables') }} className="ml-auto text-white/30 hover:text-white/60">
                  <X size={14} />
                </button>
              </div>
            )}

            {!selectedTable && (
              <div className="text-center py-12 text-white/30">
                <p className="text-sm mb-2">Please select a table first</p>
                <button onClick={() => setView('tables')} className="text-[#C0272D] text-sm font-semibold hover:underline">Go to Tables</button>
              </div>
            )}

            {selectedTable && (
              <>
                {/* Search */}
                <div className="relative mb-3">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search menu..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-[#C0272D]/50 placeholder:text-white/20" />
                </div>

                {/* Categories */}
                <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-hide">
                  {CATEGORIES.map(cat => (
                    <button key={cat.key} onClick={() => setCategory(cat.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${category === cat.key ? 'bg-[#C0272D] text-white' : 'bg-white/5 text-white/40 hover:text-white/60'}`}>
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Menu items */}
                <div className="space-y-1.5">
                  {filteredMenu.map(item => {
                    const inCart = cart.find(c => c.menuItem.id === item.id)
                    return (
                      <div key={item.id} className="flex items-center gap-3 bg-white/[0.03] border border-white/5 rounded-xl px-3 py-2.5 hover:bg-white/[0.05] transition-colors">
                        <div className={`w-2.5 h-2.5 rounded-sm flex-shrink-0 ${item.is_veg ? 'bg-green-500' : 'bg-red-500'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.name_en}</p>
                          <p className="text-xs text-white/30">{item.name_mr}</p>
                        </div>
                        <span className="text-sm font-bold text-[#C0272D] mr-2">Rs.{item.price}</span>
                        {inCart ? (
                          <div className="flex items-center gap-2">
                            <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20">
                              <Minus size={12} />
                            </button>
                            <span className="text-sm font-bold w-4 text-center">{inCart.quantity}</span>
                            <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 rounded-lg bg-[#C0272D] flex items-center justify-center hover:bg-[#a02025]">
                              <Plus size={12} />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => addToCart(item)} className="px-3 py-1.5 rounded-lg bg-[#C0272D]/10 text-[#C0272D] text-xs font-bold hover:bg-[#C0272D]/20 border border-[#C0272D]/20">
                            ADD
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* ============ ORDERS VIEW ============ */}
        {view === 'orders' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Active Orders</h2>
              <button onClick={fetchData} className="text-white/30 hover:text-white/60 text-xs flex items-center gap-1">
                <Clock size={12} /> Refresh
              </button>
            </div>

            {orders.length === 0 && <p className="text-center text-white/20 py-12 text-sm">No active orders</p>}

            <div className="space-y-3">
              {orders.map(order => {
                const t = tableForId(order.table_id)
                return (
                  <div key={order.id} className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="text-[#C0272D] font-bold text-sm">{order.order_number}</span>
                        {t && <span className="ml-2 text-xs text-white/30">Table {t.table_number}</span>}
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${statusColor(order.order_status)}`}>
                        {order.order_status}
                      </span>
                    </div>
                    <div className="space-y-0.5 mb-2">
                      {Array.isArray(order.items) && order.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span className="text-white/50">{item.name} x {item.qty}</span>
                          <span className="text-white/30">Rs.{item.price * item.qty}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <span className="text-xs text-white/20">
                        {new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="font-bold text-sm">Rs.{order.total || order.subtotal}</span>
                    </div>
                    {order.special_instructions && (
                      <div className="mt-2 text-[10px] text-yellow-400/70 bg-yellow-500/5 rounded-lg px-2 py-1 border border-yellow-500/10">
                        Note: {order.special_instructions}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>

      {/* ============ CART BAR (sticky bottom) ============ */}
      {cart.length > 0 && view === 'menu' && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#1A1A1A] border-t border-white/10 p-4 z-30">
          {/* Cart items preview */}
          <div className="max-h-40 overflow-y-auto space-y-1.5 mb-3">
            {cart.map(c => (
              <div key={c.menuItem.id} className="flex items-center gap-2 text-sm">
                <span className="flex-1 truncate text-white/70">{c.menuItem.name_en}</span>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => updateQty(c.menuItem.id, -1)} className="w-5 h-5 rounded bg-white/10 flex items-center justify-center">
                    <Minus size={10} />
                  </button>
                  <span className="text-xs font-bold w-3 text-center">{c.quantity}</span>
                  <button onClick={() => updateQty(c.menuItem.id, 1)} className="w-5 h-5 rounded bg-white/10 flex items-center justify-center">
                    <Plus size={10} />
                  </button>
                </div>
                <span className="text-xs text-white/40 w-14 text-right">Rs.{c.menuItem.price * c.quantity}</span>
                <button onClick={() => updateQty(c.menuItem.id, -c.quantity)} className="text-red-400/50 hover:text-red-400">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>

          {/* Instructions */}
          <input value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="Special instructions..."
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs mb-3 focus:outline-none focus:border-[#C0272D]/40 placeholder:text-white/15" />

          {/* Submit button */}
          <button onClick={submitOrder} disabled={submitting || !selectedTable}
            className="w-full flex items-center justify-center gap-2 bg-[#C0272D] hover:bg-[#a02025] disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors">
            <Send size={16} />
            {submitting ? 'Sending...' : `Send to Kitchen - Rs.${cartTotal}`}
            <span className="ml-1 bg-white/20 text-[11px] px-1.5 py-0.5 rounded-full">{cartCount} items</span>
          </button>
        </div>
      )}
    </div>
  )
}
