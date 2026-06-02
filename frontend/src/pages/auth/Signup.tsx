import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import toast from 'react-hot-toast'
import type { Language } from '../../lib/types'

const LANG_OPTIONS: { code: Language; native: string }[] = [
  { code: 'mr', native: 'मराठी' },
  { code: 'hi', native: 'हिंदी' },
  { code: 'en', native: 'English' },
  { code: 'kn', native: 'ಕನ್ನಡ' },
]

export default function Signup() {
  const { signUp } = useAuth()
  const { setLanguage } = useLanguage()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [langPref, setLangPref] = useState<Language>('mr')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!fullName.trim()) errs.fullName = 'Full name is required'
    if (!whatsapp.trim() || whatsapp.replace(/\D/g, '').length < 10) errs.whatsapp = 'Valid 10-digit number required'
    if (!email.trim() || !email.includes('@')) errs.email = 'Valid email required'
    if (password.length < 6) errs.password = 'Password must be at least 6 characters'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    const { error } = await signUp(email, password, {
      full_name: fullName,
      whatsapp_number: '+91' + whatsapp.replace(/\D/g, '').slice(-10),
      language_preference: langPref,
    })
    setLoading(false)
    if (error) {
      toast.error(error)
    } else {
      setLanguage(langPref)
      toast.success('Account created! Welcome to Thali House.')
      navigate('/')
    }
  }

  return (
    <motion.div
      initial={false} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
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
          <p className="text-charcoal/50 text-sm mt-2">Create your account</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h1 className="font-playfair font-bold text-2xl text-charcoal mb-6">Sign Up</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-charcoal mb-1.5">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm bg-offwhite focus:outline-none transition-colors ${errors.fullName ? 'border-red-400' : 'border-charcoal/20 focus:border-saffron/60'}`} />
              </div>
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-charcoal mb-1.5">WhatsApp Number</label>
              <div className="flex gap-2">
                <span className="bg-offwhite border border-charcoal/20 px-3 py-3 rounded-xl text-sm text-charcoal/60 font-semibold flex-shrink-0 flex items-center gap-1">
                  <Phone size={14} /> +91
                </span>
                <input type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)}
                  placeholder="XXXXXXXXXX"
                  className={`flex-1 px-4 py-3 rounded-xl border text-sm bg-offwhite focus:outline-none transition-colors ${errors.whatsapp ? 'border-red-400' : 'border-charcoal/20 focus:border-saffron/60'}`} />
              </div>
              {errors.whatsapp && <p className="text-red-500 text-xs mt-1">{errors.whatsapp}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-charcoal mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm bg-offwhite focus:outline-none transition-colors ${errors.email ? 'border-red-400' : 'border-charcoal/20 focus:border-saffron/60'}`} />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-charcoal mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
                <input type={showPassword ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters"
                  className={`w-full pl-10 pr-10 py-3 rounded-xl border text-sm bg-offwhite focus:outline-none transition-colors ${errors.password ? 'border-red-400' : 'border-charcoal/20 focus:border-saffron/60'}`} />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-charcoal mb-2">Language Preference</label>
              <div className="grid grid-cols-4 gap-2">
                {LANG_OPTIONS.map(({ code, native }) => (
                  <button key={code} type="button" onClick={() => setLangPref(code)}
                    className={`py-2.5 rounded-xl text-xs font-semibold text-center transition-all duration-200 ${langPref === code ? 'bg-saffron text-white shadow-md shadow-saffron/25' : 'bg-offwhite text-charcoal/60 hover:bg-saffron/10 hover:text-saffron'}`}>
                    {native}
                  </button>
                ))}
              </div>
            </div>

            <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading}
              className="w-full bg-saffron hover:bg-orange-600 disabled:bg-saffron/60 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-saffron/25 transition-all duration-200 mt-2">
              {loading ? 'Creating account...' : 'Create Account'}
            </motion.button>
          </form>

          <p className="text-center text-sm text-charcoal/50 mt-6">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-saffron font-semibold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </motion.div>
  )
}
