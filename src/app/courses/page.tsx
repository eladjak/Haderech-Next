import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Metadata } from "next";
import React from "react";
import { cookies } from "next/headers";
import { CourseCard } from "@/components/courses/CourseCard";

export const metadata: Metadata = {
  title: "קורסים",
  description: "גלה את הקורסים שלנו",
};

export default async function CoursesPage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-center text-3xl font-bold">הקורסים שלנו</h1>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {courses?.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}
