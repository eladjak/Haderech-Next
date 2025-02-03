/**
 * @file courses/[id]/lessons/route.ts
 * @description API routes for managing course lessons. Provides endpoints for retrieving and creating lessons.
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
  }
}

interface LessonWithRelations extends Lesson {
  content: LessonContent | null
  progress: LessonProgress[]
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
export async function GET(_: Request, { params }: RouteParams) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is enrolled in the course
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

    // Get lessons
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

    return NextResponse.json(lessons as LessonWithRelations[])
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
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get course details to verify ownership
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

    // Verify course ownership
    if (course.author_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to create lessons for this course' },
        { status: 403 }
      )
    }

    // Get lesson data from request
    const lessonData: CreateLessonBody = await request.json()

    // Create lesson
    const { data: lesson, error } = await supabase
      .from('lessons')
      .insert({
        ...lessonData,
        course_id: params.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating lesson:', error)
      return NextResponse.json(
        { error: 'Failed to create lesson' },
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

interface CreateLessonBody {
  title: string
  description: string
  content: string
  order: number
  status: 'draft' | 'published'
} 