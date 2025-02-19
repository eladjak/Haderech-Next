"use client";

import React from "react";

import { Maximize2, Minimize2, Send, X } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/Spinner";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface ChatMessage {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  relatedContent?: {
    type: "lesson" | "article" | "exercise";
    id: string;
    title: string;
    url: string;
  };
}

interface ChatbotWindowProps {
  /** האם החלון פתוח */
  isOpen?: boolean;
  /** האם החלון ממוזער */
  isMinimized?: boolean;
  /** האם בטעינה */
  isLoading?: boolean;
  /** היסטוריית ההודעות */
  messages: ChatMessage[];
  /** פונקציה לשליחת הודעה */
  onSendMessage?: (content: string) => void;
  /** פונקציה לסגירת החלון */
  onClose?: () => void;
  /** פונקציה למזעור/הגדלת החלון */
  onToggleMinimize?: () => void;
  /** פונקציה לניווט לתוכן קשור */
  onNavigateToContent?: (content: ChatMessage["relatedContent"]) => void;
  className?: string;
}

export function ChatbotWindow({
  isOpen = true,
  isMinimized = false,
  isLoading = false,
  messages = [],
  onSendMessage,
  onClose,
  onToggleMinimize,
  onNavigateToContent,
  className,
}: ChatbotWindowProps) {
  const [messageInput, setMessageInput] = React.useState("");
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !onSendMessage) return;

    onSendMessage(messageInput.trim());
    setMessageInput("");
  };

  if (!isOpen) return null;

  return (
    <Card
      className={cn(
        "fixed bottom-4 left-4 w-[400px] transition-all duration-200",
        isMinimized && "h-[60px]",
        !isMinimized && "h-[600px]",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <CardTitle className="text-lg">צ'אט עם המערכת</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={onToggleMinimize}
          >
            {isMinimized ? (
              <Maximize2 className="h-4 w-4" />
            ) : (
              <Minimize2 className="h-4 w-4" />
            )}
          </Button>
          <Button variant="ghost" className="h-8 w-8 p-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <CardContent className="h-[calc(100%-120px)] overflow-y-auto p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.sender === "user" && "flex-row-reverse"
                  )}
                >
                  <Avatar>
                    {message.sender === "user" ? (
                      <AvatarImage src="/avatars/user.png" />
                    ) : (
                      <AvatarImage src="/avatars/bot.png" />
                    )}
                    <AvatarFallback>
                      {message.sender === "user" ? "U" : "B"}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      "rounded-lg p-3",
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <p className="text-sm">{message.content}</p>
                    {message.relatedContent && (
                      <Button
                        variant="link"
                        className="mt-2 h-auto p-0 text-xs"
                        onClick={() =>
                          onNavigateToContent?.(message.relatedContent)
                        }
                      >
                        צפה ב
                        {message.relatedContent.type === "lesson"
                          ? "שיעור"
                          : message.relatedContent.type === "article"
                            ? "מאמר"
                            : "תרגיל"}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="absolute bottom-0 left-0 right-0 border-t bg-background p-4"
          >
            <div className="flex gap-2">
              <Textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="הקלד הודעה..."
                className="min-h-[40px] resize-none"
              />
              <Button
                type="submit"
                disabled={!messageInput.trim() || isLoading}
                className="h-10 w-10 p-0"
              >
                {isLoading ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </form>
        </>
      )}
    </Card>
  );
}
