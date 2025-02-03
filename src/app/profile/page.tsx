/**
 * @file profile/page.tsx
 * @description Profile page component that displays and allows editing of user profile information.
 * This is a server component that fetches the initial profile data server-side.
 */

import { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
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
import { UserProfile } from '@/components/user-profile'
import type { User } from '@/types/api'

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
  const supabase = createServerClient(cookieStore)
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    notFound()
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

export default async function ProfilePage() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    notFound()
  }

  const { data: user } = await supabase
    .from('users')
    .select(`
      *,
      courses:course_enrollments(
        course:courses(*)
      )
    `)
    .eq('id', session.user.id)
    .single()

  if (!user) {
    notFound()
  }

  return (
    <div className="container py-8">
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <UserProfile user={user as User} />
        </div>
      </div>
    </div>
  )
} 