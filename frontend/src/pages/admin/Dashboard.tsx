import { useState, useEffect } from 'react'
import { ShoppingBag, Calendar, TrendingUp, Users, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Stats {
  todayOrders: number
  todayRevenue: number
  activeReservations: number
  totalCustomers: number
  topItem: string
}

interface RecentOrder {
  id: string
  order_number: string
  customer_name: string
  order_status: string
  subtotal: number
  created_at: string
}

interface TableStatus {
  id: string
  table_number: string
  status: string
  zone: string
}

function StatCard({ icon: Icon, label, value, sub, color }: { icon: React.ElementType; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
      <div className="font-bold text-2xl text-charcoal">{value}</div>
      <div className="text-sm text-charcoal/50 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-charcoal/30 mt-1">{sub}</div>}
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ todayOrders: 0, todayRevenue: 0, activeReservations: 0, totalCustomers: 0, topItem: '—' })
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [tables, setTables] = useState<TableStatus[]>([])
  const [weeklyData, setWeeklyData] = useState<{ day: string; revenue: number }[]>([])

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]

    // Today's orders
    supabase.from('orders').select('id,order_number,customer_name,order_status,subtotal,created_at')
      .gte('created_at', today + 'T00:00:00').order('created_at', { ascending: false })
      .then(({ data }) => {
        const orders = data ?? []
        const revenue = orders.reduce((s, o) => s + (o.subtotal || 0), 0)
        setStats(prev => ({ ...prev, todayOrders: orders.length, todayRevenue: revenue }))
        setRecentOrders(orders.slice(0, 10))
      })

    // Active reservations today
    supabase.from('reservations').select('id', { count: 'exact' })
      .eq('date', today).neq('status', 'cancelled')
      .then(({ count }) => setStats(prev => ({ ...prev, activeReservations: count ?? 0 })))

    // Total customers
    supabase.from('users').select('id', { count: 'exact' })
      .then(({ count }) => setStats(prev => ({ ...prev, totalCustomers: count ?? 0 })))

    // Tables
    supabase.from('restaurant_tables').select('id,table_number,status,zone')
      .order('table_number')
      .then(({ data }) => setTables(data ?? []))

    // Weekly revenue (last 7 days)
    const days: { day: string; revenue: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      days.push({ day: d.toLocaleDateString('en-IN', { weekday: 'short' }), revenue: 0 })
    }
    supabase.from('orders').select('subtotal,created_at')
      .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString())
      .then(({ data }) => {
        const filled = [...days]
        data?.forEach(o => {
          const d = new Date(o.created_at).toLocaleDateString('en-IN', { weekday: 'short' })
          const idx = filled.findIndex(x => x.day === d)
          if (idx !== -1) filled[idx].revenue += o.subtotal || 0
        })
        setWeeklyData(filled)
      })
  }, [])

  const statusColor: Record<string, string> = {
    available: 'bg-green-100 text-green-700',
    occupied: 'bg-red-100 text-red-600',
    reserved: 'bg-[#C0272D]/10 text-[#C0272D]',
    maintenance: 'bg-gray-100 text-gray-500',
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="font-playfair font-bold text-2xl text-charcoal">Dashboard</h1>
        <p className="text-charcoal/50 text-sm">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={ShoppingBag} label="Today's Orders" value={stats.todayOrders} color="bg-[#C0272D]" />
        <StatCard icon={TrendingUp} label="Today's Revenue" value={`₹${stats.todayRevenue}`} color="bg-green-500" />
        <StatCard icon={Calendar} label="Active Reservations" value={stats.activeReservations} sub="today" color="bg-maroon" />
        <StatCard icon={Users} label="Total Customers" value={stats.totalCustomers} color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Weekly Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-charcoal mb-4">Weekly Revenue</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => [`₹${v}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#C0272D" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tables Overview */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-charcoal mb-4">Tables Status</h2>
          <div className="grid grid-cols-4 gap-1.5">
            {tables.map(t => (
              <div key={t.id}
                className={`py-2 rounded-lg text-xs font-bold text-center ${statusColor[t.status] ?? 'bg-gray-100 text-gray-500'}`}>
                {t.table_number}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {Object.entries(statusColor).map(([s, cls]) => (
              <span key={s} className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>{s}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-charcoal">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Order #', 'Customer', 'Status', 'Amount', 'Time'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-charcoal/50 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-charcoal/30 text-sm">No orders today</td></tr>
              ) : recentOrders.map(o => (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-[#C0272D]">{o.order_number}</td>
                  <td className="px-4 py-3 text-charcoal">{o.customer_name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      o.order_status === 'delivered' ? 'bg-green-100 text-green-700' :
                      o.order_status === 'cancelled' ? 'bg-red-100 text-red-500' :
                      'bg-[#C0272D]/10 text-[#C0272D]'}`}>
                      {o.order_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold">₹{o.subtotal}</td>
                  <td className="px-4 py-3 text-charcoal/50">{new Date(o.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
