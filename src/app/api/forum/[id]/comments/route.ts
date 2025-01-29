/**
 * @file forum/[id]/comments/route.ts
 * @description API routes for managing forum post comments. Provides endpoints for retrieving
 * comments for a post and adding new comments. Includes authentication checks and comment validation.
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
 * GET /api/forum/[id]/comments
 * 
 * Retrieves all comments for a specific forum post, including author information for each comment.
 * Comments are ordered by creation date, with oldest comments first.
 * 
 * @param {Request} request - The incoming request object
 * @param {RouteParams} params - Route parameters containing the post ID
 * @returns {Promise<NextResponse>} JSON response containing an array of comments or error message
 * 
 * @example Response
 * ```json
 * [
 *   {
 *     "id": "comment1",
 *     "content": "Great discussion!",
 *     "created_at": "2024-01-20T12:00:00Z",
 *     "author": {
 *       "name": "John Doe",
 *       "avatar_url": "https://..."
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
    
    const { data: comments, error } = await supabase
      .from('forum_comments')
      .select(`
        *,
        author:profiles(name, avatar_url)
      `)
      .eq('post_id', params.id)
      .order('created_at', { ascending: true })
    
    if (error) {
      console.error('Error fetching comments:', error)
      return NextResponse.json(
        { error: 'שגיאה בקבלת התגובות' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(comments)
  } catch (error) {
    console.error('Error in GET /api/forum/[id]/comments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/forum/[id]/comments
 * 
 * Creates a new comment on a forum post. Only authenticated users can comment.
 * 
 * @requires Authentication
 * 
 * @param {Request} request - The incoming request object
 * @param {RouteParams} params - Route parameters containing the post ID
 * @returns {Promise<NextResponse>} JSON response containing the created comment or error message
 * 
 * @example Request Body
 * ```json
 * {
 *   "content": "This is my comment..."
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
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // Get comment data
    const { content } = await request.json()
    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }
    
    // Verify post exists
    const { data: post } = await supabase
      .from('forum_posts')
      .select('id')
      .eq('id', params.id)
      .single()
    
    if (!post) {
      return NextResponse.json(
        { error: 'פוסט לא נמצא' },
        { status: 404 }
      )
    }
    
    // Create comment
    const { data: comment, error } = await supabase
      .from('forum_comments')
      .insert({
        content,
        post_id: params.id,
        author_id: session.user.id,
        created_at: new Date().toISOString()
      })
      .select(`
        *,
        author:profiles(name, avatar_url)
      `)
      .single()
    
    if (error) {
      console.error('Error creating comment:', error)
      return NextResponse.json(
        { error: 'שגיאה ביצירת תגובה' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/forum/[id]/comments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 