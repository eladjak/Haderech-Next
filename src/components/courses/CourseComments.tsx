"use client";

import React from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface CourseCommentsProps {
  courseId: string;
}

export function CourseComments({ courseId }: CourseCommentsProps) {
  return (
    <div className="mt-8">
      <h2 className="mb-4 text-2xl font-bold">תגובות</h2>
      <Card className="p-4">
        <div className="mb-4">
          <Textarea
            placeholder="הוסף את התגובה שלך..."
            className="min-h-[100px]"
          />
          <Button className="mt-2">שלח תגובה</Button>
        </div>
        <div className="space-y-4">
          {/* כאן יבואו התגובות מהשרת */}
          <div className="flex items-start space-x-4 space-x-reverse">
            <Avatar className="h-10 w-10" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">שם המגיב</h3>
                <span className="text-sm text-muted-foreground">
                  לפני 2 ימים
                </span>
              </div>
              <p className="mt-1 text-sm">תוכן התגובה יופיע כאן...</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
