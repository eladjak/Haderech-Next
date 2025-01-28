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
    
    const { data: course, error } = await supabase
      .from('courses')
      .select(`
        *,
        instructor:profiles(name, avatar_url, bio),
        lessons:lessons(
          *,
          content:lesson_content(*)
        ),
        ratings:course_ratings(
          rating,
          review,
          created_at,
          user:profiles(name, avatar_url)
        )
      `)
      .eq('id', params.id)
      .single()
    
    if (error) throw error
    if (!course) {
      return NextResponse.json(
        { error: 'קורס לא נמצא' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(course)
  } catch (error) {
    console.error('Error fetching course:', error)
    return NextResponse.json(
      { error: 'שגיאה בטעינת הקורס' },
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
        { error: 'יש להתחבר כדי לערוך קורס' },
        { status: 401 }
      )
    }
    
    // וידוא שהמשתמש הוא המדריך של הקורס
    const { data: course } = await supabase
      .from('courses')
      .select('instructor_id')
      .eq('id', params.id)
      .single()
    
    if (!course || course.instructor_id !== session.user.id) {
      return NextResponse.json(
        { error: 'אין הרשאה לערוך קורס זה' },
        { status: 403 }
      )
    }
    
    const {
      title,
      description,
      level,
      duration,
      price,
      thumbnail_url,
      topics,
      requirements,
      status
    } = await request.json()
    
    const { data: updatedCourse, error } = await supabase
      .from('courses')
      .update({
        title,
        description,
        level,
        duration,
        price,
        thumbnail_url,
        topics,
        requirements,
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json(updatedCourse)
  } catch (error) {
    console.error('Error updating course:', error)
    return NextResponse.json(
      { error: 'שגיאה בעדכון הקורס' },
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
        { error: 'יש להתחבר כדי למחוק קורס' },
        { status: 401 }
      )
    }
    
    // וידוא שהמשתמש הוא המדריך של הקורס או מנהל
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()
    
    const { data: course } = await supabase
      .from('courses')
      .select('instructor_id')
      .eq('id', params.id)
      .single()
    
    if (!course || (course.instructor_id !== session.user.id && profile?.role !== 'admin')) {
      return NextResponse.json(
        { error: 'אין הרשאה למחוק קורס זה' },
        { status: 403 }
      )
    }
    
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', params.id)
    
    if (error) throw error
    
    return NextResponse.json({ message: 'הקורס נמחק בהצלחה' })
  } catch (error) {
    console.error('Error deleting course:', error)
    return NextResponse.json(
      { error: 'שגיאה במחיקת הקורס' },
      { status: 500 }
    )
  }
} 