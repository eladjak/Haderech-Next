"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

// ---- Type icons with colors per notification type ----
const TYPE_CONFIG: Record<
  string,
  { icon: string; colorClass: string; label: string }
> = {
  achievement: {
    icon: "🏆",
    colorClass: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    label: "הישג",
  },
  comment_reply: {
    icon: "💬",
    colorClass: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    label: "תגובה",
  },
  course_update: {
    icon: "📚",
    colorClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    label: "עדכון קורס",
  },
  certificate: {
    icon: "🎓",
    colorClass: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    label: "תעודה",
  },
  quiz_result: {
    icon: "📝",
    colorClass: "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400",
    label: "תוצאת בוחן",
  },
};

// ---- Hebrew relative time ----
function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  if (seconds < 60) return "עכשיו";
  if (minutes === 1) return "לפני דקה";
  if (minutes < 60) return `לפני ${minutes} דקות`;
  if (hours === 1) return "לפני שעה";
  if (hours < 24) return `לפני ${hours} שעות`;
  if (days === 1) return "לפני יום";
  if (days < 7) return `לפני ${days} ימים`;
  if (weeks === 1) return "לפני שבוע";
  return `לפני ${weeks} שבועות`;
}

// ---- Group notifications by period ----
type NotificationDoc = {
  _id: Id<"notifications">;
  _creationTime: number;
  userId: Id<"users">;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: number;
};

interface NotificationGroup {
  label: string;
  items: NotificationDoc[];
}

function groupNotifications(items: NotificationDoc[]): NotificationGroup[] {
  const now = Date.now();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayMs = todayStart.getTime();
  const weekMs = todayMs - 6 * 24 * 60 * 60 * 1000;

  const today: NotificationDoc[] = [];
  const thisWeek: NotificationDoc[] = [];
  const earlier: NotificationDoc[] = [];

  for (const item of items) {
    if (item.createdAt >= todayMs) {
      today.push(item);
    } else if (item.createdAt >= weekMs) {
      thisWeek.push(item);
    } else {
      earlier.push(item);
    }
  }

  const groups: NotificationGroup[] = [];
  if (today.length > 0) groups.push({ label: "היום", items: today });
  if (thisWeek.length > 0) groups.push({ label: "השבוע", items: thisWeek });
  if (earlier.length > 0) groups.push({ label: "קודם", items: earlier });
  return groups;
}

// ---- Page component ----
export default function NotificationsPage() {
  const router = useRouter();
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const convexUser = useQuery(
    api.users.getByClerkId,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );
  const userId = convexUser?._id ?? null;

  const notifications = useQuery(
    api.notifications.list,
    userId ? { userId } : "skip"
  );
  const unreadCount = useQuery(
    api.notifications.countUnread,
    userId ? { userId } : "skip"
  );

  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  const handleMarkAllRead = useCallback(async () => {
    if (!userId) return;
    await markAllAsRead({ userId });
  }, [userId, markAllAsRead]);

  const handleNotificationClick = useCallback(
    async (notificationId: Id<"notifications">, link?: string) => {
      await markAsRead({ id: notificationId });
      if (link) {
        router.push(link);
      }
    },
    [markAsRead, router]
  );

  // Not logged in
  if (isClerkLoaded && !clerkUser) {
    return (
      <>
        <Header />
        <main className="container mx-auto min-h-[60vh] px-4 py-12">
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
              <svg className="h-8 w-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </div>
            <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
              יש להתחבר כדי לצפות בהתראות
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const isLoading = !isClerkLoaded || notifications === undefined;
  const groups = notifications ? groupNotifications(notifications as NotificationDoc[]) : [];
  const hasUnread = (unreadCount ?? 0) > 0;

  return (
    <>
      <Header />
      <main className="container mx-auto min-h-[60vh] px-4 py-8">
        {/* Page header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              התראות
            </h1>
            {hasUnread && (
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {unreadCount} התראות שלא נקראו
              </p>
            )}
          </div>
          {hasUnread && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              סמן הכל כנקרא
            </button>
          )}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex animate-pulse items-start gap-4 rounded-xl border border-zinc-100 p-4 dark:border-zinc-800"
              >
                <div className="h-10 w-10 rounded-xl bg-zinc-200 dark:bg-zinc-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 rounded bg-zinc-200 dark:bg-zinc-700" />
                  <div className="h-3 w-full rounded bg-zinc-200 dark:bg-zinc-700" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && groups.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-zinc-50 dark:bg-zinc-800/50">
              <svg className="h-10 w-10 text-zinc-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-zinc-600 dark:text-zinc-300">
                אין התראות עדיין
              </p>
              <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
                כשיהיו לך הישגים, עדכוני קורסים או תגובות - תקבל התראה כאן
              </p>
            </div>
          </div>
        )}

        {/* Grouped notifications */}
        {!isLoading &&
          groups.map((group) => (
            <section key={group.label} className="mb-8">
              <h2 className="mb-3 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                {group.label}
              </h2>
              <div className="space-y-2">
                {group.items.map((notification) => {
                  const config = TYPE_CONFIG[notification.type] ?? {
                    icon: "🔔",
                    colorClass:
                      "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
                    label: "התראה",
                  };

                  return (
                    <button
                      key={notification._id}
                      type="button"
                      onClick={() =>
                        handleNotificationClick(
                          notification._id,
                          notification.link
                        )
                      }
                      className={`flex w-full items-start gap-4 rounded-xl border p-4 text-right transition-colors ${
                        !notification.read
                          ? "border-brand-200/50 bg-brand-50/30 hover:bg-brand-50/60 dark:border-brand-800/30 dark:bg-brand-900/10 dark:hover:bg-brand-900/20"
                          : "border-zinc-100 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/50"
                      }`}
                    >
                      {/* Type icon */}
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${config.colorClass}`}
                      >
                        <span aria-hidden="true">{config.icon}</span>
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <span
                            className={`text-sm ${
                              !notification.read
                                ? "font-bold text-zinc-900 dark:text-white"
                                : "font-medium text-zinc-700 dark:text-zinc-300"
                            }`}
                          >
                            {notification.title}
                          </span>
                          <span className="shrink-0 text-xs text-zinc-400 dark:text-zinc-500">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                        </div>
                        <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                          {notification.message}
                        </p>
                      </div>

                      {/* Unread dot */}
                      {!notification.read && (
                        <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
      </main>
      <Footer />
    </>
  );
}
