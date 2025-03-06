"use client";

import { CheckCircle, ChevronRight, Lock, Play } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  CourseLesson,
  CourseProgress,
  CourseWithRelations,
} from "@/types/courses";

/**
 * @file course-content.tsx
 * @description Content component for course pages showing lessons list and content.
 * Displays a list of course lessons with their status (locked/completed),
 * and allows navigation to individual lessons.
 */

interface CourseContentProps {
  course: CourseWithRelations;
  userProgress?: CourseProgress;
  currentLessonId?: string;
  isEnrolled?: boolean;
}

export function CourseContent({
  course,
  userProgress,
  currentLessonId,
  isEnrolled = false,
}: CourseContentProps) {
  // Helper to check if a lesson is completed
  const isLessonCompleted = (lessonId: string) => {
    if (!userProgress || !userProgress.completedLessons) return false;
    return userProgress.completedLessons.includes(lessonId);
  };

  // Helper to check if a lesson is locked
  const isLessonLocked = (index: number, sectionIndex: number) => {
    if (!isEnrolled) return true;

    // הנחה: השיעור הראשון בכל קורס פתוח תמיד למשתמשים רשומים
    if (sectionIndex === 0 && index === 0) return false;

    // בדיקה האם השיעור הקודם הושלם
    const flatLessons = course.sections.flatMap((section) => section.lessons);
    const currentFlatIndex =
      course.sections
        .slice(0, sectionIndex)
        .reduce((count, section) => count + section.lessons.length, 0) + index;

    if (currentFlatIndex === 0) return false;

    const previousLesson = flatLessons[currentFlatIndex - 1];
    return previousLesson && !isLessonCompleted(previousLesson.id);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">תוכן הקורס</h2>
      <div className="space-y-4">
        {course.sections.map((section, sectionIndex) => (
          <Card key={section.id} className="overflow-hidden">
            <CardHeader className="bg-muted/50 py-4">
              <CardTitle className="text-lg">
                {section.title}
                <span className="mr-2 text-sm font-normal text-muted-foreground">
                  ({section.lessons.length} שיעורים)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y">
                {section.lessons.map((lesson, index) => {
                  const isCompleted = isLessonCompleted(lesson.id);
                  const isLocked = isLessonLocked(index, sectionIndex);
                  const isActive = currentLessonId === lesson.id;

                  return (
                    <li
                      key={lesson.id}
                      className={`relative ${
                        isActive ? "bg-accent" : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center p-4">
                        <div className="mr-4 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                          {isCompleted ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : isLocked ? (
                            <Lock className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <Play className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          {isLocked ? (
                            <div>
                              <p className="truncate font-medium text-muted-foreground">
                                {lesson.title}
                              </p>
                              {lesson.duration && (
                                <p className="text-xs text-muted-foreground">
                                  {Math.floor(lesson.duration / 60)}:
                                  {String(lesson.duration % 60).padStart(
                                    2,
                                    "0"
                                  )}
                                </p>
                              )}
                            </div>
                          ) : (
                            <Link
                              href={`/courses/${course.id}/lessons/${lesson.id}`}
                              className="block"
                            >
                              <p className="truncate font-medium">
                                {lesson.title}
                              </p>
                              {lesson.duration && (
                                <p className="text-xs text-muted-foreground">
                                  {Math.floor(lesson.duration / 60)}:
                                  {String(lesson.duration % 60).padStart(
                                    2,
                                    "0"
                                  )}
                                </p>
                              )}
                            </Link>
                          )}
                        </div>
                        {!isLocked && (
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="ml-4 flex-shrink-0"
                          >
                            <Link
                              href={`/courses/${course.id}/lessons/${lesson.id}`}
                            >
                              <ChevronRight className="h-5 w-5" />
                              <span className="sr-only">צפה בשיעור</span>
                            </Link>
                          </Button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
