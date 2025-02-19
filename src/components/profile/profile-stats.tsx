import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ProfileStatsProps {
  stats: {
    coursesCompleted: number;
    totalCourses: number;
    averageScore: number;
    totalTime: number;
    achievements: number;
    certificatesEarned: number;
  };
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  const completionRate = (stats.coursesCompleted / stats.totalCourses) * 100;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>התקדמות בקורסים</CardTitle>
          <CardDescription>
            {stats.coursesCompleted} מתוך {stats.totalCourses} קורסים הושלמו
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={completionRate} className="mt-2" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>ציון ממוצע</CardTitle>
          <CardDescription>הציון הממוצע בכל הקורסים</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.averageScore}%</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>זמן למידה</CardTitle>
          <CardDescription>סך הכל זמן למידה בפלטפורמה</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalTime} שעות</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>הישגים</CardTitle>
          <CardDescription>הישגים שנצברו</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.achievements}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>תעודות</CardTitle>
          <CardDescription>תעודות שהושגו</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.certificatesEarned}</div>
        </CardContent>
      </Card>
    </div>
  );
}
