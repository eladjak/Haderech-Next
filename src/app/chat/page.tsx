"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useUser, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { type Id } from "@/../convex/_generated/dataModel";
import { Header } from "@/components/layout/header";
import { ChatMessage, TypingIndicator } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatSidebar } from "@/components/chat/chat-sidebar";

type ChatMode = "coach" | "practice" | "analysis";

const MODE_CONFIG: Record<
  ChatMode,
  { label: string; description: string; icon: React.ReactNode; color: string }
> = {
  coach: {
    label: "מאמן אישי",
    description: "קבל ייעוץ אישי מהמאמן שלך",
    color: "from-brand-500 to-brand-600",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
        />
      </svg>
    ),
  },
  practice: {
    label: "סימולטור דייט",
    description: "התאמן על שיחות היכרות",
    color: "from-blue-500 to-blue-600",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
        />
      </svg>
    ),
  },
  analysis: {
    label: "ניתוח דייט",
    description: "נתח שיחות ומצבים שקרו לך",
    color: "from-accent-400 to-accent-500",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6"
        />
      </svg>
    ),
  },
};

const STARTER_PROMPTS: Record<ChatMode, string[]> = {
  coach: [
    "אני לא יודע איך להתחיל שיחה עם מישהי שמוצאת חן בעיני",
    "קיבלתי דחייה ואני מרגיש רע, תעזור לי להתמודד",
    "איך אני יודע אם הגיע הזמן לפנות להיכרות רצינית?",
    "אני מרגיש תקוע ובודד - מה הצעד הראשון שלי?",
  ],
  practice: [
    "בוא נתחיל סימולציה - קפה בבית קפה בפגישה ראשונה",
    "אני רוצה להתאמן על פתיחת שיחה באפליקציית היכרויות",
    "תשחק דמות מתחמקת שקצת קשה לשבור את הקרח",
    "סימולציה של פגישה שנייה - כבר יש בסיס קטן",
  ],
  analysis: [
    "יש לי דייט אתמול ורוצה לנתח אותו",
    "שלחתי הודעה ולא קיבלתי תשובה - מה קרה?",
    "פגישה שלישית ולא יודע אם יש ניצוץ - עזור לי להבין",
    "הרגשתי שהיה ריחוק פתאומי - מה ניתח את הדינמיקה",
  ],
};

