/**
 * @file course-content.tsx
 * @description Content component for course pages showing lessons list and content
 */

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, Play, CheckCircle } from 'lucide-react'
import type { Course, Lesson } from '@/types/courses'

interface CourseContentProps {
  lessons: Lesson[]
  isEnrolled: boolean
  isInstructor: boolean
}

export function CourseContent({ lessons, isEnrolled, isInstructor }: CourseContentProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">תוכן הקורס</h2>
        <p className="text-muted-foreground">
          {lessons.length} שיעורים • {lessons.reduce((acc, lesson) => acc + (lesson.duration || 0), 0)} דקות
        </p>
      </div>

      <div className="space-y-4">
        {lessons.map((lesson, index) => {
          const isCompleted = lesson.progress?.some(p => p.completed)
          const isLocked = !isEnrolled && !lesson.isFree && !isInstructor

          return (
            <Card key={lesson.id} className={isLocked ? 'opacity-75' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-sm">
                    {index + 1}
                  </span>
                  {lesson.title}
                  {isLocked && <Lock className="h-4 w-4" />}
                  {isCompleted && <CheckCircle className="h-4 w-4 text-green-500" />}
                </CardTitle>
                {lesson.description && (
                  <CardDescription>{lesson.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {lesson.duration} דקות
                  </div>
                  <Button
                    variant={isLocked ? 'outline' : 'default'}
                    size="sm"
                    className="gap-2"
                    asChild
                  >
                    <a href={isLocked ? '#' : `/courses/${lesson.courseId}/lessons/${lesson.id}`}>
                      <Play className="h-4 w-4" />
                      {isLocked ? 'נעול' : 'צפה בשיעור'}
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
} 