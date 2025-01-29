/**
 * @file courses/[id]/page.tsx
 * @description Course details page component that displays comprehensive information about a specific course.
 * This is a server component that fetches the course data server-side.
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Star, Users } from 'lucide-react'
import { CourseHeader } from '@/components/course/course-header'
import { CourseLessons } from '@/components/course/course-lessons'
import { CourseRatings } from '@/components/course/course-ratings'
import { CourseProgress } from '@/components/course/course-progress'

interface CoursePageProps {
  params: {
    id: string
  }
}

/**
 * Course details page component
 * 
 * @param props - Component props containing the course ID
 * @returns The course details page with lessons, ratings, and progress information
 */
export default async function CoursePage({ params }: CoursePageProps) {
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

  // Get course with related data
  const { data: course } = await supabase
    .from('courses')
    .select(`
      *,
      instructor:profiles(
        id,
        name,
        avatar_url,
        bio
      ),
      lessons:lessons(
        id,
        title,
        description,
        duration,
        type,
        order
      ),
      ratings:course_ratings(
        rating,
        review,
        created_at,
        user:profiles(
          name,
          avatar_url
        )
      )
    `)
    .eq('id', params.id)
    .single()

  if (!course) {
    notFound()
  }

  // Get user's enrollment and progress if authenticated
  const { data: { session } } = await supabase.auth.getSession()
  let enrollment = null
  let progress = null

  if (session) {
    const { data: enrollmentData } = await supabase
      .from('course_enrollments')
      .select('*')
      .eq('course_id', params.id)
      .eq('user_id', session.user.id)
      .single()

    if (enrollmentData) {
      enrollment = enrollmentData

      const { data: progressData } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('course_id', params.id)
        .eq('user_id', session.user.id)

      progress = progressData
    }
  }

  // Calculate course statistics
  const stats = {
    totalLessons: course.lessons?.length ?? 0,
    totalDuration: course.lessons?.reduce((acc, lesson) => acc + (lesson.duration ?? 0), 0) ?? 0,
    averageRating: course.ratings?.reduce((acc, r) => acc + r.rating, 0) / (course.ratings?.length ?? 1) ?? 0,
    totalRatings: course.ratings?.length ?? 0,
    completedLessons: progress?.filter(p => p.completed)?.length ?? 0,
  }

  return (
    <div className="container mx-auto py-8">
      <CourseHeader
        course={course}
        stats={stats}
        enrollment={enrollment}
      />
      <div className="grid gap-8 mt-8">
        <CourseLessons
          lessons={course.lessons}
          progress={progress}
          isEnrolled={!!enrollment}
        />
        <CourseRatings ratings={course.ratings} />
        {enrollment && (
          <CourseProgress
            stats={stats}
            progress={progress}
          />
        )}
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
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

  // Get course with related data
  const { data: course } = await supabase
    .from('courses')
    .select(`
      *,
      instructor:profiles(
        id,
        name,
        avatar_url,
        bio
      ),
      lessons:lessons(
        id,
        title,
        description,
        duration,
        type,
        order
      ),
      ratings:course_ratings(
        rating,
        review,
        created_at,
        user:profiles(
          name,
          avatar_url
        )
      )
    `)
    .eq('id', params.id)
    .single()

  if (!course) {
    return {
      title: 'קורס לא נמצא | הדרך',
      description: 'הקורס המבוקש לא נמצא במערכת',
    }
  }

  return {
    title: `${course.title} | הדרך`,
    description: course.description,
    openGraph: {
      title: `${course.title} | הדרך`,
      description: course.description,
      type: 'website',
    },
  }
} 