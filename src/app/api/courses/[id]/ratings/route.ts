import { createServerClient } from '@supabase/ssr'
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
    
    const { data: ratings, error } = await supabase
      .from('course_ratings')
      .select(`
        *,
        user:profiles(name, avatar_url)
      `)
      .eq('course_id', params.id)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return NextResponse.json(ratings)
  } catch (error) {
    console.error('Error fetching course ratings:', error)
    return NextResponse.json(
      { error: 'שגיאה בטעינת הדירוגים' },
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
        { error: 'יש להתחבר כדי לדרג קורס' },
        { status: 401 }
      )
    }
    
    // וידוא שהקורס קיים
    const { data: course } = await supabase
      .from('courses')
      .select('id')
      .eq('id', params.id)
      .single()
    
    if (!course) {
      return NextResponse.json(
        { error: 'קורס לא נמצא' },
        { status: 404 }
      )
    }
    
    // בדיקה אם המשתמש כבר דירג את הקורס
    const { data: existingRating } = await supabase
      .from('course_ratings')
      .select('id')
      .eq('course_id', params.id)
      .eq('user_id', session.user.id)
      .single()
    
    if (existingRating) {
      return NextResponse.json(
        { error: 'כבר דירגת קורס זה' },
        { status: 400 }
      )
    }
    
    const { rating, review } = await request.json()
    
    const { data: newRating, error } = await supabase
      .from('course_ratings')
      .insert({
        rating,
        review,
        course_id: params.id,
        user_id: session.user.id,
        created_at: new Date().toISOString()
      })
      .select(`
        *,
        user:profiles(name, avatar_url)
      `)
      .single()
    
    if (error) throw error
    
    // עדכון הדירוג הממוצע של הקורס
    await supabase.rpc('update_course_average_rating', {
      course_id: params.id
    })
    
    return NextResponse.json(newRating)
  } catch (error) {
    console.error('Error creating course rating:', error)
    return NextResponse.json(
      { error: 'שגיאה ביצירת הדירוג' },
      { status: 500 }
    )
  }
} 