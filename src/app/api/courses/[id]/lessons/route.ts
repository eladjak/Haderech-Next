/**
 * @file courses/[id]/lessons/route.ts
 * @description API routes for managing course lessons. Provides endpoints for retrieving and creating lessons.
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
 * GET /api/courses/[id]/lessons
 * 
 * Retrieves all lessons for a specific course.
 * 
 * @param {Request} request - The incoming request object
 * @param {RouteParams} params - Route parameters containing the course ID
 * @returns {Promise<NextResponse>} JSON response containing the course lessons or error message
 * 
 * @example Response
 * ```json
 * [
 *   {
 *     "id": "lesson1",
 *     "title": "Introduction",
 *     "description": "Course overview",
 *     "duration": 30,
 *     "order": 1,
 *     "content": {
 *       "type": "video",
 *       "url": "https://..."
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
    console.error('Lessons GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/courses/[id]/lessons
 * 
 * Creates a new lesson for a course. Only the course instructor can create lessons.
 * 
 * @requires Authentication
 * @requires Authorization: Course instructor only
 * 
 * @param {Request} request - The incoming request object
 * @param {RouteParams} params - Route parameters containing the course ID
 * @returns {Promise<NextResponse>} JSON response containing the new lesson or error message
 * 
 * @example Request Body
 * ```json
 * {
 *   "title": "New Lesson",
 *   "description": "Lesson description",
 *   "duration": 45,
 *   "order": 2,
 *   "content": {
 *     "type": "video",
 *     "url": "https://...",
 *     "transcript": "Lesson transcript..."
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

    const { title, description, duration, order, content } = await request.json()

    // Create lesson
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .insert({
        course_id: params.id,
        title,
        description,
        duration,
        order
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

    // Create lesson content
    if (content) {
      const { error: contentError } = await supabase
        .from('lesson_content')
        .insert({
          lesson_id: lesson.id,
          ...content
        })

      if (contentError) {
        console.error('Error creating lesson content:', contentError)
        // Rollback lesson creation
        await supabase
          .from('lessons')
          .delete()
          .eq('id', lesson.id)

        return NextResponse.json(
          { error: 'Failed to create lesson content' },
          { status: 500 }
        )
      }
    }

    // Return complete lesson with content
    const { data: completeLesson, error: fetchError } = await supabase
      .from('lessons')
      .select(`
        *,
        content:lesson_content(*)
      `)
      .eq('id', lesson.id)
      .single()

    if (fetchError) {
      console.error('Error fetching complete lesson:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch complete lesson' },
        { status: 500 }
      )
    }

    return NextResponse.json(completeLesson)
  } catch (error) {
    console.error('Lessons POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH handler for updating lesson order
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

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user is course instructor
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

    const { lessonOrder } = await request.json()
    if (!Array.isArray(lessonOrder)) {
      return NextResponse.json(
        { error: 'Invalid lesson order' },
        { status: 400 }
      )
    }

    // Update lesson order
    const updates = lessonOrder.map((lessonId, index) => ({
      id: lessonId,
      order_index: index,
      updated_at: new Date().toISOString()
    }))

    const { error } = await supabase
      .from('lessons')
      .upsert(updates)
      .eq('course_id', params.id)

    if (error) {
      console.error('Error updating lesson order:', error)
      return NextResponse.json(
        { error: 'Failed to update lesson order' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Lesson order updated successfully' })
  } catch (error) {
    console.error('Lessons PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 