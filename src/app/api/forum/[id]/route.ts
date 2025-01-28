import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
    const { data: post, error } = await supabase
      .from('forum_posts')
      .select(`
        *,
        author:profiles(name, avatar_url),
        comments:forum_comments(
          *,
          author:profiles(name, avatar_url)
        )
      `)
      .eq('id', params.id)
      .single()
    
    if (error) throw error
    if (!post) {
      return NextResponse.json(
        { error: 'פוסט לא נמצא' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(post)
  } catch (error) {
    console.error('Error fetching forum post:', error)
    return NextResponse.json(
      { error: 'שגיאה בטעינת הפוסט' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
    // וידוא שהמשתמש מחובר
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'יש להתחבר כדי לערוך פוסט' },
        { status: 401 }
      )
    }
    
    const json = await request.json()
    const { title, content } = json
    
    // וידוא שהמשתמש הוא בעל הפוסט
    const { data: post } = await supabase
      .from('forum_posts')
      .select('author_id')
      .eq('id', params.id)
      .single()
    
    if (!post || post.author_id !== session.user.id) {
      return NextResponse.json(
        { error: 'אין הרשאה לערוך פוסט זה' },
        { status: 403 }
      )
    }
    
    const { data: updatedPost, error } = await supabase
      .from('forum_posts')
      .update({ title, content })
      .eq('id', params.id)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error('Error updating forum post:', error)
    return NextResponse.json(
      { error: 'שגיאה בעדכון הפוסט' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
    // וידוא שהמשתמש מחובר
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'יש להתחבר כדי למחוק פוסט' },
        { status: 401 }
      )
    }
    
    // וידוא שהמשתמש הוא בעל הפוסט או מנהל
    const { data: post } = await supabase
      .from('forum_posts')
      .select('author_id')
      .eq('id', params.id)
      .single()
    
    if (!post || (post.author_id !== session.user.id && session.user.role !== 'admin')) {
      return NextResponse.json(
        { error: 'אין הרשאה למחוק פוסט זה' },
        { status: 403 }
      )
    }
    
    const { error } = await supabase
      .from('forum_posts')
      .delete()
      .eq('id', params.id)
    
    if (error) throw error
    
    return NextResponse.json({ message: 'הפוסט נמחק בהצלחה' })
  } catch (error) {
    console.error('Error deleting forum post:', error)
    return NextResponse.json(
      { error: 'שגיאה במחיקת הפוסט' },
      { status: 500 }
    )
  }
} 