/**
 * @file courses/[id]/page.tsx
 * @description Course details page component
 */

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { cookies } from "next/headers";
import { CourseHeader } from "@/components/course/course-header";
import { CourseContent } from "@/components/course/course-content";
import { CourseSidebar } from "@/components/course/course-sidebar";
import { CourseProgress } from "@/components/course/course-progress";
import { CourseRatings } from "@/components/course/course-ratings";
import { CourseComments } from "@/components/course/course-comments";
import type { CourseWithRelations } from "@/types/courses";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: RouteParams): Promise<Metadata> {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const { data: course } = await supabase
    .from("courses")
    .select("title, description")
    .eq("id", params.id)
    .single();

  if (!course) {
    return {
      title: "קורס לא נמצא",
      description: "הקורס המבוקש לא נמצא",
    };
  }

  return {
    title: course.title,
    description: course.description,
  };
}

export default async function CoursePage({ params }: RouteParams) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data: course } = await supabase
    .from("courses")
    .select(
      `
      *,
      instructor:users!instructor_id(*),
      lessons(
        *,
        progress:lesson_progress(*)
      ),
      ratings(
        *,
        user:users(*)
      )
    `,
    )
    .eq("id", params.id)
    .single();

  if (!course) {
    notFound();
  }

  const typedCourse = course as CourseWithRelations;

  let isEnrolled = false;
  let progress = 0;
  let completedLessons = 0;
  let totalLessons = typedCourse.lessons?.length || 0;

  if (session) {
    const { data: enrollment } = await supabase
      .from("course_enrollments")
      .select("*")
      .eq("course_id", params.id)
      .eq("user_id", session.user.id)
      .single();

    isEnrolled = !!enrollment;

    if (isEnrolled) {
      completedLessons =
        typedCourse.lessons?.filter((lesson) =>
          lesson.progress?.some(
            (p) => p.user_id === session.user.id && p.completed,
          ),
        ).length || 0;

      progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
    }
  }

  return (
    <div className="container py-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <CourseHeader course={typedCourse} isEnrolled={isEnrolled} />
          <CourseContent course={typedCourse} isEnrolled={isEnrolled} />
          <CourseRatings course={typedCourse} />
          <CourseComments
            comments={typedCourse.comments}
            courseId={typedCourse.id}
          />
        </div>
        <div>
          <div className="sticky top-20 space-y-8">
            <CourseSidebar
              course={typedCourse}
              isEnrolled={isEnrolled}
              progress={progress}
            />
            {isEnrolled && (
              <CourseProgress
                completedLessons={completedLessons}
                totalLessons={totalLessons}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
