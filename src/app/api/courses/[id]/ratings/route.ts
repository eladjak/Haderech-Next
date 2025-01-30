/**
 * @file courses/[id]/ratings/route.ts
 * @description API routes for managing course ratings. Provides endpoints for retrieving and submitting ratings.
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
 * Retrieves all ratings for a specific course.
 * 
 * @param {Request} request - The incoming request object
 * @param {RouteParams} params - Route parameters containing the course ID
 * @returns {Promise<NextResponse>} JSON response containing the course ratings or error message
 * 
 * @example Response
 * ```json
 * [
 *   {
 *     "id": "rating1",
 *     "rating": 5,
 *     "review": "Great course!",
 *     "created_at": "2024-01-01T12:00:00Z",
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
        user:profiles!user_id (
          id,
          name,
          avatar_url
        )
      `)
      .eq('course_id', params.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching ratings:', error)
      return NextResponse.json(
        { error: 'Failed to fetch ratings' },
        { status: 500 }
      )
    }

    return NextResponse.json(ratings)
  } catch (error) {
    console.error('Ratings GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/courses/[id]/ratings
 * 
 * Submits a new rating for a course. Users can only rate courses they are enrolled in.
 * 
 * @requires Authentication
 * @requires Course enrollment
 * 
 * @param {Request} request - The incoming request object
 * @param {RouteParams} params - Route parameters containing the course ID
 * @returns {Promise<NextResponse>} JSON response containing the new rating or error message
 * 
 * @example Request Body
 * ```json
 * {
 *   "rating": 5,
 *   "review": "Excellent course content and instruction!"
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
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify course enrollment
    const { data: enrollment } = await supabase
      .from('course_enrollments')
      .select('id')
      .eq('course_id', params.id)
      .eq('user_id', session.user.id)
      .single()

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Must be enrolled to rate course' },
        { status: 403 }
      )
    }

    const { rating, review } = await request.json()

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Check for existing rating
    const { data: existingRating } = await supabase
      .from('course_ratings')
      .select('id')
      .eq('course_id', params.id)
      .eq('user_id', session.user.id)
      .single()

    if (existingRating) {
      return NextResponse.json(
        { error: 'User has already rated this course' },
        { status: 400 }
      )
    }

    // Create rating
    const { data: newRating, error } = await supabase
      .from('course_ratings')
      .insert({
        course_id: params.id,
        user_id: session.user.id,
        rating,
        review
      })
      .select(`
        *,
        user:profiles!user_id (
          id,
          name,
          avatar_url
        )
      `)
      .single()

    if (error) {
      console.error('Error creating rating:', error)
      return NextResponse.json(
        { error: 'Failed to create rating' },
        { status: 500 }
      )
    }

    return NextResponse.json(newRating)
  } catch (error) {
    console.error('Ratings POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/courses/[id]/ratings
 * 
 * Deletes a user's rating for a course. Users can only delete their own ratings.
 * 
 * @requires Authentication
 * 
 * @param {Request} request - The incoming request object
 * @param {RouteParams} params - Route parameters containing the course ID
 * @returns {Promise<NextResponse>} JSON response indicating success or error message
 */
export async function DELETE(request: Request, { params }: RouteParams) {
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
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Delete rating
    const { error } = await supabase
      .from('course_ratings')
      .delete()
      .eq('course_id', params.id)
      .eq('user_id', session.user.id)

    if (error) {
      console.error('Error deleting rating:', error)
      return NextResponse.json(
        { error: 'Failed to delete rating' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Rating deleted successfully' })
  } catch (error) {
    console.error('Ratings DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 