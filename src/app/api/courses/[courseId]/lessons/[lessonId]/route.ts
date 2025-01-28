import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
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
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
    const { data: lesson, error } = await supabase
      .from('lessons')
      .select(`
        *,
        content:lesson_content(*),
        course:courses(
          id,
          title,
          instructor_id
        )
      `)
      .eq('id', params.lessonId)
      .eq('course_id', params.courseId)
      .single()
    
    if (error) throw error
    if (!lesson) {
      return NextResponse.json(
        { error: 'שיעור לא נמצא' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(lesson)
  } catch (error) {
    console.error('Error fetching lesson:', error)
    return NextResponse.json(
      { error: 'שגיאה בטעינת השיעור' },
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
        { error: 'יש להתחבר כדי לערוך שיעור' },
        { status: 401 }
      )
    }
    
    // וידוא שהמשתמש הוא המדריך של הקורס
    const { data: course } = await supabase
      .from('courses')
      .select('instructor_id')
      .eq('id', params.courseId)
      .single()
    
    if (!course || course.instructor_id !== session.user.id) {
      return NextResponse.json(
        { error: 'אין הרשאה לערוך שיעור בקורס זה' },
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
    
    // עדכון השיעור
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .update({
        title,
        description,
        duration,
        type,
        order,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.lessonId)
      .select()
      .single()
    
    if (lessonError) throw lessonError
    
    // עדכון תוכן השיעור
    const { error: contentError } = await supabase
      .from('lesson_content')
      .update(content)
      .eq('lesson_id', params.lessonId)
    
    if (contentError) throw contentError
    
    // קבלת השיעור המלא עם התוכן המעודכן
    const { data: fullLesson, error: fetchError } = await supabase
      .from('lessons')
      .select(`
        *,
        content:lesson_content(*)
      `)
      .eq('id', params.lessonId)
      .single()
    
    if (fetchError) throw fetchError
    
    return NextResponse.json(fullLesson)
  } catch (error) {
    console.error('Error updating lesson:', error)
    return NextResponse.json(
      { error: 'שגיאה בעדכון השיעור' },
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
        { error: 'יש להתחבר כדי למחוק שיעור' },
        { status: 401 }
      )
    }
    
    // וידוא שהמשתמש הוא המדריך של הקורס
    const { data: course } = await supabase
      .from('courses')
      .select('instructor_id')
      .eq('id', params.courseId)
      .single()
    
    if (!course || course.instructor_id !== session.user.id) {
      return NextResponse.json(
        { error: 'אין הרשאה למחוק שיעור בקורס זה' },
        { status: 403 }
      )
    }
    
    // מחיקת תוכן השיעור
    const { error: contentError } = await supabase
      .from('lesson_content')
      .delete()
      .eq('lesson_id', params.lessonId)
    
    if (contentError) throw contentError
    
    // מחיקת השיעור
    const { error: lessonError } = await supabase
      .from('lessons')
      .delete()
      .eq('id', params.lessonId)
    
    if (lessonError) throw lessonError
    
    return NextResponse.json({ message: 'השיעור נמחק בהצלחה' })
  } catch (error) {
    console.error('Error deleting lesson:', error)
    return NextResponse.json(
      { error: 'שגיאה במחיקת השיעור' },
      { status: 500 }
    )
  }
} 