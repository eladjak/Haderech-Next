/**
 * @file profile/route.ts
 * @description API routes for managing user profiles. Provides endpoints for retrieving
 * and updating user profile information. Includes authentication checks and profile validation.
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

/**
 * GET /api/profile
 * 
 * Retrieves the current user's profile information.
 * 
 * @requires Authentication
 * 
 * @returns {Promise<NextResponse>} JSON response containing the user profile or error message
 * 
 * @example Response
 * ```json
 * {
 *   "id": "user123",
 *   "name": "John Doe",
 *   "avatar_url": "https://...",
 *   "bio": "Software developer...",
 *   "points": 1000,
 *   "role": "student"
 * }
 * ```
 */
export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )
    
    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return NextResponse.json(
        { error: 'שגיאה בקבלת הפרופיל' },
        { status: 500 }
      )
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error in GET /api/profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/profile
 * 
 * Updates the current user's profile information.
 * 
 * @requires Authentication
 * 
 * @param {Request} request - The incoming request object containing profile updates
 * @returns {Promise<NextResponse>} JSON response containing the updated profile or error message
 * 
 * @example Request Body
 * ```json
 * {
 *   "name": "Updated Name",
 *   "bio": "Updated bio...",
 *   "avatar_url": "https://..."
 * }
 * ```
 */
export async function PATCH(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )
    
    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get profile updates
    const updates = await request.json()
    
    // Validate updates
    const allowedFields = ['name', 'bio', 'avatar_url']
    const invalidFields = Object.keys(updates).filter(field => !allowedFields.includes(field))
    
    if (invalidFields.length > 0) {
      return NextResponse.json(
        { error: `Invalid fields: ${invalidFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Update profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', session.user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating profile:', error)
      return NextResponse.json(
        { error: 'שגיאה בעדכון הפרופיל' },
        { status: 500 }
      )
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error in PATCH /api/profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 