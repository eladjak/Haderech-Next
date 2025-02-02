/**
 * @file profile/page.tsx
 * @description Profile page component that displays and allows editing of user profile information.
 * This is a server component that fetches the initial profile data server-side.
 */

import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { RecommendedCoursesPreview } from '@/components/recommended-courses-preview'
import { LatestForumPosts } from '@/components/latest-forum-posts'
import { ProfileForm } from '@/components/profile/profile-form'
import { ProfileStats } from '@/components/profile/profile-stats'
import { ProfileHeader } from '@/components/profile/profile-header'

export const metadata: Metadata = {
  title: 'הפרופיל שלי | הדרך',
  description: 'צפה בהתקדמות שלך, העדפות והמלצות אישיות',
}

interface Course {
  id: string
  title: string
  description: string
}

interface CourseEnrollment {
  course: Course
  progress: number
  last_accessed: string
}

interface Profile {
  id: string
  name: string
  bio: string | null
  avatar_url: string | null
  courses: CourseEnrollment[]
}

async function getUserProfile(): Promise<Profile | null> {
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
  if (!session) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      id,
      name,
      bio,
      avatar_url,
      courses:course_enrollments(
        course:courses(
          id,
          title,
          description
        ),
        progress,
        last_accessed
      )
    `)
    .eq('id', session.user.id)
    .single()

  return profile
}

export default async function Profile() {
  const profile = await getUserProfile()

  if (!profile) {
    redirect('/login')
  }

  const totalProgress = profile.courses.reduce(
    (acc: number, curr: CourseEnrollment) => acc + (curr.progress || 0),
    0
  ) / profile.courses.length

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold">הפרופיל שלי</h1>
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        {/* Profile Info */}
        <div>
          <h2 className="text-xl font-semibold">פרטים אישיים</h2>
          <div className="mt-4">
            <p><strong>שם:</strong> {profile.name}</p>
            {profile.bio && <p><strong>אודות:</strong> {profile.bio}</p>}
          </div>
        </div>

        {/* Enrolled Courses */}
        <div>
          <h2 className="text-xl font-semibold">הקורסים שלי</h2>
          <div className="mt-4 space-y-4">
            {profile.courses.map((enrollment) => (
              <div key={enrollment.course.id} className="rounded-lg border p-4">
                <h3 className="font-medium">{enrollment.course.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {enrollment.course.description}
                </p>
                <div className="mt-2 text-sm">
                  <p>התקדמות: {enrollment.progress}%</p>
                  <p>גישה אחרונה: {new Date(enrollment.last_accessed).toLocaleDateString('he-IL')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 