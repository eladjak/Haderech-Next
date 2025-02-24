import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/simulator";

interface MessageDisplayProps {
  message: Message;
}

export function MessageDisplay({ message }: MessageDisplayProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <Card
        className={cn(
          "max-w-[80%] p-4",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        <p>{message.content}</p>
        {message.feedback && (
          <div className="mt-2 border-t pt-2">
            <p className="font-bold">ציון: {message.feedback.score}</p>
            <div className="mt-2">
              <p className="font-semibold">חוזקות:</p>
              {message.feedback.strengths.map((strength, index) => (
                <p key={index} className="text-sm">
                  • {strength}
                </p>
              ))}
            </div>
            {message.feedback.improvements.length > 0 && (
              <div className="mt-2">
                <p className="font-semibold">נקודות לשיפור:</p>
                {message.feedback.improvements.map((improvement, index) => (
                  <p key={index} className="text-sm">
                    • {improvement}
                  </p>
                ))}
              </div>
            )}
            {message.feedback.suggestions.length > 0 && (
              <div className="mt-2">
                <p className="font-semibold">הצעות:</p>
                {message.feedback.suggestions.map((suggestion, index) => (
                  <p key={index} className="text-sm">
                    • {suggestion}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
