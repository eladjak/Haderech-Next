/**
 * @file course-header.tsx
 * @description Header component for course pages showing course title, instructor, and enrollment status
 */

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Sparkles } from '@/components/ui/sparkles'
import type { Course } from '@/types/courses'

interface CourseHeaderProps {
  course: Course
  isEnrolled: boolean
  isInstructor: boolean
}

export function CourseHeader({ course, isEnrolled, isInstructor }: CourseHeaderProps) {
  return (
    <div className="relative bg-gradient-to-b from-muted/50 to-muted/10 py-10">
      <div className="container">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-8">
          {/* Course Title and Description */}
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{course.level}</Badge>
                {course.price === 0 && (
                  <Badge variant="success">
                    <Sparkles>חינם</Sparkles>
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold md:text-4xl">{course.title}</h1>
              <p className="text-muted-foreground">{course.description}</p>
            </div>

            {/* Instructor Info */}
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={course.instructor.avatar_url || undefined} />
                <AvatarFallback>{course.instructor.name[0]}</AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <p className="font-medium">{course.instructor.name}</p>
                <p className="text-muted-foreground">מדריך</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {isInstructor ? (
              <Button variant="outline" asChild>
                <a href={`/courses/${course.id}/edit`}>ערוך קורס</a>
              </Button>
            ) : isEnrolled ? (
              <Button asChild>
                <a href={`/courses/${course.id}/learn`}>המשך ללמוד</a>
              </Button>
            ) : (
              <Button asChild>
                <a href={`/courses/${course.id}/enroll`}>הרשם לקורס</a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 