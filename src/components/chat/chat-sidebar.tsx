"use client";

import { useCallback } from "react";
import { type Doc } from "@/../convex/_generated/dataModel";

type ChatSession = Doc<"chatSessions">;

const MODE_LABELS: Record<string, string> = {
  coach: "מאמן אישי",
  practice: "סימולטור",
  analysis: "ניתוח",
};

const MODE_ICONS: Record<string, React.ReactNode> = {
  coach: (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  ),
  practice: (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
    </svg>
  ),
  analysis: (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
    </svg>
  ),
};

function formatDate(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const day = 86400000;

  if (diff < day) {
    return new Intl.DateTimeFormat("he-IL", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(timestamp));
  }
  if (diff < 7 * day) {
    return new Intl.DateTimeFormat("he-IL", { weekday: "short" }).format(
      new Date(timestamp)
    );
  }
  return new Intl.DateTimeFormat("he-IL", {
    day: "numeric",
    month: "short",
  }).format(new Date(timestamp));
}

interface ChatSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function ChatSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  isOpen,
  onClose,
}: ChatSidebarProps) {
  const handleSelect = useCallback(
    (id: string) => {
      onSelectSession(id);
      onClose();
    },
    [onSelectSession, onClose]
  );

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-blue-700/20 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 right-0 z-30 flex w-72 flex-col border-l border-brand-100/30 bg-white shadow-2xl transition-transform duration-300 dark:border-zinc-700/50 dark:bg-zinc-900 md:relative md:inset-auto md:z-auto md:w-64 md:translate-x-0 md:shadow-none ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        dir="rtl"
        aria-label="היסטוריית שיחות"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-100/30 p-4 dark:border-zinc-700/50">
          <h2 className="text-sm font-semibold text-blue-500 dark:text-white">
            שיחות
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-blue-500/40 transition-colors hover:bg-brand-50 hover:text-brand-500 md:hidden dark:hover:bg-zinc-800"
            aria-label="סגור תפריט"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* New chat button */}
        <div className="p-3">
          <button
            type="button"
            onClick={onNewChat}
            className="flex w-full items-center gap-2.5 rounded-xl bg-gradient-to-l from-brand-500 to-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md hover:brightness-110"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            שיחה חדשה
          </button>
        </div>

        {/* Session list */}
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {sessions.length === 0 ? (
            <div className="mt-8 px-4 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-50/20">
                <svg className="h-5 w-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
              </div>
              <p className="text-xs text-blue-500/50 dark:text-zinc-500">
                אין שיחות עדיין.
                <br />
                התחל שיחה חדשה!
              </p>
            </div>
          ) : (
            <ul className="space-y-1" role="listbox" aria-label="רשימת שיחות">
              {sessions.map((session) => (
                <li key={session._id} role="option" aria-selected={session._id === activeSessionId}>
                  <div
                    className={`group flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 transition-colors ${
                      session._id === activeSessionId
                        ? "bg-brand-50 dark:bg-brand-50/10"
                        : "hover:bg-blue-50/50 dark:hover:bg-zinc-800/60"
                    }`}
                    onClick={() => handleSelect(session._id)}
                    onKeyDown={(e) => e.key === "Enter" && handleSelect(session._id)}
                    tabIndex={0}
                  >
                    {/* Mode icon */}
                    <div
                      className={`flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-lg ${
                        session._id === activeSessionId
                          ? "bg-brand-100 text-brand-600 dark:bg-brand-100/20 dark:text-brand-300"
                          : "bg-blue-50 text-blue-500/60 dark:bg-zinc-700 dark:text-zinc-400"
                      }`}
                    >
                      {MODE_ICONS[session.mode]}
                    </div>

                    {/* Title + meta */}
                    <div className="min-w-0 flex-1">
                      <p
                        className={`truncate text-xs font-medium ${
                          session._id === activeSessionId
                            ? "text-brand-700 dark:text-brand-300"
                            : "text-blue-500 dark:text-zinc-300"
                        }`}
                      >
                        {session.title ?? MODE_LABELS[session.mode]}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs text-blue-500/40 dark:text-zinc-500">
                          {formatDate(session.updatedAt)}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-blue-500/20 dark:bg-zinc-600" aria-hidden="true" />
                        <span className="text-xs text-blue-500/40 dark:text-zinc-500">
                          {session.messageCount} הודעות
                        </span>
                      </div>
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session._id);
                      }}
                      aria-label={`מחק שיחה: ${session.title ?? MODE_LABELS[session.mode]}`}
                      className="flex-shrink-0 hidden h-6 w-6 items-center justify-center rounded-lg text-blue-500/30 transition-colors hover:bg-red-50 hover:text-red-500 group-hover:flex dark:hover:bg-red-500/10"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}
