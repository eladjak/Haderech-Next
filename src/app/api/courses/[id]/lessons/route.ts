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
    
    const { data: lessons, error } = await supabase
      .from('lessons')
      .select(`
        *,
        content:lesson_content(*)
      `)
      .eq('course_id', params.id)
      .order('order', { ascending: true })
    
    if (error) throw error
    
    return NextResponse.json(lessons)
  } catch (error) {
    console.error('Error fetching lessons:', error)
    return NextResponse.json(
      { error: 'שגיאה בטעינת השיעורים' },
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
        { error: 'יש להתחבר כדי ליצור שיעור' },
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
        { error: 'אין הרשאה ליצור שיעור בקורס זה' },
        { status: 403 }
      )
    }
    
    const {
      title,
      description,
      duration,
      type,
      order,
      content
    } = await request.json()
    
    // יצירת השיעור
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .insert({
        title,
        description,
        duration,
        type,
        order,
        course_id: params.id,
        created_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (lessonError) throw lessonError
    
    // יצירת תוכן השיעור
    const { error: contentError } = await supabase
      .from('lesson_content')
      .insert({
        lesson_id: lesson.id,
        ...content
      })
    
    if (contentError) {
      // אם יש שגיאה ביצירת התוכן, נמחק את השיעור שנוצר
      await supabase
        .from('lessons')
        .delete()
        .eq('id', lesson.id)
      
      throw contentError
    }
    
    // קבלת השיעור המלא עם התוכן
    const { data: fullLesson, error: fetchError } = await supabase
      .from('lessons')
      .select(`
        *,
        content:lesson_content(*)
      `)
      .eq('id', lesson.id)
      .single()
    
    if (fetchError) throw fetchError
    
    return NextResponse.json(fullLesson)
  } catch (error) {
    console.error('Error creating lesson:', error)
    return NextResponse.json(
      { error: 'שגיאה ביצירת השיעור' },
      { status: 500 }
    )
  }
} 