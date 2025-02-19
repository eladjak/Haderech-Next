import React, { useEffect, useRef } from "react";

import type { Message } from "@/types/simulator";

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
        {messages.map((message) => (
          <div key={message.id}>
            <MessageItem message={message} />
            {message.feedback && message.role === "user" && (
              <FeedbackDisplay
                feedback={message.feedback}
                messageId={message.id}
                isExpanded={expandedFeedback.includes(message.id)}
                onToggle={onToggleFeedback}
              />
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
