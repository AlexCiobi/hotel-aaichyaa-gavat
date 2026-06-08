import React, { createContext, useContext, useState, useEffect } from 'react'

interface AdminSession {
  email: string
  name: string
  role: string
  loggedInAt: number
}

interface AdminContextValue {
  adminSession: AdminSession | null
  adminLogin: (email: string, password: string) => Promise<{ error: string | null }>
  adminLogout: () => void
  isAdmin: boolean
}

const STORAGE_KEY = 'th_admin_session'
const SESSION_TTL = 8 * 60 * 60 * 1000 // 8 hours

const AdminContext = createContext<AdminContextValue | null>(null)

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed: AdminSession = JSON.parse(stored)
        if (Date.now() - parsed.loggedInAt < SESSION_TTL) {
          setAdminSession(parsed)
        } else {
          localStorage.removeItem(STORAGE_KEY)
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  const adminLogin = async (email: string, password: string) => {
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@aaichyaagavat.com'
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'AaichyaaGavat@2024'

    if (email !== adminEmail || password !== adminPassword) {
      return { error: 'Invalid admin credentials' }
    }

    const session: AdminSession = {
      email,
      name: 'Admin',
      role: 'admin',
      loggedInAt: Date.now(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    setAdminSession(session)
    return { error: null }
  }

  const adminLogout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setAdminSession(null)
  }

  return (
    <AdminContext.Provider value={{ adminSession, adminLogin, adminLogout, isAdmin: !!adminSession }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin(): AdminContextValue {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider')
  return ctx
}
