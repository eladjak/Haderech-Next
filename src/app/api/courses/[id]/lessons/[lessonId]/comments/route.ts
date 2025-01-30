/**
 * @file courses/[id]/lessons/[lessonId]/comments/route.ts
 * @description API routes for managing lesson comments
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
 * GET handler for retrieving lesson comments
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
      .from('lesson_comments')
      .select(`
        *,
        author:profiles(name, avatar_url)
      `)
      .eq('lesson_id', params.lessonId)
      .order('created_at', { ascending: true })

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
 * POST handler for creating a new comment
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

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { content } = await request.json()
    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Verify lesson exists and belongs to course
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

    const { data: comment, error } = await supabase
      .from('lesson_comments')
      .insert({
        content,
        lesson_id: params.lessonId,
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
        { error: 'Failed to create comment' },
        { status: 500 }
      )
    }

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('Comments POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 