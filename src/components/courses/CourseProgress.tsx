"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface CourseProgressProps {
  courseId: string;
}

export function CourseProgress({ courseId }: CourseProgressProps) {
  // כאן יבוא הלוגיקה לקבלת ההתקדמות מהשרת
  const progress = 65; // לדוגמה

  return (
    <Card className="p-4">
      <h3 className="mb-4 text-lg font-semibold">התקדמות בקורס</h3>
      <div className="space-y-4">
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-muted-foreground">
          השלמת {progress}% מהקורס
        </p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>שיעורים שהושלמו</span>
            <span className="font-medium">13/20</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>זמן צפייה</span>
            <span className="font-medium">2.5 שעות</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>תרגילים שהושלמו</span>
            <span className="font-medium">8/12</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
