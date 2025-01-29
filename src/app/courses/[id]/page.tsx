/**
 * @file courses/[courseId]/page.tsx
 * @description דף קורס ספציפי
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

import { CourseHeader } from '@/components/course/course-header'
import { CourseSidebar } from '@/components/course/course-sidebar'
import { CourseContent } from '@/components/course/course-content'
import { CourseProgress } from '@/components/course/course-progress'
import { CourseRatings } from '@/components/course/course-ratings'
import { CourseComments } from '@/components/course/course-comments'

interface CoursePageProps {
  params: {
    courseId: string
  }
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

  const { data: course } = await supabase
    .from('courses')
    .select('title, description')
    .eq('id', params.courseId)
    .single()

  if (!course) {
    return {
      title: 'קורס לא נמצא',
      description: 'הקורס המבוקש לא נמצא',
    }
  }

  return {
    title: course.title,
    description: course.description,
  }
}

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

  const { data: { session } } = await supabase.auth.getSession()

  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select(`
      *,
      instructor:profiles!instructor_id (
        id,
        name,
        avatar_url,
        bio
      ),
      lessons (
        *,
        progress:lesson_progress (*)
      ),
      ratings:course_ratings (
        *,
        user:profiles!user_id (
          id,
          name,
          avatar_url
        )
      ),
      comments:course_comments (
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
      )
    `)
    .eq('id', params.courseId)
    .single()

  if (courseError || !course) {
    console.error('Error fetching course:', courseError)
    notFound()
  }

  // בדיקה אם המשתמש רשום לקורס
  let isEnrolled = false
  if (session) {
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('course_id', params.courseId)
      .eq('user_id', session.user.id)
      .single()

    isEnrolled = !!enrollment
  }

  // חישוב התקדמות כללית בקורס
  const totalLessons = course.lessons.length
  const completedLessons = course.lessons.filter(lesson => 
    lesson.progress?.some(p => p.user_id === session?.user.id && p.completed)
  ).length

  const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0

  return (
    <div className="flex flex-col min-h-screen">
      <CourseHeader course={course} isEnrolled={isEnrolled} />
      <div className="flex-1 container grid gap-6 md:grid-cols-7 lg:gap-10 py-8">
        <div className="md:col-span-5">
          <CourseContent course={course} isEnrolled={isEnrolled} />
          <CourseProgress progress={progress} completedLessons={completedLessons} totalLessons={totalLessons} />
          <CourseRatings ratings={course.ratings} courseId={course.id} />
          <CourseComments comments={course.comments} courseId={course.id} />
        </div>
        <aside className="md:col-span-2">
          <CourseSidebar course={course} isEnrolled={isEnrolled} />
        </aside>
      </div>
    </div>
  )
} 