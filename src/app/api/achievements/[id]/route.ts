import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Update achievement progress
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
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
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get progress data
    const { progress } = await req.json()
    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      return NextResponse.json(
        { error: 'Progress must be a number between 0 and 100' },
        { status: 400 }
      )
    }

    // Update achievement progress
    const { data: achievement, error } = await supabase
      .from('user_achievements')
      .update({ 
        progress,
        completed: progress === 100,
        completed_at: progress === 100 ? new Date().toISOString() : null
      })
      .eq('id', params.id)
      .eq('user_id', session.user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating achievement:', error)
      return NextResponse.json(
        { error: 'שגיאה בעדכון התקדמות ההישג' },
        { status: 500 }
      )
    }

    if (!achievement) {
      return NextResponse.json(
        { error: 'הישג לא נמצא' },
        { status: 404 }
      )
    }

    return NextResponse.json(achievement)
  } catch (error) {
    console.error('Error in PATCH /api/achievements/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 