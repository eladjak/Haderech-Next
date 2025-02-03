/**
 * @file courses/[id]/lessons/[lessonId]/route.ts
 * @description API routes for managing individual lessons. Provides endpoints for retrieving,
 * updating, and deleting specific lessons.
 */

import { createServerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

type Tables = Database['public']['Tables']
type Lesson = Tables['lessons']['Row']
type LessonContent = Tables['lesson_content']['Row']
type LessonProgress = Tables['lesson_progress']['Row']

interface RouteParams {
  params: {
    id: string
    lessonId: string
  }
}

interface LessonWithRelations extends Lesson {
  content: LessonContent | null
  progress: LessonProgress[]
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
export async function GET(_: Request, { params }: RouteParams) {
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

    const { data: enrollment } = await supabase
      .from('course_enrollments')
      .select('id')
      .eq('course_id', params.id)
      .eq('user_id', session.user.id)
      .single()

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Not enrolled in this course' },
        { status: 403 }
      )
    }

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

    return NextResponse.json(lesson as LessonWithRelations)
  } catch (error) {
    console.error('Error in GET /api/courses/[id]/lessons/[lessonId]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

interface LessonUpdate {
  title?: string
  description?: string
  content?: string
  order?: number
  status?: 'draft' | 'published'
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
        { error: 'Not authorized to update this lesson' },
        { status: 403 }
      )
    }

    const updates: Partial<Lesson> = await request.json()

    const { error: updateError } = await supabase
      .from('lessons')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.lessonId)
      .eq('course_id', params.id)

    if (updateError) {
      console.error('Error updating lesson:', updateError)
      return NextResponse.json(
        { error: 'Failed to update lesson' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Lesson updated successfully' })
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
        { error: 'Not authorized to delete this lesson' },
        { status: 403 }
      )
    }

    const { error: deleteError } = await supabase
      .from('lessons')
      .delete()
      .eq('id', params.lessonId)
      .eq('course_id', params.id)

    if (deleteError) {
      console.error('Error deleting lesson:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete lesson' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Lesson deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/courses/[id]/lessons/[lessonId]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 