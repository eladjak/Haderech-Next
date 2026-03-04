"use client";

import { useState, useRef, useEffect } from "react";
import { useAction, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import { SessionFeedback } from "./session-feedback";

interface SimulatorChatProps {
  sessionId: Id<"simulatorSessions">;
}

export function SimulatorChat({ sessionId }: SimulatorChatProps) {
  const session = useQuery(api.simulator.getSession, { sessionId });
  const sendMessage = useAction(api.simulator.sendMessage);
  const endSession = useAction(api.simulator.endSession);

  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session?.messages]);

  // Show feedback once session is completed with score
  useEffect(() => {
    if (
      session?.status === "completed" &&
      session.score !== undefined
    ) {
      setShowFeedback(true);
    }
  }, [session?.status, session?.score]);

  const handleSend = async () => {
    if (!inputValue.trim() || isSending || session?.status !== "active") return;

    const message = inputValue.trim();
    setInputValue("");
    setIsSending(true);
    setError(null);

    try {
      await sendMessage({ sessionId, content: message });
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בשליחת הודעה");
      setInputValue(message); // Restore input on error
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleEnd = async () => {
    if (isEnding) return;
    setIsEnding(true);
    setError(null);

    try {
      await endSession({ sessionId });
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בסיום הסשן");
      setIsEnding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  if (!session) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  const { scenario, messages } = session;

  if (showFeedback && session.status === "completed") {
    return (
      <div className="mx-auto max-w-lg py-6">
        <h2 className="mb-4 text-center text-xl font-bold text-zinc-900 dark:text-white">
          סיכום הסשן
        </h2>
        <SessionFeedback
          score={session.score ?? 0}
          feedback={session.feedback ?? ""}
          strengths={session.strengths ?? []}
          improvements={session.improvements ?? []}
          onRestart={() => router.push(`/simulator/${session.scenarioId}`)}
          onHistory={() => router.push("/simulator/history")}
        />
      </div>
    );
  }

  // Waiting for analysis after end
  if (session.status === "completed" && !session.score) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-brand-500 border-t-transparent" />
        <p className="text-zinc-600 dark:text-zinc-400">
          מנתח את השיחה שלך...
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Scenario header */}
      {scenario && (
        <div className="flex-shrink-0 border-b border-zinc-100 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-brand-200 text-lg dark:from-brand-800/40 dark:to-brand-700/40">
              {scenario.personaGender === "female" ? "♀" : "♂"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-zinc-900 dark:text-white">
                {scenario.personaName}, {scenario.personaAge}
              </p>
              <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                {scenario.title}
              </p>
            </div>
            {session.status === "active" && (
              <button
                type="button"
                onClick={() => void handleEnd()}
                disabled={isEnding}
                className="flex-shrink-0 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                {isEnding ? "מסיים..." : "סיים סשן"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-2xl space-y-3">
          {messages.map((message) => {
            if (message.role === "narrator") {
              return (
                <div
                  key={message._id}
                  className="rounded-xl bg-zinc-50 px-4 py-3 text-center text-sm italic text-zinc-500 dark:bg-zinc-800/60 dark:text-zinc-400"
                >
                  {message.content}
                </div>
              );
            }

            const isUser = message.role === "user";

            return (
              <div
                key={message._id}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="ml-2 flex h-8 w-8 flex-shrink-0 items-center justify-center self-end rounded-full bg-gradient-to-br from-brand-100 to-brand-200 text-sm dark:from-brand-800/40 dark:to-brand-700/40">
                    {scenario?.personaGender === "female" ? "♀" : "♂"}
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    isUser
                      ? "rounded-br-sm bg-brand-500 text-white"
                      : "rounded-bl-sm bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            );
          })}

          {/* AI typing indicator */}
          {isSending && (
            <div className="flex justify-start">
              <div className="ml-2 flex h-8 w-8 flex-shrink-0 items-center justify-center self-end rounded-full bg-gradient-to-br from-brand-100 to-brand-200 text-sm dark:from-brand-800/40 dark:to-brand-700/40">
                {scenario?.personaGender === "female" ? "♀" : "♂"}
              </div>
              <div className="rounded-2xl rounded-bl-sm bg-zinc-100 px-4 py-3 dark:bg-zinc-800">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 dark:bg-zinc-500 [animation-delay:0ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 dark:bg-zinc-500 [animation-delay:150ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 dark:bg-zinc-500 [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mb-2 rounded-lg bg-rose-50 px-4 py-2 text-sm text-rose-700 dark:bg-rose-900/20 dark:text-rose-400">
          {error}
        </div>
      )}

      {/* Input */}
      {session.status === "active" && (
        <div className="flex-shrink-0 border-t border-zinc-100 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mx-auto flex max-w-2xl items-end gap-2">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="כתוב הודעה... (Enter לשליחה)"
              rows={1}
              disabled={isSending}
              className="flex-1 resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-brand-700 dark:focus:ring-blue-500/30"
              style={{
                maxHeight: "120px",
                overflowY: inputValue.length > 100 ? "auto" : "hidden",
              }}
              aria-label="כתוב הודעה לסימולטור"
            />
            <button
              type="button"
              onClick={() => void handleSend()}
              disabled={!inputValue.trim() || isSending}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white transition-all hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="שלח הודעה"
            >
              <svg
                className="h-4 w-4 rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
