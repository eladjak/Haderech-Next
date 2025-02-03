/**
 * @file courses/[id]/page.tsx
 * @description Course details page component
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { CourseHeader } from '@/components/course/course-header'
import { CourseSidebar } from '@/components/course/course-sidebar'
import { CourseContent } from '@/components/course/course-content'
import { CourseProgress } from '@/components/course/course-progress'
import { CourseRatings } from '@/components/course/course-ratings'
import { CourseComments } from '@/components/course/course-comments'
import { Database } from '@/types/supabase'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RouteParams {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { data: course } = await supabase
    .from('courses')
    .select('title, description')
    .eq('id', params.id)
    .single()

  if (!course) {
    return {
      title: 'קורס לא נמצא',
      description: 'הקורס המבוקש לא נמצא'
    }
  }

  return {
    title: course.title,
    description: course.description
  }
}

export default async function CoursePage({ params }: RouteParams) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { data: { session } } = await supabase.auth.getSession()

  const { data: course, error } = await supabase
    .from('courses')
    .select(`
      *,
      author:users(*),
      lessons:lessons(
        *,
        progress:progress(*)
      ),
      ratings:course_ratings(
        *,
        user:users(*)
      )
    `)
    .eq('id', params.id)
    .single()

  if (error || !course) {
    notFound()
  }

  const { data: enrollment } = await supabase
    .from('course_enrollments')
    .select('*')
    .eq('course_id', params.id)
    .eq('user_id', session?.user.id)
    .single()

  const completedLessons = course.lessons?.filter((lesson: any) => {
    const progress = lesson.progress?.find((p: any) => p.user_id === session?.user.id)
    return progress?.completed
  })?.length || 0

  const totalLessons = course.lessons?.length || 0
  const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0

  return (
    <div className="container py-8">
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <div>
            <h1 className="mb-2 text-3xl font-bold">{course.title}</h1>
            <p className="text-muted-foreground">{course.description}</p>
          </div>

          <div>
            <h2 className="mb-4 text-2xl font-bold">תוכן הקורס</h2>
            <div className="space-y-4">
              {course.lessons?.map((lesson: any) => (
                <Card key={lesson.id}>
                  <CardHeader>
                    <CardTitle>{lesson.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{lesson.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <CourseRatings course={course} />
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>התקדמות בקורס</CardTitle>
            </CardHeader>
            <CardContent>
              {enrollment ? (
                <CourseProgress course={course} />
              ) : (
                <div className="text-center">
                  <p className="mb-4 text-muted-foreground">
                    הירשם לקורס כדי להתחיל ללמוד
                  </p>
                  <Button className="w-full">
                    הירשם לקורס
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>פרטי הקורס</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium">רמה</div>
                <div className="text-muted-foreground">{course.level}</div>
              </div>
              <div>
                <div className="text-sm font-medium">משך</div>
                <div className="text-muted-foreground">{course.duration} דקות</div>
              </div>
              <div>
                <div className="text-sm font-medium">תגיות</div>
                <div className="text-muted-foreground">{course.tags.join(', ')}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 