"use client";

import { Star } from "lucide-react";
import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface CourseRatingsProps {
  courseId: string;
}

export function CourseRatings({ courseId }: CourseRatingsProps) {
  // כאן יבוא הלוגיקה לקבלת הדירוגים מהשרת
  const ratings = {
    average: 4.5,
    total: 128,
    distribution: [
      { stars: 5, count: 80, percentage: 62.5 },
      { stars: 4, count: 30, percentage: 23.4 },
      { stars: 3, count: 10, percentage: 7.8 },
      { stars: 2, count: 5, percentage: 3.9 },
      { stars: 1, count: 3, percentage: 2.4 },
    ],
  };

  return (
    <Card className="p-6">
      <h2 className="mb-4 text-2xl font-bold">דירוגים</h2>
      <div className="flex items-start space-x-6 space-x-reverse">
        <div className="text-center">
          <div className="text-4xl font-bold">{ratings.average}</div>
          <div className="flex items-center justify-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < Math.floor(ratings.average)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            {ratings.total} דירוגים
          </div>
        </div>
        <div className="flex-1 space-y-2">
          {ratings.distribution.map((rating) => (
            <div key={rating.stars} className="flex items-center gap-2">
              <div className="w-12 text-sm">{rating.stars} כוכבים</div>
              <Progress value={rating.percentage} className="h-2" />
              <div className="w-12 text-sm text-muted-foreground">
                {rating.count}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
