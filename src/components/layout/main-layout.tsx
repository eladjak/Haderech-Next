"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export function MainLayout({ children, className }: LayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* נוסיף את תוכן ה-header בהמשך */}
      </header>

      <div className={cn("container mx-auto flex-1 p-8", className)}>
        <main className="flex w-full flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>

      <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          {/* נוסיף את תוכן ה-footer בהמשך */}
        </div>
      </footer>
    </div>
  );
}
