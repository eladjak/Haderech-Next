"use client";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: number;
}

interface ChatMessageProps {
  message: Message;
}

function formatTime(timestamp: number): string {
  return new Intl.DateTimeFormat("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
      dir="rtl"
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold shadow-sm ${
          isUser
            ? "bg-gradient-to-br from-brand-500 to-brand-600 text-white"
            : "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
        }`}
        aria-hidden="true"
      >
        {isUser ? (
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
            />
          </svg>
        ) : (
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
            />
          </svg>
        )}
      </div>

      {/* Bubble */}
      <div
        className={`group max-w-[75%] flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}
      >
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
            isUser
              ? "rounded-tl-sm bg-gradient-to-br from-brand-500 to-brand-600 text-white"
              : "rounded-tr-sm border border-blue-100/30 bg-white text-blue-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          }`}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
        <span className="px-1 text-xs text-blue-500/40 dark:text-zinc-500">
          {formatTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
}

// Typing indicator component
export function TypingIndicator() {
  return (
    <div className="flex gap-3 flex-row" dir="rtl">
      <div className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-sm">
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
          />
        </svg>
      </div>
      <div className="rounded-2xl rounded-tr-sm border border-blue-100/30 bg-white px-5 py-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        <div className="flex items-center gap-1.5" aria-label="המאמן מקליד...">
          <span className="h-2 w-2 rounded-full bg-blue-400 animate-bounce dark:bg-blue-300" style={{ animationDelay: "0ms" }} />
          <span className="h-2 w-2 rounded-full bg-blue-400 animate-bounce dark:bg-blue-300" style={{ animationDelay: "150ms" }} />
          <span className="h-2 w-2 rounded-full bg-blue-400 animate-bounce dark:bg-blue-300" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}
