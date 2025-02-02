import { Course, Lesson, LessonProgress } from "@/types/courses"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock, Play, CheckCircle } from "lucide-react"

interface CourseContentProps {
  course: Course
  isEnrolled: boolean
}

export const CourseContent = ({ course, isEnrolled }: CourseContentProps) => {
  const sortedLessons = course.lessons.sort((a: Lesson, b: Lesson) => a.order - b.order)
  
  const completedLessons = sortedLessons.filter((lesson: Lesson) => 
    lesson.progress?.some((p: LessonProgress) => p.completed)
  ).length
  
  const freeLessons = sortedLessons.filter((lesson: Lesson) => lesson.isFree).length

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">תוכן הקורס</h2>
        <p className="text-muted-foreground">
          {sortedLessons.length} שיעורים • {sortedLessons.reduce((acc, lesson) => acc + (lesson.duration || 0), 0)} דקות
        </p>
      </div>

      <div className="space-y-4">
        {sortedLessons.map((lesson, index) => {
          const isCompleted = lesson.progress?.some(p => p.completed)
          const isLocked = !isEnrolled && !lesson.isFree

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
                    <a href={isLocked ? '#' : `/courses/${course.id}/lessons/${lesson.id}`}>
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