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
    
    const { data: comments, error } = await supabase
      .from('forum_comments')
      .select(`
        *,
        author:profiles(name, avatar_url)
      `)
      .eq('post_id', params.id)
      .order('created_at', { ascending: true })
    
    if (error) throw error
    
    return NextResponse.json(comments)
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'שגיאה בטעינת התגובות' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
    // וידוא שהמשתמש מחובר
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'יש להתחבר כדי להגיב' },
        { status: 401 }
      )
    }
    
    const json = await request.json()
    const { content } = json
    
    // וידוא שהפוסט קיים
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
    
    const { data: comment, error } = await supabase
      .from('forum_comments')
      .insert({
        content,
        post_id: params.id,
        author_id: session.user.id
      })
      .select(`
        *,
        author:profiles(name, avatar_url)
      `)
      .single()
    
    if (error) throw error
    
    // עדכון מספר התגובות בפוסט
    await supabase.rpc('increment_comments_count', {
      post_id: params.id
    })
    
    return NextResponse.json(comment)
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'שגיאה ביצירת התגובה' },
      { status: 500 }
    )
  }
} 