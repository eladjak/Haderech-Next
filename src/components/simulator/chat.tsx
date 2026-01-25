"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { processUserMessage } from "@/lib/services/simulator";
import { cn } from "@/lib/utils";
import { ChatHeader } from "./ChatHeader";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";







import type {
  Message,
  SimulatorResponse,
  SimulatorScenario,
  SimulatorSession,
  SimulatorState,
} from "@/types/simulator";




interface ChatProps {
  state: SimulatorState | null;
  onComplete?: (state: SimulatorState) => void;
  onMessage?: (message: string) => Promise<void>;
  isLoading?: boolean;
  showFeedback?: boolean;
}

export function Chat({
  state,
  onComplete,
  onMessage,
  isLoading = false,
  _showFeedback = true,
}: ChatProps) {
  const _router = useRouter();
  const { _user } = useAuth();
  const { _toast } = useToast();

  const [message, setMessage] = useState("");
  const [expandedFeedback, setExpandedFeedback] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [state?.messages]);

  const handleToggleFeedback = (messageId: string) => {
    setExpandedFeedback((prev) =>
      prev.includes(messageId)
        ? prev.filter((id) => id !== messageId)
        : [...prev, messageId]
    );
  };

  const handleSubmit = async () => {
    if (!message.trim() || isLoading || !state) return;

    const content = message;
    setMessage("");

    if (onMessage) {
      await onMessage(content);
    } else {
      const session: SimulatorSession = {
        id: state.id,
        user_id: state.user_id,
        scenario_id: state.scenario_id,
        scenario: state.scenario,
        status: state.status,
        state: state,
        messages: state.messages,
        created_at: state.created_at,
        updated_at: state.updated_at,
      };

      const response = await processUserMessage(session, content);
      if (response.state === "completed" && onComplete) {
        onComplete(response);
      }
    }
  };

  if (!state) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">אין תרחיש פעיל</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <ChatHeader scenario={state.scenario} />
      <div className="flex-1 overflow-y-auto p-4">
        <MessageList
          messages={state.messages}
          expandedFeedback={expandedFeedback}
          onToggleFeedback={handleToggleFeedback}
        />
        <div ref={messagesEndRef} />
      </div>
      <MessageInput
        message={message}
        onChange={setMessage}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
