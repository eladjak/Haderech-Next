import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

interface RouteParams {
  params: {
    courseId: string
    lessonId: string
  }
}

export async function GET(request: Request, { params }: RouteParams) {
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
    
    // וידוא שהמשתמש מחובר
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'יש להתחבר כדי לצפות בהתקדמות' },
        { status: 401 }
      )
    }
    
    const { data: progress, error } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('lesson_id', params.lessonId)
      .eq('user_id', session.user.id)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error // PGRST116 = לא נמצא
    
    return NextResponse.json(progress || { completed: false, progress: 0 })
  } catch (error) {
    console.error('Error fetching lesson progress:', error)
    return NextResponse.json(
      { error: 'שגיאה בטעינת ההתקדמות' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request, { params }: RouteParams) {
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
    
    // וידוא שהמשתמש מחובר
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'יש להתחבר כדי לעדכן התקדמות' },
        { status: 401 }
      )
    }
    
    const { completed, progress } = await request.json()
    
    // בדיקה אם כבר קיימת התקדמות
    const { data: existingProgress } = await supabase
      .from('lesson_progress')
      .select('id')
      .eq('lesson_id', params.lessonId)
      .eq('user_id', session.user.id)
      .single()
    
    let result
    
    if (existingProgress) {
      // עדכון התקדמות קיימת
      const { data, error } = await supabase
        .from('lesson_progress')
        .update({
          completed,
          progress,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingProgress.id)
        .select()
        .single()
      
      if (error) throw error
      result = data
    } else {
      // יצירת התקדמות חדשה
      const { data, error } = await supabase
        .from('lesson_progress')
        .insert({
          lesson_id: params.lessonId,
          course_id: params.courseId,
          user_id: session.user.id,
          completed,
          progress,
          created_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) throw error
      result = data
    }
    
    // אם השיעור הושלם, נעדכן את ההתקדמות הכללית בקורס
    if (completed) {
      await supabase.rpc('update_course_progress', {
        p_course_id: params.courseId,
        p_user_id: session.user.id
      })
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating lesson progress:', error)
    return NextResponse.json(
      { error: 'שגיאה בעדכון ההתקדמות' },
      { status: 500 }
    )
  }
} 