import React from "react";

import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MessageInputProps {
  message: string | undefined;
  isLoading: boolean;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function MessageInput({
  message,
  isLoading,
  onChange,
  onSubmit,
}: MessageInputProps): React.ReactElement {
  const actualMessage = message ?? "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newMessage = e.target.value;
    if (newMessage.length <= 1000) {
      onChange(newMessage);
    }
  };

  return (
    <form onSubmit={onSubmit} className="border-t p-4" role="form">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            value={actualMessage}
            onChange={handleChange}
            placeholder="הקלד הודעה..."
            disabled={isLoading}
            maxLength={1000}
          />
          <div className="absolute bottom-0 right-2 text-xs text-muted-foreground">
            {actualMessage.length}/1000
          </div>
        </div>
        <Button
          type="submit"
          disabled={isLoading || !actualMessage.trim()}
          aria-label="שלח"
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">שלח</span>
        </Button>
      </div>
    </form>
  );
}
