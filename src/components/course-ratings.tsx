"use client";

import { Star } from "lucide-react";
import { CourseRating } from "@/components/course-rating";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CourseWithRelations } from "@/types/courses";

interface CourseRatingsProps {
  course: CourseWithRelations;
  className?: string;
}

export function CourseRatings({ course, className }: CourseRatingsProps) {
  if (!course.ratings?.length) {
    return null;
  }

  const averageRating =
    course.ratings.reduce((acc, curr) => acc + curr.rating, 0) /
    course.ratings.length;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>דירוגים וביקורות</CardTitle>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < Math.round(averageRating)
                    ? "fill-primary text-primary"
                    : "fill-muted text-muted"
                }`}
              />
            ))}
          </div>
          <span className="text-lg font-semibold">
            {averageRating.toFixed(1)}
          </span>
          <span className="text-muted-foreground">
            ({course.ratings.length} דירוגים)
          </span>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        {course.ratings.map((rating) => (
          <CourseRating key={rating.id} rating={rating} />
        ))}
      </CardContent>
    </Card>
  );
}
