/**
 * @file courses/[id]/lessons/[lessonId]/route.ts
 * @description API routes for managing individual lessons. Provides endpoints for retrieving,
 * updating, and deleting specific lessons.
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

interface RouteParams {
  params: {
    id: string
    lessonId: string
  }
}

/**
 * GET /api/courses/[id]/lessons/[lessonId]
 * 
 * Retrieves a specific lesson's details, including its content.
 * 
 * @param {Request} request - The incoming request object
 * @param {RouteParams} params - Route parameters containing the course ID and lesson ID
 * @returns {Promise<NextResponse>} JSON response containing the lesson details or error message
 * 
 * @example Response
 * ```json
 * {
 *   "id": "lesson1",
 *   "title": "Introduction",
 *   "description": "Course overview",
 *   "duration": 30,
 *   "order": 1,
 *   "content": {
 *     "type": "video",
 *     "url": "https://...",
 *     "transcript": "Lesson transcript..."
 *   }
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

    const { data: lesson, error } = await supabase
      .from('lessons')
      .select(`
        *,
        content:lesson_content(*),
        progress:lesson_progress(*)
      `)
      .eq('course_id', params.id)
      .eq('id', params.lessonId)
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
    console.error('Lesson GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/courses/[id]/lessons/[lessonId]
 * 
 * Updates a lesson's details. Only the course instructor can update lessons.
 * 
 * @requires Authentication
 * @requires Authorization: Course instructor only
 * 
 * @param {Request} request - The incoming request object
 * @param {RouteParams} params - Route parameters containing the course ID and lesson ID
 * @returns {Promise<NextResponse>} JSON response containing the updated lesson or error message
 * 
 * @example Request Body
 * ```json
 * {
 *   "title": "Updated Title",
 *   "description": "Updated description",
 *   "duration": 45,
 *   "order": 2,
 *   "content": {
 *     "type": "video",
 *     "url": "https://...",
 *     "transcript": "Updated transcript..."
 *   }
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

    const { title, description, duration, order, content } = await request.json()

    // Update lesson
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .update({
        title,
        description,
        duration,
        order,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.lessonId)
      .eq('course_id', params.id)
      .select()
      .single()

    if (lessonError) {
      console.error('Error updating lesson:', lessonError)
      return NextResponse.json(
        { error: 'Failed to update lesson' },
        { status: 500 }
      )
    }

    // Update lesson content
    if (content) {
      const { error: contentError } = await supabase
        .from('lesson_content')
        .upsert({
          lesson_id: params.lessonId,
          ...content
        })

      if (contentError) {
        console.error('Error updating lesson content:', contentError)
        return NextResponse.json(
          { error: 'Failed to update lesson content' },
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
      .eq('id', params.lessonId)
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
    console.error('Lesson PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/courses/[id]/lessons/[lessonId]
 * 
 * Deletes a lesson. Only the course instructor can delete lessons.
 * 
 * @requires Authentication
 * @requires Authorization: Course instructor only
 * 
 * @param {Request} request - The incoming request object
 * @param {RouteParams} params - Route parameters containing the course ID and lesson ID
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

    // Delete lesson (cascade will handle related content)
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

    return NextResponse.json({ message: 'Lesson deleted successfully' })
  } catch (error) {
    console.error('Lesson DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 