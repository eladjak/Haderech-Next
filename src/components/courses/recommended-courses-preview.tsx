"use client";

import { CourseCard } from "@/components/courses/course-card";
import type { CourseWithRelations } from "@/types/courses";

interface RecommendedCoursesPreviewProps {
  courses: Partial<CourseWithRelations>[];
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
              id: course.id || "",
              title: course.title || "",
              description: course.description || "",
              level: course.level || "מתחילים",
              price: course.price || 0,
              duration: course.duration || 0,
              total_students: course.total_students || 0,
              created_at: course.created_at || new Date().toISOString(),
              updated_at: course.updated_at || new Date().toISOString(),
              thumbnail: course.thumbnail,
              lessons: course.lessons || [],
              ratings: course.ratings || [],
              comments: course.comments || [],
              instructor: course.instructor || {
                name: "מרצה לא ידוע",
              },
              _count: {
                students: course._count?.students || 0,
              },
            }}
          />
        ))}
      </div>
    </div>
  );
}
