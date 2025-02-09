import { Clock, Users } from "lucide-react";
import Image from "next/image";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { Course } from "@/types/courses";

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <div className="aspect-video relative">
          <Image
            src={course.thumbnail || "/placeholder.jpg"}
            alt={course.title}
            fill
            className="object-cover"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="mb-2 line-clamp-2">{course.title}</CardTitle>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {course.description}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{course.duration} דקות</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{course.studentsCount} תלמידים</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
