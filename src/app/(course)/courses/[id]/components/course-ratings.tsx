"use client";

import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// יצירת קומפוננטת דירוג פשוטה במקום ייבוא מ-@/lib/utils
const Rating = ({ value, readOnly }: { value: number; readOnly?: boolean }) => {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={
            star <= value ? "fill-yellow-500 text-yellow-500" : "text-gray-300"
          }
          size={16}
        />
      ))}
    </div>
  );
};

interface CourseRatingsProps {
  course: any; // במקום CourseWithRelations
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
            <Rating value={averageRating} />
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
                  <div className="flex items-center gap-2">
                    <Rating value={rating.rating} />
                    <div className="text-sm text-muted-foreground">
                      {new Date(rating.created_at).toLocaleDateString("he-IL")}
                    </div>
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
