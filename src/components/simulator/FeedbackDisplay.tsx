import { _CheckCircle2, AlertCircle, Briefcase, CheckCircle, ChevronDown, ChevronUp, Heart, Sun, Target, ThumbsUp, Wrench,} from "./forum";
import React from "react";
import type { ReactElement, ReactNode } from "react";

import type {
  _CheckCircle2} from "./forum";
  AlertCircle,
  Briefcase,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Heart,
  Sun,
  Target,
  ThumbsUp,
  Wrench,
} from "lucide-react";







interface FeedbackDisplayProps {
  feedback?: FeedbackDetails;
  messageId: string;
  isExpanded: boolean;
  onToggle: (messageId: string) => void;
  className?: string;
}

interface MetricItem {
  label: string;
  value: number;
  icon: ReactNode;
  color: string;
}

export function FeedbackDisplay({
  feedback,
  messageId,
  isExpanded,
  onToggle,
  className,
}: FeedbackDisplayProps): ReactElement {
  if (!feedback) {
    return (
      <Alert variant="default" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>אין משוב זמין</AlertTitle>
        <AlertDescription>אין משוב זמין להודעה זו כרגע.</AlertDescription>
      </Alert>
    );
  }

  const metrics: MetricItem[] = [
    {
      label: "אמפתיה",
      value: feedback.metrics.empathy * 100,
      icon: <Heart className="h-4 w-4" />,
      color: "bg-red-200",
    },
    {
      label: "בהירות",
      value: feedback.metrics.clarity * 100,
      icon: <Sun className="h-4 w-4" />,
      color: "bg-yellow-200",
    },
    {
      label: "אפקטיביות",
      value: feedback.metrics.effectiveness * 100,
      icon: <Target className="h-4 w-4" />,
      color: "bg-blue-200",
    },
    {
      label: "התאמה",
      value: feedback.metrics.appropriateness * 100,
      icon: <CheckCircle className="h-4 w-4" />,
      color: "bg-green-200",
    },
    {
      label: "מקצועיות",
      value: feedback.metrics.professionalism * 100,
      icon: <Briefcase className="h-4 w-4" />,
      color: "bg-purple-200",
    },
    {
      label: "פתרון בעיות",
      value: feedback.metrics.problem_solving * 100,
      icon: <Wrench className="h-4 w-4" />,
      color: "bg-orange-200",
    },
  ];

  const getScoreColor = (score: number): string => {
    if (score >= 90) return "bg-green-500";
    if (score >= 80) return "bg-green-400";
    if (score >= 70) return "bg-yellow-400";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Alert
      variant="default"
      className={cn("cursor-pointer", className)}
      onClick={() => onToggle(messageId)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ThumbsUp className="h-4 w-4" />
          <AlertTitle>ציון: {feedback.score}</AlertTitle>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onToggle(messageId);
          }}
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {metrics.map((metric) => (
              <div key={metric.label} className="space-y-1">
                <div className="flex items-center gap-2">
                  {metric.icon}
                  <span className="text-sm font-medium">{metric.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn("h-full transition-all", metric.color)}
                      style={{ width: `${metric.value}%` }}
                    />
                  </div>
                  <span className="text-sm">{Math.round(metric.value)}%</span>
                </div>
              </div>
            ))}
          </div>

          <div>
            <h4 className="mb-2 font-semibold">התקדמות כללית</h4>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full transition-all",
                  getScoreColor(feedback.overallProgress.score)
                )}
                style={{ width: `${feedback.overallProgress.score}%` }}
              />
            </div>
            <div className="mt-2 text-sm">
              <p>רמה נוכחית: {feedback.overallProgress.level}</p>
              <p>הרמה הבאה: {feedback.overallProgress.nextLevel}</p>
              <p>
                נדרש: {feedback.overallProgress.requiredScore}% להתקדמות לרמה
                הבאה
              </p>
            </div>
          </div>

          {feedback.strengths.length > 0 && (
            <div>
              <h4 className="mb-2 font-semibold">חוזקות</h4>
              <ul className="list-inside list-disc space-y-1">
                {feedback.strengths.map((strength, index) => (
                  <li key={index} className="text-sm">
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {feedback.improvements.length > 0 && (
            <div>
              <h4 className="mb-2 font-semibold">נקודות לשיפור</h4>
              <ul className="list-inside list-disc space-y-1">
                {feedback.improvements.map((improvement, index) => (
                  <li key={index} className="text-sm">
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {feedback.suggestions.length > 0 && (
            <div>
              <h4 className="mb-2 font-semibold">הצעות לשיפור</h4>
              <ul className="list-inside list-disc space-y-1">
                {feedback.suggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm">
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Alert>
  );
}
