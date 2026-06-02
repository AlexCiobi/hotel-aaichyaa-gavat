import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Session, User } from '@supabase/supabase-js'

export interface CustomerProfile {
  id: string
  auth_id: string
  full_name: string
  email: string
  whatsapp_number: string
  phone: string
  language_preference: 'mr' | 'hi' | 'en' | 'kn'
  total_orders: number
  loyalty_points: number
  created_at: string
}

interface AuthContextValue {
  session: Session | null
  user: User | null
  profile: CustomerProfile | null
  loading: boolean
  signUp: (email: string, password: string, data: SignUpData) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

interface SignUpData {
  full_name: string
  whatsapp_number: string
  language_preference: 'mr' | 'hi' | 'en' | 'kn'
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (authUser: User) => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authUser.id)
      .single()
    setProfile(data ?? null)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  const signUp = async (email: string, password: string, data: SignUpData) => {
    const { data: authData, error } = await supabase.auth.signUp({ email, password })
    if (error) return { error: error.message }
    if (authData.user) {
      await supabase.from('users').insert({
        auth_id: authData.user.id,
        email,
        full_name: data.full_name,
        phone: data.whatsapp_number,
        whatsapp_number: data.whatsapp_number,
        language_preference: data.language_preference,
        total_orders: 0,
        loyalty_points: 0,
      })
    }
    return { error: null }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
  }

  const refreshProfile = async () => {
    if (user) await fetchProfile(user)
  }

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
