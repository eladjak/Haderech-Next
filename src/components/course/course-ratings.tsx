/**
 * @file course-ratings.tsx
 * @description Ratings component for course pages showing user reviews
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Star, StarHalf } from 'lucide-react'
import type { CourseRating } from '@/types/courses'

interface CourseRatingsProps {
  ratings: CourseRating[]
  courseId: string
}

export function CourseRatings({ ratings, courseId }: CourseRatingsProps) {
  const [showAll, setShowAll] = useState(false)

  const averageRating = ratings.length
    ? ratings.reduce((acc, rating) => acc + rating.rating, 0) / ratings.length
    : 0

  const displayRatings = showAll ? ratings : ratings.slice(0, 3)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>דירוגים וביקורות</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star}>
                  {star <= averageRating ? (
                    <Star className="h-4 w-4 fill-current text-yellow-400" />
                  ) : star - 0.5 <= averageRating ? (
                    <StarHalf className="h-4 w-4 fill-current text-yellow-400" />
                  ) : (
                    <Star className="h-4 w-4 text-muted" />
                  )}
                </span>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              ({ratings.length} דירוגים)
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {displayRatings.map((rating) => (
          <div key={rating.id} className="space-y-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={rating.user.avatar_url || undefined} />
                <AvatarFallback>{rating.user.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{rating.user.name}</div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: rating.rating }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-current text-yellow-400" />
                  ))}
                </div>
              </div>
            </div>
            {rating.review && (
              <p className="text-sm text-muted-foreground">{rating.review}</p>
            )}
          </div>
        ))}

        {ratings.length > 3 && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'הצג פחות' : 'הצג הכל'}
          </Button>
        )}
      </CardContent>
    </Card>
  )
} 