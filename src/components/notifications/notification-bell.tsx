"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";

const NOTIFICATION_ICONS: Record<string, string> = {
  achievement: "🏆",
  comment_reply: "💬",
  course_update: "📚",
  certificate: "🎓",
  quiz_result: "📝",
};

export function NotificationBell() {
  const { user: clerkUser } = useUser();
  const convexUser = useQuery(
    api.users.getByClerkId,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );
  const userId = convexUser?._id ?? null;

  const unreadCount = useQuery(
    api.notifications.countUnread,
    userId ? { userId } : "skip"
  );
  const notifications = useQuery(
    api.notifications.list,
    userId ? { userId } : "skip"
  );
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    if (!userId) return;
    await markAllAsRead({ userId });
  }, [userId, markAllAsRead]);

  const handleNotificationClick = useCallback(
    async (notificationId: Id<"notifications">, link?: string) => {
      await markAsRead({ id: notificationId });
      if (link) {
        window.location.href = link;
      }
    },
    [markAsRead]
  );

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "עכשיו";
    if (minutes < 60) return `${minutes}ד`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}ש`;
    const days = Math.floor(hours / 24);
    return `${days}י`;
  };

  if (!userId) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
        aria-label={`התראות${unreadCount ? ` (${unreadCount} חדשות)` : ""}`}
      >
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
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>
        {(unreadCount ?? 0) > 0 && (
          <span className="absolute -top-0.5 -left-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount! > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-80 rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
              התראות
            </h3>
            {(unreadCount ?? 0) > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-white"
              >
                סמן הכל כנקרא
              </button>
            )}
          </div>

          {/* Notifications list */}
          <div className="max-h-80 overflow-y-auto">
            {notifications === undefined ? (
              <div className="p-4">
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-2">
                      <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                      <div className="flex-1">
                        <div className="mb-1 h-3 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
                        <div className="h-3 w-full rounded bg-zinc-200 dark:bg-zinc-700" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  אין התראות
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification._id}
                  type="button"
                  onClick={() =>
                    handleNotificationClick(
                      notification._id,
                      notification.link
                    )
                  }
                  className={`flex w-full gap-3 px-4 py-3 text-right transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800 ${
                    !notification.read
                      ? "bg-blue-50/50 dark:bg-blue-900/10"
                      : ""
                  }`}
                >
                  <span className="mt-0.5 text-lg" aria-hidden="true">
                    {NOTIFICATION_ICONS[notification.type] ?? "🔔"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`truncate text-sm ${
                          !notification.read
                            ? "font-semibold text-zinc-900 dark:text-white"
                            : "font-medium text-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        {notification.title}
                      </span>
                      <span className="shrink-0 text-xs text-zinc-400">
                        {formatTime(notification.createdAt)}
                      </span>
                    </div>
                    <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                      {notification.message}
                    </p>
                  </div>
                  {!notification.read && (
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* View all link */}
          <div className="border-t border-zinc-200 dark:border-zinc-700">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2.5 text-center text-xs font-medium text-brand-600 transition-colors hover:bg-zinc-50 dark:text-brand-400 dark:hover:bg-zinc-800"
            >
              צפה בכל ההתראות
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
