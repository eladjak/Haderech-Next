/**
 * @file route.ts
 * @description API route handlers for individual lesson operations
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

/**
 * GET handler for retrieving lesson details
 */
export async function GET(
  request: Request,
  { params }: { params: { courseId: string; lessonId: string } }
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

    const { courseId, lessonId } = params

    const { data: lesson, error } = await supabase
      .from('lessons')
      .select(`
        *,
        progress (*)
      `)
      .eq('id', lessonId)
      .eq('course_id', courseId)
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
 * PUT handler for updating lesson details
 */
export async function PUT(
  request: Request,
  { params }: { params: { courseId: string; lessonId: string } }
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

    const { courseId, lessonId } = params

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
        { error: 'Not authorized to update this lesson' },
        { status: 403 }
      )
    }

    const updates = await request.json()

    const { error } = await supabase
      .from('lessons')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', lessonId)
      .eq('course_id', courseId)

    if (error) {
      console.error('Error updating lesson:', error)
      return NextResponse.json(
        { error: 'Failed to update lesson' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Lesson updated successfully' })
  } catch (error) {
    console.error('Lesson PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE handler for removing a lesson
 */
export async function DELETE(
  request: Request,
  { params }: { params: { courseId: string; lessonId: string } }
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

    const { courseId, lessonId } = params

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
        { error: 'Not authorized to delete this lesson' },
        { status: 403 }
      )
    }

    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', lessonId)
      .eq('course_id', courseId)

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