import { Star } from "lucide-react";

import { CourseRating } from "@/components/course-rating";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { Course } from "@/types/api";

interface CourseRatingsProps {
  course: Course;
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
                    : "fill-muted text-muted-foreground"
                }`}
              />
            ))}
          </div>
          <div className="text-lg font-medium">{averageRating.toFixed(1)}</div>
          <div className="text-sm text-muted-foreground">
            ({course.ratings.length} דירוגים)
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        {course.ratings.map((rating) => (
          <CourseRating
            key={rating.id}
            rating={rating}
          />
        ))}
      </CardContent>
    </Card>
  );
}
