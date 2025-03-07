"use client";

import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CourseWithRelations } from "@/types/courses";

/**
 * @file course-ratings.tsx
 * @description Ratings component for course pages showing user reviews
 */

interface CourseRatingsProps {
  course: CourseWithRelations;
  showAll?: boolean;
}

export function CourseRatings({ course, showAll = false }: CourseRatingsProps) {
  // הנחה: המדרוג נמצא בשדה rating והביקורות בשדה reviews
  const rating = course.rating || 0;
  const reviews = course.reviews || [];

  // הצג רק עד 3 ביקורות אם לא נדרש להציג את כולן
  const displayedReviews = showAll ? reviews : reviews.slice(0, 3);

  // יצירת מערך של אחוזי דירוג עבור כל כוכב (מ-1 עד 5)
  const ratingDistribution = Array.from({ length: 5 }, (_, i) => {
    const starsCount = reviews.filter(
      (review) => review.rating === 5 - i
    ).length;
    return {
      stars: 5 - i,
      count: starsCount,
      percentage: reviews.length ? (starsCount / reviews.length) * 100 : 0,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>דירוגים וביקורות</CardTitle>
      </CardHeader>
      <CardContent>
        {reviews.length === 0 ? (
          <p className="text-center text-muted-foreground">
            אין עדיין ביקורות לקורס זה.
          </p>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-5xl font-bold">{rating.toFixed(1)}</div>
                <div className="mt-1 flex justify-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.round(rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-gray-200 text-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {reviews.length} ביקורות
                </p>
              </div>

              <div className="flex-1 space-y-2">
                {ratingDistribution.map((dist) => (
                  <div
                    key={dist.stars}
                    className="flex items-center gap-2 text-sm"
                  >
                    <div className="w-6 text-right">{dist.stars}</div>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-yellow-400"
                        style={{ width: `${dist.percentage}%` }}
                      />
                    </div>
                    <div className="w-9 text-muted-foreground">
                      {dist.count}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">ביקורות אחרונות</h3>
              {displayedReviews.map((review) => (
                <div key={review.id} className="border-b pb-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={review.user.image || undefined}
                        alt={review.user.name}
                      />
                      <AvatarFallback>
                        {review.user.name.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{review.user.name}</h4>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "fill-gray-200 text-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                      <p className="mt-2 text-sm">{review.content}</p>
                    </div>
                  </div>
                </div>
              ))}

              {!showAll && reviews.length > 3 && (
                <div className="pt-2 text-center">
                  <a
                    href="#all-reviews"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    הצג את כל {reviews.length} הביקורות
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
