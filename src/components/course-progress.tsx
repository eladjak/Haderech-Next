import { Progress } from "@/components/ui/progress";
import type { Course } from "@/types/api";
import { useAuth } from "@/hooks/use-auth";

interface CourseProgressProps {
  course: Course;
  className?: string;
}

export function CourseProgress({ course, className }: CourseProgressProps) {
  const { user } = useAuth();

  const completedLessons =
    course.lessons?.filter((lesson) => {
      const progress = lesson.progress?.find((p) => p.user_id === user?.id);
      return progress?.completed;
    })?.length || 0;

  const totalLessons = course.lessons?.length || 0;
  const progress =
    totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <div className={className}>
      <Progress value={progress} className="h-2" />
      <div className="mt-2 text-sm text-muted-foreground">
        {completedLessons} מתוך {totalLessons} שיעורים הושלמו
      </div>
    </div>
  );
}
