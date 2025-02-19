/**
 * @file course-content.tsx
 * @description Content component for course pages showing lessons list and content
 */

import { CheckCircle, Lock, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CourseWithRelations } from "@/types/courses";
import type { CourseLesson, CourseProgress } from "@/types/models";

interface ExtendedCourseLesson extends CourseLesson {
  progress?: CourseProgress[];
  is_free: boolean;
}

interface CourseContentProps {
  course: CourseWithRelations & {
    lessons: ExtendedCourseLesson[];
  };
  isEnrolled: boolean;
  isInstructor?: boolean;
}

export function CourseContent({
  course,
  isEnrolled,
  isInstructor,
}: CourseContentProps) {
  const sortedLessons = (course.lessons || []).sort(
    (a, b) => a.order - b.order
  );

  const completedLessons = sortedLessons.filter((lesson) =>
    lesson.progress?.some((p) => p.completed)
  ).length;

  const freeLessons = sortedLessons.filter((lesson) => lesson.is_free).length;

  return (
    <div className="space-y-8">
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

      <div className="space-y-4">
        {sortedLessons.map((lesson) => {
          const isCompleted = lesson.progress?.some((p) => p.completed);
          const isLocked = !isEnrolled && !lesson.is_free && !isInstructor;

          return (
            <Card key={lesson.id} className={isLocked ? "opacity-75" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-sm">
                    {lesson.order}
                  </span>
                  {lesson.title}
                  {isLocked && <Lock className="h-4 w-4" />}
                  {isCompleted && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {lesson.duration} דקות
                  </div>
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
