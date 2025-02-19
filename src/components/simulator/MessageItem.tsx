import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/simulator";

interface MessageItemProps {
  message: Message;
  className?: string;
}

export function MessageItem({
  message,
  className,
}: MessageItemProps): React.ReactElement {
  return (
    <div
      className={cn(
        "flex",
        message.role === "user" ? "justify-end" : "justify-start",
        className
      )}
    >
      <div
        className={cn(
          "flex max-w-[80%] items-start gap-2",
          message.role === "user" && "flex-row-reverse"
        )}
      >
        <Avatar>
          <AvatarImage src={message.sender.avatar} />
          <AvatarFallback>
            {message.sender.name?.[0] || message.sender.role[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div
          className={cn(
            "rounded-lg px-4 py-2",
            message.role === "user"
              ? "bg-primary text-primary-foreground"
              : "bg-muted"
          )}
        >
          <div className="mb-1 text-sm font-medium">
            {message.sender.name || message.sender.role}
          </div>
          <div className="text-sm">{message.content}</div>
        </div>
      </div>
    </div>
  );
}
