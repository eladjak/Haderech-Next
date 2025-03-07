"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Lesson {
  id: string;
  title: string;
  content: string;
  videoUrl?: string;
}

interface LessonContentProps {
  lesson: Lesson;
}

export default function LessonContent({ lesson }: LessonContentProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-right text-2xl font-bold">
          {lesson.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {lesson.videoUrl && (
          <div className="mb-6 overflow-hidden rounded-lg">
            <iframe
              className="aspect-video w-full"
              src={lesson.videoUrl}
              title={lesson.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        )}
        <div
          className="prose prose-lg max-w-none text-right"
          dangerouslySetInnerHTML={{ __html: lesson.content }}
        ></div>
      </CardContent>
    </Card>
  );
}
