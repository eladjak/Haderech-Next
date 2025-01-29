/**
 * @file notifications/[id]/route.ts
 * @description API routes for managing individual notifications. Provides endpoints for
 * marking notifications as read and deleting notifications. Includes authentication and
 * authorization checks.
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * PATCH /api/notifications/[id]
 * 
 * Marks a specific notification as read. Only the notification recipient can mark it as read.
 * 
 * @requires Authentication
 * @requires Authorization: Notification recipient only
 * 
 * @param {Request} request - The incoming request object
 * @param {RouteParams} params - Route parameters containing the notification ID
 * @returns {Promise<NextResponse>} JSON response containing the updated notification or error message
 */
export async function PATCH(request: Request, { params }: RouteParams) {
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

    // Verify notification ownership
    const { data: notification } = await supabase
      .from('notifications')
      .select('user_id')
      .eq('id', params.id)
      .single()

    if (!notification) {
      return NextResponse.json(
        { error: 'התראה לא נמצאה' },
        { status: 404 }
      )
    }

    if (notification.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Mark notification as read
    const { data: updatedNotification, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating notification:', error)
      return NextResponse.json(
        { error: 'שגיאה בעדכון ההתראה' },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedNotification)
  } catch (error) {
    console.error('Error in PATCH /api/notifications/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/notifications/[id]
 * 
 * Deletes a specific notification. Only the notification recipient can delete it.
 * 
 * @requires Authentication
 * @requires Authorization: Notification recipient only
 * 
 * @param {Request} request - The incoming request object
 * @param {RouteParams} params - Route parameters containing the notification ID
 * @returns {Promise<NextResponse>} JSON response indicating success or error message
 */
export async function DELETE(request: Request, { params }: RouteParams) {
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

    // Verify notification ownership
    const { data: notification } = await supabase
      .from('notifications')
      .select('user_id')
      .eq('id', params.id)
      .single()

    if (!notification) {
      return NextResponse.json(
        { error: 'התראה לא נמצאה' },
        { status: 404 }
      )
    }

    if (notification.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Delete notification
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting notification:', error)
      return NextResponse.json(
        { error: 'שגיאה במחיקת ההתראה' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'התראה נמחקה בהצלחה' })
  } catch (error) {
    console.error('Error in DELETE /api/notifications/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 