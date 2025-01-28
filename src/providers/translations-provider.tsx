/**
 * TranslationsProvider Component
 * 
 * A provider component that initializes i18next and provides translations to the app.
 * It also handles the initial language setup and direction changes.
 */

'use client'

import { useEffect } from 'react'
import { I18nextProvider } from 'react-i18next'
import i18next from '@/lib/i18n'
import { useTranslations } from '@/hooks/use-translations'

interface TranslationsProviderProps {
  children: React.ReactNode
}

export function TranslationsProvider({ children }: TranslationsProviderProps) {
  const { getDirection } = useTranslations()

  useEffect(() => {
    document.documentElement.dir = getDirection()
  }, [getDirection])

  return <I18nextProvider i18n={i18next}>{children}</I18nextProvider>
} 