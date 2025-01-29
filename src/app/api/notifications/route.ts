/**
 * @file notifications/route.ts
 * @description API route for managing user notifications. Provides endpoints for retrieving
 * user notifications and marking all notifications as read.
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

/**
 * GET /api/notifications
 * 
 * Retrieves all notifications for the current user.
 * 
 * @requires Authentication
 * 
 * @returns {Promise<NextResponse>} JSON response containing an array of notifications or error message
 * 
 * @example Response
 * ```json
 * [
 *   {
 *     "id": "notif1",
 *     "title": "Course Completed",
 *     "content": "Congratulations! You've completed the course.",
 *     "type": "achievement",
 *     "read": false,
 *     "created_at": "2024-01-20T12:00:00Z"
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
    
    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user notifications
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching notifications:', error)
      return NextResponse.json(
        { error: 'שגיאה בקבלת ההתראות' },
        { status: 500 }
      )
    }

    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Error in GET /api/notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/notifications
 * 
 * Marks all notifications as read for the current user.
 * 
 * @requires Authentication
 * 
 * @returns {Promise<NextResponse>} JSON response indicating success or error message
 */
export async function PATCH() {
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

    // Mark all notifications as read
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', session.user.id)
      .eq('read', false)

    if (error) {
      console.error('Error updating notifications:', error)
      return NextResponse.json(
        { error: 'שגיאה בעדכון ההתראות' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'All notifications marked as read' })
  } catch (error) {
    console.error('Error in PATCH /api/notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerClient<Database>({ cookies })
    
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