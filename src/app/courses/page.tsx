import { Metadata } from "next";
import { CourseCard } from "@/components/course-card";
import { courses } from "@/constants/courses";

export const metadata: Metadata = {
  title: "קורסים",
  description: "גלה את הקורסים שלנו",
};

export default function CoursesPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">קורסים</h1>
        <p className="text-muted-foreground">
          גלה את הקורסים שלנו ולמד מהמומחים המובילים בתחום
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}
