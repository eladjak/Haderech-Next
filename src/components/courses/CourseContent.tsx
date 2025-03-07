"use client";

import { Download, FileText, PlayCircle } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Course {
  id: string;
  title: string;
  description: string;
  content: {
    sections: {
      id: string;
      title: string;
      lessons: {
        id: string;
        title: string;
        type: "video" | "text" | "file";
        duration?: string;
      }[];
    }[];
  };
}

interface CourseContentProps {
  course: Course;
}

export function CourseContent({ course }: CourseContentProps) {
  return (
    <div className="mt-8">
      <h2 className="mb-4 text-2xl font-bold">תוכן הקורס</h2>
      <div className="space-y-4">
        {course.content.sections.map((section) => (
          <Card key={section.id} className="p-4">
            <h3 className="mb-4 text-xl font-semibold">{section.title}</h3>
            <div className="space-y-2">
              {section.lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent"
                >
                  <div className="flex items-center space-x-3 space-x-reverse">
                    {lesson.type === "video" && (
                      <PlayCircle className="h-5 w-5 text-primary" />
                    )}
                    {lesson.type === "text" && (
                      <FileText className="h-5 w-5 text-primary" />
                    )}
                    {lesson.type === "file" && (
                      <Download className="h-5 w-5 text-primary" />
                    )}
                    <span>{lesson.title}</span>
                  </div>
                  {lesson.duration && (
                    <span className="text-sm text-muted-foreground">
                      {lesson.duration}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
