/**
 * @file courses/[id]/enroll/route.ts
 * @description API routes for managing course enrollments. Provides endpoints for enrolling in and unenrolling from courses.
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
 * POST /api/courses/[id]/enroll
 * 
 * Enrolls the current user in a course.
 * 
 * @requires Authentication
 * 
 * @param {Request} request - The incoming request object
 * @param {RouteParams} params - Route parameters containing the course ID
 * @returns {Promise<NextResponse>} JSON response containing the enrollment details or error message
 * 
 * @example Response
 * ```json
 * {
 *   "id": "enrollment1",
 *   "created_at": "2024-01-01T12:00:00Z",
 *   "course": {
 *     "title": "Course Title",
 *     "description": "Course Description"
 *   }
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

    // Check if course exists
    const { data: course } = await supabase
      .from('courses')
      .select('id')
      .eq('id', params.id)
      .single()

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Check if already enrolled
    const { data: existingEnrollment } = await supabase
      .from('course_enrollments')
      .select('id')
      .eq('course_id', params.id)
      .eq('user_id', session.user.id)
      .single()

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Already enrolled in this course' },
        { status: 400 }
      )
    }

    // Create enrollment
    const { data: enrollment, error } = await supabase
      .from('course_enrollments')
      .insert({
        course_id: params.id,
        user_id: session.user.id
      })
      .select(`
        *,
        course:courses (
          title,
          description
        )
      `)
      .single()

    if (error) {
      console.error('Error creating enrollment:', error)
      return NextResponse.json(
        { error: 'Failed to create enrollment' },
        { status: 500 }
      )
    }

    return NextResponse.json(enrollment)
  } catch (error) {
    console.error('Enrollment POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/courses/[id]/enroll
 * 
 * Unenrolls the current user from a course.
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

    // Delete enrollment
    const { error } = await supabase
      .from('course_enrollments')
      .delete()
      .eq('course_id', params.id)
      .eq('user_id', session.user.id)

    if (error) {
      console.error('Error deleting enrollment:', error)
      return NextResponse.json(
        { error: 'Failed to delete enrollment' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Successfully unenrolled from course' })
  } catch (error) {
    console.error('Enrollment DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 