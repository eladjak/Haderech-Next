import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { _Avatar, _AvatarFallback, _AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader} from "@/components/ui/";\nimport type { Course } from "@/types/api";

"use client";







import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";


interface CourseCardProps {
  course: Course;
  className?: string;
}

export function CourseCard({ course, className }: CourseCardProps) {
  const averageRating =
    course.ratings && course.ratings.length > 0
      ? course.ratings.reduce((acc, curr) => acc + curr.rating, 0) /
        course.ratings.length
      : 0;

  return (
    <Card className={className}>
      <CardHeader className="p-0">
        <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
          <Image
            src={course.image_url || "/placeholder.png"}
            alt={course.title}
            fill
            className="object-cover"
          />
        </div>
      </CardHeader>
      <CardContent className="grid gap-2.5 p-4">
        <div className="flex items-center justify-between">
          <Badge
            variant={course.status === "published" ? "default" : "secondary"}
          >
            {course.status === "published" ? "פורסם" : "טיוטה"}
          </Badge>
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-primary text-primary" />
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
          >
            {course.title}
          </Link>
          <div className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {course.description}
          </div>
        </div>
        {course.instructor && (
          <div className="flex items-center space-x-2">
            <div className="relative h-8 w-8">
              <Image
                src={course.instructor.avatar_url || "/placeholder.png"}
                alt={course.instructor.name}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <div className="text-sm font-medium">{course.instructor.name}</div>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full" asChild>
          <Link href={`/courses/${course.id}`}>
            {course.price === 0 ? "התחל ללמוד" : `הירשם ב-${course.price}₪`}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
