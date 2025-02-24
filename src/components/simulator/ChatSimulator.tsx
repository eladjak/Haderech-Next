"use client";

import type { ReactElement } from "react";
import { useCallback, useState } from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import type { ChatSimulatorProps } from "@/types/props";
import type {
  Message,
  SimulatorResponse,
  SimulatorScenario,
} from "@/types/simulator";

import { MessageDisplay } from "./MessageDisplay";

export function ChatSimulator({
  state,
  onSendMessage,
  onReset,
  isLoading = false,
}: ChatSimulatorProps): ReactElement {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
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
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{state.scenario.title}</h2>
        <Button onClick={onReset} variant="outline">
          התחל מחדש
        </Button>
      </div>

      <p className="text-muted-foreground">{state.scenario.description}</p>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4 p-4">
          {state.messages.map((msg) => (
            <MessageDisplay key={msg.id} message={msg} />
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="הקלד הודעה..."
          disabled={isLoading || state.status === "completed"}
        />
        <Button
          type="submit"
          disabled={
            isLoading || state.status === "completed" || !message.trim()
          }
        >
          שלח
        </Button>
      </form>
    </div>
  );
}
