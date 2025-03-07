"use client";

import { Check, Clock, Download, PlayCircle } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Course {
  id: string;
  price: number;
  features: string[];
  includes: {
    type: "video" | "download" | "time";
    text: string;
  }[];
}

interface CourseSidebarProps {
  course: Course;
}

export function CourseSidebar({ course }: CourseSidebarProps) {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="mb-2 text-3xl font-bold">₪{course.price}</div>
        <Button className="w-full" size="lg">
          הרשם לקורס
        </Button>
      </div>
      <div className="space-y-6">
        <div>
          <h3 className="mb-2 font-semibold">הקורס כולל:</h3>
          <ul className="space-y-2">
            {course.includes.map((item, index) => (
              <li
                key={index}
                className="flex items-center space-x-2 space-x-reverse"
              >
                {item.type === "video" && (
                  <PlayCircle className="h-5 w-5 text-primary" />
                )}
                {item.type === "download" && (
                  <Download className="h-5 w-5 text-primary" />
                )}
                {item.type === "time" && (
                  <Clock className="h-5 w-5 text-primary" />
                )}
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-2 font-semibold">מה תקבלו:</h3>
          <ul className="space-y-2">
            {course.features.map((feature, index) => (
              <li
                key={index}
                className="flex items-center space-x-2 space-x-reverse"
              >
                <Check className="h-5 w-5 text-green-500" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
