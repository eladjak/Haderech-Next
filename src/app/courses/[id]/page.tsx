import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Star, Users } from 'lucide-react'

interface CourseDetailProps {
  params: {
    id: string
  }
}

async function getCourse(id: string) {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: course, error } = await supabase
    .from('courses')
    .select(`
      *,
      lessons:course_lessons(count),
      students:course_enrollments(count),
      ratings:course_ratings(rating)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching course:', error)
    return null
  }

  const averageRating = course.ratings.length > 0
    ? course.ratings.reduce((acc: number, curr: { rating: number }) => acc + curr.rating, 0) / course.ratings.length
    : 0

  return {
    ...course,
    studentsCount: course.students[0]?.count || 0,
    lessonsCount: course.lessons[0]?.count || 0,
    averageRating,
  }
}

export async function generateMetadata({ params }: CourseDetailProps): Promise<Metadata> {
  const course = await getCourse(params.id)

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

export default async function CourseDetail({ params }: CourseDetailProps) {
  const course = await getCourse(params.id)

  if (!course) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-3xl">{course.title}</CardTitle>
          <CardDescription className="text-lg">
            {course.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{course.duration} שעות</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{course.studentsCount} תלמידים</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span>{course.averageRating.toFixed(1)} דירוג ממוצע</span>
            </div>
          </div>
          <div className="mt-6">
            <h3 className="mb-2 text-lg font-semibold">מה תלמדו בקורס:</h3>
            <ul className="list-disc space-y-1 rtl:mr-4">
              {course.syllabus?.map((item: string) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="mt-8 flex justify-between">
            <div className="text-2xl font-bold">₪{course.price}</div>
            <Button size="lg">הרשמה לקורס</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 