/**
 * @file course-progress.tsx
 * @description Progress component for course pages showing completion status
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export interface CourseProgressProps {
  completedLessons: number;
  totalLessons: number;
}

export function CourseProgress({
  completedLessons,
  totalLessons,
}: CourseProgressProps) {
  const progress =
    totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>התקדמות בקורס</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <Progress
            value={progress}
            className="w-full"
          />
          <div className="text-sm text-muted-foreground">
            {completedLessons} מתוך {totalLessons} שיעורים הושלמו
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
