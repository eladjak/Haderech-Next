"use client";

import { MessageCircle } from "lucide-react";
import type { ChatMessage } from "types/models";
import React, { useState } from "react";

// יצירת גרסה זמנית פשוטה של ChatbotWindow
const ChatbotWindow = ({
  isOpen,
  isMinimized,
  isLoading,
  messages,
  onSendMessage,
  onClose,
  onToggleMinimize,
  onNavigateToContent,
}: {
  isOpen: boolean;
  isMinimized: boolean;
  isLoading: boolean;
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  onClose: () => void;
  onToggleMinimize: () => void;
  onNavigateToContent: (content: any) => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 left-4 w-80 rounded bg-background shadow-lg">
      <div className="flex items-center justify-between border-b p-3">
        <h3 className="text-sm font-medium">צ'אט עזרה</h3>
        <div className="flex gap-1">
          <button
            onClick={onToggleMinimize}
            className="rounded-sm p-1 hover:bg-muted"
          >
            {isMinimized ? "הגדל" : "מזער"}
          </button>
          <button onClick={onClose} className="rounded-sm p-1 hover:bg-muted">
            סגור
          </button>
        </div>
      </div>
      {!isMinimized && (
        <>
          <div className="h-64 overflow-y-auto p-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-2 ${msg.role === "user" ? "text-right" : "text-left"}`}
              >
                <div className="inline-block max-w-[80%] rounded-lg bg-muted px-3 py-1">
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="text-center">
                <div className="inline-block animate-spin">⏳</div>
              </div>
            )}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const input = e.currentTarget.elements.namedItem(
                "message"
              ) as HTMLInputElement;
              onSendMessage(input.value);
              input.value = "";
            }}
            className="border-t p-3"
          >
            <div className="flex gap-2">
              <input
                type="text"
                name="message"
                placeholder="הקלד הודעה..."
                className="flex-1 rounded border p-2"
              />
              <button
                type="submit"
                className="rounded bg-primary p-2 text-white"
                disabled={isLoading}
              >
                שלח
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

interface ChatbotContainerProps {
  /** פונקציה לשליחת הודעה ל-AI */
  onSendMessage: (message: string) => Promise<ChatMessage>;
  /** פונקציה לניווט לתוכן קשור */
  onNavigateToContent: (content: any) => void;
}

/**
 * קומפוננטת מיכל לצ'טבוט שמנהלת את המצב והלוגיקה
 */
export function ChatbotContainer({
  onSendMessage,
  onNavigateToContent,
}: ChatbotContainerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    try {
      setIsLoading(true);

      // הוספת הודעת המשתמש
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        content,
        role: "user",
        timestamp: new Date().toISOString(),
        sender: {
          id: "user",
          name: "משתמש",
          role: "user",
        },
      };

      setMessages((prev) => [...prev, userMessage]);

      // קבלת תגובת ה-AI
      const botResponse = await onSendMessage(content);
      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("Error in chatbot:", error);
      // כאן אפשר להוסיף הודעת שגיאה למשתמש
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const handleToggleMinimize = () => {
    setIsMinimized((prev) => !prev);
  };

  return (
    <>
      {/* כפתור פתיחת הצ'טבוט */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 left-4 rounded-full bg-primary p-4 text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
          aria-label="פתח צ'טבוט"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* חלון הצ'טבוט */}
      <ChatbotWindow
        isOpen={isOpen}
        isMinimized={isMinimized}
        isLoading={isLoading}
        messages={messages}
        onSendMessage={handleSendMessage}
        onClose={handleClose}
        onToggleMinimize={handleToggleMinimize}
        onNavigateToContent={onNavigateToContent}
      />
    </>
  );
}
