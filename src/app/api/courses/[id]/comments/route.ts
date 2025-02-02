/**
 * @file courses/[id]/comments/route.ts
 * @description API routes for managing course comments. Provides endpoints for retrieving,
 * creating, updating, and deleting comments on courses.
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
 * GET /api/courses/[id]/comments
 * 
 * Returns all comments for a specific course.
 * 
 * @param id - The course ID
 * @returns List of comments with author information
 * 
 * Example response:
 * ```json
 * [
 *   {
 *     id: "123",
 *     content: "Great course!",
 *     created_at: "2024-02-02T12:00:00Z",
 *     author: {
 *       id: "456",
 *       name: "John Doe",
 *       avatar_url: "https://..."
 *     }
 *   }
 * ]
 * ```
 */
export async function GET(_: Request, { params }: RouteParams) {
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

    const { data: comments, error } = await supabase
      .from('course_comments')
      .select(`
        *,
        author:users(id, name, avatar_url)
      `)
      .eq('course_id', params.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching comments:', error)
      return NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: 500 }
      )
    }

    return NextResponse.json(comments)
  } catch (error) {
    console.error('Error in GET /api/courses/[id]/comments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/courses/[id]/comments
 * 
 * Creates a new comment on a course.
 * 
 * @param request - The request containing the comment data
 * @param id - The course ID
 * @returns The created comment
 * 
 * Example request body:
 * ```json
 * {
 *   "content": "This course is amazing!"
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

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get request body
    const { content } = await request.json()
    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Create comment
    const { data: comment, error } = await supabase
      .from('course_comments')
      .insert({
        course_id: params.id,
        user_id: session.user.id,
        content,
        created_at: new Date().toISOString(),
      })
      .select(`
        *,
        author:users(id, name, avatar_url)
      `)
      .single()

    if (error) {
      console.error('Error creating comment:', error)
      return NextResponse.json(
        { error: 'Failed to create comment' },
        { status: 500 }
      )
    }

    return NextResponse.json(comment)
  } catch (error) {
    console.error('Error in POST /api/courses/[id]/comments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 