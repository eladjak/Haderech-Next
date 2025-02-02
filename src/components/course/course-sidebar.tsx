/**
 * @file course-sidebar.tsx
 * @description Sidebar component for course pages showing course details and enrollment options
 */

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Clock, Users, BookOpen } from 'lucide-react'
import type { Course } from '@/types/courses'

interface CourseSidebarProps {
  course: Course
  isEnrolled: boolean
}

export function CourseSidebar({ course, isEnrolled }: CourseSidebarProps) {
  return (
    <div className="space-y-4">
      {/* Course Stats */}
      <Card>
        <CardHeader>
          <CardTitle>פרטי הקורס</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{course.duration} דקות</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{course.studentsCount} תלמידים</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{course.lessons?.length || 0} שיעורים</span>
          </div>
        </CardContent>
      </Card>

      {/* Enrollment Card */}
      {!isEnrolled && (
        <Card>
          <CardHeader>
            <CardTitle>הרשמה לקורס</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {course.price === 0 ? (
                'חינם'
              ) : (
                `₪${course.price}`
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <a href={`/courses/${course.id}/enroll`}>
                {course.price === 0 ? 'הרשם עכשיו' : 'קנה עכשיו'}
              </a>
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Progress Card */}
      {isEnrolled && course.progress && (
        <Card>
          <CardHeader>
            <CardTitle>התקדמות</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={course.progress} />
            <p className="text-sm text-muted-foreground">
              {Math.round(course.progress)}% הושלמו
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 