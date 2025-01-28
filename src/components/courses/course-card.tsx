import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Star } from 'lucide-react'
import Image from 'next/image'
import { Course } from '@/lib/api'

interface CourseCardProps {
  course: Course
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video">
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="h-full bg-muted" />
        )}
      </div>
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{course.title}</h3>
          {course.averageRating > 0 && (
            <div className="flex items-center gap-1 text-yellow-500">
              <Star className="h-4 w-4" />
              <span>{course.averageRating.toFixed(1)}</span>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {course.description}
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{course.duration} דקות</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">
          {course.price > 0 ? `₪${course.price}` : 'חינם'}
        </Button>
      </CardFooter>
    </Card>
  )
} 