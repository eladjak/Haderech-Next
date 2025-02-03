"use client"

/**
 * @file course-ratings.tsx
 * @description Ratings component for course pages showing user reviews
 */

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StarIcon } from 'lucide-react'
import type { CourseRating } from '@/types/api'

interface CourseRatingsProps {
  ratings: CourseRating[]
}

export function CourseRatings({ ratings }: CourseRatingsProps) {
  const averageRating = ratings.length
    ? ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length
    : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>דירוגים וביקורות</span>
          <div className="flex items-center gap-2">
            <StarIcon className="h-5 w-5 text-yellow-400" />
            <span>{averageRating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">
              ({ratings.length} דירוגים)
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {ratings.map((rating) => (
          <div key={rating.id} className="space-y-2">
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src={rating.user?.avatar_url} />
                <AvatarFallback>{rating.user?.name?.[0] ?? '?'}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{rating.user?.name ?? 'משתמש אנונימי'}</div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`h-4 w-4 ${
                        i < rating.rating
                          ? 'text-yellow-400'
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            {rating.review && (
              <p className="text-sm text-muted-foreground">{rating.review}</p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
} 