"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";

interface LessonNotesProps {
  lessonId: Id<"lessons">;
  courseId: Id<"courses">;
  userId: Id<"users"> | null;
}

export function LessonNotes({ lessonId, courseId, userId }: LessonNotesProps) {
  const existingNote = useQuery(
    api.notes.getForLesson,
    userId ? { userId, lessonId } : "skip"
  );
  const saveNote = useMutation(api.notes.save);

  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load existing note
  useEffect(() => {
    if (existingNote) {
      setContent(existingNote.content);
    }
  }, [existingNote]);

  // Auto-save after 2 seconds of inactivity
  const triggerAutoSave = useCallback(
    (newContent: string) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

      saveTimerRef.current = setTimeout(async () => {
        if (!newContent.trim()) return;
        setSaving(true);
        await saveNote({ lessonId, courseId, content: newContent });
        setLastSaved(Date.now());
        setSaving(false);
      }, 2000);
    },
    [saveNote, lessonId, courseId]
  );

  const handleChange = useCallback(
    (value: string) => {
      setContent(value);
      triggerAutoSave(value);
    },
    [triggerAutoSave]
  );

  const handleManualSave = useCallback(async () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    if (!content.trim()) return;
    setSaving(true);
    await saveNote({ lessonId, courseId, content });
    setLastSaved(Date.now());
    setSaving(false);
  }, [content, saveNote, lessonId, courseId]);

  if (!userId) return null;

  return (
    <div className="mb-8">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 text-right transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/70"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <svg
            className="h-5 w-5 text-amber-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
            />
          </svg>
          <span className="text-sm font-medium text-zinc-900 dark:text-white">
            ההערות שלי
          </span>
          {existingNote && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
              יש הערות
            </span>
          )}
        </div>
        <svg
          className={`h-4 w-4 text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
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

      {isOpen && (
        <div className="mt-2 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <textarea
            value={content}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="רשום הערות לשיעור זה... (נשמר אוטומטית)"
            rows={6}
            maxLength={10000}
            className="w-full resize-y rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-amber-400 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-amber-500 dark:focus:bg-zinc-900"
            dir="rtl"
          />
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              {saving && (
                <span className="flex items-center gap-1">
                  <svg
                    className="h-3 w-3 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="opacity-25"
                    />
                    <path
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      className="opacity-75"
                    />
                  </svg>
                  שומר...
                </span>
              )}
              {!saving && lastSaved && (
                <span className="text-emerald-500">נשמר בהצלחה</span>
              )}
              <span>{content.length}/10,000</span>
            </div>
            <button
              type="button"
              onClick={handleManualSave}
              disabled={!content.trim() || saving}
              className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              שמור עכשיו
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
