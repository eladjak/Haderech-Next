import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

interface RouteParams {
  params: {
    id: string
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
        { error: 'יש להתחבר כדי להירשם לקורס' },
        { status: 401 }
      )
    }
    
    // בדיקה אם הקורס קיים
    const { data: course } = await supabase
      .from('courses')
      .select('id, price')
      .eq('id', params.id)
      .single()
    
    if (!course) {
      return NextResponse.json(
        { error: 'קורס לא נמצא' },
        { status: 404 }
      )
    }
    
    // בדיקה אם המשתמש כבר רשום לקורס
    const { data: enrollment } = await supabase
      .from('course_enrollments')
      .select('id')
      .eq('course_id', params.id)
      .eq('user_id', session.user.id)
      .single()
    
    if (enrollment) {
      return NextResponse.json(
        { error: 'כבר נרשמת לקורס זה' },
        { status: 400 }
      )
    }
    
    // קבלת פרטי התשלום מהבקשה
    const { payment_method_id, coupon_code } = await request.json()
    
    // חישוב המחיר הסופי (כאן צריך להוסיף לוגיקה של קופונים)
    const final_price = course.price
    
    // יצירת רשומת הרשמה
    const { data: newEnrollment, error: enrollmentError } = await supabase
      .from('course_enrollments')
      .insert({
        course_id: params.id,
        user_id: session.user.id,
        payment_status: 'pending',
        payment_amount: final_price,
        payment_method: payment_method_id,
        coupon_code,
        created_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (enrollmentError) throw enrollmentError
    
    // כאן צריך להוסיף לוגיקה של עיבוד תשלום
    // לדוגמה: קריאה לשירות תשלומים חיצוני
    
    // עדכון סטטוס התשלום ל"הושלם"
    const { error: updateError } = await supabase
      .from('course_enrollments')
      .update({
        payment_status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', newEnrollment.id)
    
    if (updateError) throw updateError
    
    // יצירת התראה על הרשמה מוצלחת
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: session.user.id,
        title: 'נרשמת בהצלחה לקורס',
        content: `נרשמת בהצלחה לקורס. אתה יכול להתחיל ללמוד עכשיו!`,
        type: 'enrollment',
        read: false,
        created_at: new Date().toISOString()
      })
    
    if (notificationError) {
      console.error('Error creating notification:', notificationError)
    }
    
    return NextResponse.json({
      message: 'נרשמת בהצלחה לקורס',
      enrollment: newEnrollment
    })
  } catch (error) {
    console.error('Error enrolling in course:', error)
    return NextResponse.json(
      { error: 'שגיאה בהרשמה לקורס' },
      { status: 500 }
    )
  }
} 