"use client";

import { useState, useCallback } from "react";
import { UserButton } from "@clerk/nextjs";
import { AdminGuard } from "@/components/auth/admin-guard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <AdminGuard>
      <div className="min-h-dvh bg-zinc-50 dark:bg-zinc-950">
        {/* Extracted AdminSidebar component */}
        <AdminSidebar isOpen={sidebarOpen} onClose={closeSidebar} />

        {/* Main content */}
        <div className="md:mr-64">
          {/* Top bar */}
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/80 px-4 backdrop-blur-sm md:px-8 dark:border-zinc-800 dark:bg-zinc-950/80">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 md:hidden dark:text-zinc-400 dark:hover:bg-zinc-800"
              onClick={() => setSidebarOpen(true)}
              aria-label="פתח תפריט ניווט"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            <div className="hidden text-lg font-semibold text-zinc-900 md:block dark:text-white">
              לוח ניהול
            </div>

            <div className="flex items-center gap-3">
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8",
                  },
                }}
              />
            </div>
          </header>

          {/* Page content */}
          <main className="p-4 md:p-8">{children}</main>
        </div>
      </div>
    </AdminGuard>
  );
}
