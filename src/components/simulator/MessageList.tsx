import React, { useEffect, useRef } from "react";
import { Message } from "@/types/simulator";
import { FeedbackDisplay } from "./FeedbackDisplay";
import { MessageItem } from "./MessageItem";

interface MessageListProps {
  messages: Message[];
  expandedFeedback: string[];
  onToggleFeedback: (messageId: string) => void;
  className?: string;
}

export function MessageList({
  messages,
  expandedFeedback,
  onToggleFeedback,
  className = "",
}: MessageListProps): React.ReactElement {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className={`flex-1 overflow-y-auto p-4 ${className}`}>
      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground">
            אין הודעות עדיין
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={message.id}>
              <MessageItem
                message={message}
                isExpanded={expandedFeedback.includes(message.id)}
                onToggleFeedback={onToggleFeedback}
                isLast={index === messages.length - 1}
              />
              {message.feedback && message.role === "user" && (
                <FeedbackDisplay
                  feedback={message.feedback}
                  messageId={message.id}
                  isExpanded={expandedFeedback.includes(message.id)}
                  onToggle={onToggleFeedback}
                />
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
