import { CourseCard } from "@/components/course-card";
import type { Course } from "@/types/api";

interface RecommendedCoursesPreviewProps {
  courses: Course[];
}

export function RecommendedCoursesPreview({
  courses,
}: RecommendedCoursesPreviewProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">קורסים מומלצים</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={{
              ...course,
              lessons: course.lessons || [],
              ratings: course.ratings || [],
              comments: course.comments || [],
              instructor: course.instructor,
            }}
          />
        ))}
      </div>
    </div>
  );
}
