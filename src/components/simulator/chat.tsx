"use client";

import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type {
  APIResponse,
  Message as GlobalMessage,
  SimulationState as GlobalSimulationState,
  SimulationResponse,
} from "@/types/simulator";

type Message = GlobalMessage;
type SimulationState = GlobalSimulationState;

const MAX_CONTEXT_LENGTH = 2000;
const MAX_MESSAGE_LENGTH = 1000;
const SAFE_IMAGE_PATHS = ["/avatars/user.png", "/avatars/system.png"] as const;
type SafeImagePath = (typeof SAFE_IMAGE_PATHS)[number];

function isSafeImagePath(path: string): path is SafeImagePath {
  return SAFE_IMAGE_PATHS.includes(path as SafeImagePath);
}

function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .slice(0, MAX_MESSAGE_LENGTH); // Limit length
}

function validateMessage(message: string): string {
  const sanitized = sanitizeInput(message);
  if (!sanitized) {
    throw new Error("ההודעה לא יכולה להיות ריקה");
  }
  if (sanitized.length > MAX_MESSAGE_LENGTH) {
    throw new Error(`ההודעה ארוכה מדי (מקסימום ${MAX_MESSAGE_LENGTH} תווים)`);
  }
  return sanitized;
}

function validateContext(context: string): string {
  const sanitized = sanitizeInput(context);
  if (!sanitized) {
    throw new Error("הקונטקסט לא יכול להיות ריק");
  }
  if (sanitized.length > MAX_CONTEXT_LENGTH) {
    throw new Error(`הקונטקסט ארוך מדי (מקסימום ${MAX_CONTEXT_LENGTH} תווים)`);
  }
  return sanitized;
}

function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date");
    }
    return date.toLocaleTimeString();
  } catch (error) {
    console.error("Error formatting timestamp:", error);
    return "זמן לא ידוע";
  }
}

function validateResponse(data: unknown): asserts data is APIResponse {
  if (!data || typeof data !== "object") {
    throw new Error("תשובה לא תקינה מהשרת");
  }

  const response = data as Partial<APIResponse>;

  if (response.error) {
    throw new Error(response.error);
  }

  if (!response.state || typeof response.state !== "object") {
    throw new Error("חסר מצב סימולציה בתשובה");
  }

  const { scenario, messages, status } =
    response.state as Partial<SimulationState>;

  if (!scenario || typeof scenario !== "object") {
    throw new Error("חסר תרחיש בתשובה");
  }

  if (!Array.isArray(messages)) {
    throw new Error("חסרות הודעות בתשובה");
  }

  if (!status || !["active", "completed", "failed"].includes(status)) {
    throw new Error("סטטוס לא תקין בתשובה");
  }
}

