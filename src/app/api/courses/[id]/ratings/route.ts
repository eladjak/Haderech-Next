/**
 * @file courses/[id]/ratings/route.ts
 * @description API routes for managing course ratings and reviews. Provides endpoints for
 * retrieving course ratings and submitting new ratings. Includes authentication checks
 * and rating validation.
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * GET /api/courses/[id]/ratings
 * 
 * Retrieves all ratings and reviews for a specific course, including user information
 * for each rating.
 * 
 * @param {Request} request - The incoming request object
 * @param {RouteParams} params - Route parameters containing the course ID
 * @returns {Promise<NextResponse>} JSON response containing an array of ratings or error message
 * 
 * @example Response
 * ```json
 * [
 *   {
 *     "rating": 5,
 *     "review": "Great course! Very informative.",
 *     "created_at": "2024-01-20T12:00:00Z",
 *     "user": {
 *       "name": "John Doe",
 *       "avatar_url": "https://..."
 *     }
 *   }
 * ]
 * ```
 */
export async function GET(request: Request, { params }: RouteParams) {
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
    
    const { data: ratings, error } = await supabase
      .from('course_ratings')
      .select(`
        *,
        user:profiles(name, avatar_url)
      `)
      .eq('course_id', params.id)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return NextResponse.json(ratings)
  } catch (error) {
    console.error('Error fetching course ratings:', error)
    return NextResponse.json(
      { error: 'שגיאה בטעינת הדירוגים' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/courses/[id]/ratings
 * 
 * Creates a new rating and review for a course. Users can only rate a course once.
 * Automatically updates the course's average rating after submission.
 * 
 * @requires Authentication
 * 
 * @param {Request} request - The incoming request object
 * @param {RouteParams} params - Route parameters containing the course ID
 * @returns {Promise<NextResponse>} JSON response containing the created rating or error message
 * 
 * @example Request Body
 * ```json
 * {
 *   "rating": 5,
 *   "review": "Excellent course content and presentation!"
 * }
 * ```
 */
export async function POST(request: Request, { params }: RouteParams) {
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
        { error: 'יש להתחבר כדי לדרג קורס' },
        { status: 401 }
      )
    }
    
    // Verify course exists
    const { data: course } = await supabase
      .from('courses')
      .select('id')
      .eq('id', params.id)
      .single()
    
    if (!course) {
      return NextResponse.json(
        { error: 'קורס לא נמצא' },
        { status: 404 }
      )
    }
    
    // Check if user has already rated this course
    const { data: existingRating } = await supabase
      .from('course_ratings')
      .select('id')
      .eq('course_id', params.id)
      .eq('user_id', session.user.id)
      .single()
    
    if (existingRating) {
      return NextResponse.json(
        { error: 'כבר דירגת קורס זה' },
        { status: 400 }
      )
    }
    
    const { rating, review } = await request.json()
    
    // Create new rating
    const { data: newRating, error } = await supabase
      .from('course_ratings')
      .insert({
        rating,
        review,
        course_id: params.id,
        user_id: session.user.id,
        created_at: new Date().toISOString()
      })
      .select(`
        *,
        user:profiles(name, avatar_url)
      `)
      .single()
    
    if (error) throw error
    
    // Update course average rating
    await supabase.rpc('update_course_average_rating', {
      course_id: params.id
    })
    
    return NextResponse.json(newRating)
  } catch (error) {
    console.error('Error creating course rating:', error)
    return NextResponse.json(
      { error: 'שגיאה ביצירת הדירוג' },
      { status: 500 }
    )
  }
} 