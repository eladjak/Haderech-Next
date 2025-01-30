/**
 * @file courses/[id]/comments/route.ts
 * @description API routes for managing course comments. Provides endpoints for retrieving and creating comments.
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
 * Retrieves all comments for a specific course.
 * 
 * @param {Request} request - The incoming request object
 * @param {RouteParams} params - Route parameters containing the course ID
 * @returns {Promise<NextResponse>} JSON response containing the course comments or error message
 * 
 * @example Response
 * ```json
 * [
 *   {
 *     "id": "comment1",
 *     "content": "Great course!",
 *     "created_at": "2024-01-01T12:00:00Z",
 *     "user": {
 *       "name": "John Doe",
 *       "avatar_url": "https://..."
 *     },
 *     "replies": [
 *       {
 *         "id": "reply1",
 *         "content": "Thanks!",
 *         "user": {
 *           "name": "Jane Doe",
 *           "avatar_url": "https://..."
 *         }
 *       }
 *     ]
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

    const { data: comments, error } = await supabase
      .from('course_comments')
      .select(`
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
      `)
      .eq('course_id', params.id)
      .is('parent_id', null)
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
    console.error('Comments GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/courses/[id]/comments
 * 
 * Creates a new comment or reply for a course.
 * 
 * @requires Authentication
 * @requires Course enrollment
 * 
 * @param {Request} request - The incoming request object
 * @param {RouteParams} params - Route parameters containing the course ID
 * @returns {Promise<NextResponse>} JSON response containing the new comment or error message
 * 
 * @example Request Body
 * ```json
 * {
 *   "content": "Great course!",
 *   "parent_id": "comment1" // Optional, for replies
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

    // Verify course enrollment
    const { data: enrollment } = await supabase
      .from('course_enrollments')
      .select('id')
      .eq('course_id', params.id)
      .eq('user_id', session.user.id)
      .single()

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Must be enrolled to comment' },
        { status: 403 }
      )
    }

    const { content, parent_id } = await request.json()

    // Validate content
    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      )
    }

    // If this is a reply, verify parent comment exists
    if (parent_id) {
      const { data: parentComment } = await supabase
        .from('course_comments')
        .select('id')
        .eq('id', parent_id)
        .eq('course_id', params.id)
        .single()

      if (!parentComment) {
        return NextResponse.json(
          { error: 'Parent comment not found' },
          { status: 404 }
        )
      }
    }

    // Create comment
    const { data: comment, error } = await supabase
      .from('course_comments')
      .insert({
        course_id: params.id,
        user_id: session.user.id,
        content,
        parent_id
      })
      .select(`
        *,
        user:profiles!user_id (
          id,
          name,
          avatar_url
        )
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
    console.error('Comments POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 