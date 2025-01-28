import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
    const { data: posts, error } = await supabase
      .from('forum_posts')
      .select(`
        *,
        author:profiles(name, avatar_url),
        comments:forum_comments(count)
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error fetching forum posts:', error)
    return NextResponse.json(
      { error: 'שגיאה בטעינת הפוסטים' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
    // וידוא שהמשתמש מחובר
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'יש להתחבר כדי ליצור פוסט' },
        { status: 401 }
      )
    }
    
    const json = await request.json()
    const { title, content, category, tags } = json
    
    const { data: post, error } = await supabase
      .from('forum_posts')
      .insert({
        title,
        content,
        category,
        tags,
        author_id: session.user.id
      })
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json(post)
  } catch (error) {
    console.error('Error creating forum post:', error)
    return NextResponse.json(
      { error: 'שגיאה ביצירת הפוסט' },
      { status: 500 }
    )
  }
} 