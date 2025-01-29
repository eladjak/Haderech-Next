/**
 * @file route.ts
 * @description API route handler for global search operations
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

type SearchResults = {
  courses: Database['public']['Tables']['courses']['Row'][]
  lessons: Database['public']['Tables']['lessons']['Row'][]
  instructors: Database['public']['Tables']['profiles']['Row'][]
}

/**
 * GET handler for global search
 */
export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const type = searchParams.get('type')

    if (!query) {
      return NextResponse.json(
        { error: 'נדרש ביטוי חיפוש' },
        { status: 400 }
      )
    }

    const results: SearchResults = {
      courses: [],
      lessons: [],
      instructors: []
    }

    // חיפוש קורסים
    if (!type || type === 'courses') {
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select(`
          *,
          instructor:profiles!instructor_id (
            id,
            name,
            avatar_url
          )
        `)
        .or(`
          title.ilike.%${query}%,
          description.ilike.%${query}%,
          category.ilike.%${query}%
        `)
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(10)

      if (coursesError) {
        console.error('שגיאה בחיפוש קורסים:', coursesError)
      } else {
        results.courses = courses || []
      }
    }

    // חיפוש שיעורים
    if (!type || type === 'lessons') {
      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select(`
          *,
          course:courses!course_id (
            id,
            title,
            instructor:profiles!instructor_id (
              id,
              name,
              avatar_url
            )
          )
        `)
        .or(`
          title.ilike.%${query}%,
          description.ilike.%${query}%
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      if (lessonsError) {
        console.error('שגיאה בחיפוש שיעורים:', lessonsError)
      } else {
        // סינון שיעורים מקורסים שפורסמו
        results.lessons = (lessons || []).filter(lesson => lesson.course.published)
      }
    }

    // חיפוש משתמשים (רק מדריכים)
    if (!type || type === 'instructors') {
      const { data: instructors, error: instructorsError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'instructor')
        .or(`
          name.ilike.%${query}%,
          bio.ilike.%${query}%
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      if (instructorsError) {
        console.error('שגיאה בחיפוש מדריכים:', instructorsError)
      } else {
        results.instructors = instructors || []
      }
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('שגיאה בחיפוש:', error)
    return NextResponse.json(
      { error: 'שגיאת שרת פנימית' },
      { status: 500 }
    )
  }
} 