"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { type Id } from "@/../convex/_generated/dataModel";
import { ChatInput } from "./chat-input";
import { TypingIndicator } from "./chat-message";

// =====================================================================
// CoachChat - Phase 80
// New unified chat component with rate-limit indicator, feedback,
// debrief flow, and mode toggle (coach / mentor).
// =====================================================================

type CoachUiMode = "coach" | "mentor";

interface CoachChatProps {
  initialSessionId?: Id<"chatSessions"> | null;
}

export function CoachChat({ initialSessionId = null }: CoachChatProps) {
  const [activeSessionId, setActiveSessionId] =
    useState<Id<"chatSessions"> | null>(initialSessionId);
  const [mode, setMode] = useState<CoachUiMode>("coach");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Convex hooks
  const session = useQuery(
    api.chat.getSession,
    activeSessionId ? { sessionId: activeSessionId } : "skip"
  );
  const usage = useQuery(api.chat.getDailyUsage, {});
  const createSession = useMutation(api.chat.createSession);
  const sendCoachMessage = useAction(api.chat.sendCoachMessage);
  const startDebrief = useMutation(api.chat.startDebriefSession);
  const submitFeedback = useMutation(api.chat.submitFeedback);

  const messages = session?.messages ?? [];

  // Auto-scroll on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, isLoading]);

  const handleSend = useCallback(
    async (content: string) => {
      if (isLoading) return;

      // Rate-limit guard (UX) - the server enforces too
      if (usage && usage.remaining <= 0) {
        setError(
          `הגעת למכסה היומית (${usage.limit} הודעות). חזור מחר.`
        );
        return;
      }

      // Create session if missing — userId is derived server-side from Clerk
      // identity inside createSession (no longer accepts userId from client).
      let sessionId = activeSessionId;
      if (!sessionId) {
        try {
          sessionId = await createSession({ mode });
          setActiveSessionId(sessionId);
        } catch {
          setError("שגיאה ביצירת שיחה");
          return;
        }
      }

      setIsLoading(true);
      setError(null);
      try {
        await sendCoachMessage({ sessionId, content });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "שגיאה בשליחת ההודעה";
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [activeSessionId, mode, isLoading, usage, createSession, sendCoachMessage]
  );

  const handleStartDebrief = useCallback(async () => {
    setError(null);
    try {
      const sid = await startDebrief({});
      setActiveSessionId(sid);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "שגיאה בפתיחת דה-בריפינג";
      setError(msg);
    }
  }, [startDebrief]);

  const handleFeedback = useCallback(
    async (
      messageId: Id<"chatMessages">,
      feedback: "up" | "down"
    ) => {
      try {
        await submitFeedback({ messageId, feedback });
      } catch {
        // Silent fail for feedback - not blocking
      }
    },
    [submitFeedback]
  );

  return (
    <div className="flex h-full flex-col" dir="rtl">
      {/* Top bar: mode toggle + debrief button + usage */}
      <div className="flex items-center justify-between gap-3 border-b border-blue-100/30 bg-white/70 px-4 py-3 backdrop-blur-sm dark:border-zinc-700/50 dark:bg-zinc-900/60">
        {/* Mode toggle */}
        <div
          className="flex items-center rounded-xl border border-blue-100/40 bg-white p-0.5 shadow-sm dark:border-zinc-700 dark:bg-zinc-800"
          role="tablist"
          aria-label="מצב שיחה"
        >
          <ModePill
            label="לדבר"
            active={mode === "coach"}
            onClick={() => setMode("coach")}
            tooltip="מאמן: ישיר, ענייני"
          />
          <ModePill
            label="לחקור"
            active={mode === "mentor"}
            onClick={() => setMode("mentor")}
            tooltip="מנטור: שאלות עומק"
          />
        </div>

        {/* Debrief CTA */}
        <button
          type="button"
          onClick={handleStartDebrief}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-red-500 to-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:brightness-110"
          aria-label="התחל דה-בריפינג אחרי דייט"
        >
          <span aria-hidden="true">●</span>
          <span>חזרתי מדייט</span>
        </button>

        {/* Usage badge */}
        {usage && (
          <div
            className="text-xs tabular-nums text-blue-500/60 dark:text-zinc-400"
            aria-live="polite"
          >
            נותרו לך{" "}
            <span
              className={
                usage.remaining <= 2
                  ? "font-semibold text-orange-500"
                  : "font-semibold text-blue-500 dark:text-zinc-200"
              }
            >
              {usage.remaining}
            </span>{" "}
            מתוך {usage.limit} היום
          </div>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div
          role="alert"
          className="mx-4 mt-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="mr-auto flex-shrink-0 text-red-400 hover:text-red-600"
            aria-label="סגור שגיאה"
          >
            ×
          </button>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.length === 0 && !session && (
            <EmptyState
              onStarter={handleSend}
              onDebrief={handleStartDebrief}
            />
          )}

          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <CoachMessageBubble
                key={m._id}
                id={m._id}
                role={m.role}
                content={m.content}
                feedback={m.feedback}
                onFeedback={handleFeedback}
              />
            ))}
          </AnimatePresence>

          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        isLoading={isLoading}
        disabled={!!(usage && usage.remaining <= 0)}
      />
    </div>
  );
}

