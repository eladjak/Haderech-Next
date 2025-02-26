import { Card } from "@/components/ui/card";
import type { Lesson } from "@/types/api";

("use client");

interface LessonContentProps {
  lesson: Lesson;
  onComplete?: () => void;
}

export function LessonContent({ lesson, onComplete }: LessonContentProps) {
  return (
    <Card className="p-4">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">{lesson.title}</h2>
        <p className="text-muted-foreground">{lesson.description}</p>

        {/* Video Player */}
        <div className="aspect-video overflow-hidden rounded-lg bg-muted">
          {lesson.video_url && (
            <video
              className="h-full w-full"
              controls
              src={lesson.video_url}
              poster="/images/video-placeholder.jpg"
            />
          )}
        </div>

        {/* Content */}
        <div
          className="prose prose-sm dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: lesson.content }}
        />

        {/* Complete Button */}
        {onComplete && (
          <button
            onClick={onComplete}
            className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground"
          >
            סיימתי את השיעור
          </button>
        )}
      </div>
    </Card>
  );
}
