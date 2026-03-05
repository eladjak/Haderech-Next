"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// Analytics event types
export type AnalyticsEvent =
  | { name: "page_view"; properties?: { path: string; title?: string } }
  | {
      name: "course_view";
      properties: { courseId: string; courseTitle: string };
    }
  | { name: "lesson_start"; properties: { lessonId: string; courseId: string } }
  | {
      name: "lesson_complete";
      properties: { lessonId: string; courseId: string; watchTime: number };
    }
  | {
      name: "quiz_submit";
      properties: { quizId: string; score: number; passed: boolean };
    }
  | { name: "enrollment"; properties: { courseId: string } }
  | {
      name: "chat_message";
      properties: { sessionId: string; mode: string };
    }
  | { name: "simulator_start"; properties: { scenarioId: string } }
  | {
      name: "simulator_complete";
      properties: { scenarioId: string; score: number };
    }
  | {
      name: "search";
      properties: { query: string; resultsCount: number };
    }
  | {
      name: "cta_click";
      properties: { location: string; variant: string };
    }
  | { name: "signup_start"; properties?: Record<string, string> }
  | { name: "signup_complete"; properties?: Record<string, string> }
  | {
      name: "error";
      properties: { message: string; stack?: string; component?: string };
    };

// Global analytics function
export function trackEvent(event: AnalyticsEvent) {
  // Google Analytics 4
  if (typeof window !== "undefined" && "gtag" in window) {
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag(
      "event",
      event.name,
      event.properties,
    );
  }

  // Console in development
  if (process.env.NODE_ENV === "development") {
    console.log("[Analytics]", event.name, event.properties);
  }
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Track page views on route change
    trackEvent({
      name: "page_view",
      properties: { path: pathname },
    });
  }, [pathname, searchParams]);

  return <>{children}</>;
}
