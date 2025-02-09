"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { Course } from "@/types/api";


interface RecommendedCoursesPreviewProps {
  courses: Course[];
}

export function RecommendedCoursesPreview({
  courses,
}: RecommendedCoursesPreviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>קורסים מומלצים</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {courses.map((course) => (
          <div
            key={course.id}
            className="flex items-center justify-between"
          >
            <div>
              <h3 className="font-medium">{course.title}</h3>
              <p className="text-sm text-muted-foreground">
                {course.description.slice(0, 100)}...
              </p>
            </div>
            <Link href={`/courses/${course.id}`}>
              <Button
                variant="ghost"
                size="icon"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
