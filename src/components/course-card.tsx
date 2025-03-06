"use client";

import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import type { CourseWithRelations } from "@/types/courses";

interface CourseCardProps {
  course: CourseWithRelations;
  showRating?: boolean;
  showInstructors?: boolean;
  showEnrollButton?: boolean;
  variant?: "default" | "compact";
}

export function CourseCard({
  course,
  showRating = true,
  showInstructors = true,
  showEnrollButton = true,
  variant = "default",
}: CourseCardProps) {
  const isCompact = variant === "compact";

  return (
    <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={course.image || "/images/course-placeholder.jpg"}
            alt={course.title}
            className="object-cover"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            quality={80}
          />
          {course.featured && (
            <Badge className="absolute left-3 top-3 bg-primary">מומלץ</Badge>
          )}
          {course.level && (
            <Badge className="absolute right-3 top-3" variant="outline">
              {course.level}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className={isCompact ? "p-3" : "p-4"}>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge variant="outline">{course.category?.name || "כללי"}</Badge>
            {showRating && (
              <div className="flex items-center">
                <Star
                  className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400"
                  aria-hidden="true"
                />
                <span className="text-sm font-medium">
                  {course.rating?.toFixed(1) || "0.0"}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({course.reviews_count || 0})
                </span>
              </div>
            )}
          </div>
          <Link href={`/courses/${course.id}`}>
            <h3 className="line-clamp-2 font-semibold hover:text-primary hover:underline">
              {course.title}
            </h3>
          </Link>
          {!isCompact && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {course.description}
            </p>
          )}
          {showInstructors &&
            course.instructors &&
            course.instructors.length > 0 && (
              <div className="flex items-center pt-1">
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={course.instructors[0].image || undefined}
                    alt={course.instructors[0].name}
                  />
                  <AvatarFallback>
                    {course.instructors[0].name.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <span className="mr-2 text-sm font-medium">
                  {course.instructors[0].name}
                </span>
                {course.instructors.length > 1 && (
                  <span className="text-xs text-muted-foreground">
                    +{course.instructors.length - 1} נוספים
                  </span>
                )}
              </div>
            )}
        </div>
      </CardContent>
      <CardFooter className={isCompact ? "p-3 pt-0" : "p-4 pt-0"}>
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center space-x-2 space-x-reverse">
            <Badge variant="secondary" className="px-2 py-0 text-xs">
              {course.lessons_count || 0} שיעורים
            </Badge>
            <Badge variant="secondary" className="px-2 py-0 text-xs">
              {course.duration_hours?.toFixed(1) || 0} שעות
            </Badge>
          </div>
          {showEnrollButton && (
            <Button size="sm" asChild>
              <Link href={`/courses/${course.id}`}>הרשמה</Link>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
