"use client";

import { Clock, Star, Users } from "lucide-react";
import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  students: number;
  rating: number;
  progress?: number;
  level: string;
  tags: string[];
  image?: string;
}

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/courses/${course.id}`}>
      <Card className="overflow-hidden transition-shadow duration-200 hover:shadow-lg">
        {course.image && (
          <div className="relative h-48 w-full">
            <img
              src={course.image}
              alt={course.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <div className="p-6">
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="secondary">{course.level}</Badge>
            {course.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
          <h3 className="mb-2 text-2xl font-bold">{course.title}</h3>
          <p className="mb-4 line-clamp-2 text-muted-foreground">
            {course.description}
          </p>
          <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{course.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{course.students} תלמידים</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{course.rating}</span>
            </div>
          </div>
          {course.progress !== undefined && (
            <div>
              <Progress value={course.progress} className="mb-2 h-2" />
              <p className="text-sm text-muted-foreground">
                {course.progress}% הושלם
              </p>
            </div>
          )}
          <p className="mt-4 text-sm font-medium">מדריך: {course.instructor}</p>
        </div>
      </Card>
    </Link>
  );
}
