"use client";

import { Maximize2, Minimize2, Send, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export interface ChatbotWindowProps {
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

/**
 * רכיב חלון הצ'טבוט
 */
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
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // גלילה אוטומטית למטה כאשר מתווספות הודעות חדשות
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // טיפול בשליחת הודעה
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !onSendMessage) return;

    onSendMessage(inputValue.trim());
    setInputValue("");
  };

  if (!isOpen) return null;

  return (
    <Card
      className={cn("fixed bottom-4 left-4 z-50 w-80 shadow-lg", className)}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3">
        <CardTitle className="text-base font-medium">צ'אט עזרה</CardTitle>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onToggleMinimize}
          >
            {isMinimized ? (
              <Maximize2 className="h-4 w-4" />
            ) : (
              <Minimize2 className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <>
          <CardContent className="max-h-[300px] overflow-y-auto p-3">
            {messages.length === 0 ? (
              <div className="py-4 text-center text-muted-foreground">
                שלח הודעה כדי להתחיל את השיחה
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "mb-3",
                    message.sender === "user" ? "text-right" : "text-left"
                  )}
                >
                  <div className="flex items-start gap-2">
                    {message.sender !== "user" && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/images/bot-avatar.png" />
                        <AvatarFallback>בוט</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "inline-block max-w-[80%] rounded-lg px-3 py-2",
                        message.sender === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      {message.content}
                      {message.relatedContent && (
                        <div className="mt-2 text-xs">
                          <button
                            onClick={() =>
                              onNavigateToContent &&
                              onNavigateToContent(message.relatedContent)
                            }
                            className="text-blue-500 underline hover:text-blue-700"
                          >
                            צפה ב
                            {message.relatedContent.type === "lesson"
                              ? "שיעור"
                              : message.relatedContent.type === "article"
                                ? "מאמר"
                                : "תרגיל"}
                            : {message.relatedContent.title}
                          </button>
                        </div>
                      )}
                    </div>
                    {message.sender === "user" && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/images/user-avatar.png" />
                        <AvatarFallback>אני</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="py-2 text-center">
                <Spinner className="inline-block" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          <form onSubmit={handleSubmit} className="border-t p-3">
            <div className="flex gap-2">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="הקלד הודעה..."
                className="min-h-[40px] resize-none"
              />
              <Button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="h-10 w-10 p-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </>
      )}
    </Card>
  );
}
