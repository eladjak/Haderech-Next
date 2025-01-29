/**
 * @file forum/route.ts
 * @description API routes for managing forum posts. Provides endpoints for listing all forum posts
 * and creating new posts. Includes authentication checks and post validation.
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

/**
 * GET /api/forum
 * 
 * Retrieves all forum posts with their author information and comment counts.
 * Posts are ordered by creation date, with newest posts first.
 * 
 * @returns {Promise<NextResponse>} JSON response containing an array of posts or error message
 * 
 * @example Response
 * ```json
 * [
 *   {
 *     "id": "post1",
 *     "title": "Discussion Topic",
 *     "content": "Let's discuss this topic...",
 *     "created_at": "2024-01-20T12:00:00Z",
 *     "author": {
 *       "name": "John Doe",
 *       "avatar_url": "https://..."
 *     },
 *     "comments": {
 *       "count": 5
 *     }
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
    
    const { data: posts, error } = await supabase
      .from('forum_posts')
      .select(`
        *,
        author:profiles(id, name, avatar_url),
        comments:forum_comments(count)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching forum posts:', error)
      return NextResponse.json(
        { error: 'שגיאה בקבלת הפוסטים' },
        { status: 500 }
      )
    }

    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error in GET /api/forum:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/forum
 * 
 * Creates a new forum post. Only authenticated users can create posts.
 * 
 * @requires Authentication
 * 
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response containing the created post or error message
 * 
 * @example Request Body
 * ```json
 * {
 *   "title": "New Discussion Topic",
 *   "content": "Let's discuss this..."
 * }
 * ```
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

    // Create post
    const { data: post, error } = await supabase
      .from('forum_posts')
      .insert({
        title,
        content,
        author_id: session.user.id,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating forum post:', error)
      return NextResponse.json(
        { error: 'שגיאה ביצירת פוסט' },
        { status: 500 }
      )
    }

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/forum:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 