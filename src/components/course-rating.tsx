import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Star, User } from 'lucide-react'
import type { CourseRating } from '@/types/api'

interface CourseRatingProps {
  rating: CourseRating
  className?: string
}

export function CourseRating({ rating, className }: CourseRatingProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={rating.user?.avatar_url} />
            <AvatarFallback>
              {rating.user?.name?.[0] ?? <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-base">
              {rating.user?.name ?? 'משתמש אנונימי'}
            </CardTitle>
            <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < rating.rating
                        ? 'fill-primary text-primary'
                        : 'fill-muted text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
              <span>•</span>
              <span>
                {new Date(rating.created_at).toLocaleDateString('he-IL')}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm">{rating.review}</div>
      </CardContent>
    </Card>
  )
} 