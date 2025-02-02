/**
 * @file course-progress.tsx
 * @description Progress component for course pages showing completion status
 */

import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface CourseProgressProps {
  progress: number
  completedLessons: number
  totalLessons: number
}

export function CourseProgress({ progress, completedLessons, totalLessons }: CourseProgressProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>התקדמות בקורס</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progress} />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{completedLessons} שיעורים הושלמו</span>
          <span>{totalLessons} שיעורים סה"כ</span>
        </div>
      </CardContent>
    </Card>
  )
} 