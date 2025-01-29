/**
 * @file courses/[courseId]/route.ts
 * @description API route handlers for course operations
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

/**
 * GET handler for retrieving course details
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

    const { data: course, error } = await supabase
      .from('courses')
      .select(`
        *,
        instructor:profiles!instructor_id (
          id,
          name,
          avatar_url,
          bio
        ),
        lessons (
          *,
          progress:lesson_progress (*)
        ),
        ratings:course_ratings (
          *,
          user:profiles!user_id (
            id,
            name,
            avatar_url
          )
        ),
        comments:course_comments (
          *,
          user:profiles!user_id (
            id,
            name,
            avatar_url
          ),
          replies!parent_id (
            *,
            user:profiles!user_id (
              id,
              name,
              avatar_url
            )
          )
        )
      `)
      .eq('id', courseId)
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

    return NextResponse.json(course)
  } catch (error) {
    console.error('Course GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT handler for updating course details
 */
export async function PUT(
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
    const updates = await request.json()

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
        { error: 'Not authorized to update this course' },
        { status: 403 }
      )
    }

    const { error } = await supabase
      .from('courses')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', courseId)

    if (error) {
      console.error('Error updating course:', error)
      return NextResponse.json(
        { error: 'Failed to update course' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Course updated successfully' })
  } catch (error) {
    console.error('Course PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE handler for removing a course
 */
export async function DELETE(
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
        { error: 'Not authorized to delete this course' },
        { status: 403 }
      )
    }

    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId)

    if (error) {
      console.error('Error deleting course:', error)
      return NextResponse.json(
        { error: 'Failed to delete course' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Course deleted successfully' })
  } catch (error) {
    console.error('Course DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 