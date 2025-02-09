"use client";

import { MessageCircle } from "lucide-react";
import React from "react";

import { ChatbotWindow, type ChatMessage } from "./ChatbotWindow";

interface ChatbotContainerProps {
  /** פונקציה לשליחת הודעה ל-AI */
  onSendMessage: (message: string) => Promise<ChatMessage>;
  /** פונקציה לניווט לתוכן קשור */
  onNavigateToContent: (content: ChatMessage["relatedContent"]) => void;
}

/**
 * קומפוננטת מיכל לצ'טבוט שמנהלת את המצב והלוגיקה
 */
export function ChatbotContainer({
  onSendMessage,
  onNavigateToContent,
}: ChatbotContainerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isMinimized, setIsMinimized] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSendMessage = async (content: string) => {
    try {
      setIsLoading(true);

      // הוספת הודעת המשתמש
      const userMessage: ChatMessage = {
        id: String(messages.length + 1),
        content,
        sender: "user",
        timestamp: new Date(),
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
