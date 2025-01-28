import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface CourseCardProps {
  course: {
    id: string
    title: string
    description: string
    duration: number
    level: 'beginner' | 'intermediate' | 'advanced'
    price: number
    averageRating: number
    thumbnail?: string
  }
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{course.title}</CardTitle>
        <div className="text-sm text-muted-foreground">
          רמה: {course.level === 'beginner' ? 'מתחילים' : course.level === 'intermediate' ? 'מתקדמים' : 'מומחים'}
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription>{course.description}</CardDescription>
        <div className="mt-2 text-sm text-muted-foreground">
          משך הקורס: {course.duration} שעות
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          דירוג: {course.averageRating.toFixed(1)} ⭐
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-lg font-semibold">
          ₪{course.price}
        </div>
        <Button asChild>
          <Link href={`/courses/${course.id}`}>
            למד עוד
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
} 