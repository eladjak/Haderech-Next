/**
 * @file courses/[id]/lessons/route.ts
 * @description API routes for managing course lessons. Provides endpoints for listing all lessons
 * in a course and creating new lessons. Includes authentication and authorization checks.
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
 * Retrieves all lessons for a specific course, including their content.
 * 
 * @param {Request} request - The incoming request object
 * @param {RouteParams} params - Route parameters containing the course ID
 * @returns {Promise<NextResponse>} JSON response containing an array of lessons or error message
 * 
 * @example Response
 * ```json
 * [
 *   {
 *     "id": "lesson1",
 *     "title": "Introduction",
 *     "description": "Course overview",
 *     "duration": "10 minutes",
 *     "type": "video",
 *     "order": 1,
 *     "content": {
 *       "video_url": "https://...",
 *       "transcript": "..."
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
        content:lesson_content(*)
      `)
      .eq('course_id', params.id)
      .order('order', { ascending: true })
    
    if (error) throw error
    
    return NextResponse.json(lessons)
  } catch (error) {
    console.error('Error fetching lessons:', error)
    return NextResponse.json(
      { error: 'שגיאה בטעינת השיעורים' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/courses/[id]/lessons
 * 
 * Creates a new lesson in a course. Only the course instructor can create lessons.
 * 
 * @requires Authentication
 * @requires Authorization: Course instructor only
 * 
 * @param {Request} request - The incoming request object
 * @param {RouteParams} params - Route parameters containing the course ID
 * @returns {Promise<NextResponse>} JSON response containing the created lesson or error message
 * 
 * @example Request Body
 * ```json
 * {
 *   "title": "New Lesson",
 *   "description": "Lesson description",
 *   "duration": "15 minutes",
 *   "type": "video",
 *   "order": 2,
 *   "content": {
 *     "video_url": "https://...",
 *     "transcript": "..."
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
        { error: 'יש להתחבר כדי ליצור שיעור' },
        { status: 401 }
      )
    }
    
    // Verify course instructor
    const { data: course } = await supabase
      .from('courses')
      .select('instructor_id')
      .eq('id', params.id)
      .single()
    
    if (!course || course.instructor_id !== session.user.id) {
      return NextResponse.json(
        { error: 'אין הרשאה ליצור שיעור בקורס זה' },
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
    
    // Create lesson
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .insert({
        title,
        description,
        duration,
        type,
        order,
        course_id: params.id,
        created_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (lessonError) throw lessonError
    
    // Create lesson content
    const { error: contentError } = await supabase
      .from('lesson_content')
      .insert({
        lesson_id: lesson.id,
        ...content
      })
    
    if (contentError) {
      // If content creation fails, delete the lesson
      await supabase
        .from('lessons')
        .delete()
        .eq('id', lesson.id)
      
      throw contentError
    }
    
    // Get full lesson with content
    const { data: fullLesson, error: fetchError } = await supabase
      .from('lessons')
      .select(`
        *,
        content:lesson_content(*)
      `)
      .eq('id', lesson.id)
      .single()
    
    if (fetchError) throw fetchError
    
    return NextResponse.json(fullLesson)
  } catch (error) {
    console.error('Error creating lesson:', error)
    return NextResponse.json(
      { error: 'שגיאה ביצירת השיעור' },
      { status: 500 }
    )
  }
} 