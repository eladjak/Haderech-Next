import React from "react";

import {
  ChevronDown,
  ChevronUp,
  MessageCircle,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import type { MessageFeedback } from "@/types/simulator";

interface FeedbackDisplayProps {
  feedback: MessageFeedback;
  messageId: string;
  isExpanded: boolean;
  onToggle: (messageId: string) => void;
}

interface FeedbackMetric {
  label: string;
  value: number;
}

export function FeedbackDisplay({
  feedback,
  messageId,
  isExpanded,
  onToggle,
}: FeedbackDisplayProps): React.ReactElement {
  const renderFeedbackIcon = (score: number): React.ReactElement => {
    if (score >= 80) {
      return <ThumbsUp className="h-4 w-4 text-green-500" />;
    }
    if (score >= 60) {
      return <MessageCircle className="h-4 w-4 text-yellow-500" />;
    }
    return <ThumbsDown className="h-4 w-4 text-red-500" />;
  };

  const renderFeedbackDetails = (): React.ReactElement | null => {
    if (!feedback.details) return null;

    const { details } = feedback;
    const { strengths, improvements, tips } = details;

    const metrics: FeedbackMetric[] = [
      { label: "אמפתיה", value: details.empathy },
      { label: "בהירות", value: details.clarity },
      { label: "אפקטיביות", value: details.effectiveness },
      { label: "התאמה", value: details.appropriateness },
    ];

    return (
      <div className="mt-4 space-y-4">
        {metrics.map(({ label, value }) => (
          <div key={label} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>{label}</span>
              <span>{value}%</span>
            </div>
            <Progress value={value} className="h-2" />
          </div>
        ))}

        {strengths.length > 0 && (
          <div>
            <h4 className="mb-2 font-semibold">חוזקות</h4>
            <ul className="list-inside list-disc">
              {strengths.map((strength: string, index: number) => (
                <li key={`strength-${index}`}>{strength}</li>
              ))}
            </ul>
          </div>
        )}

        {improvements.length > 0 && (
          <div>
            <h4 className="mb-2 font-semibold">נקודות לשיפור</h4>
            <ul className="list-inside list-disc">
              {improvements.map((improvement: string, index: number) => (
                <li key={`improvement-${index}`}>{improvement}</li>
              ))}
            </ul>
          </div>
        )}

        {tips.length > 0 && (
          <div>
            <h4 className="mb-2 font-semibold">טיפים</h4>
            <ul className="list-inside list-disc">
              {tips.map((tip: string, index: number) => (
                <li key={`tip-${index}`}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full space-y-2">
      <Alert
        className={`cursor-pointer ${
          feedback.score >= 80
            ? "border-green-500"
            : feedback.score >= 60
              ? "border-yellow-500"
              : "border-red-500"
        }`}
        onClick={() => onToggle(messageId)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {renderFeedbackIcon(feedback.score)}
            <AlertTitle>ציון: {feedback.score}</AlertTitle>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" data-testid="chevron-up" />
          ) : (
            <ChevronDown className="h-4 w-4" data-testid="chevron-down" />
          )}
        </div>
        <AlertDescription>{feedback.message}</AlertDescription>

        {isExpanded && renderFeedbackDetails()}
      </Alert>
    </div>
  );
}
