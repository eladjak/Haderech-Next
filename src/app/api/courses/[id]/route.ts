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
 * lessons, and enrollment statistics.
 * 
 * @param {Request} request - The incoming request object
 * @param {RouteParams} params - Route parameters containing the course ID
 * @returns {Promise<NextResponse>} JSON response containing course details or error message
 * 
 * @example Response
 * ```json
 * {
 *   "id": "123",
 *   "title": "Course Title",
 *   "description": "Course Description",
 *   "instructor": {
 *     "name": "John Doe",
 *     "avatar_url": "https://..."
 *   },
 *   "lessons": [
 *     {
 *       "id": "lesson1",
 *       "title": "Lesson 1",
 *       "duration": 30
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
        instructor:profiles!instructor_id (
          id,
          name,
          avatar_url,
          bio
        ),
        lessons (
          *,
          progress:lesson_progress (*)
        ),
        ratings:course_ratings (
          *,
          user:profiles!user_id (
            id,
            name,
            avatar_url
          )
        ),
        comments:course_comments (
          *,
          user:profiles!user_id (
            id,
            name,
            avatar_url
          ),
          replies!parent_id (
            *,
            user:profiles!user_id (
              id,
              name,
              avatar_url
            )
          )
        )
      `)
      .eq('id', params.id)
      .single()
    
    if (error) {
      console.error('Error fetching course:', error)
      return NextResponse.json(
        { error: 'Failed to fetch course' },
        { status: 500 }
      )
    }
    
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(course)
  } catch (error) {
    console.error('Course GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/courses/[id]
 * 
 * Updates a course's details. Only the course instructor can update the course.
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
 *   "price": 99.99
 * }
 * ```
 */
export async function PUT(request: Request, { params }: RouteParams) {
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
    
    // Verify course instructor
    const { data: course } = await supabase
      .from('courses')
      .select('id')
      .eq('id', params.id)
      .eq('instructor_id', session.user.id)
      .single()
    
    if (!course) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }
    
    const updates = await request.json()
    
    // Update course
    const { data: updatedCourse, error } = await supabase
      .from('courses')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating course:', error)
      return NextResponse.json(
        { error: 'Failed to update course' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(updatedCourse)
  } catch (error) {
    console.error('Course PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/courses/[id]
 * 
 * Deletes a course. Only the course instructor or an admin can delete the course.
 * 
 * @requires Authentication
 * @requires Authorization: Course instructor or admin
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
    
    // Get user role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()
    
    // Get course instructor
    const { data: course } = await supabase
      .from('courses')
      .select('instructor_id')
      .eq('id', params.id)
      .single()
    
    if (!course || (course.instructor_id !== session.user.id && profile?.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }
    
    // Delete course
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', params.id)
    
    if (error) {
      console.error('Error deleting course:', error)
      return NextResponse.json(
        { error: 'Failed to delete course' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ message: 'Course deleted successfully' })
  } catch (error) {
    console.error('Course DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 