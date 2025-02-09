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

import type { Course } from "@/types/api";

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
        <div className="aspect-video relative w-full overflow-hidden rounded-t-lg">
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
        {course.author && (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={course.author.avatar_url || undefined} />
              <AvatarFallback>{course.author.name[0]}</AvatarFallback>
            </Avatar>
            <div className="text-sm font-medium">{course.author.name}</div>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          asChild
        >
          <Link href={`/courses/${course.id}`}>
            {course.price === 0 ? "התחל ללמוד" : `הירשם ב-${course.price}₪`}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
