import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Get comments for a post
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: comments, error } = await supabase
      .from('post_comments')
      .select(`
        id,
        content,
        created_at,
        author:profiles(id, name, avatar_url)
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
    console.error('Error in GET /api/community/[id]/comments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Add comment to a post
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get comment data
    const { content } = await req.json()
    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Check if post exists
    const { data: post } = await supabase
      .from('posts')
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
      .from('post_comments')
      .insert({
        content,
        post_id: params.id,
        author_id: session.user.id,
        created_at: new Date().toISOString()
      })
      .select(`
        id,
        content,
        created_at,
        author:profiles(id, name, avatar_url)
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
    console.error('Error in POST /api/community/[id]/comments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 