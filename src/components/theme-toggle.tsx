/**
 * ThemeToggle Component
 * 
 * A button component that toggles between light and dark themes.
 * Uses next-themes for theme management.
 */

'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          בהיר
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          כהה
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          מערכת
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 