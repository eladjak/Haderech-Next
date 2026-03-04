"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AchievementToastData {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt?: number;
}

// ─── Individual Toast ─────────────────────────────────────────────────────────

interface ToastItemProps {
  toast: AchievementToastData;
  onDismiss: (id: string) => void;
  index: number;
}

function AchievementToastItem({ toast, onDismiss, index }: ToastItemProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [progress, setProgress] = useState(100);
  const duration = 5000; // 5 seconds

  const dismiss = useCallback(() => {
    onDismiss(toast.id);
  }, [toast.id, onDismiss]);

  // Auto-dismiss after duration
  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 50);

    timerRef.current = setTimeout(dismiss, duration);

    return () => {
      clearInterval(interval);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [dismiss]);

  // Pause on hover
  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleMouseLeave = () => {
    const remainingMs = (progress / 100) * duration;
    timerRef.current = setTimeout(dismiss, remainingMs);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -60, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -40, scale: 0.9 }}
      transition={{ type: "spring", damping: 22, stiffness: 350 }}
      style={{ zIndex: 9999 - index }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="relative w-80 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/5 dark:bg-zinc-900 dark:ring-white/10">
        {/* Gold top accent border */}
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-accent-400 via-accent-300 to-accent-400" />

        <div className="flex items-start gap-3 px-4 py-4">
          {/* Achievement icon badge */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent-300 to-accent-500 text-2xl shadow-sm">
            {toast.icon}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-accent-500">
              הישג חדש!
            </p>
            <p className="text-sm font-bold text-zinc-900 dark:text-white">
              {toast.title}
            </p>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
              {toast.description}
            </p>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={dismiss}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            aria-label="סגור"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 w-full bg-zinc-100 dark:bg-zinc-800">
          <motion.div
            className="h-full bg-accent-400"
            style={{ width: `${progress}%` }}
            transition={{ ease: "linear" }}
          />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Toast Container ─────────────────────────────────────────────────────────

interface AchievementToastContainerProps {
  toasts: AchievementToastData[];
  onDismiss: (id: string) => void;
}

export function AchievementToastContainer({
  toasts,
  onDismiss,
}: AchievementToastContainerProps) {
  return (
    <div
      className="fixed right-4 top-4 z-[9999] flex flex-col gap-2"
      aria-label="הישגים חדשים"
    >
      <AnimatePresence mode="sync">
        {toasts.map((toast, index) => (
          <AchievementToastItem
            key={toast.id}
            toast={toast}
            onDismiss={onDismiss}
            index={index}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── Hook for managing toasts ─────────────────────────────────────────────────

export function useAchievementToasts() {
  const [toasts, setToasts] = useState<AchievementToastData[]>([]);

  const addToast = useCallback((toast: Omit<AchievementToastData, "id">) => {
    const id = `achievement-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [{ ...toast, id }, ...prev]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, dismissToast };
}

// ─── Demo/story export (convenience) ─────────────────────────────────────────

export { AchievementToastItem };
