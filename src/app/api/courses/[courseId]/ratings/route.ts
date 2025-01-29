/**
 * @file route.ts
 * @description API route handlers for course ratings operations
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

/**
 * GET handler for retrieving course ratings
 */
export async function GET(
  request: Request,
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

    const { courseId } = params

    const { data: ratings, error } = await supabase
      .from('course_ratings')
      .select(`
        *,
        user:profiles!user_id (
          id,
          name,
          avatar_url
        )
      `)
      .eq('course_id', courseId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('שגיאה בקבלת דירוגים:', error)
      return NextResponse.json(
        { error: 'שגיאה בקבלת דירוגים' },
        { status: 500 }
      )
    }

    return NextResponse.json(ratings)
  } catch (error) {
    console.error('שגיאה בקבלת דירוגים:', error)
    return NextResponse.json(
      { error: 'שגיאת שרת פנימית' },
      { status: 500 }
    )
  }
}

/**
 * POST handler for creating or updating a course rating
 */
export async function POST(
  request: Request,
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
    const { rating, review } = await request.json()

    // בדיקה אם המשתמש רשום לקורס
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('course_id', courseId)
      .eq('user_id', session.user.id)
      .single()

    if (!enrollment) {
      return NextResponse.json(
        { error: 'רק תלמידים רשומים יכולים לדרג את הקורס' },
        { status: 403 }
      )
    }

    // בדיקה אם כבר קיים דירוג מהמשתמש
    const { data: existingRating } = await supabase
      .from('course_ratings')
      .select('id')
      .eq('course_id', courseId)
      .eq('user_id', session.user.id)
      .single()

    if (existingRating) {
      // עדכון דירוג קיים
      const { error: updateError } = await supabase
        .from('course_ratings')
        .update({
          rating,
          review,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingRating.id)

      if (updateError) {
        console.error('שגיאה בעדכון דירוג:', updateError)
        return NextResponse.json(
          { error: 'שגיאה בעדכון הדירוג' },
          { status: 500 }
        )
      }

      return NextResponse.json({ message: 'הדירוג עודכן בהצלחה' })
    } else {
      // יצירת דירוג חדש
      const { error: createError } = await supabase
        .from('course_ratings')
        .insert([
          {
            course_id: courseId,
            user_id: session.user.id,
            rating,
            review,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])

      if (createError) {
        console.error('שגיאה ביצירת דירוג:', createError)
        return NextResponse.json(
          { error: 'שגיאה ביצירת הדירוג' },
          { status: 500 }
        )
      }

      return NextResponse.json({ message: 'הדירוג נוסף בהצלחה' })
    }
  } catch (error) {
    console.error('שגיאה בדירוג:', error)
    return NextResponse.json(
      { error: 'שגיאת שרת פנימית' },
      { status: 500 }
    )
  }
}

/**
 * DELETE handler for removing a course rating
 */
export async function DELETE(
  request: Request,
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

    const { error } = await supabase
      .from('course_ratings')
      .delete()
      .eq('course_id', courseId)
      .eq('user_id', session.user.id)

    if (error) {
      console.error('שגיאה במחיקת דירוג:', error)
      return NextResponse.json(
        { error: 'שגיאה במחיקת הדירוג' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'הדירוג נמחק בהצלחה' })
  } catch (error) {
    console.error('שגיאה במחיקת דירוג:', error)
    return NextResponse.json(
      { error: 'שגיאת שרת פנימית' },
      { status: 500 }
    )
  }
} 