import { CourseCard } from "@/components/course-card";

import type { Course } from "@/types/api";

interface CourseListProps {
  courses: Course[];
  className?: string;
}

export function CourseList({ courses, className }: CourseListProps) {
  return (
    <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
        />
      ))}
    </div>
  );
}
