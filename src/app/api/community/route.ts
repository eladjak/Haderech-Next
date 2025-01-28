import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Get all posts
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        content,
        created_at,
        author:profiles(id, name, avatar_url),
        comments:post_comments(count)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching posts:', error)
      return NextResponse.json(
        { error: 'שגיאה בקבלת הפוסטים' },
        { status: 500 }
      )
    }

    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error in GET /api/community:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Create new post
export async function POST(req: Request) {
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

    // Get post data from request body
    const { title, content } = await req.json()
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    // Create post
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        title,
        content,
        author_id: session.user.id,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating post:', error)
      return NextResponse.json(
        { error: 'שגיאה ביצירת פוסט' },
        { status: 500 }
      )
    }

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/community:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 