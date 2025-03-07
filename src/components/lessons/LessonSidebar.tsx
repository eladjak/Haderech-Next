"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed?: boolean;
}

interface LessonSidebarProps {
  courseId: string;
  lessons: Lesson[];
  currentLessonId: string;
}

export default function LessonSidebar({
  courseId,
  lessons,
  currentLessonId,
}: LessonSidebarProps) {
  const currentIndex = lessons.findIndex(
    (lesson) => lesson.id === currentLessonId
  );
  const previousLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-right text-xl font-bold">
          תוכן הקורס
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            {lessons.map((lesson) => (
              <Link
                key={lesson.id}
                href={`/courses/${courseId}/lessons/${lesson.id}`}
                passHref
              >
                <div
                  className={`cursor-pointer rounded-md p-3 transition-colors ${
                    lesson.id === currentLessonId
                      ? "bg-primary text-primary-foreground"
                      : lesson.completed
                        ? "bg-muted"
                        : "hover:bg-accent"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{lesson.duration}</span>
                    <span className="font-medium">{lesson.title}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-6 flex justify-between">
            {previousLesson ? (
              <Link
                href={`/courses/${courseId}/lessons/${previousLesson.id}`}
                passHref
              >
                <Button
                  variant="outline"
                  className="mr-auto flex items-center gap-2"
                >
                  <ChevronRight className="h-4 w-4" />
                  <span>השיעור הקודם</span>
                </Button>
              </Link>
            ) : (
              <div />
            )}

            {nextLesson ? (
              <Link
                href={`/courses/${courseId}/lessons/${nextLesson.id}`}
                passHref
              >
                <Button className="ml-auto flex items-center gap-2">
                  <span>השיעור הבא</span>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link href={`/courses/${courseId}`} passHref>
                <Button className="ml-auto flex items-center gap-2">
                  <span>סיים קורס</span>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
