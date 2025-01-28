import { Course, getRecommendedCourses } from '@/lib/api'
import { CourseCard } from '@/components/courses/course-card'

export async function RecommendedCoursesPreview() {
  const recommendedCourses = await getRecommendedCourses()

  if (!recommendedCourses) {
    return (
      <div className="text-center text-muted-foreground">
        טוען המלצות קורסים...
      </div>
    )
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold tracking-tight mb-4">
        קורסים מומלצים עבורך
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendedCourses.slice(0, 3).map((course: Course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  )
} 