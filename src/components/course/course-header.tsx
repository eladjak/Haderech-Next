/**
 * @file course-header.tsx
 * @description Header component for course pages showing course title, instructor, and enrollment status
 */

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CourseHeaderProps } from "@/types/props";

export function CourseHeader({ course, isEnrolled }: CourseHeaderProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{course.level}</Badge>
              {course.price === 0 && <Badge variant="success">חינם</Badge>}
            </div>
            <CardTitle>{course.title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {course.description}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Avatar>
                <AvatarImage
                  src={course.instructor.avatar_url || undefined}
                  alt={course.instructor.name}
                />
                <AvatarFallback>{course.instructor.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{course.instructor.name}</p>
                <p className="text-sm text-muted-foreground">מדריך</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div>
                <p className="font-medium">{course.level}</p>
                <p className="text-sm text-muted-foreground">רמה</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div>
                <p className="font-medium">{course.duration || 0} דקות</p>
                <p className="text-sm text-muted-foreground">משך</p>
              </div>
            </div>
          </div>
          <Button variant={isEnrolled ? "secondary" : "default"}>
            {isEnrolled ? "המשך ללמוד" : "הרשם לקורס"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
