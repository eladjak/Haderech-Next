import { Trophy } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { Achievement as AchievementType } from "@/types/api";

interface AchievementProps {
  achievement: AchievementType;
  className?: string;
}

export function Achievement({ achievement, className }: AchievementProps) {
  return (
    <Card className={className}>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Trophy className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <div className="font-medium">{achievement.title}</div>
          <div className="mt-1 text-sm text-muted-foreground">
            {achievement.description}
          </div>
          {achievement.earned_at && (
            <div className="mt-1 text-sm text-muted-foreground">
              הושג ב-
              {new Date(achievement.earned_at).toLocaleDateString("he-IL")}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
