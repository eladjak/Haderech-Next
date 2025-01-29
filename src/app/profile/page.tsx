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
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      *,
      courses:course_enrollments(
        course:courses(
          id,
          title,
          description
        ),
        progress,
        last_accessed
      ),
      completed_courses:course_enrollments(
        count,
        completed_at
      ),
      achievements:user_achievements(count)
    `)
    .eq('id', session.user.id)
    .single()

  if (profile) {
    return profile
  } else {
    const { data: newProfile } = await supabase
      .from('profiles')
      .insert({
        id: session.user.id,
        email: session.user.email,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

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
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={profile.avatar_url || undefined} />
          <AvatarFallback>{profile.name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{profile.name}</h1>
          <p className="text-muted-foreground">{profile.bio || 'אין ביוגרפיה'}</p>
        </div>
      </div>

      <Tabs defaultValue="progress">
        <TabsList>
          <TabsTrigger value="progress">התקדמות</TabsTrigger>
          <TabsTrigger value="courses">הקורסים שלי</TabsTrigger>
          <TabsTrigger value="recommendations">המלצות</TabsTrigger>
        </TabsList>
        
        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>התקדמות כללית</CardTitle>
              <CardDescription>
                התקדמות ממוצעת בכל הקורסים
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Progress value={totalProgress * 100} />
                <p className="text-sm text-muted-foreground">
                  {Math.round(totalProgress * 100)}% הושלמו
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          {profile.courses.map(({ course, progress, last_accessed }) => (
            <Card key={course.id}>
              <CardHeader>
                <CardTitle>{course.title}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Progress value={progress * 100} />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{Math.round(progress * 100)}% הושלמו</span>
                    <span>
                      עודכן לאחרונה: {new Date(last_accessed).toLocaleDateString('he-IL')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-8">
          <RecommendedCoursesPreview />
          <LatestForumPosts />
        </TabsContent>
      </Tabs>
    </div>
  )
} 