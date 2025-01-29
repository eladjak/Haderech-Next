/**
 * @file courses/[courseId]/lessons/route.ts
 * @description API route handlers for course lessons operations
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

/**
 * GET handler for retrieving course lessons
 */
export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
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

    const { courseId } = params

    const { data: lessons, error } = await supabase
      .from('lessons')
      .select(`
        *,
        progress:lesson_progress (*)
      `)
      .eq('course_id', courseId)
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
 * POST handler for creating a new lesson
 */
export async function POST(
  request: Request,
  { params }: { params: { courseId: string } }
) {
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

    const { courseId } = params

    // Verify user is course instructor
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('instructor_id')
      .eq('id', courseId)
      .single()

    if (courseError || !course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    if (course.instructor_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to add lessons to this course' },
        { status: 403 }
      )
    }

    // Get current max order
    const { data: maxOrder } = await supabase
      .from('lessons')
      .select('order')
      .eq('course_id', courseId)
      .order('order', { ascending: false })
      .limit(1)
      .single()

    const nextOrder = (maxOrder?.order || 0) + 1

    const lessonData = await request.json()
    const { data: lesson, error } = await supabase
      .from('lessons')
      .insert([
        {
          ...lessonData,
          course_id: courseId,
          order: nextOrder,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
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
    console.error('Lessons POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH handler for reordering lessons
 */
export async function PATCH(
  request: Request,
  { params }: { params: { courseId: string } }
) {
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

    const { courseId } = params

    // Verify user is course instructor
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('instructor_id')
      .eq('id', courseId)
      .single()

    if (courseError || !course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    if (course.instructor_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to reorder lessons in this course' },
        { status: 403 }
      )
    }

    const { lessons } = await request.json()

    // Update each lesson's order
    for (const { id, order } of lessons) {
      const { error } = await supabase
        .from('lessons')
        .update({ order })
        .eq('id', id)
        .eq('course_id', courseId)

      if (error) {
        console.error('Error updating lesson order:', error)
        return NextResponse.json(
          { error: 'Failed to update lesson order' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ message: 'Lessons reordered successfully' })
  } catch (error) {
    console.error('Lessons PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 