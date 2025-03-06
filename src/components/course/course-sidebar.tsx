"use client";

import { CheckCircle, Lock, PlayCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Lesson {
  id: string;
  title: string;
  progress?: { id: string }[] | null;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface CourseSidebarProps {
  course: {
    id: string;
    title: string;
    modules: Module[];
  };
  progressCount: number;
  lessonId?: string;
}

export const CourseSidebar = ({
  course,
  progressCount,
  lessonId,
}: CourseSidebarProps) => {
  const lessonCompleted = progressCount;
  const totalLessons = course.modules.reduce((acc, module) => {
    return acc + module.lessons.length;
  }, 0);

  const completionText = `${lessonCompleted}/${totalLessons}`;
  const completionPercentage = (lessonCompleted / totalLessons) * 100;

  return (
    <div className="flex h-full flex-col overflow-y-auto border-r shadow-sm">
      <div className="flex flex-col border-b p-8">
        <h2 className="text-xl font-semibold">{course.title}</h2>
        <div className="mt-10">
          <div className="flex items-center gap-x-2 text-sm text-slate-500">
            <div>השלמת הקורס: {completionPercentage.toFixed(0)}%</div>
            <div className="ml-auto">{completionText}</div>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-sky-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>
      <div className="flex w-full flex-col">
        {course.modules.map((module, moduleIndex) => (
          <div key={module.id} className="border-b p-6">
            <h3 className="mb-2 text-xl font-semibold">
              {moduleIndex + 1}. {module.title}
            </h3>
            <div className="flex flex-col gap-y-2">
              {module.lessons.map((lesson, lessonIndex) => {
                const LessonIcon = lesson.progress?.length
                  ? CheckCircle
                  : PlayCircle;

                const isActive = lesson.id === lessonId;
                return (
                  <Link
                    key={lesson.id}
                    href={`/courses/${course.id}/lessons/${lesson.id}`}
                  >
                    <Button
                      type="button"
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "flex w-full items-center justify-start gap-x-2 text-sm font-normal text-slate-500",
                        isActive && "bg-slate-200/20 text-slate-700"
                      )}
                    >
                      <div className="flex items-center gap-x-2 py-2">
                        <LessonIcon
                          size={22}
                          className={cn(
                            "text-slate-500",
                            isActive && "text-slate-700",
                            lesson.progress?.length && "text-emerald-700"
                          )}
                        />
                        <span className="text-right">
                          {moduleIndex + 1}.{lessonIndex + 1}{" "}
                          <span className="mr-2">{lesson.title}</span>
                        </span>
                      </div>
                      <div className="mr-auto flex items-center gap-x-2">
                        {lesson.progress?.length ? (
                          <div className="rounded-full border border-emerald-700 p-0.5 text-emerald-700">
                            <CheckCircle size={16} />
                          </div>
                        ) : (
                          <div>
                            {/* Future implementation for locked content */}
                          </div>
                        )}
                      </div>
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
