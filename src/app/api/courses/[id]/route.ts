/**
 * @file courses/[id]/route.ts
 * @description API routes for managing individual courses. Provides endpoints for retrieving,
 * updating, and deleting specific courses. Includes authentication and authorization checks.
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
 * GET /api/courses/[id]
 * 
 * Retrieves detailed information about a specific course, including instructor details,
 * lessons, and ratings.
 * 
 * @param {Request} request - The incoming request object
 * @param {RouteParams} params - Route parameters containing the course ID
 * @returns {Promise<NextResponse>} JSON response containing the course details or error message
 * 
 * @example Response
 * ```json
 * {
 *   "id": "123",
 *   "title": "Course Title",
 *   "description": "Course Description",
 *   "instructor": {
 *     "name": "John Doe",
 *     "avatar_url": "https://...",
 *     "bio": "Instructor bio"
 *   },
 *   "lessons": [
 *     {
 *       "id": "lesson1",
 *       "title": "Lesson 1",
 *       "content": { ... }
 *     }
 *   ],
 *   "ratings": [
 *     {
 *       "rating": 5,
 *       "review": "Great course!",
 *       "user": {
 *         "name": "Jane Doe",
 *         "avatar_url": "https://..."
 *       }
 *     }
 *   ]
 * }
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
    
    const { data: course, error } = await supabase
      .from('courses')
      .select(`
        *,
        instructor:profiles(name, avatar_url, bio),
        lessons:lessons(
          *,
          content:lesson_content(*)
        ),
        ratings:course_ratings(
          rating,
          review,
          created_at,
          user:profiles(name, avatar_url)
        )
      `)
      .eq('id', params.id)
      .single()
    
    if (error) throw error
    if (!course) {
      return NextResponse.json(
        { error: 'קורס לא נמצא' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(course)
  } catch (error) {
    console.error('Error fetching course:', error)
    return NextResponse.json(
      { error: 'שגיאה בטעינת הקורס' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/courses/[id]
 * 
 * Updates a specific course. Only the course instructor can update the course.
 * 
 * @requires Authentication
 * @requires Authorization: Course instructor only
 * 
 * @param {Request} request - The incoming request object
 * @param {RouteParams} params - Route parameters containing the course ID
 * @returns {Promise<NextResponse>} JSON response containing the updated course or error message
 * 
 * @example Request Body
 * ```json
 * {
 *   "title": "Updated Title",
 *   "description": "Updated Description",
 *   "level": "intermediate",
 *   "duration": "12 hours",
 *   "price": 129.99,
 *   "thumbnail_url": "https://...",
 *   "topics": ["updated-topic"],
 *   "requirements": ["updated-req"],
 *   "status": "published"
 * }
 * ```
 */
export async function PATCH(request: Request, { params }: RouteParams) {
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
        { error: 'יש להתחבר כדי לערוך קורס' },
        { status: 401 }
      )
    }
    
    // Verify course instructor
    const { data: course } = await supabase
      .from('courses')
      .select('instructor_id')
      .eq('id', params.id)
      .single()
    
    if (!course || course.instructor_id !== session.user.id) {
      return NextResponse.json(
        { error: 'אין הרשאה לערוך קורס זה' },
        { status: 403 }
      )
    }
    
    const {
      title,
      description,
      level,
      duration,
      price,
      thumbnail_url,
      topics,
      requirements,
      status
    } = await request.json()
    
    const { data: updatedCourse, error } = await supabase
      .from('courses')
      .update({
        title,
        description,
        level,
        duration,
        price,
        thumbnail_url,
        topics,
        requirements,
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json(updatedCourse)
  } catch (error) {
    console.error('Error updating course:', error)
    return NextResponse.json(
      { error: 'שגיאה בעדכון הקורס' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/courses/[id]
 * 
 * Deletes a specific course. Only the course instructor or an admin can delete the course.
 * 
 * @requires Authentication
 * @requires Authorization: Course instructor or admin role
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
        { error: 'יש להתחבר כדי למחוק קורס' },
        { status: 401 }
      )
    }
    
    // Verify course instructor or admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()
    
    const { data: course } = await supabase
      .from('courses')
      .select('instructor_id')
      .eq('id', params.id)
      .single()
    
    if (!course || (course.instructor_id !== session.user.id && profile?.role !== 'admin')) {
      return NextResponse.json(
        { error: 'אין הרשאה למחוק קורס זה' },
        { status: 403 }
      )
    }
    
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', params.id)
    
    if (error) throw error
    
    return NextResponse.json({ message: 'הקורס נמחק בהצלחה' })
  } catch (error) {
    console.error('Error deleting course:', error)
    return NextResponse.json(
      { error: 'שגיאה במחיקת הקורס' },
      { status: 500 }
    )
  }
} 