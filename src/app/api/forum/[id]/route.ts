/**
 * @file forum/[id]/route.ts
 * @description API routes for managing individual forum posts. Provides endpoints for retrieving,
 * updating, and deleting specific posts. Includes authentication and authorization checks.
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
 * GET /api/forum/[id]
 * 
 * Retrieves detailed information about a specific forum post, including author details,
 * comments, and comment authors.
 * 
 * @param {Request} request - The incoming request object
 * @param {RouteParams} params - Route parameters containing the post ID
 * @returns {Promise<NextResponse>} JSON response containing the post details or error message
 * 
 * @example Response
 * ```json
 * {
 *   "id": "post1",
 *   "title": "Discussion Topic",
 *   "content": "Let's discuss this topic...",
 *   "created_at": "2024-01-20T12:00:00Z",
 *   "author": {
 *     "name": "John Doe",
 *     "avatar_url": "https://..."
 *   },
 *   "comments": [
 *     {
 *       "id": "comment1",
 *       "content": "Great discussion!",
 *       "created_at": "2024-01-20T12:30:00Z",
 *       "author": {
 *         "name": "Jane Smith",
 *         "avatar_url": "https://..."
 *       }
 *     }
 *   ]
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
    
    const { data: post, error } = await supabase
      .from('forum_posts')
      .select(`
        *,
        author:profiles(id, name, avatar_url),
        comments:forum_comments(
          id,
          content,
          created_at,
          author:profiles(id, name, avatar_url)
        )
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching forum post:', error)
      return NextResponse.json(
        { error: 'שגיאה בקבלת הפוסט' },
        { status: 500 }
      )
    }

    if (!post) {
      return NextResponse.json(
        { error: 'פוסט לא נמצא' },
        { status: 404 }
      )
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error in GET /api/forum/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/forum/[id]
 * 
 * Updates a specific forum post. Only the post author can update the post.
 * 
 * @requires Authentication
 * @requires Authorization: Post author only
 * 
 * @param {Request} request - The incoming request object
 * @param {RouteParams} params - Route parameters containing the post ID
 * @returns {Promise<NextResponse>} JSON response containing the updated post or error message
 * 
 * @example Request Body
 * ```json
 * {
 *   "title": "Updated Topic",
 *   "content": "Updated discussion content..."
 * }
 * ```
 */
export async function PATCH(request: Request, { params }: RouteParams) {
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

    // Get post data
    const { title, content } = await request.json()
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    // Verify post author
    const { data: post } = await supabase
      .from('forum_posts')
      .select('author_id')
      .eq('id', params.id)
      .single()

    if (!post) {
      return NextResponse.json(
        { error: 'פוסט לא נמצא' },
        { status: 404 }
      )
    }

    if (post.author_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Update post
    const { data: updatedPost, error } = await supabase
      .from('forum_posts')
      .update({ title, content })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating forum post:', error)
      return NextResponse.json(
        { error: 'שגיאה בעדכון הפוסט' },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error('Error in PATCH /api/forum/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/forum/[id]
 * 
 * Deletes a specific forum post and its associated comments. Only the post author can delete the post.
 * 
 * @requires Authentication
 * @requires Authorization: Post author only
 * 
 * @param {Request} request - The incoming request object
 * @param {RouteParams} params - Route parameters containing the post ID
 * @returns {Promise<NextResponse>} JSON response indicating success or error message
 */
export async function DELETE(request: Request, { params }: RouteParams) {
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

    // Verify post author
    const { data: post } = await supabase
      .from('forum_posts')
      .select('author_id')
      .eq('id', params.id)
      .single()

    if (!post) {
      return NextResponse.json(
        { error: 'פוסט לא נמצא' },
        { status: 404 }
      )
    }

    if (post.author_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Delete post and its comments (cascade delete)
    const { error } = await supabase
      .from('forum_posts')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting forum post:', error)
      return NextResponse.json(
        { error: 'שגיאה במחיקת הפוסט' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'פוסט נמחק בהצלחה' })
  } catch (error) {
    console.error('Error in DELETE /api/forum/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 