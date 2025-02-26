import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CourseWithRelations } from "@/types/courses";

("use client");

/**
 * @file course-ratings.tsx
 * @description Ratings component for course pages showing user reviews
 */

interface CourseRatingsProps {
  course: CourseWithRelations;
  showAll?: boolean;
}

export function CourseRatings({ course, showAll = false }: CourseRatingsProps) {
  const ratings = course.ratings || [];
  const averageRating =
    ratings.length > 0
      ? ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length
      : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>דירוגים</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">
              {averageRating.toFixed(1)}
            </span>
            <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
            <span className="text-muted-foreground">
              ({ratings.length} דירוגים)
            </span>
          </div>

          {(showAll ? ratings : ratings.slice(0, 3)).map((rating) => (
            <div key={rating.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage src={rating.user.avatar_url || undefined} />
                  <AvatarFallback>{rating.user.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{rating.user.name}</div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < rating.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-gray-200 text-gray-200"
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
        </div>
      </CardContent>
    </Card>
  );
}
