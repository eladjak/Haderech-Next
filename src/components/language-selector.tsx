/**
 * LanguageSelector Component
 * 
 * A component that allows users to switch between available languages.
 * It displays the current language and provides a dropdown to select a different one.
 */

'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTranslations } from '@/hooks/use-translations'
import { Languages } from 'lucide-react'

const languages = {
  he: 'עברית',
  en: 'English',
} as const

export function LanguageSelector() {
  const { getCurrentLanguage, setLanguage } = useTranslations()
  const currentLanguage = getCurrentLanguage()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Languages className="h-5 w-5" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(languages).map(([code, name]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => setLanguage(code as keyof typeof languages)}
            className="flex items-center gap-2"
          >
            <span className={currentLanguage === code ? 'font-bold' : ''}>
              {name}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 