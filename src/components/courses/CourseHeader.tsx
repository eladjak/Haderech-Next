"use client";

import { Clock, Star, Users } from "lucide-react";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: {
    name: string;
    avatar: string;
  };
  duration: string;
  students: number;
  rating: number;
  level: string;
  tags: string[];
}

interface CourseHeaderProps {
  course: Course;
}

export function CourseHeader({ course }: CourseHeaderProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <Badge variant="secondary">{course.level}</Badge>
        </div>
        <p className="text-muted-foreground">{course.description}</p>
        <div className="flex items-center space-x-6 space-x-reverse">
          <div className="flex items-center space-x-2 space-x-reverse">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <Users className="h-5 w-5 text-muted-foreground" />
            <span>{course.students} תלמידים</span>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <Star className="h-5 w-5 text-yellow-400" />
            <span>{course.rating}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {course.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center space-x-3 space-x-reverse">
          <img
            src={course.instructor.avatar}
            alt={course.instructor.name}
            className="h-10 w-10 rounded-full"
          />
          <div>
            <p className="text-sm font-medium">מרצה</p>
            <p className="text-sm text-muted-foreground">
              {course.instructor.name}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
