import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
    // וידוא שהמשתמש מחובר
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'יש להתחבר כדי לצפות בהתראות' },
        { status: 401 }
      )
    }
    
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('read', false)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'שגיאה בטעינת ההתראות' },
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
        { error: 'יש להתחבר כדי ליצור התראה' },
        { status: 401 }
      )
    }
    
    const { title, content, type, target_user_id } = await request.json()
    
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        title,
        content,
        type,
        user_id: target_user_id,
        created_by: session.user.id,
        read: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json(notification)
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json(
      { error: 'שגיאה ביצירת ההתראה' },
      { status: 500 }
    )
  }
} 