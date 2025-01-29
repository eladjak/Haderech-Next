/**
 * @file route.ts
 * @description API route handlers for lesson comments operations
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

/**
 * GET handler for retrieving lesson comments
 */
export async function GET(
  request: Request,
  { params }: { params: { courseId: string; lessonId: string } }
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

    const { lessonId } = params

    const { data: comments, error } = await supabase
      .from('lesson_comments')
      .select(`
        *,
        user:profiles!user_id (
          id,
          name,
          avatar_url
        ),
        replies!parent_id (
          *,
          user:profiles!user_id (
            id,
            name,
            avatar_url
          )
        )
      `)
      .eq('lesson_id', lessonId)
      .is('parent_id', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('שגיאה בקבלת תגובות:', error)
      return NextResponse.json(
        { error: 'שגיאה בקבלת תגובות' },
        { status: 500 }
      )
    }

    return NextResponse.json(comments)
  } catch (error) {
    console.error('שגיאה בקבלת תגובות:', error)
    return NextResponse.json(
      { error: 'שגיאת שרת פנימית' },
      { status: 500 }
    )
  }
}

/**
 * POST handler for creating a new comment
 */
export async function POST(
  request: Request,
  { params }: { params: { courseId: string; lessonId: string } }
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

    const { courseId, lessonId } = params
    const { content, parentId } = await request.json()

    // בדיקה אם המשתמש רשום לקורס
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('course_id', courseId)
      .eq('user_id', session.user.id)
      .single()

    if (!enrollment) {
      return NextResponse.json(
        { error: 'רק תלמידים רשומים יכולים להגיב לשיעור' },
        { status: 403 }
      )
    }

    // יצירת תגובה חדשה
    const { data: comment, error: createError } = await supabase
      .from('lesson_comments')
      .insert([
        {
          lesson_id: lessonId,
          user_id: session.user.id,
          content,
          parent_id: parentId || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select(`
        *,
        user:profiles!user_id (
          id,
          name,
          avatar_url
        )
      `)
      .single()

    if (createError) {
      console.error('שגיאה ביצירת תגובה:', createError)
      return NextResponse.json(
        { error: 'שגיאה ביצירת התגובה' },
        { status: 500 }
      )
    }

    // אם זו תגובה לתגובה אחרת, שלח התראה למשתמש המקורי
    if (parentId) {
      const { data: parentComment } = await supabase
        .from('lesson_comments')
        .select('user_id')
        .eq('id', parentId)
        .single()

      if (parentComment && parentComment.user_id !== session.user.id) {
        await supabase
          .from('notifications')
          .insert([
            {
              user_id: parentComment.user_id,
              type: 'comment_reply',
              title: 'תגובה חדשה לתגובה שלך',
              content: `המשתמש ${session.user.email} הגיב לתגובה שלך`,
              read: false,
              created_at: new Date().toISOString(),
            },
          ])
      }
    }

    return NextResponse.json(comment)
  } catch (error) {
    console.error('שגיאה ביצירת תגובה:', error)
    return NextResponse.json(
      { error: 'שגיאת שרת פנימית' },
      { status: 500 }
    )
  }
}

/**
 * PUT handler for updating a comment
 */
export async function PUT(
  request: Request,
  { params }: { params: { courseId: string; lessonId: string } }
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

    const { id, content } = await request.json()

    // בדיקה אם המשתמש הוא בעל התגובה
    const { data: comment } = await supabase
      .from('lesson_comments')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!comment || comment.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'אין הרשאה לערוך תגובה זו' },
        { status: 403 }
      )
    }

    const { error } = await supabase
      .from('lesson_comments')
      .update({
        content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      console.error('שגיאה בעדכון תגובה:', error)
      return NextResponse.json(
        { error: 'שגיאה בעדכון התגובה' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'התגובה עודכנה בהצלחה' })
  } catch (error) {
    console.error('שגיאה בעדכון תגובה:', error)
    return NextResponse.json(
      { error: 'שגיאת שרת פנימית' },
      { status: 500 }
    )
  }
}

/**
 * DELETE handler for removing a comment
 */
export async function DELETE(
  request: Request,
  { params }: { params: { courseId: string; lessonId: string } }
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

    const { searchParams } = new URL(request.url)
    const commentId = searchParams.get('id')

    if (!commentId) {
      return NextResponse.json(
        { error: 'נדרש מזהה תגובה' },
        { status: 400 }
      )
    }

    // בדיקה אם המשתמש הוא בעל התגובה או מדריך הקורס
    const { data: comment } = await supabase
      .from('lesson_comments')
      .select('user_id')
      .eq('id', commentId)
      .single()

    if (!comment) {
      return NextResponse.json(
        { error: 'התגובה לא נמצאה' },
        { status: 404 }
      )
    }

    const { data: course } = await supabase
      .from('courses')
      .select('instructor_id')
      .eq('id', params.courseId)
      .single()

    if (comment.user_id !== session.user.id && course?.instructor_id !== session.user.id) {
      return NextResponse.json(
        { error: 'אין הרשאה למחוק תגובה זו' },
        { status: 403 }
      )
    }

    const { error } = await supabase
      .from('lesson_comments')
      .delete()
      .eq('id', commentId)

    if (error) {
      console.error('שגיאה במחיקת תגובה:', error)
      return NextResponse.json(
        { error: 'שגיאה במחיקת התגובה' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'התגובה נמחקה בהצלחה' })
  } catch (error) {
    console.error('שגיאה במחיקת תגובה:', error)
    return NextResponse.json(
      { error: 'שגיאת שרת פנימית' },
      { status: 500 }
    )
  }
} 