export default function ChatPage() {
  return (
    <>
      <SignedIn>
        <ChatPageContent />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

function ChatPageContent() {
  const { user } = useUser();
  const userId = user?.id ?? "";

  const [activeSessionId, setActiveSessionId] = useState<Id<"chatSessions"> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Convex queries + mutations + actions
  const sessions = useQuery(api.chat.listSessions, userId ? { userId } : "skip") ?? [];
  const activeSession = useQuery(
    api.chat.getSession,
    activeSessionId ? { sessionId: activeSessionId } : "skip"
  );

  const createSession = useMutation(api.chat.createSession);
  const deleteSession = useMutation(api.chat.deleteSession);
  const sendMessage = useAction(api.chat.sendMessage);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeSession?.messages, isLoading]);

  // Start new session
  const handleNewChat = useCallback(
    async (mode: ChatMode) => {
      if (!userId) return;
      try {
        const sessionId = await createSession({ userId, mode });
        setActiveSessionId(sessionId);
        setShowModeSelector(false);
        setIsSidebarOpen(false);
        setError(null);
      } catch (e) {
        setError("שגיאה ביצירת שיחה חדשה");
      }
    },
    [userId, createSession]
  );

  // Send message
  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!activeSessionId || !userId || isLoading) return;
      setIsLoading(true);
      setError(null);
      try {
        await sendMessage({
          sessionId: activeSessionId,
          userMessage: content,
          userId,
        });
      } catch (e) {
        setError("שגיאה בשליחת ההודעה. נסה שוב.");
      } finally {
        setIsLoading(false);
      }
    },
    [activeSessionId, userId, isLoading, sendMessage]
  );

  // Delete session
  const handleDeleteSession = useCallback(
    async (sessionId: string) => {
      try {
        await deleteSession({ sessionId: sessionId as Id<"chatSessions"> });
        if (activeSessionId === sessionId) {
          setActiveSessionId(null);
        }
      } catch (e) {
        setError("שגיאה במחיקת השיחה");
      }
    },
    [activeSessionId, deleteSession]
  );

  // Use a starter prompt
  const handleStarterPrompt = useCallback(
    async (prompt: string) => {
      await handleSendMessage(prompt);
    },
    [handleSendMessage]
  );

  const currentMode = activeSession?.mode ?? "coach";
  const modeConfig = MODE_CONFIG[currentMode as ChatMode];

  return (
    <div className="flex h-dvh flex-col bg-[var(--background)]">
      <Header />

      <div className="flex flex-1 overflow-hidden" dir="rtl">
        {/* Sidebar */}
        <ChatSidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={(id) => setActiveSessionId(id as Id<"chatSessions">)}
          onNewChat={() => setShowModeSelector(true)}
          onDeleteSession={handleDeleteSession}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Chat Area */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="flex items-center gap-3 border-b border-brand-100/30 bg-white/60 px-4 py-3 backdrop-blur-sm dark:border-zinc-700/50 dark:bg-zinc-900/60">
            {/* Mobile sidebar toggle */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-blue-100/40 bg-white text-blue-500/60 shadow-sm transition-colors hover:text-brand-500 md:hidden dark:border-zinc-700 dark:bg-zinc-800"
              aria-label="פתח היסטוריית שיחות"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            {activeSession ? (
              <>
                <div
                  className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${modeConfig.color} shadow-sm text-white`}
                >
                  {modeConfig.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-blue-500 dark:text-white">
                    {activeSession.title ?? modeConfig.label}
                  </p>
                  <p className="text-xs text-blue-500/50 dark:text-zinc-500">
                    {modeConfig.description}
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-500 dark:text-white">
                  מאמן AI - אומנות הקשר
                </p>
                <p className="text-xs text-blue-500/50 dark:text-zinc-500">
                  15+ שנות ניסיון, 461 זוגות
                </p>
              </div>
            )}

            {/* New chat button */}
            <button
              type="button"
              onClick={() => setShowModeSelector(true)}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-brand-200/50 bg-brand-50/50 px-3 text-xs font-medium text-brand-600 shadow-sm transition-colors hover:bg-brand-100/50 dark:border-brand-200/20 dark:bg-brand-50/10 dark:text-brand-300"
              aria-label="שיחה חדשה"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span className="hidden sm:inline">שיחה חדשה</span>
            </button>
          </div>

          {/* Error banner */}
          {error && (
            <div
              role="alert"
              className="mx-4 mt-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
            >
              <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              {error}
              <button
                type="button"
                onClick={() => setError(null)}
                className="mr-auto flex-shrink-0 text-red-400 hover:text-red-600"
                aria-label="סגור שגיאה"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto">
            {!activeSession ? (
              // Welcome / Mode selector
              <div className="flex flex-col items-center justify-center min-h-full p-6 text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-xl shadow-brand-500/25">
                  <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                </div>

                <h1 className="mb-2 text-2xl font-bold text-blue-500 dark:text-white">
                  המאמן שלך כאן
                </h1>
                <p className="mb-8 max-w-sm text-sm leading-relaxed text-blue-500/60 dark:text-zinc-400">
                  15+ שנות ניסיון בליווי זוגות. כאן בשבילך כדי לעזור, לייעץ ולהכין אותך לאהבה שמגיע לך.
                </p>

                {/* Mode selector cards */}
                <div className="grid w-full max-w-xl gap-3 md:grid-cols-3">
                  {(Object.keys(MODE_CONFIG) as ChatMode[]).map((mode) => {
                    const config = MODE_CONFIG[mode];
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => handleNewChat(mode)}
                        className="group flex flex-col items-center gap-3 rounded-2xl border border-blue-100/40 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-200/60 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800/60 dark:hover:border-brand-200/20"
                      >
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${config.color} text-white shadow-sm`}
                        >
                          {config.icon}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-blue-500 dark:text-white">
                            {config.label}
                          </p>
                          <p className="mt-0.5 text-xs text-blue-500/50 dark:text-zinc-400">
                            {config.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-3xl space-y-4 p-4 pb-2">
                {/* Welcome message if no messages yet */}
                {activeSession.messages.length === 0 && (
                  <div className="py-6 text-center">
                    <p className="text-sm text-blue-500/50 dark:text-zinc-500">
                      שיחה חדשה התחילה. מה תרצה לדון?
                    </p>
                    {/* Starter prompts */}
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                      {STARTER_PROMPTS[currentMode as ChatMode].map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          onClick={() => handleStarterPrompt(prompt)}
                          disabled={isLoading}
                          className="rounded-full border border-brand-200/40 bg-brand-50/50 px-3 py-1.5 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-100/50 disabled:opacity-50 dark:border-brand-200/20 dark:bg-brand-50/10 dark:text-brand-300"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Messages */}
                {activeSession.messages.map((message) => (
                  <ChatMessage key={message._id} message={message} />
                ))}

                {/* Typing indicator */}
                {isLoading && <TypingIndicator />}

                {/* Scroll anchor */}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input area - only show when session is active */}
          {activeSession && (
            <ChatInput
              onSend={handleSendMessage}
              isLoading={isLoading}
              disabled={!activeSession}
            />
          )}
        </main>
      </div>

      {/* Mode selector modal */}
      {showModeSelector && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="בחר סוג שיחה"
        >
          <div
            className="absolute inset-0 bg-blue-700/20 backdrop-blur-sm"
            onClick={() => setShowModeSelector(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-zinc-900" dir="rtl">
            <h2 className="mb-1 text-lg font-bold text-blue-500 dark:text-white">
              שיחה חדשה
            </h2>
            <p className="mb-5 text-sm text-blue-500/60 dark:text-zinc-400">
              בחר את סוג השיחה שתרצה
            </p>
            <div className="space-y-3">
              {(Object.keys(MODE_CONFIG) as ChatMode[]).map((mode) => {
                const config = MODE_CONFIG[mode];
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => handleNewChat(mode)}
                    className="flex w-full items-center gap-4 rounded-2xl border border-blue-100/40 bg-blue-50/30 p-4 text-right transition-all hover:border-brand-200/60 hover:bg-brand-50/50 dark:border-zinc-700 dark:bg-zinc-800/60 dark:hover:border-brand-200/20"
                  >
                    <div
                      className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${config.color} text-white shadow-sm`}
                    >
                      {config.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-500 dark:text-white">
                        {config.label}
                      </p>
                      <p className="text-xs text-blue-500/50 dark:text-zinc-400">
                        {config.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => setShowModeSelector(false)}
              className="mt-4 w-full rounded-xl border border-blue-100/40 py-2.5 text-sm text-blue-500/60 transition-colors hover:bg-blue-50/50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              ביטול
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
