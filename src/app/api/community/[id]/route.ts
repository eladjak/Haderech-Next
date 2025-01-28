import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Get specific post
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: post, error } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        content,
        created_at,
        author:profiles(id, name, avatar_url),
        comments:post_comments(
          id,
          content,
          created_at,
          author:profiles(id, name, avatar_url)
        )
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching post:', error)
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
    console.error('Error in GET /api/community/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Update post
export async function PATCH(
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

    // Get post data
    const { title, content } = await req.json()
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    // Check if user is post author
    const { data: post } = await supabase
      .from('posts')
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
      .from('posts')
      .update({ title, content })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating post:', error)
      return NextResponse.json(
        { error: 'שגיאה בעדכון הפוסט' },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error('Error in PATCH /api/community/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Delete post
export async function DELETE(
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

    // Check if user is post author
    const { data: post } = await supabase
      .from('posts')
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

    // Delete post and its comments
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting post:', error)
      return NextResponse.json(
        { error: 'שגיאה במחיקת הפוסט' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'פוסט נמחק בהצלחה' })
  } catch (error) {
    console.error('Error in DELETE /api/community/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 