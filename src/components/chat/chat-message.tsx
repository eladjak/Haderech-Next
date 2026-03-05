"use client";

import { useState, useCallback } from "react";

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

/**
 * Very lightweight markdown renderer for assistant messages.
 * Supports: **bold**, *italic*, - lists, numbered lists, line breaks.
 * No external dependencies needed.
 */
function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let numberedItems: { num: string; text: string }[] = [];

  const flushLists = (key: string) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${key}`} className="mb-2 list-disc space-y-0.5 pr-5 text-right">
          {listItems.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
    if (numberedItems.length > 0) {
      elements.push(
        <ol key={`ol-${key}`} className="mb-2 list-decimal space-y-0.5 pr-5 text-right">
          {numberedItems.map((item, i) => (
            <li key={i}>{renderInline(item.text)}</li>
          ))}
        </ol>
      );
      numberedItems = [];
    }
  };

  lines.forEach((line, idx) => {
    const bulletMatch = line.match(/^[-*•]\s+(.+)/);
    const numberedMatch = line.match(/^(\d+)\.\s+(.+)/);

    if (bulletMatch) {
      if (numberedItems.length > 0) flushLists(`pre-${idx}`);
      listItems.push(bulletMatch[1]);
    } else if (numberedMatch) {
      if (listItems.length > 0) flushLists(`pre-${idx}`);
      numberedItems.push({ num: numberedMatch[1], text: numberedMatch[2] });
    } else {
      flushLists(`${idx}`);
      if (line.trim() === "") {
        if (idx < lines.length - 1) {
          elements.push(<br key={`br-${idx}`} />);
        }
      } else {
        elements.push(
          <p key={`p-${idx}`} className="mb-1 last:mb-0">
            {renderInline(line)}
          </p>
        );
      }
    }
  });

  flushLists("end");

  return <>{elements}</>;
}

function renderInline(text: string): React.ReactNode {
  // Handle **bold** and *italic*
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  }, [text]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "הועתק!" : "העתק הודעה"}
      title={copied ? "הועתק!" : "העתק"}
      className="flex h-6 w-6 items-center justify-center rounded-lg text-blue-500/30 transition-all hover:bg-blue-50 hover:text-blue-500 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
    >
      {copied ? (
        <svg className="h-3.5 w-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      ) : (
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
        </svg>
      )}
    </button>
  );
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
      dir="rtl"
    >
      {/* Avatar */}
      {isUser ? (
        <div
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-sm font-semibold text-white shadow-sm"
          aria-hidden="true"
        >
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
        </div>
      ) : (
        <div className="flex flex-shrink-0 flex-col items-center gap-1">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-sm font-bold text-white shadow-sm"
            aria-hidden="true"
            title="המאמן שלי"
          >
            מ
          </div>
        </div>
      )}

      {/* Bubble */}
      <div
        className={`group max-w-[78%] flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}
      >
        {/* Coach name label */}
        {!isUser && (
          <span className="px-1 text-xs font-medium text-blue-500/60 dark:text-zinc-400">
            המאמן שלי
          </span>
        )}

        <div
          className={`relative rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
            isUser
              ? "rounded-tl-sm bg-gradient-to-br from-brand-500 to-brand-600 text-white"
              : "rounded-tr-sm border border-blue-100/30 bg-white text-blue-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose-sm prose-blue max-w-none dark:prose-invert">
              {renderMarkdown(message.content)}
            </div>
          )}
        </div>

        {/* Timestamp + copy */}
        <div className={`flex items-center gap-1.5 px-1 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
          <span className="text-xs text-blue-500/40 dark:text-zinc-500">
            {formatTime(message.createdAt)}
          </span>
          {!isUser && (
            <span className="opacity-0 transition-opacity group-hover:opacity-100">
              <CopyButton text={message.content} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Typing indicator component
export function TypingIndicator() {
  return (
    <div className="flex gap-3 flex-row" dir="rtl">
      {/* Coach avatar */}
      <div className="flex flex-shrink-0 flex-col items-center gap-1">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-sm font-bold text-white shadow-sm"
          aria-hidden="true"
        >
          מ
        </div>
      </div>
      <div className="flex flex-col gap-1 items-start">
        <span className="px-1 text-xs font-medium text-blue-500/60 dark:text-zinc-400">
          המאמן שלי
        </span>
        <div className="rounded-2xl rounded-tr-sm border border-blue-100/30 bg-white px-5 py-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
          <div className="flex items-center gap-1.5" aria-label="המאמן מקליד...">
            <span
              className="h-2 w-2 rounded-full bg-blue-400 animate-bounce dark:bg-blue-300"
              style={{ animationDelay: "0ms" }}
            />
            <span
              className="h-2 w-2 rounded-full bg-blue-400 animate-bounce dark:bg-blue-300"
              style={{ animationDelay: "150ms" }}
            />
            <span
              className="h-2 w-2 rounded-full bg-blue-400 animate-bounce dark:bg-blue-300"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
