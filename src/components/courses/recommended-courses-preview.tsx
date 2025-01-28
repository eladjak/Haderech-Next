import type { Course } from "@/types/courses"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CourseCard } from "@/components/courses/course-card"

interface RecommendedCoursesPreviewProps {
  courses: Course[]
}

export function RecommendedCoursesPreview({ courses }: RecommendedCoursesPreviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>קורסים מומלצים</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 