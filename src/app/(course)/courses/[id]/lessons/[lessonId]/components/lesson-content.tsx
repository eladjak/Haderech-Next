"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { Lesson } from "@/types/api";

interface LessonContentProps {
  lesson: Lesson;
  className?: string;
}

export function LessonContent({ lesson, className }: LessonContentProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <Card>
        <CardHeader>
          <CardTitle>{lesson.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {lesson.videoUrl && (
            <div className="aspect-video overflow-hidden rounded-lg bg-muted">
              <iframe
                src={lesson.videoUrl}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          )}
          <div className="prose prose-sm mt-4 max-w-none">
            <div dangerouslySetInnerHTML={{ __html: lesson.content || "" }} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
