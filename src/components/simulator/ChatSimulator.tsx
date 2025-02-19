"use client";

import React, { useState } from "react";

import { Card } from "@/components/ui/card";
import type { SimulationState } from "@/types/simulator";

import { ChatHeader } from "./ChatHeader";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";

export interface ChatSimulatorProps {
  state: SimulationState;
  onMessage: (content: string) => Promise<void>;
  isLoading?: boolean;
}

export function ChatSimulator({
  state,
  onMessage,
  isLoading = false,
}: ChatSimulatorProps): React.ReactElement {
  const [message, setMessage] = useState("");
  const [expandedFeedback, setExpandedFeedback] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading || message.length > 1000) return;

    try {
      await onMessage(message);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleToggleFeedback = (messageId: string): void => {
    setExpandedFeedback((prev) =>
      prev.includes(messageId)
        ? prev.filter((id) => id !== messageId)
        : [...prev, messageId]
    );
  };

  return (
    <Card className="flex h-[600px] flex-col">
      <ChatHeader scenario={state.scenario} />
      <MessageList
        messages={state.messages}
        expandedFeedback={expandedFeedback}
        onToggleFeedback={handleToggleFeedback}
      />
      <MessageInput
        message={message}
        isLoading={isLoading}
        onChange={setMessage}
        onSubmit={handleSubmit}
      />
    </Card>
  );
}
