"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FeedbackDetails } from "@/types/simulator";

interface FeedbackDisplayProps {
  feedback: FeedbackDetails;
}

export const FeedbackDisplay = ({ feedback }: FeedbackDisplayProps) => {
  if (!feedback) return null;

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>משוב</CardTitle>
        <CardDescription>הנה המשוב על התשובה שלך בסימולציה</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="mb-2 text-lg font-semibold">ציון כולל</h3>
          <div className="mb-1 flex items-center justify-between">
            <span>{feedback.overallScore}%</span>
            <Badge
              variant={feedback.overallScore >= 70 ? "success" : "destructive"}
            >
              {feedback.overallScore >= 70 ? "עבר" : "לא עבר"}
            </Badge>
          </div>
          <Progress value={feedback.overallScore} className="h-2" />
        </div>

        {feedback.criteria && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">קריטריונים</h3>
            {Object.entries(feedback.criteria).map(([key, value]) => (
              <div key={key}>
                <div className="mb-1 flex items-center justify-between">
                  <span>{key}</span>
                  <span>{value.score}/10</span>
                </div>
                <Progress value={value.score * 10} className="h-2" />
                <p className="mt-1 text-sm text-muted-foreground">
                  {value.comment}
                </p>
              </div>
            ))}
          </div>
        )}

        {feedback.suggestions && (
          <div>
            <h3 className="mb-2 text-lg font-semibold">הצעות לשיפור</h3>
            <ul className="list-inside list-disc space-y-1">
              {feedback.suggestions.map((suggestion, index) => (
                <li key={index} className="text-sm">
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}

        {feedback.comment && (
          <div>
            <h3 className="mb-2 text-lg font-semibold">הערות נוספות</h3>
            <p className="text-sm">{feedback.comment}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
