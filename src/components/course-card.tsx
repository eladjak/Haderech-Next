"use client";

import React, { useMemo } from "react";
import { CheckCircle2, Circle, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import type { Course } from "@/types/api";

interface CourseCardProps {
  course: Course;
  className?: string;
}

export const CourseCard = React.memo(function CourseCard({ course, className }: CourseCardProps) {
  const averageRating = useMemo(() => {
    if (!course.ratings?.length) return 0;
    return course.ratings.reduce((acc, curr) => acc + curr.rating, 0) / course.ratings.length;
  }, [course.ratings]);

  return (
    <Card className={className}>
      <CardHeader className="p-0">
        <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
          <Image
            src={course.image_url || "/placeholder.png"}
            alt={course.title}
            fill
            className="object-cover"
            quality={75}
            priority={false}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      </CardHeader>
      <CardContent className="grid gap-2.5 p-4">
        <div className="flex items-center justify-between">
          <Badge
            variant={course.status === "published" ? "default" : "secondary"}
            className="flex items-center gap-1"
          >
            {course.status === "published" ? (
              <>
                <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                <span>פורסם</span>
              </>
            ) : (
              <>
                <Circle className="h-3 w-3" aria-hidden="true" />
                <span>טיוטה</span>
              </>
            )}
          </Badge>
          <div className="flex items-center gap-1 text-sm" aria-label={`דירוג ${averageRating.toFixed(1)} מתוך 5 (${course.ratings?.length || 0} דירוגים)`}>
            <Star className="h-4 w-4 fill-primary text-primary" aria-hidden="true" />
            <span>{averageRating.toFixed(1)}</span>
            <span className="text-muted-foreground">
              ({course.ratings?.length || 0})
            </span>
          </div>
        </div>
        <div>
          <Link
            href={`/courses/${course.id}`}
            className="font-semibold hover:underline"
            aria-label={`עבור לקורס ${course.title}`}
          >
            {course.title}
          </Link>
          <div className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {course.description}
          </div>
        </div>
        {course.instructor && (
          <div className="flex items-center space-x-2" aria-label={`מרצה: ${course.instructor.name}`}>
            <div className="relative h-8 w-8">
              <Image
                src={course.instructor.avatar_url || "/placeholder.png"}
                alt={`תמונת ${course.instructor.name}`}
                fill
                className="rounded-full object-cover"
                quality={75}
                priority={false}
                sizes="32px"
              />
            </div>
            <div className="text-sm font-medium">{course.instructor.name}</div>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full" asChild>
          <Link
            href={`/courses/${course.id}`}
            aria-label={course.price === 0 ? `התחל ללמוד את הקורס ${course.title}` : `הירשם לקורס ${course.title} ב-${course.price} שקלים`}
          >
            {course.price === 0 ? "התחל ללמוד" : `הירשם ב-${course.price}₪`}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
});
