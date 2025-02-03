/**
 * @file courses/[id]/lessons/[lessonId]/route.ts
 * @description API routes for managing individual lessons. Provides endpoints for retrieving,
 * updating, and deleting specific lessons.
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

interface LessonUpdate {
  title?: string
  description?: string
  content?: string
  order?: number
  status?: 'draft' | 'published'
}

/**
 * GET /api/courses/[id]/lessons/[lessonId]
 * 
 * Retrieves a specific lesson from a course.
 * 
 * @requires Authentication
 * 
 * @param {Request} _ - The request object (unused)
 * @param {RouteParams} params - Route parameters containing the course ID and lesson ID
 * @returns {Promise<NextResponse>} JSON response containing the lesson details or error message
 * 
 * @example Response
 * ```json
 * {
 *   "id": "lesson1",
 *   "title": "Introduction",
 *   "description": "Course overview",
 *   "content": "Lesson content...",
 *   "order": 1,
 *   "status": "published"
 * }
 * ```
 */
export async function GET(
  _: Request,
  { params }: { params: { id: string; lessonId: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
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

    const { data: lesson, error } = await supabase
      .from('lessons')
      .select(`
        *,
        content:lesson_content(*),
        progress:lesson_progress(*)
      `)
      .eq('id', params.lessonId)
      .eq('course_id', params.id)
      .single()

    if (error) {
      console.error('Error fetching lesson:', error)
      return NextResponse.json(
        { error: 'Failed to fetch lesson' },
        { status: 500 }
      )
    }

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(lesson)
  } catch (error) {
    console.error('Error in GET /api/courses/[id]/lessons/[lessonId]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/courses/[id]/lessons/[lessonId]
 * 
 * Updates a lesson's details.
 * 
 * @requires Authentication & Authorization (Course Author)
 * 
 * @param {Request} request - The request object containing the updated lesson data
 * @param {RouteParams} params - Route parameters containing the course ID and lesson ID
 * @returns {Promise<NextResponse>} JSON response indicating success or error message
 * 
 * @example Request
 * ```json
 * {
 *   "title": "Updated Title",
 *   "description": "Updated description",
 *   "content": "Updated content",
 *   "order": 2,
 *   "status": "published"
 * }
 * ```
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string; lessonId: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
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

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const updates: LessonUpdate = await request.json()

    const { data: lesson, error } = await supabase
      .from('lessons')
      .update(updates)
      .eq('id', params.lessonId)
      .eq('course_id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating lesson:', error)
      return NextResponse.json(
        { error: 'Failed to update lesson' },
        { status: 500 }
      )
    }

    return NextResponse.json(lesson)
  } catch (error) {
    console.error('Error in PATCH /api/courses/[id]/lessons/[lessonId]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/courses/[id]/lessons/[lessonId]
 * 
 * Deletes a lesson from a course.
 * 
 * @requires Authentication & Authorization (Course Author)
 * 
 * @param {Request} _ - The request object (unused)
 * @param {RouteParams} params - Route parameters containing the course ID and lesson ID
 * @returns {Promise<NextResponse>} JSON response indicating success or error message
 */
export async function DELETE(
  _: Request,
  { params }: { params: { id: string; lessonId: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
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

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', params.lessonId)
      .eq('course_id', params.id)

    if (error) {
      console.error('Error deleting lesson:', error)
      return NextResponse.json(
        { error: 'Failed to delete lesson' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Lesson deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in DELETE /api/courses/[id]/lessons/[lessonId]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 