"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface CourseCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseName: string;
  completedLessons: number;
  totalLessons: number;
  certificateId?: string;
  nextCourseId?: string;
  nextCourseName?: string;
}

// ─── CSS Confetti particle ────────────────────────────────────────────────────

interface ConfettiParticle {
  id: number;
  x: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  rotation: number;
}

const CONFETTI_COLORS = [
  "#E85D75", // brand-500 (rose)
  "#D4A853", // accent-400 (gold)
  "#1E3A5F", // blue-500
  "#10b981", // emerald
  "#f59e0b", // amber
  "#8b5cf6", // violet
];

function generateParticles(count: number): ConfettiParticle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 1.5,
    duration: 2.5 + Math.random() * 2,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: 6 + Math.random() * 8,
    rotation: Math.random() * 360,
  }));
}

function ConfettiCanvas() {
  const [particles] = useState<ConfettiParticle[]>(() =>
    generateParticles(40)
  );

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute top-0 rounded-sm"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size * 0.4,
            backgroundColor: p.color,
            rotate: p.rotation,
          }}
          initial={{ y: -20, opacity: 1 }}
          animate={{
            y: ["0%", "110%"],
            opacity: [1, 1, 0],
            rotate: [p.rotation, p.rotation + 360 * (Math.random() > 0.5 ? 1 : -1)],
            x: [0, (Math.random() - 0.5) * 80],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeIn",
            repeat: Infinity,
            repeatDelay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
}

// ─── Trophy icon ─────────────────────────────────────────────────────────────

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a48.454 48.454 0 01-7.54 0"
      />
    </svg>
  );
}

// ─── Share button ─────────────────────────────────────────────────────────────

function ShareButton({ courseName }: { courseName: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const text = `סיימתי את הקורס "${courseName}" בהדרך! 🎓`;
    try {
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Silently ignore share errors (user cancelled, etc.)
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex h-10 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
    >
      {copied ? (
        <>
          <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          הועתק!
        </>
      ) : (
        <>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
          </svg>
          שתף הישג
        </>
      )}
    </button>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export function CourseCompletionModal({
  isOpen,
  onClose,
  courseName,
  completedLessons,
  totalLessons,
  certificateId,
  nextCourseId,
  nextCourseName,
}: CourseCompletionModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  // Trap focus and handle Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    closeRef.current?.focus();
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="completion-title"
          >
            <motion.div
              className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-zinc-900"
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
              {/* Confetti inside modal */}
              <ConfettiCanvas />

              {/* Close button */}
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className="absolute left-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                aria-label="סגור"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Header gradient */}
              <div className="relative bg-gradient-to-br from-blue-500 to-brand-600 px-8 pb-8 pt-10 text-center">
                {/* Trophy icon with bounce animation */}
                <motion.div
                  className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
                >
                  <TrophyIcon className="h-10 w-10 text-accent-400" />
                </motion.div>

                <motion.h2
                  id="completion-title"
                  className="mb-1 text-3xl font-extrabold text-white"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  כל הכבוד! 🏆
                </motion.h2>
                <motion.p
                  className="text-base text-white/80"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 }}
                >
                  סיימת את הקורס בהצלחה
                </motion.p>
              </div>

              {/* Body */}
              <div className="px-8 py-6">
                {/* Course name */}
                <motion.div
                  className="mb-5 rounded-xl bg-zinc-50 px-4 py-3 text-center dark:bg-zinc-800"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.75 }}
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    קורס
                  </p>
                  <p className="mt-0.5 text-lg font-bold text-zinc-900 dark:text-white">
                    {courseName}
                  </p>
                </motion.div>

                {/* Stats */}
                <motion.div
                  className="mb-5 grid grid-cols-2 gap-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.85 }}
                >
                  <div className="rounded-xl bg-emerald-50 p-3 text-center dark:bg-emerald-950/30">
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {completedLessons}
                    </p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      שיעורים הושלמו
                    </p>
                  </div>
                  <div className="rounded-xl bg-accent-300/20 p-3 text-center">
                    <p className="text-2xl font-bold text-accent-500 dark:text-accent-400">
                      100%
                    </p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      מתוך {totalLessons} שיעורים
                    </p>
                  </div>
                </motion.div>

                {/* Certificate link */}
                {certificateId && (
                  <motion.div
                    className="mb-4 overflow-hidden rounded-xl border-2 border-dashed border-accent-400/50 bg-accent-300/10 px-4 py-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.95 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-400/20">
                        <svg className="h-5 w-5 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                          תעודת הסיום שלך מוכנה!
                        </p>
                        <Link
                          href="/certificates"
                          onClick={onClose}
                          className="text-xs font-medium text-accent-500 underline decoration-dotted hover:no-underline"
                        >
                          צפה בתעודה &larr;
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Action buttons */}
                <motion.div
                  className="flex flex-col gap-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.05 }}
                >
                  {/* Next course */}
                  {nextCourseId && nextCourseName ? (
                    <Link
                      href={`/courses/${nextCourseId}`}
                      onClick={onClose}
                      className="flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                      המשך ללמוד: {nextCourseName}
                    </Link>
                  ) : (
                    <Link
                      href="/courses"
                      onClick={onClose}
                      className="flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                      </svg>
                      המשך ללמוד
                    </Link>
                  )}

                  {/* Share row */}
                  <div className="flex gap-3">
                    <ShareButton courseName={courseName} />
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 rounded-xl border border-zinc-200 bg-white py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                    >
                      סגור
                    </button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
