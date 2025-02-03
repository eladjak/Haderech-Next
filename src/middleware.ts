/**
 * @file middleware.ts
 * @description Middleware for handling authentication and protected routes
 */

import { createServerClient } from '@/lib/supabase-server'
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
 * Middleware to handle authentication and authorization.
 * 
 * @param {NextRequest} request - The incoming request
 * @returns {Promise<NextResponse>} The response or redirect
 */
export async function middleware(request: NextRequest) {
  // Create a response object that we can modify
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create Supabase client
  const supabase = createServerClient({
    get(name: string) {
      return request.cookies.get(name)?.value
    },
    set(name: string, value: string, options: { path: string; maxAge: number }) {
      // Convert server runtime cookies to response cookies
      response = NextResponse.next({
        request: {
          headers: request.headers,
        },
      })
      response.cookies.set(name, value, options)
      return response
    },
    remove(name: string, options: { path: string }) {
      response = NextResponse.next({
        request: {
          headers: request.headers,
        },
      })
      response.cookies.delete(name)
      return response
    },
  })

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
    return response
  }

  // Protect private routes
  if (!session) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Continue to protected route
  return response
}

/**
 * Define which routes use this middleware.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes that don't require authentication
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/public).*)',
  ],
} 