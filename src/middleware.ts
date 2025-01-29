/**
 * @file middleware.ts
 * @description Middleware for handling authentication and protected routes
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Array of public routes that don't require authentication
 */
const publicRoutes = [
  '/',
  '/login',
  '/signup',
  '/reset-password',
  '/verify-email',
  '/auth/callback',
]

/**
 * Middleware function to handle authentication and protected routes
 * 
 * @param request - The incoming request
 * @returns The response or redirect
 */
export async function middleware(request: NextRequest) {
  try {
    // Create a Supabase client configured to use cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: { path: string; maxAge: number }) {
            request.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: { path: string }) {
            request.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    // Refresh session if expired
    await supabase.auth.getSession()

    // Check if the route is public
    const isPublicRoute = publicRoutes.some(route => 
      request.nextUrl.pathname === route || 
      request.nextUrl.pathname.startsWith('/api/')
    )

    // Get user session
    const { data: { session } } = await supabase.auth.getSession()

    // Allow access to public routes
    if (isPublicRoute) {
      // Redirect logged-in users away from auth pages
      if (session && ['/login', '/signup'].includes(request.nextUrl.pathname)) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      return NextResponse.next()
    }

    // Protect private routes
    if (!session) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Continue to protected route
    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.redirect(new URL('/error', request.url))
  }
}

/**
 * Configure which routes should be processed by this middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
} 