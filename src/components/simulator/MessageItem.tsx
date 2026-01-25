import React from "react";
import { FeedbackDisplay } from "@/components/simulator/FeedbackDisplay";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { FeedbackDetails, Message } from "@/types/simulator";

interface MessageItemProps {
  message: Message;
  isLast?: boolean;
  isExpanded?: boolean;
  onToggleFeedback?: (messageId: string) => void;
}

export const MessageItem = React.memo(function MessageItem({
  message,
  _isLast = false,
  isExpanded = false,
  onToggleFeedback,
}: MessageItemProps): React.ReactElement {
  const isUser = message.role === "user";
  const handleToggleFeedback =
    onToggleFeedback || ((_messageId: string) => void 0);

  return (
    <div
      className={cn(
        "flex w-full gap-2 py-2",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <Avatar className="h-8 w-8">
        <AvatarImage
          src={message.sender.avatar_url}
          alt={message.sender.name}
        />
        <AvatarFallback>{message.sender.name[0].toUpperCase()}</AvatarFallback>
      </Avatar>

      <div
        className={cn(
          "flex max-w-[80%] flex-col gap-2",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "rounded-lg px-4 py-2",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          <p className="text-sm">{message.content}</p>
        </div>

        {message.feedback && (
          <div className="w-full">
            <FeedbackDisplay
              feedback={message.feedback as FeedbackDetails}
              messageId={message.id}
              isExpanded={isExpanded}
              onToggle={handleToggleFeedback}
            />
          </div>
        )}
      </div>
    </div>
  );
});
