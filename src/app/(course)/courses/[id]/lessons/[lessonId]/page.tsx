"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import type { Course, Lesson } from "@/types/api";
import { LessonContent } from "./components/lesson-content";
import { LessonSidebar } from "./components/lesson-sidebar";
import { logger } from "@/lib/utils/logger";

export default function LessonPage({
  params,
}: {
  params: { id: string; lessonId: string };
}) {
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [courseResponse, lessonResponse] = await Promise.all([
          fetch(`/api/courses/${params.id}`),
          fetch(`/api/lessons/${params.lessonId}`),
        ]);

        if (!courseResponse.ok || !lessonResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const [courseData, lessonData] = await Promise.all([
          courseResponse.json(),
          lessonResponse.json(),
        ]);

        setCourse(courseData);
        setLesson(lessonData);
      } catch (error) {
        logger.error("Error fetching data:", error);
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה בטעינת השיעור",
          variant: "destructive",
        });
      }
    }

    fetchData();
  }, [params.id, params.lessonId, toast]);

  if (!course || !lesson) {
    return (
      <div className="container py-8">
        <div className="text-center">טוען...</div>
      </div>
    );
  }

  return (
    <div className="container grid gap-8 py-8 md:grid-cols-[1fr_300px]">
      <LessonContent lesson={lesson} />
      <LessonSidebar
        course={course}
        currentLessonId={lesson.id}
        className="hidden md:block"
      />
    </div>
  );
}
