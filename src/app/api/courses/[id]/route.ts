/**
 * @file courses/[id]/route.ts
 * @description API routes for managing individual courses. Provides endpoints for retrieving,
 * updating, and deleting specific courses. Includes authentication and authorization checks.
 */

import { createServerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

type Tables = Database['public']['Tables']
type Course = Tables['courses']['Row']
type User = Tables['users']['Row']
type Lesson = Tables['lessons']['Row']
type LessonProgress = Tables['lesson_progress']['Row']
type CourseRating = Tables['course_ratings']['Row']

interface RouteParams {
  params: {
    id: string
  }
}

interface CourseWithRelations extends Course {
  author: User
  lessons: (Lesson & { progress: LessonProgress[] })[]
  ratings: (CourseRating & { user: User })[]
}

/**
 * GET /api/courses/[id]
 * 
 * Retrieves a specific course with all its details.
 * 
 * @requires Authentication
 * 
 * @param {Request} _ - The request object (unused)
 * @param {RouteParams} params - Route parameters containing the course ID
 * @returns {Promise<NextResponse>} JSON response containing the course or error message
 * 
 * @example Response
 * ```json
 * {
 *   "id": "course1",
 *   "title": "Course Title",
 *   "description": "Course description",
 *   "image_url": "https://...",
 *   "status": "published",
 *   "author": {
 *     "name": "John Doe",
 *     "avatar_url": "https://..."
 *   },
 *   "lessons": [
 *     {
 *       "id": "lesson1",
 *       "title": "Lesson 1",
 *       "description": "Lesson description"
 *     }
 *   ]
 * }
 * ```
 */
export async function GET(_: Request, { params }: RouteParams) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    const { data: course, error } = await supabase
      .from('courses')
      .select(`
        *,
        author:users(*),
        lessons(
          *,
          progress:lesson_progress(*)
        ),
        ratings:course_ratings(
          *,
          user:users(*)
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

    return NextResponse.json(course as CourseWithRelations)
  } catch (error) {
    console.error('Error in GET /api/courses/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

interface UpdateCourseBody {
  title?: string
  description?: string
  image_url?: string | null
  status?: 'draft' | 'published' | 'archived'
  level?: 'beginner' | 'intermediate' | 'advanced'
  duration?: number
  tags?: string[]
}

/**
 * PATCH /api/courses/[id]
 * 
 * Updates a course's details.
 * 
 * @requires Authentication & Authorization (Course Author)
 * 
 * @param {Request} request - The request object containing the updated course data
 * @param {RouteParams} params - Route parameters containing the course ID
 * @returns {Promise<NextResponse>} JSON response containing the updated course or error message
 * 
 * @example Request
 * ```json
 * {
 *   "title": "Updated Title",
 *   "description": "Updated description",
 *   "status": "published"
 * }
 * ```
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: course } = await supabase
      .from('courses')
      .select('author_id')
      .eq('id', params.id)
      .single()

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    if (course.author_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this course' },
        { status: 403 }
      )
    }

    const updates: UpdateCourseBody = await request.json()

    const { data: updatedCourse, error } = await supabase
      .from('courses')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select(`
        *,
        author:users(*),
        lessons(
          *,
          progress:lesson_progress(*)
        ),
        ratings:course_ratings(
          *,
          user:users(*)
        )
      `)
      .single()

    if (error) {
      console.error('Error updating course:', error)
      return NextResponse.json(
        { error: 'Failed to update course' },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedCourse as CourseWithRelations)
  } catch (error) {
    console.error('Error in PATCH /api/courses/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/courses/[id]
 * 
 * Deletes a course.
 * 
 * @requires Authentication & Authorization (Course Author)
 * 
 * @param {Request} _ - The request object (unused)
 * @param {RouteParams} params - Route parameters containing the course ID
 * @returns {Promise<NextResponse>} JSON response indicating success or error message
 */
export async function DELETE(_: Request, { params }: RouteParams) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: course } = await supabase
      .from('courses')
      .select('author_id')
      .eq('id', params.id)
      .single()

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    if (course.author_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to delete this course' },
        { status: 403 }
      )
    }

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
    console.error('Error in DELETE /api/courses/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 