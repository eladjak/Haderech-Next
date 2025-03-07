"use client";

import { CourseCard } from "@/components/courses/CourseCard";

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  students: number;
  rating: number;
  progress?: number;
  level: string;
  tags: string[];
  image?: string;
}

interface CourseListProps {
  courses: Course[];
  className?: string;
}

export function CourseList({ courses, className }: CourseListProps) {
  return (
    <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
