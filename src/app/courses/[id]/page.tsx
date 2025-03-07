import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { Metadata } from "next";
import React from "react";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { CourseComments } from "@/components/courses/CourseComments";
import { CourseContent } from "@/components/courses/CourseContent";
import { CourseHeader } from "@/components/courses/CourseHeader";
import { CourseProgress } from "@/components/courses/CourseProgress";
import { CourseRatings } from "@/components/courses/CourseRatings";
import { CourseSidebar } from "@/components/courses/CourseSidebar";

/**
 * @file courses/[id]/page.tsx
 * @description Course details page component
 */

interface RouteParams {
  params: { id: string };
}

export default async function CoursePage({ params }: RouteParams) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const { data: course, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!course || error) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <CourseHeader course={course} />
          <CourseContent course={course} />
          <CourseRatings courseId={course.id} />
          <CourseComments courseId={course.id} />
        </div>
        <div className="md:col-span-1">
          <div className="sticky top-24 space-y-6">
            <CourseSidebar course={course} />
            <CourseProgress courseId={course.id} />
          </div>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({
  params,
}: RouteParams): Promise<Metadata> {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const { data: course, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!course || error) {
    return {
      title: "קורס לא נמצא",
      description: "לא הצלחנו למצוא את הקורס המבוקש",
    };
  }

  return {
    title: `${course.title} - הדרך`,
    description: course.description,
  };
}