// ---------------------------------------------------------------------
// Mode pill
// ---------------------------------------------------------------------
function ModePill({
  label,
  active,
  onClick,
  tooltip,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  tooltip: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      title={tooltip}
      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
        active
          ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-sm"
          : "text-blue-500/70 hover:text-blue-600 dark:text-zinc-400"
      }`}
    >
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------
// Message bubble with feedback buttons
// ---------------------------------------------------------------------
function CoachMessageBubble({
  id,
  role,
  content,
  feedback,
  onFeedback,
}: {
  id: Id<"chatMessages">;
  role: "user" | "assistant" | "system";
  content: string;
  feedback?: "up" | "down";
  onFeedback: (id: Id<"chatMessages">, fb: "up" | "down") => void;
}) {
  if (role === "system") return null;
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
      dir="rtl"
    >
      {/* Avatar */}
      <div
        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm ${
          isUser
            ? "bg-gradient-to-br from-brand-500 to-brand-600"
            : "bg-gradient-to-br from-blue-500 to-blue-600"
        }`}
        aria-hidden="true"
      >
        {isUser ? "א" : "מ"}
      </div>

      {/* Bubble + feedback */}
      <div
        className={`group flex max-w-[78%] flex-col gap-1 ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`relative rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
            isUser
              ? "rounded-tl-sm bg-gradient-to-br from-brand-500 to-brand-600 text-white"
              : "rounded-tr-sm border border-blue-100/30 bg-white text-blue-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          }`}
        >
          <p className="whitespace-pre-wrap">{content}</p>
        </div>

        {/* Feedback buttons (only for assistant, only if no feedback yet) */}
        {!isUser && (
          <div className="flex items-center gap-1 px-1 opacity-0 transition-opacity group-hover:opacity-100">
            <FeedbackButton
              active={feedback === "up"}
              onClick={() => onFeedback(id, "up")}
              label="הודעה טובה"
              icon="👍"
              disabled={!!feedback}
            />
            <FeedbackButton
              active={feedback === "down"}
              onClick={() => onFeedback(id, "down")}
              label="הודעה לא טובה"
              icon="👎"
              disabled={!!feedback}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}

function FeedbackButton({
  active,
  onClick,
  label,
  icon,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: string;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex h-6 w-6 items-center justify-center rounded-md text-xs transition-all ${
        active
          ? "bg-blue-100 dark:bg-blue-900/30"
          : "hover:bg-blue-50 dark:hover:bg-zinc-700"
      } disabled:cursor-default disabled:opacity-60`}
    >
      <span aria-hidden="true">{icon}</span>
    </button>
  );
}

// ---------------------------------------------------------------------
// Empty state - first time user
// ---------------------------------------------------------------------
function EmptyState({
  onStarter,
  onDebrief,
}: {
  onStarter: (s: string) => void;
  onDebrief: () => void;
}) {
  const starters = [
    "אני לא יודע איך להתחיל שיחה עם מישהי",
    "קיבלתי דחייה, איך אני מתמודד?",
    "אני מרגיש תקוע - מה הצעד הראשון?",
  ];
  return (
    <div
      className="flex flex-col items-center py-10 text-center"
      dir="rtl"
    >
      <div
        className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-2xl font-bold text-white shadow-lg shadow-blue-500/25"
        aria-hidden="true"
      >
        מ
      </div>
      <h2 className="mb-2 text-lg font-bold text-blue-700 dark:text-white">
        דבר איתי על מה שמטריד אותך
      </h2>
      <p className="mb-6 max-w-sm text-sm text-blue-500/70 dark:text-zinc-400">
        אני מאמן, לא מטפל. אני מקשיב, שואל, ולפעמים נותן כיוון. רק כשמבקשים.
      </p>

      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {starters.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onStarter(s)}
            className="rounded-full border border-brand-200/40 bg-brand-50/50 px-3 py-1.5 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-100/50 dark:border-brand-200/20 dark:bg-brand-50/10 dark:text-brand-300"
          >
            {s}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onDebrief}
        className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-red-500 to-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-110"
      >
        <span aria-hidden="true">●</span>
        חזרתי מדייט - בוא נדבר עליו
      </button>
    </div>
  );
}
