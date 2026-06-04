import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { useAdmin } from '../../context/AdminContext'
import toast from 'react-hot-toast'

export default function AdminLogin() {
  const { adminLogin } = useAdmin()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await adminLogin(email, password)
    setLoading(false)
    if (error) { toast.error(error) } else { toast.success('Welcome, Admin!'); navigate('/admin') }
  }

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center px-4">
      <motion.div initial={false} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#C0272D] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#C0272D]/30">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="font-playfair font-bold text-2xl text-white">Admin Panel</h1>
          <p className="text-white/40 text-sm mt-1">Hotel Aaichyaa Gavat — Management</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-1.5">Admin Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="admin@hotelaaichyaagavat.com" required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-[#C0272D]/60 focus:outline-none text-white placeholder:text-white/30 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input type={showPassword ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-[#C0272D]/60 focus:outline-none text-white placeholder:text-white/30 text-sm" />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading}
              className="w-full bg-[#C0272D] hover:bg-[#9e1f25] disabled:bg-[#C0272D]/50 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#C0272D]/20 transition-all duration-200 mt-4">
              {loading ? 'Signing in...' : 'Sign In to Admin Panel'}
            </motion.button>
          </form>
        </div>
        <p className="text-center text-white/20 text-xs mt-6">Restricted to authorised staff only.</p>
      </motion.div>
    </div>
  )
}
