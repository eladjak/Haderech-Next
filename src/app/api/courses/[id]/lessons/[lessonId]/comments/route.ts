/**
 * @file courses/[id]/lessons/[lessonId]/comments/route.ts
 * @description API routes for managing lesson comments. Provides endpoints for retrieving and creating comments.
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
 * GET /api/courses/[id]/lessons/[lessonId]/comments
 * 
 * Retrieves all comments for a specific lesson.
 * 
 * @param {Request} _ - The request object (unused)
 * @param {RouteParams} params - Route parameters containing the course ID and lesson ID
 * @returns {Promise<NextResponse>} JSON response containing the lesson comments or error message
 * 
 * @example Response
 * ```json
 * [
 *   {
 *     "id": "comment1",
 *     "content": "Great explanation!",
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
      .from('lesson_comments')
      .select('*, author:profiles(*)')
      .eq('lesson_id', params.lessonId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching lesson comments:', error)
      return NextResponse.json(
        { error: 'Failed to fetch lesson comments' },
        { status: 500 }
      )
    }

    return NextResponse.json(comments)
  } catch (error) {
    console.error('Error in GET /api/courses/[id]/lessons/[lessonId]/comments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/courses/[id]/lessons/[lessonId]/comments
 * 
 * Creates a new comment or reply for a lesson.
 * 
 * @requires Authentication
 * 
 * @param {Request} request - The incoming request object
 * @param {RouteParams} params - Route parameters containing the course ID and lesson ID
 * @returns {Promise<NextResponse>} JSON response containing the new comment or error message
 * 
 * @example Request Body
 * ```json
 * {
 *   "content": "Great lesson!",
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

    const { content, parent_id } = await request.json()

    // Validate content
    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      )
    }

    // Verify lesson exists
    const { data: lesson } = await supabase
      .from('lessons')
      .select('id')
      .eq('id', params.lessonId)
      .eq('course_id', params.id)
      .single()

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      )
    }

    // If this is a reply, verify parent comment exists
    if (parent_id) {
      const { data: parentComment } = await supabase
        .from('lesson_comments')
        .select('id')
        .eq('id', parent_id)
        .eq('lesson_id', params.lessonId)
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
      .from('lesson_comments')
      .insert({
        lesson_id: params.lessonId,
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