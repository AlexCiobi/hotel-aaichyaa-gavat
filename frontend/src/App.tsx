import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { LanguageProvider } from './context/LanguageContext'
import Nav from './components/Nav'
import Footer from './components/Footer'
import WhatsAppFloat from './components/WhatsAppFloat'
import Home from './pages/Home'
import Menu from './pages/Menu'
import Order from './pages/Order'
import Reservation from './pages/Reservation'
import Offers from './pages/Offers'
import Contact from './pages/Contact'

function AppRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/order" element={<Order />} />
        <Route path="/reservation" element={<Reservation />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <div className="min-h-screen flex flex-col bg-cream">
        <Nav />
        <main className="flex-1">
          <AppRoutes />
        </main>
        <Footer />
        <WhatsAppFloat />
      </div>
    </LanguageProvider>
  )
}
