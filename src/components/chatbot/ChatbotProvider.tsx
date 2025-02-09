"use client";

import React from "react";

import { ChatbotContainer } from "./ChatbotContainer";

import type { ChatMessage } from "./ChatbotWindow";

interface ChatbotProviderProps {
  /** פונקציה לשליחת הודעה ל-AI */
  onSendMessage: (message: string) => Promise<ChatMessage>;
  /** פונקציה לניווט לתוכן קשור */
  onNavigateToContent: (content: ChatMessage["relatedContent"]) => void;
  /** תוכן הילדים */
  children: React.ReactNode;
}

/**
 * קומפוננטת ספק הצ'טבוט שמספקת את הצ'טבוט לכל האפליקציה
 */
export function ChatbotProvider({
  onSendMessage,
  onNavigateToContent,
  children,
}: ChatbotProviderProps) {
  return (
    <>
      {children}
      <ChatbotContainer
        onSendMessage={onSendMessage}
        onNavigateToContent={onNavigateToContent}
      />
    </>
  );
}
