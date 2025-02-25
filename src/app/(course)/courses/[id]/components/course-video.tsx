"use client";

import { useState } from "react";

import { Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CourseVideoProps {
  course: {
    id: string;
    title: string;
    description: string;
    videoUrl: string;
  };
  className?: string;
}

export function CourseVideo({ course, className }: CourseVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader>
        <CardTitle>{course.title}</CardTitle>
        <CardDescription>{course.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-video">
          {!isPlaying ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <Button
                variant="ghost"
                size="icon"
                className="h-16 w-16 rounded-full"
                onClick={handlePlay}
              >
                <Play className="h-8 w-8" />
              </Button>
            </div>
          ) : (
            <video
              src={course.videoUrl}
              controls
              autoPlay
              className="h-full w-full"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
