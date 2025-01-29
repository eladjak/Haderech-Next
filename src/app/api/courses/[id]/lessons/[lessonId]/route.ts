/**
 * @file courses/[id]/lessons/[lessonId]/route.ts
 * @description API routes for managing individual lessons within a course. Provides endpoints
 * for retrieving, updating, and deleting specific lessons. Includes authentication and
 * authorization checks.
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

interface RouteParams {
  params: {
    courseId: string
    lessonId: string
  }
}

/**
 * GET /api/courses/[courseId]/lessons/[lessonId]
 * 
 * Retrieves detailed information about a specific lesson, including its content
 * and course information.
 * 
 * @param {Request} request - The incoming request object
 * @param {RouteParams} params - Route parameters containing course and lesson IDs
 * @returns {Promise<NextResponse>} JSON response containing the lesson details or error message
 * 
 * @example Response
 * ```json
 * {
 *   "id": "lesson1",
 *   "title": "Introduction",
 *   "description": "Course overview",
 *   "duration": "10 minutes",
 *   "type": "video",
 *   "order": 1,
 *   "content": {
 *     "video_url": "https://...",
 *     "transcript": "..."
 *   },
 *   "course": {
 *     "id": "course1",
 *     "title": "Course Title",
 *     "instructor_id": "user123"
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
        course:courses(
          id,
          title,
          instructor_id
        )
      `)
      .eq('id', params.lessonId)
      .eq('course_id', params.courseId)
      .single()
    
    if (error) throw error
    if (!lesson) {
      return NextResponse.json(
        { error: 'שיעור לא נמצא' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(lesson)
  } catch (error) {
    console.error('Error fetching lesson:', error)
    return NextResponse.json(
      { error: 'שגיאה בטעינת השיעור' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/courses/[courseId]/lessons/[lessonId]
 * 
 * Updates a specific lesson and its content. Only the course instructor can update lessons.
 * 
 * @requires Authentication
 * @requires Authorization: Course instructor only
 * 
 * @param {Request} request - The incoming request object
 * @param {RouteParams} params - Route parameters containing course and lesson IDs
 * @returns {Promise<NextResponse>} JSON response containing the updated lesson or error message
 * 
 * @example Request Body
 * ```json
 * {
 *   "title": "Updated Lesson",
 *   "description": "Updated description",
 *   "duration": "12 minutes",
 *   "type": "video",
 *   "order": 2,
 *   "content": {
 *     "video_url": "https://...",
 *     "transcript": "Updated transcript"
 *   }
 * }
 * ```
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookies().get(name)?.value
          },
        },
      }
    )
    
    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'יש להתחבר כדי לערוך שיעור' },
        { status: 401 }
      )
    }
    
    // Verify course instructor
    const { data: course } = await supabase
      .from('courses')
      .select('instructor_id')
      .eq('id', params.courseId)
      .single()
    
    if (!course || course.instructor_id !== session.user.id) {
      return NextResponse.json(
        { error: 'אין הרשאה לערוך שיעור בקורס זה' },
        { status: 403 }
      )
    }
    
    const {
      title,
      description,
      duration,
      type,
      order,
      content
    } = await request.json()
    
    // Update lesson details
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .update({
        title,
        description,
        duration,
        type,
        order,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.lessonId)
      .select()
      .single()
    
    if (lessonError) throw lessonError
    
    // Update lesson content
    const { error: contentError } = await supabase
      .from('lesson_content')
      .update(content)
      .eq('lesson_id', params.lessonId)
    
    if (contentError) throw contentError
    
    // Get updated lesson with content
    const { data: fullLesson, error: fetchError } = await supabase
      .from('lessons')
      .select(`
        *,
        content:lesson_content(*)
      `)
      .eq('id', params.lessonId)
      .single()
    
    if (fetchError) throw fetchError
    
    return NextResponse.json(fullLesson)
  } catch (error) {
    console.error('Error updating lesson:', error)
    return NextResponse.json(
      { error: 'שגיאה בעדכון השיעור' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/courses/[courseId]/lessons/[lessonId]
 * 
 * Deletes a specific lesson and its associated content. Only the course instructor can delete lessons.
 * 
 * @requires Authentication
 * @requires Authorization: Course instructor only
 * 
 * @param {Request} request - The incoming request object
 * @param {RouteParams} params - Route parameters containing course and lesson IDs
 * @returns {Promise<NextResponse>} JSON response indicating success or error message
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookies().get(name)?.value
          },
        },
      }
    )
    
    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'יש להתחבר כדי למחוק שיעור' },
        { status: 401 }
      )
    }
    
    // Verify course instructor
    const { data: course } = await supabase
      .from('courses')
      .select('instructor_id')
      .eq('id', params.courseId)
      .single()
    
    if (!course || course.instructor_id !== session.user.id) {
      return NextResponse.json(
        { error: 'אין הרשאה למחוק שיעור בקורס זה' },
        { status: 403 }
      )
    }
    
    // Delete lesson content
    const { error: contentError } = await supabase
      .from('lesson_content')
      .delete()
      .eq('lesson_id', params.lessonId)
    
    if (contentError) throw contentError
    
    // Delete lesson
    const { error: lessonError } = await supabase
      .from('lessons')
      .delete()
      .eq('id', params.lessonId)
    
    if (lessonError) throw lessonError
    
    return NextResponse.json({ message: 'השיעור נמחק בהצלחה' })
  } catch (error) {
    console.error('Error deleting lesson:', error)
    return NextResponse.json(
      { error: 'שגיאה במחיקת השיעור' },
      { status: 500 }
    )
  }
} 