import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

interface RouteParams {
  params: {
    id: string
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
    // וידוא שהמשתמש מחובר
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'יש להתחבר כדי לעדכן התראה' },
        { status: 401 }
      )
    }
    
    // וידוא שההתראה שייכת למשתמש
    const { data: notification } = await supabase
      .from('notifications')
      .select('user_id')
      .eq('id', params.id)
      .single()
    
    if (!notification || notification.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'אין הרשאה לעדכן התראה זו' },
        { status: 403 }
      )
    }
    
    const { data: updatedNotification, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', params.id)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json(updatedNotification)
  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json(
      { error: 'שגיאה בעדכון ההתראה' },
      { status: 500 }
    )
  }
} 