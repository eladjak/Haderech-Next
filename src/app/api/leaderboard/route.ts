import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Get leaderboard
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: leaderboard, error } = await supabase
      .from('profiles')
      .select(`
        id,
        name,
        avatar_url,
        score,
        achievements:user_achievements(count)
      `)
      .order('score', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching leaderboard:', error)
      return NextResponse.json(
        { error: 'שגיאה בטעינת טבלת המובילים' },
        { status: 500 }
      )
    }

    // Calculate rank for each user
    const leaderboardWithRanks = leaderboard.map((user, index) => ({
      ...user,
      rank: index + 1
    }))

    return NextResponse.json(leaderboardWithRanks)
  } catch (error) {
    console.error('Error in GET /api/leaderboard:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Update user score
export async function PATCH(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get score data
    const { score } = await req.json()
    if (typeof score !== 'number') {
      return NextResponse.json(
        { error: 'Score must be a number' },
        { status: 400 }
      )
    }

    // Get current score
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('score')
      .eq('id', session.user.id)
      .single()

    if (!currentProfile) {
      return NextResponse.json(
        { error: 'משתמש לא נמצא' },
        { status: 404 }
      )
    }

    // Update score
    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update({ 
        score: currentProfile.score + score,
        updated_at: new Date().toISOString()
      })
      .eq('id', session.user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating score:', error)
      return NextResponse.json(
        { error: 'שגיאה בעדכון הניקוד' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'הניקוד עודכן בהצלחה',
      newScore: updatedProfile.score
    })
  } catch (error) {
    console.error('Error in PATCH /api/leaderboard:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 