"use client";

import { useState, useRef, useCallback } from "react";

const MAX_CHARS = 1000;

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSend, isLoading, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || isLoading || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, isLoading, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const next = e.target.value;
      if (next.length > MAX_CHARS) return; // enforce max
      setValue(next);
      // Auto-resize textarea
      const el = e.target;
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
    },
    []
  );

  const canSend = value.trim().length > 0 && !isLoading && !disabled;
  const charCount = value.length;
  const isNearLimit = charCount > MAX_CHARS * 0.8;
  const isAtLimit = charCount >= MAX_CHARS;

  return (
    <div className="border-t border-brand-100/30 bg-white/80 p-4 backdrop-blur-sm dark:border-zinc-700/50 dark:bg-zinc-900/80">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-end gap-3 rounded-2xl border border-blue-100/40 bg-white p-3 shadow-sm transition-shadow focus-within:shadow-md focus-within:ring-2 focus-within:ring-brand-200/50 dark:border-zinc-700 dark:bg-zinc-800">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="כתוב הודעה למאמן..."
            disabled={isLoading || disabled}
            rows={1}
            aria-label="הודעה למאמן"
            aria-describedby="char-count-hint"
            dir="rtl"
            className="flex-1 resize-none bg-transparent text-sm leading-relaxed text-blue-700 placeholder-blue-300/60 focus:outline-none disabled:opacity-50 dark:text-zinc-100 dark:placeholder-zinc-500"
            style={{ minHeight: "24px", maxHeight: "160px" }}
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            aria-label="שלח הודעה"
            className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-sm transition-all hover:shadow-md hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            {isLoading ? (
              <svg
                className="h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              <svg
                className="h-4 w-4 rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Footer: hint + char count */}
        <div className="mt-2 flex items-center justify-between" dir="rtl">
          <p className="text-xs text-blue-500/40 dark:text-zinc-500">
            Enter לשליחה • Shift+Enter לשורה חדשה
          </p>
          {isNearLimit && (
            <p
              id="char-count-hint"
              className={`text-xs tabular-nums ${
                isAtLimit
                  ? "font-semibold text-red-500"
                  : "text-orange-500/70 dark:text-orange-400/60"
              }`}
              aria-live="polite"
            >
              {charCount}/{MAX_CHARS}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
