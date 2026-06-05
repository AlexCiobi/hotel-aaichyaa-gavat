import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { LanguageProvider } from './context/LanguageContext'
import { AuthProvider } from './context/AuthContext'
import { AdminProvider } from './context/AdminContext'
import Nav from './components/Nav'
import Footer from './components/Footer'
import WhatsAppFloat from './components/WhatsAppFloat'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import Home from './pages/Home'
import Menu from './pages/Menu'
import Order from './pages/Order'
import Reservation from './pages/Reservation'
import Offers from './pages/Offers'
import Contact from './pages/Contact'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import Profile from './pages/auth/Profile'
import WaiterLogin from './pages/waiter/WaiterLogin'
import WaiterPortal from './pages/waiter/WaiterPortal'
import KitchenLogin from './pages/kitchen/KitchenLogin'
import KitchenDisplay from './pages/kitchen/KitchenDisplay'
import AdminLogin from './pages/admin/AdminLogin'
import AdminLayout from './pages/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import OrdersAdmin from './pages/admin/OrdersAdmin'
import ReservationsAdmin from './pages/admin/ReservationsAdmin'
import MenuAdmin from './pages/admin/MenuAdmin'
import TablesAdmin from './pages/admin/TablesAdmin'
import CustomersAdmin from './pages/admin/CustomersAdmin'
import OffersAdmin from './pages/admin/OffersAdmin'
import SettingsAdmin from './pages/admin/SettingsAdmin'

function MainApp() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')
  const isWaiter = location.pathname.startsWith('/waiter')
  const isKitchen = location.pathname.startsWith('/kitchen')

  if (isWaiter) {
    return (
      <Routes>
        <Route path="/waiter/login" element={<WaiterLogin />} />
        <Route path="/waiter" element={<WaiterPortal />} />
      </Routes>
    )
  }

  if (isKitchen) {
    return (
      <Routes>
        <Route path="/kitchen/login" element={<KitchenLogin />} />
        <Route path="/kitchen" element={<KitchenDisplay />} />
      </Routes>
    )
  }

  if (isAdmin) {
    return (
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<OrdersAdmin />} />
          <Route path="reservations" element={<ReservationsAdmin />} />
          <Route path="menu" element={<MenuAdmin />} />
          <Route path="tables" element={<TablesAdmin />} />
          <Route path="customers" element={<CustomersAdmin />} />
          <Route path="offers" element={<OffersAdmin />} />
          <Route path="settings" element={<SettingsAdmin />} />
        </Route>
      </Routes>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Nav />
      <main className="flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/order" element={<Order />} />
            <Route path="/reservation" element={<Reservation />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Signup />} />
            <Route path="/auth/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  )
}

export default function App() {
  return (
    <AdminProvider>
      <AuthProvider>
        <LanguageProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: { background: '#1A1A1A', color: '#fff', borderRadius: '12px', fontSize: '14px', fontWeight: '500' },
              success: { iconTheme: { primary: '#C0272D', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
          <MainApp />
        </LanguageProvider>
      </AuthProvider>
    </AdminProvider>
  )
}
