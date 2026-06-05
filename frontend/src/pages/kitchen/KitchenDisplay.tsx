import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { ChefHat, LogOut, Clock, Flame, CheckCircle, Bell, RefreshCw } from 'lucide-react'

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
  order_type: string
}

interface Table {
  id: string
  table_number: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; next: string | null }> = {
  placed: { label: 'NEW', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', next: 'preparing' },
  confirmed: { label: 'CONFIRMED', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', next: 'preparing' },
  preparing: { label: 'COOKING', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', next: 'ready' },
  ready: { label: 'READY', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', next: 'delivered' },
}

function timeSince(dateStr: string) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return `${seconds}s`
  const mins = Math.floor(seconds / 60)
  if (mins < 60) return `${mins}m`
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

export default function KitchenDisplay() {
  const navigate = useNavigate()
  const kitchenData = JSON.parse(localStorage.getItem('th_kitchen') || '{}')
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [tables, setTables] = useState<Table[]>([])
  const [filter, setFilter] = useState<'all' | 'placed' | 'preparing' | 'ready'>('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const prevOrderCountRef = useRef(0)

  const fetchOrders = useCallback(async () => {
    const [{ data: o }, { data: t }] = await Promise.all([
      supabase.from('orders').select('*').in('order_status', ['placed', 'confirmed', 'preparing', 'ready']).order('created_at', { ascending: true }),
      supabase.from('restaurant_tables').select('id, table_number'),
    ])
    const newOrders = o ?? []
    // Play sound on new orders
    if (newOrders.length > prevOrderCountRef.current && prevOrderCountRef.current > 0) {
      try { audioRef.current?.play() } catch {}
    }
    prevOrderCountRef.current = newOrders.length
    setOrders(newOrders)
    setTables(t ?? [])
  }, [])

  useEffect(() => {
    if (!kitchenData.loggedInAt) { navigate('/kitchen/login'); return }
    fetchOrders()
  }, [fetchOrders, navigate, kitchenData.loggedInAt])

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('kitchen-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchOrders])

  // Auto-refresh every 30s as fallback
  useEffect(() => {
    const interval = setInterval(fetchOrders, 30000)
    return () => clearInterval(interval)
  }, [fetchOrders])

  const tableMap = Object.fromEntries(tables.map(t => [t.id, t.table_number]))

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId)
    const { error } = await supabase.from('orders').update({ order_status: newStatus, updated_at: new Date().toISOString() }).eq('id', orderId)
    if (!error) {
      await supabase.from('order_status_history').insert({ order_id: orderId, status: newStatus, changed_by: 'kitchen' })
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, order_status: newStatus } : o).filter(o => newStatus !== 'delivered'))
    }
    setUpdatingId(null)
  }

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.order_status === filter || (filter === 'placed' && o.order_status === 'confirmed'))

  const counts = {
    placed: orders.filter(o => o.order_status === 'placed' || o.order_status === 'confirmed').length,
    preparing: orders.filter(o => o.order_status === 'preparing').length,
    ready: orders.filter(o => o.order_status === 'ready').length,
  }

  const logout = () => {
    localStorage.removeItem('th_kitchen')
    navigate('/kitchen/login')
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Notification sound (silent audio element) */}
      <audio ref={audioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbsGczHjqIxN/RdkMlPlqn0+C9bDQWKnzE5NlzNBEjcLvg13k7FC9stNnTfT8ZMmez08eMKVGUrNnLfjgTMGey0sF+KU6SqNPDey0RI2iy0r16IkuNpNHAdy0QHmGvz7h0H0eIl83AbywOGl+sy694HEaGEwuAbisMGN0qSWz3WsZEz4hAbSmKmBunyC34mgaEzoYAa6gJlpkliW65m0dFzgQAaicHlJYhRia7Z3EgGjYEAaKUGk5LdRSb854JhXDQCAZ+MGUJDYQ==" type="audio/wav" />
      </audio>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C0272D] flex items-center justify-center">
              <ChefHat size={20} />
            </div>
            <div>
              <h1 className="font-bold text-base">Kitchen Display</h1>
              <p className="text-white/20 text-[11px]">Hotel Aaichyaa Gavat</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchOrders} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <RefreshCw size={14} className="text-white/40" />
            </button>
            <button onClick={logout} className="flex items-center gap-1.5 text-white/30 hover:text-white/60 text-xs">
              <LogOut size={14} /> Exit
            </button>
          </div>
        </div>

        {/* Status filter bar */}
        <div className="flex gap-2 px-5 pb-3">
          <button onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${filter === 'all' ? 'bg-white/10 text-white' : 'bg-white/[0.03] text-white/30 hover:text-white/50'}`}>
            All ({orders.length})
          </button>
          <button onClick={() => setFilter('placed')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${filter === 'placed' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/[0.03] text-white/30 hover:text-white/50'}`}>
            <Bell size={12} /> New ({counts.placed})
          </button>
          <button onClick={() => setFilter('preparing')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${filter === 'preparing' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/[0.03] text-white/30 hover:text-white/50'}`}>
            <Flame size={12} /> Cooking ({counts.preparing})
          </button>
          <button onClick={() => setFilter('ready')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${filter === 'ready' ? 'bg-green-500/20 text-green-400' : 'bg-white/[0.03] text-white/30 hover:text-white/50'}`}>
            <CheckCircle size={12} /> Ready ({counts.ready})
          </button>
        </div>
      </header>

      {/* Orders grid */}
      <main className="p-4">
        {filteredOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-white/15">
            <ChefHat size={48} className="mb-4" />
            <p className="text-lg font-bold">No orders right now</p>
            <p className="text-sm mt-1">New orders will appear automatically</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredOrders.map(order => {
            const config = STATUS_CONFIG[order.order_status] ?? STATUS_CONFIG.placed
            const elapsed = timeSince(order.created_at)
            const isNew = order.order_status === 'placed' || order.order_status === 'confirmed'
            const tableName = order.table_id ? tableMap[order.table_id] : null

            return (
              <div key={order.id}
                className={`rounded-2xl border-2 ${config.border} ${config.bg} overflow-hidden transition-all ${isNew ? 'animate-pulse-subtle' : ''}`}>
                {/* Card header */}
                <div className="flex items-center justify-between px-4 pt-3 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base">{order.order_number}</span>
                    {tableName && (
                      <span className="bg-white/10 text-white/60 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        T-{tableName}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={11} className="text-white/20" />
                    <span className={`text-xs font-mono font-bold ${parseInt(elapsed) > 15 && elapsed.includes('m') ? 'text-red-400' : 'text-white/30'}`}>
                      {elapsed}
                    </span>
                  </div>
                </div>

                {/* Status badge */}
                <div className="px-4 pb-2">
                  <span className={`text-[10px] font-black uppercase tracking-wider ${config.color}`}>
                    {config.label}
                  </span>
                  <span className="text-[10px] text-white/20 ml-2 capitalize">{order.order_type}</span>
                </div>

                {/* Items */}
                <div className="px-4 pb-3 space-y-1">
                  {Array.isArray(order.items) && order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-xs font-black">
                        {item.qty}
                      </span>
                      <span className="text-sm font-medium flex-1">{item.name}</span>
                    </div>
                  ))}
                </div>

                {/* Special instructions */}
                {order.special_instructions && (
                  <div className="mx-4 mb-3 text-[11px] text-yellow-400/80 bg-yellow-500/5 rounded-lg px-3 py-1.5 border border-yellow-500/10">
                    {order.special_instructions}
                  </div>
                )}

                {/* Action button */}
                {config.next && (
                  <div className="px-4 pb-4">
                    <button
                      onClick={() => updateStatus(order.id, config.next!)}
                      disabled={updatingId === order.id}
                      className={`w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 ${
                        isNew
                          ? 'bg-[#C0272D] hover:bg-[#a02025] text-white'
                          : order.order_status === 'preparing'
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}>
                      {updatingId === order.id ? 'Updating...' :
                        isNew ? 'Start Cooking' :
                        order.order_status === 'preparing' ? 'Mark Ready' :
                        'Mark Delivered'}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </main>

      <style>{`
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }
        .animate-pulse-subtle { animation: pulse-subtle 2s ease-in-out infinite; }
      `}</style>
    </div>
  )
}
