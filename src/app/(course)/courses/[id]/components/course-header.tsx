"use client";

import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Clock, Users } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

import type { Course } from "@/types/api";

interface CourseHeaderProps {
  course: Course;
  isEnrolled: boolean;
  className?: string;
}

export function CourseHeader({
  course,
  isEnrolled,
  className,
}: CourseHeaderProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleEnroll = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/courses/${course.id}/enroll`, {
        method: "POST",
      });

      if (!response?.ok) {
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה בהרשמה לקורס",
          variant: "destructive",
        });
        return;
      }

      router.refresh();

      toast({
        title: "נרשמת בהצלחה!",
        description: "נרשמת לקורס בהצלחה",
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בהרשמה לקורס",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative h-[300px] w-full overflow-hidden rounded-lg">
        <Image
          src={course.image_url || "/images/placeholder.jpg"}
          alt={course.title}
          fill
          className="object-cover"
          priority
        />
      </div>
      <Card className="mt-8">
        <CardHeader>
          <div className="flex items-start gap-4">
            <Avatar>
              <AvatarImage
                src={course.instructor.avatar_url || undefined}
                alt={course.instructor.name}
              />
              <AvatarFallback>
                {course.instructor.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle>{course.title}</CardTitle>
              <CardDescription>
                {format(new Date(course.created_at), "dd בMMMM yyyy", {
                  locale: he,
                })}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{course.description}</p>
          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>
                {Math.floor(course.duration / 60)}:
                {String(course.duration % 60).padStart(2, "0")} שעות
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{course.students_count} תלמידים</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          {isEnrolled ? (
            <Button
              variant="default"
              size="lg"
              className="w-full"
              onClick={() => router.push(`/courses/${course.id}/lessons`)}
            >
              המשך ללמוד
            </Button>
          ) : (
            <Button
              variant="default"
              size="lg"
              className="w-full"
              onClick={handleEnroll}
              disabled={isLoading}
            >
              {isLoading ? "נרשם..." : `הירשם לקורס - ₪${course.price}`}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
