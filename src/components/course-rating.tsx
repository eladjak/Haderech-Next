"use client";

import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CourseRating } from "@/types/courses";

interface CourseRatingProps {
  rating: CourseRating;
  className?: string;
}

export function CourseRating({ rating, className }: CourseRatingProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center gap-4 space-y-0">
        <Avatar>
          <AvatarImage src={rating.user?.avatar_url || undefined} />
          <AvatarFallback>{rating.user?.name?.[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="font-medium">{rating.user?.name}</div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-4 w-4",
                    i < rating.rating
                      ? "fill-primary text-primary"
                      : "text-muted"
                  )}
                />
              ))}
            </div>
            <span>•</span>
            <span>
              {new Date(rating.created_at).toLocaleDateString("he-IL", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm">{rating.comment}</div>
      </CardContent>
    </Card>
  );
}
