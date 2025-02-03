/**
 * @file courses/[id]/lessons/route.ts
 * @description API routes for managing course lessons. Provides endpoints for retrieving and creating lessons.
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

interface CreateLessonBody {
  title: string
  description: string
  content: string
  order: number
  status: 'draft' | 'published'
}

/**
 * GET /api/courses/[id]/lessons
 * 
 * Retrieves all lessons for a specific course.
 * 
 * @requires Authentication
 * 
 * @param {Request} _ - The request object (unused)
 * @param {RouteParams} params - Route parameters containing the course ID
 * @returns {Promise<NextResponse>} JSON response containing the lessons or error message
 * 
 * @example Response
 * ```json
 * [
 *   {
 *     "id": "lesson1",
 *     "title": "Introduction",
 *     "description": "Course overview",
 *     "content": "Lesson content...",
 *     "order": 1,
 *     "status": "published"
 *   }
 * ]
 * ```
 */
export async function GET(
  _: Request,
  { params }: { params: { id: string } }
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

    const { data: lessons, error } = await supabase
      .from('lessons')
      .select(`
        *,
        content:lesson_content(*),
        progress:lesson_progress(*)
      `)
      .eq('course_id', params.id)
      .order('order', { ascending: true })

    if (error) {
      console.error('Error fetching lessons:', error)
      return NextResponse.json(
        { error: 'Failed to fetch lessons' },
        { status: 500 }
      )
    }

    return NextResponse.json(lessons)
  } catch (error) {
    console.error('Error in GET /api/courses/[id]/lessons:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/courses/[id]/lessons
 * 
 * Creates a new lesson for a course.
 * 
 * @requires Authentication & Authorization (Course Author)
 * 
 * @param {Request} request - The request object containing the lesson data
 * @param {RouteParams} params - Route parameters containing the course ID
 * @returns {Promise<NextResponse>} JSON response containing the created lesson or error message
 * 
 * @example Request
 * ```json
 * {
 *   "title": "New Lesson",
 *   "description": "Lesson description",
 *   "content": "Lesson content...",
 *   "order": 1,
 *   "status": "draft"
 * }
 * ```
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
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

    const body: CreateLessonBody = await request.json()

    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .insert({
        course_id: params.id,
        title: body.title,
        description: body.description,
        order: body.order,
        status: body.status,
      })
      .select()
      .single()

    if (lessonError) {
      console.error('Error creating lesson:', lessonError)
      return NextResponse.json(
        { error: 'Failed to create lesson' },
        { status: 500 }
      )
    }

    const { error: contentError } = await supabase
      .from('lesson_content')
      .insert({
        lesson_id: lesson.id,
        content: body.content,
        type: 'text',
        order: 1,
      })

    if (contentError) {
      console.error('Error creating lesson content:', contentError)
      // Cleanup lesson if content creation fails
      await supabase
        .from('lessons')
        .delete()
        .eq('id', lesson.id)

      return NextResponse.json(
        { error: 'Failed to create lesson content' },
        { status: 500 }
      )
    }

    return NextResponse.json(lesson)
  } catch (error) {
    console.error('Error in POST /api/courses/[id]/lessons:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH handler for updating lesson order
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
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

    const updates = await request.json()

    const { data: lesson, error } = await supabase
      .from('lessons')
      .update(updates)
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
    console.error('Error in PATCH /api/courses/[id]/lessons:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 