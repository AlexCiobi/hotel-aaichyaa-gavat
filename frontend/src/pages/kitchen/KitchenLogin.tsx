import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChefHat } from 'lucide-react'

const KITCHEN_PIN = import.meta.env.VITE_KITCHEN_PIN || '5678'

export default function KitchenLogin() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (pin !== KITCHEN_PIN) { setError('Invalid PIN'); return }
    localStorage.setItem('th_kitchen', JSON.stringify({ loggedInAt: Date.now() }))
    navigate('/kitchen')
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center p-4">
      <form onSubmit={handleLogin} className="w-full max-w-sm bg-[#222] rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#C0272D] flex items-center justify-center">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-xl">Kitchen Display</h1>
            <p className="text-white/40 text-xs">Hotel Aaichyaa Gavat</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-white/60 text-xs font-semibold uppercase tracking-wider block mb-2">Kitchen PIN</label>
            <input
              type="password" value={pin} onChange={e => { setPin(e.target.value); setError('') }}
              placeholder="Enter PIN" maxLength={6}
              className="w-full bg-white/10 text-white rounded-xl px-4 py-3 text-sm border border-white/10 focus:border-[#C0272D] focus:outline-none placeholder:text-white/30 tracking-[0.3em] text-center text-lg"
            />
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button type="submit" className="w-full bg-[#C0272D] text-white font-bold py-3 rounded-xl hover:bg-[#a02025] transition-colors">
            Open Kitchen Display
          </button>
        </div>
      </form>
    </div>
  )
}