export function SimulatorChat(): React.ReactElement {
  const { toast } = useToast();
  const [context, setContext] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [state, setState] = useState<SimulationState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Start a new simulation
  const startSimulation = async (): Promise<void> => {
    try {
      setError(null);
      const validContext = validateContext(context);

      setIsLoading(true);
      const response = await fetch("/api/simulator/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context: validContext }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || `שגיאה ${response.status}: ${response.statusText}`
        );
      }

      validateResponse(data);
      if (data.state) {
        setState(data.state);
      }
    } catch (error) {
      console.error("Error starting simulation:", error);
      const errorMessage =
        error instanceof Error ? error.message : "לא ניתן להתחיל את הסימולציה";
      setError(errorMessage);
      toast({
        title: "שגיאה",
        description: errorMessage,
        action: {
          label: "נסה שוב",
          onClick: () => void startSimulation(),
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Send a message in the simulation
  const sendMessage = async (): Promise<void> => {
    if (!state) return;

    try {
      setError(null);
      const validMessage = validateMessage(message);

      setIsLoading(true);
      const response = await fetch("/api/simulator/message", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state, message: validMessage }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || `שגיאה ${response.status}: ${response.statusText}`
        );
      }

      validateResponse(data);
      if (data.state) {
        setState(data.state);
      }
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage =
        error instanceof Error ? error.message : "לא ניתן לשלוח את ההודעה";
      setError(errorMessage);
      toast({
        title: "שגיאה",
        description: errorMessage,
        action: {
          label: "נסה שוב",
          onClick: () => void sendMessage(),
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Save simulation results
  const saveResults = async (): Promise<void> => {
    if (!state) return;

    try {
      setError(null);
      setIsLoading(true);
      const response = await fetch("/api/simulator/save", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || `שגיאה ${response.status}: ${response.statusText}`
        );
      }

      if (data.error) {
        throw new Error(data.error);
      }

      toast({
        title: "נשמר בהצלחה",
        description: "תוצאות הסימולציה נשמרו",
      });
    } catch (error) {
      console.error("Error saving results:", error);
      const errorMessage =
        error instanceof Error ? error.message : "לא ניתן לשמור את התוצאות";
      setError(errorMessage);
      toast({
        title: "שגיאה",
        description: errorMessage,
        action: {
          label: "נסה שוב",
          onClick: () => void saveResults(),
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset the simulation
  const resetSimulation = (): void => {
    setState(null);
    setContext("");
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter" && message.trim()) {
      void sendMessage();
    }
  };

  const handleContextChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ): void => {
    const newContext = e.target.value;
    if (newContext.length <= MAX_CONTEXT_LENGTH) {
      setContext(newContext);
    }
  };

  const handleMessageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const newMessage = e.target.value;
    if (newMessage.length <= MAX_MESSAGE_LENGTH) {
      setMessage(newMessage);
    }
  };

  if (!state) {
    return (
      <div className="space-y-4">
        <Textarea
          placeholder="תאר את הסיטואציה והקונטקסט לדייט..."
          value={context}
          onChange={handleContextChange}
          className="min-h-[100px]"
          maxLength={MAX_CONTEXT_LENGTH}
        />
        <div className="text-xs text-muted-foreground">
          {context.length}/{MAX_CONTEXT_LENGTH}
        </div>
        <Button
          onClick={() => void startSimulation()}
          disabled={isLoading || !context.trim()}
          className="w-full"
        >
          התחל סימולציה
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="rounded-lg border bg-muted p-4">
        <h3 className="font-semibold">קונטקסט</h3>
        <p className="text-sm text-muted-foreground">
          {state.scenario.description}
        </p>
      </div>

      <div className="space-y-4">
        {state.messages.map((msg: Message) => {
          const avatarSrc =
            msg.role === "user" ? "/avatars/user.png" : "/avatars/system.png";
          return (
            <div
              key={`${msg.role}-${msg.timestamp}`}
              className={
                cn(
                  "flex w-max max-w-[80%] items-end gap-2 rounded-lg p-4",
                  msg.role === "user"
                    ? "mr-auto bg-primary text-primary-foreground"
                    : "bg-muted"
                ) as string
              }
            >
              <Avatar className="h-6 w-6">
                {isSafeImagePath(avatarSrc) && (
                  <AvatarImage src={avatarSrc} alt={msg.role} />
                )}
                <AvatarFallback>
                  {msg.role === "user" ? "א" : "מ"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <p className="text-sm">{msg.content}</p>
                <span className="text-xs text-muted-foreground">
                  {formatTimestamp(msg.timestamp)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="הקלד הודעה..."
            value={message}
            onChange={handleMessageChange}
            onKeyDown={handleKeyDown}
            maxLength={MAX_MESSAGE_LENGTH}
          />
          <div className="absolute bottom-0 right-2 text-xs text-muted-foreground">
            {message.length}/{MAX_MESSAGE_LENGTH}
          </div>
        </div>
        <Button
          onClick={() => void sendMessage()}
          disabled={isLoading || !message.trim()}
        >
          שלח
        </Button>
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={resetSimulation}
          disabled={isLoading}
        >
          סימולציה חדשה
        </Button>
        <Button
          variant="secondary"
          onClick={() => void saveResults()}
          disabled={isLoading}
        >
          שמור תוצאות
        </Button>
      </div>
    </div>
  );
}
