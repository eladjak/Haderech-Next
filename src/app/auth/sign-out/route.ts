/**
 * @file route.ts
 * @description Auth sign-out handler for processing user logout
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

/**
 * POST handler for signing out users
 */
export async function POST(request: Request) {
  const cookieStore = cookies()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: { path: string; maxAge: number }) {
          cookieStore.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: { path: string }) {
          cookieStore.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Sign out error:', error)
    return NextResponse.json(
      { error: 'Failed to sign out' },
      { status: 500 }
    )
  }

  return NextResponse.redirect(new URL('/login', request.url))
} 