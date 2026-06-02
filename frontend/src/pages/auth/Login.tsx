import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      toast.error(error)
    } else {
      toast.success('Login successful!')
      navigate(from, { replace: true })
    }
  }

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-offwhite flex items-center justify-center px-4 py-20"
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-saffron flex items-center justify-center shadow-lg shadow-saffron/30">
              <span className="text-white font-playfair font-bold text-xl">TH</span>
            </div>
            <span className="font-playfair font-bold text-2xl text-charcoal">
              Thali <span className="text-saffron">House</span>
            </span>
          </Link>
          <p className="text-charcoal/50 text-sm mt-2">Welcome back! Sign in to your account</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h1 className="font-playfair font-bold text-2xl text-charcoal mb-6">Sign In</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-charcoal mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-charcoal/20 focus:border-saffron/60 focus:outline-none text-sm bg-offwhite transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-charcoal mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Your password"
                  required
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-charcoal/20 focus:border-saffron/60 focus:outline-none text-sm bg-offwhite transition-colors"
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading}
              className="w-full bg-saffron hover:bg-orange-600 disabled:bg-saffron/60 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-saffron/25 transition-all duration-200 mt-2">
              {loading ? 'Signing in...' : 'Sign In'}
            </motion.button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-charcoal/10" /></div>
            <div className="relative flex justify-center text-xs text-charcoal/40 bg-white px-3">or</div>
          </div>

          <motion.div whileTap={{ scale: 0.97 }}>
            <Link to="/order"
              className="block w-full text-center border-2 border-charcoal/15 hover:border-saffron/40 text-charcoal/60 hover:text-saffron font-semibold py-3 rounded-xl transition-all duration-200 text-sm">
              Continue as Guest
            </Link>
          </motion.div>

          <p className="text-center text-sm text-charcoal/50 mt-6">
            Don't have an account?{' '}
            <Link to="/auth/signup" className="text-saffron font-semibold hover:underline">Sign Up</Link>
          </p>
        </div>
      </div>
    </motion.div>
  )
}
