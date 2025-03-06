"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import type { Course, Lesson } from "@/types/api";
import { LessonContent } from "./components/lesson-content";
import { LessonSidebar } from "./components/lesson-sidebar";

// הגדרות טיפוס זמניות
interface Lesson {
  id: string;
  title: string;
  content: string;
  duration: string;
  completed?: boolean;
}

interface Course {
  id: string;
  title: string;
  lessons: Lesson[];
}

export default function LessonPage({
  params,
}: {
  params: { id: string; lessonId: string };
}) {
  const [course, setCourse] = useState<Course | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchCourseAndLesson() {
      try {
        setLoading(true);
        // קריאה לשרת לקבלת נתוני הקורס
        const courseResponse = await fetch(`/api/courses/${params.id}`);
        if (!courseResponse.ok) {
          throw new Error("Failed to fetch course data");
        }
        const courseData = await courseResponse.json();
        setCourse(courseData);

        // קריאה לשרת לקבלת נתוני השיעור
        const lessonResponse = await fetch(
          `/api/courses/${params.id}/lessons?lessonId=${params.lessonId}`
        );
        if (!lessonResponse.ok) {
          throw new Error("Failed to fetch lesson data");
        }
        const lessonData = await lessonResponse.json();
        setLesson(lessonData);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching course or lesson:", err);
        setError("אירעה שגיאה בטעינת השיעור");
        setLoading(false);
        toast({
          title: "שגיאה",
          description: "לא ניתן לטעון את נתוני השיעור",
          variant: "destructive",
        });
      }
    }

    fetchCourseAndLesson();
  }, [params.id, params.lessonId, toast]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <h2 className="text-2xl font-bold">שגיאה</h2>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!course || !lesson) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <h2 className="text-2xl font-bold">לא נמצא</h2>
        <p className="text-muted-foreground">השיעור המבוקש לא נמצא</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <div className="w-full flex-1 overflow-y-auto p-4 lg:order-1">
        <LessonContent course={course} lesson={lesson} />
      </div>
      <div className="w-full lg:w-80 lg:flex-none lg:border-l lg:border-border">
        <LessonSidebar course={course} currentLessonId={params.lessonId} />
      </div>
    </div>
  );
}
