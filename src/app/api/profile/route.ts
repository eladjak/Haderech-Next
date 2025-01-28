import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
    // וידוא שהמשתמש מחובר
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'יש להתחבר כדי לצפות בפרופיל' },
        { status: 401 }
      )
    }
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        *,
        courses_enrolled:course_enrollments(count),
        courses_completed:course_enrollments(
          count,
          completed_at
        ),
        achievements:achievements(count)
      `)
      .eq('id', session.user.id)
      .single()
    
    if (error) throw error
    
    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'שגיאה בטעינת הפרופיל' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
    // וידוא שהמשתמש מחובר
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'יש להתחבר כדי לעדכן פרופיל' },
        { status: 401 }
      )
    }
    
    const {
      name,
      bio,
      avatar_url,
      phone,
      gender,
      birth_date,
      relationship_status,
      interests,
      notification_preferences
    } = await request.json()
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        name,
        bio,
        avatar_url,
        phone,
        gender,
        birth_date,
        relationship_status,
        interests,
        notification_preferences,
        updated_at: new Date().toISOString()
      })
      .eq('id', session.user.id)
      .select()
      .single()
    
    if (error) throw error
    
    // בדיקה אם הפרופיל הושלם במלואו
    const isProfileComplete = Boolean(
      profile.name &&
      profile.bio &&
      profile.avatar_url &&
      profile.phone &&
      profile.gender &&
      profile.birth_date &&
      profile.relationship_status &&
      profile.interests?.length > 0
    )
    
    if (isProfileComplete) {
      // בדיקה אם כבר קיים הישג של השלמת פרופיל
      const { data: existingAchievement } = await supabase
        .from('achievements')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('achievement_id', 'complete_profile')
        .single()
      
      if (!existingAchievement) {
        // הוספת הישג של השלמת פרופיל
        await supabase
          .from('achievements')
          .insert({
            user_id: session.user.id,
            achievement_id: 'complete_profile',
            created_at: new Date().toISOString()
          })
      }
    }
    
    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'שגיאה בעדכון הפרופיל' },
      { status: 500 }
    )
  }
} 