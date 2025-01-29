/**
 * @file courses/[courseId]/enroll/route.ts
 * @description API route handlers for course enrollment operations
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

/**
 * POST handler for enrolling in a course
 */
export async function POST(
  _request: Request,
  { params }: { params: { courseId: string } }
) {
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

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'לא מחובר' },
        { status: 401 }
      )
    }

    const { courseId } = params

    // בדיקה אם הקורס קיים
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, title')
      .eq('id', courseId)
      .single()

    if (courseError || !course) {
      return NextResponse.json(
        { error: 'הקורס לא נמצא' },
        { status: 404 }
      )
    }

    // בדיקה אם המשתמש כבר רשום לקורס
    const { data: existingEnrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('course_id', courseId)
      .eq('user_id', session.user.id)
      .single()

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'כבר רשום לקורס זה' },
        { status: 400 }
      )
    }

    // הוספת הרשמה חדשה
    const { error: createError } = await supabase
      .from('enrollments')
      .insert([
        {
          course_id: courseId,
          user_id: session.user.id,
          enrolled_at: new Date().toISOString(),
          status: 'active',
        },
      ])

    if (createError) {
      console.error('שגיאה בהרשמה לקורס:', createError)
      return NextResponse.json(
        { error: 'שגיאה בהרשמה לקורס' },
        { status: 500 }
      )
    }

    // יצירת התראה על הרשמה חדשה
    await supabase
      .from('notifications')
      .insert([
        {
          user_id: session.user.id,
          type: 'enrollment',
          title: `נרשמת בהצלחה לקורס ${course.title}`,
          content: `ברוכים הבאים לקורס ${course.title}! אתה יכול להתחיל ללמוד עכשיו.`,
          read: false,
          created_at: new Date().toISOString(),
        },
      ])

    return NextResponse.json({ message: 'נרשמת בהצלחה לקורס' })
  } catch (error) {
    console.error('שגיאה בהרשמה:', error)
    return NextResponse.json(
      { error: 'שגיאת שרת פנימית' },
      { status: 500 }
    )
  }
}

/**
 * DELETE handler for unenrolling from a course
 */
export async function DELETE(
  _request: Request,
  { params }: { params: { courseId: string } }
) {
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

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'לא מחובר' },
        { status: 401 }
      )
    }

    const { courseId } = params

    // בדיקה אם הקורס קיים
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, title')
      .eq('id', courseId)
      .single()

    if (courseError || !course) {
      return NextResponse.json(
        { error: 'הקורס לא נמצא' },
        { status: 404 }
      )
    }

    // מחיקת ההרשמה
    const { error: deleteError } = await supabase
      .from('enrollments')
      .delete()
      .eq('course_id', courseId)
      .eq('user_id', session.user.id)

    if (deleteError) {
      console.error('שגיאה בביטול הרשמה:', deleteError)
      return NextResponse.json(
        { error: 'שגיאה בביטול ההרשמה' },
        { status: 500 }
      )
    }

    // יצירת התראה על ביטול הרשמה
    await supabase
      .from('notifications')
      .insert([
        {
          user_id: session.user.id,
          type: 'unenrollment',
          title: `ביטלת את ההרשמה לקורס ${course.title}`,
          content: `ההרשמה שלך לקורס ${course.title} בוטלה בהצלחה.`,
          read: false,
          created_at: new Date().toISOString(),
        },
      ])

    return NextResponse.json({ message: 'ההרשמה בוטלה בהצלחה' })
  } catch (error) {
    console.error('שגיאה בביטול הרשמה:', error)
    return NextResponse.json(
      { error: 'שגיאת שרת פנימית' },
      { status: 500 }
    )
  }
} 
