"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useState } from "react";
import type { Id } from "@/../convex/_generated/dataModel";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ContactMessage {
  _id: Id<"contactMessages">;
  _creationTime: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "new" | "read" | "replied";
  userId?: string;
  createdAt: number;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(ts: number): string {
  return new Intl.DateTimeFormat("he-IL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ts));
}

const SUBJECT_LABELS: Record<string, string> = {
  general: "שאלה כללית",
  technical: "בעיה טכנית",
  partnership: "שיתוף פעולה",
  suggestion: "הצעה",
  other: "אחר",
};

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; dotColor: string }
> = {
  new: {
    label: "חדש",
    color:
      "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300",
    dotColor: "bg-blue-500",
  },
  read: {
    label: "נקרא",
    color:
      "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
    dotColor: "bg-zinc-400",
  },
  replied: {
    label: "נענה",
    color:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300",
    dotColor: "bg-emerald-500",
  },
};

// ─── Component ─────────────────────────────────────────────────────────────────

export default function AdminContactPage() {
  const messages = useQuery(api.contact.listMessages, {});
  const stats = useQuery(api.contact.getStats);
  const updateStatus = useMutation(api.contact.updateStatus);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "new" | "read" | "replied"
  >("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered: ContactMessage[] =
    (messages as ContactMessage[] | undefined)?.filter((m) =>
      filterStatus === "all" ? true : m.status === filterStatus
    ) ?? [];

  const handleStatusUpdate = async (
    messageId: Id<"contactMessages">,
    status: "new" | "read" | "replied"
  ) => {
    setUpdatingId(messageId);
    try {
      await updateStatus({ messageId, status });
    } catch (err) {
      console.error("Status update error:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          הודעות יצירת קשר
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          ניהול פניות מהאתר
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "סה״כ", value: stats.total, color: "text-zinc-900 dark:text-white" },
            { label: "חדשות", value: stats.new, color: "text-blue-600 dark:text-blue-400" },
            { label: "נקראו", value: stats.read, color: "text-zinc-600 dark:text-zinc-400" },
            { label: "נענו", value: stats.replied, color: "text-emerald-600 dark:text-emerald-400" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {s.label}
              </p>
              <p className={`mt-1 text-2xl font-bold ${s.color}`}>
                {s.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", "new", "read", "replied"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilterStatus(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filterStatus === f
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
            }`}
          >
            {f === "all"
              ? "הכל"
              : STATUS_CONFIG[f]?.label ?? f}
          </button>
        ))}
      </div>

      {/* Messages List */}
      {messages === undefined ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-500">אין הודעות להצגה</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((msg) => {
            const isExpanded = expandedId === msg._id;
            const cfg = STATUS_CONFIG[msg.status] ?? STATUS_CONFIG.new;

            return (
              <div
                key={msg._id}
                className="overflow-hidden rounded-2xl border border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900"
              >
                {/* Row */}
                <button
                  type="button"
                  onClick={() => {
                    setExpandedId(isExpanded ? null : msg._id);
                    // Auto-mark as read when first opened
                    if (!isExpanded && msg.status === "new") {
                      void handleStatusUpdate(
                        msg._id as Id<"contactMessages">,
                        "read"
                      );
                    }
                  }}
                  className="flex w-full items-start gap-4 p-4 text-right hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  aria-expanded={isExpanded}
                >
                  {/* Status dot */}
                  <div className="mt-1.5 flex-shrink-0">
                    <span
                      className={`inline-block h-2.5 w-2.5 rounded-full ${cfg.dotColor}`}
                    />
                  </div>

                  {/* Content preview */}
                  <div className="min-w-0 flex-1 text-right">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-zinc-900 dark:text-white">
                        {msg.name}
                      </span>
                      <span className="text-xs text-zinc-400" dir="ltr">
                        {msg.email}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="text-sm text-zinc-600 dark:text-zinc-300">
                        {SUBJECT_LABELS[msg.subject] ?? msg.subject}
                      </span>
                      <span className="text-zinc-300 dark:text-zinc-600">
                        ·
                      </span>
                      <span className="text-xs text-zinc-400">
                        {formatDate(msg.createdAt)}
                      </span>
                    </div>
                    {!isExpanded && (
                      <p className="mt-1 truncate text-xs text-zinc-400">
                        {msg.message}
                      </p>
                    )}
                  </div>

                  {/* Status badge */}
                  <div className="flex-shrink-0">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${cfg.color}`}
                    >
                      {cfg.label}
                    </span>
                  </div>

                  {/* Chevron */}
                  <svg
                    className={`mt-1 h-4 w-4 flex-shrink-0 text-zinc-400 transition-transform duration-200 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </button>

                {/* Expanded message */}
                {isExpanded && (
                  <div className="border-t border-zinc-100 bg-zinc-50 px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950/50">
                    <div className="mb-3 rounded-xl bg-white p-4 dark:bg-zinc-900">
                      <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                        {msg.message}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-zinc-500">
                        שנה סטטוס:
                      </span>

                      {(["new", "read", "replied"] as const).map((s) => (
                        <button
                          key={s}
                          type="button"
                          disabled={
                            msg.status === s || updatingId === msg._id
                          }
                          onClick={() =>
                            handleStatusUpdate(
                              msg._id as Id<"contactMessages">,
                              s
                            )
                          }
                          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                            msg.status === s
                              ? `${STATUS_CONFIG[s]?.color ?? ""} ring-1 ring-current`
                              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                          }`}
                        >
                          {STATUS_CONFIG[s]?.label ?? s}
                        </button>
                      ))}

                      {updatingId === msg._id && (
                        <svg
                          className="h-4 w-4 animate-spin text-zinc-400"
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
                      )}

                      {/* Reply via email */}
                      <a
                        href={`mailto:${msg.email}?subject=Re: ${SUBJECT_LABELS[msg.subject] ?? msg.subject}&body=שלום ${msg.name},%0D%0A%0D%0Aבקשר לפנייתכם:%0D%0A`}
                        className="mr-auto inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                      >
                        <svg
                          className="h-3 w-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                          />
                        </svg>
                        השב במייל
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
