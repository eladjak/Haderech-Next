/**
 * @file courses/route.ts
 * @description API routes for managing courses. Provides endpoints for listing all courses
 * and creating new courses. Includes authentication and role-based access control.
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

/**
 * GET /api/courses
 * 
 * Retrieves a list of all courses with their basic information, instructor details,
 * lesson count, and average rating.
 * 
 * @returns {Promise<NextResponse>} JSON response containing an array of courses or error message
 * 
 * @example Response
 * ```json
 * [
 *   {
 *     "id": "123",
 *     "title": "Course Title",
 *     "description": "Course Description",
 *     "instructor": {
 *       "name": "John Doe",
 *       "avatar_url": "https://..."
 *     },
 *     "lessons": { "count": 10 },
 *     "ratings": { "avg": 4.5 }
 *   }
 * ]
 * ```
 */
export async function GET() {
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
    
    const { data: courses, error } = await supabase
      .from('courses')
      .select(`
        *,
        instructor:profiles(name, avatar_url),
        lessons:lessons(count),
        ratings:course_ratings(avg(rating))
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return NextResponse.json(courses)
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { error: 'שגיאה בטעינת הקורסים' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/courses
 * 
 * Creates a new course. Only authenticated instructors can create courses.
 * 
 * @requires Authentication
 * @requires Role: 'instructor'
 * 
 * @example Request Body
 * ```json
 * {
 *   "title": "Course Title",
 *   "description": "Course Description",
 *   "level": "beginner",
 *   "duration": "10 hours",
 *   "price": 99.99,
 *   "thumbnail_url": "https://...",
 *   "topics": ["topic1", "topic2"],
 *   "requirements": ["req1", "req2"]
 * }
 * ```
 * 
 * @returns {Promise<NextResponse>} JSON response containing the created course or error message
 */
export async function POST(request: Request) {
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
    
    // Verify authentication and instructor role
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'יש להתחבר כדי ליצור קורס' },
        { status: 401 }
      )
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()
    
    if (!profile || profile.role !== 'instructor') {
      return NextResponse.json(
        { error: 'רק מדריכים יכולים ליצור קורסים' },
        { status: 403 }
      )
    }
    
    const {
      title,
      description,
      level,
      duration,
      price,
      thumbnail_url,
      topics,
      requirements
    } = await request.json()
    
    const { data: course, error } = await supabase
      .from('courses')
      .insert({
        title,
        description,
        level,
        duration,
        price,
        thumbnail_url,
        topics,
        requirements,
        instructor_id: session.user.id,
        status: 'draft',
        created_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json(course)
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json(
      { error: 'שגיאה ביצירת הקורס' },
      { status: 500 }
    )
  }
} 