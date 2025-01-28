import { useQuery } from '@tanstack/react-query'
import { getRecommendedCourses } from '@/lib/api'
import { CourseCard } from '@/components/course-card'

interface Course {
  id: string
  title: string
  description: string
  duration: number
  level: 'beginner' | 'intermediate' | 'advanced'
  price: number
  averageRating: number
  thumbnail?: string
}

export function RecommendedCoursesPreview() {
  const { data: recommendedCourses, isLoading, error } = useQuery<Course[]>({
    queryKey: ['recommendedCourses'],
    queryFn: getRecommendedCourses
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        טוען המלצות קורסים...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-destructive">
        שגיאה בטעינת המלצות קורסים
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">
        קורסים מומלצים עבורך
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {recommendedCourses?.slice(0, 3).map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  )
} 