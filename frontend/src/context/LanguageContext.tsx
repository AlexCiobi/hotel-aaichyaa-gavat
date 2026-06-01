import React, { createContext, useContext, useState, useCallback } from 'react'
import type { Language } from '../lib/types'
import { translations } from '../lib/translations'

interface LanguageContextValue {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('mr')

  const t = useCallback(
    (key: string): string => {
      const langMap = translations[language]
      if (langMap && key in langMap) {
        return langMap[key]
      }
      // Fallback to English
      const enMap = translations['en']
      if (enMap && key in enMap) {
        return enMap[key]
      }
      return key
    },
    [language]
  )

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return ctx
}
