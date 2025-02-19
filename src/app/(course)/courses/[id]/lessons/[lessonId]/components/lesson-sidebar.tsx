"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Course } from "@/types/api";

interface LessonSidebarProps {
  course: Course;
  currentLessonId: string;
  className?: string;
}

export function LessonSidebar({
  course,
  currentLessonId,
  className,
}: LessonSidebarProps) {
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleLessonClick = (lessonId: string) => {
    router.push(`/courses/${course.id}/lessons/${lessonId}`);
  };

  if (!course?.sections) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {course.sections.map((section) => (
        <Card key={section.id}>
          <CardHeader
            className="cursor-pointer"
            onClick={() => toggleSection(section.id)}
          >
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </div>
              <Button variant="ghost" size="icon">
                {expandedSections.includes(section.id) ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          {expandedSections.includes(section.id) && (
            <CardContent>
              <div className="space-y-2">
                {section.lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className={cn(
                      "flex items-center justify-between rounded-lg border p-4 hover:bg-accent",
                      lesson.id === currentLessonId && "bg-accent"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleLessonClick(lesson.id)}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <div>
                        <h4 className="font-medium">{lesson.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {lesson.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        {Math.floor(lesson.duration / 60)}:
                        {String(lesson.duration % 60).padStart(2, "0")}
                      </span>
                      {lesson.isCompleted && (
                        <span className="text-sm text-success">✓</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
