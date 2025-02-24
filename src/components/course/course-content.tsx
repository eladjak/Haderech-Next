/**
 * @file course-content.tsx
 * @description Content component for course pages showing lessons list and content.
 * Displays a list of course lessons with their status (locked/completed),
 * duration, and provides navigation to individual lessons.
 */

import { useRouter } from "next/navigation";

import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Lock,
  Play,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { CourseWithRelations } from "@/types/courses";
import type { CourseLesson, CourseProgress } from "@/types/models";

/**
 * Extended course lesson type that includes progress and access information
 */
interface ExtendedCourseLesson extends CourseLesson {
  progress?: CourseProgress[]; // Progress tracking for each user
  is_free: boolean; // Whether the lesson is freely accessible
}

/**
 * Props for the CourseContent component
 */
interface CourseContentProps {
  course: CourseWithRelations & {
    lessons: ExtendedCourseLesson[];
  };
  isEnrolled: boolean; // Whether the current user is enrolled in the course
  isInstructor?: boolean; // Whether the current user is the course instructor
}

/**
 * CourseContent Component
 *
 * Renders a list of course lessons with their status, progress, and access controls.
 * Handles lesson navigation and displays completion status for enrolled users.
 *
 * @param props - Component properties
 * @returns React component
 */
export function CourseContent({
  course,
  isEnrolled,
  isInstructor,
}: CourseContentProps) {
  // Sort lessons by their defined order
  const sortedLessons = (course.lessons || []).sort(
    (a, b) => a.order - b.order
  );

  // Calculate completion statistics
  const completedLessons = sortedLessons.filter((lesson) =>
    lesson.progress?.some((p) => p.completed)
  ).length;

  // Count free lessons for display
  const freeLessons = sortedLessons.filter((lesson) => lesson.is_free).length;

  return (
    <div className="space-y-8">
      {/* Course statistics summary */}
      <div>
        <h2 className="text-2xl font-bold">תוכן הקורס</h2>
        <p className="text-muted-foreground">
          {sortedLessons.length} שיעורים •{" "}
          {sortedLessons.reduce(
            (acc, lesson) => acc + (lesson.duration || 0),
            0
          )}{" "}
          דקות • הושלמו {completedLessons} שיעורים • {freeLessons} שיעורים
          חינמיים
        </p>
      </div>

      {/* Lessons list */}
      <div className="space-y-4">
        {sortedLessons.map((lesson) => {
          // Determine lesson status
          const isCompleted = lesson.progress?.some((p) => p.completed);
          const isLocked = !isEnrolled && !lesson.is_free && !isInstructor;

          return (
            <Card key={lesson.id} className={isLocked ? "opacity-75" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {/* Lesson order indicator */}
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-sm">
                    {lesson.order}
                  </span>
                  {lesson.title}
                  {/* Status indicators */}
                  {isLocked && <Lock className="h-4 w-4" />}
                  {isCompleted && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  {/* Lesson duration */}
                  <div className="text-sm text-muted-foreground">
                    {lesson.duration} דקות
                  </div>
                  {/* Lesson access button */}
                  <Button
                    variant={isLocked ? "outline" : "default"}
                    size="sm"
                    className="gap-2"
                    asChild
                  >
                    <a
                      href={
                        isLocked
                          ? "#"
                          : `/courses/${course.id}/lessons/${lesson.id}`
                      }
                    >
                      <Play className="h-4 w-4" />
                      {isLocked ? "נעול" : "צפה בשיעור"}
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
