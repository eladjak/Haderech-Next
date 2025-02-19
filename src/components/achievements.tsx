import { Achievement } from "@/components/achievement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Achievement as AchievementType } from "@/types/api";

interface AchievementsProps {
  achievements: AchievementType[];
  className?: string;
}

export function Achievements({ achievements, className }: AchievementsProps) {
  if (!achievements.length) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>הישגים</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {achievements.map((achievement) => (
          <Achievement key={achievement.id} achievement={achievement} />
        ))}
      </CardContent>
    </Card>
  );
}
