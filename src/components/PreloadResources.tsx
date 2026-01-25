/**
 * PreloadResources Component
 * Preloads critical resources to improve performance
 */

import React from "react";
import { logger } from "@/lib/utils/logger";

export function PreloadResources(): React.ReactElement {
  return (
    <>
      {/* Preload critical API endpoints */}
      <link
        rel="preload"
        href="/api/courses"
        as="fetch"
        crossOrigin="anonymous"
      />
      <link
        rel="preload"
        href="/api/auth/session"
        as="fetch"
        crossOrigin="anonymous"
      />

      {/* Preload critical JavaScript chunks */}
      <link rel="modulepreload" href="/_next/static/chunks/framework.js" />
      <link rel="modulepreload" href="/_next/static/chunks/main.js" />
      <link rel="modulepreload" href="/_next/static/chunks/pages/_app.js" />

      {/* Preload critical CSS */}
      <link
        rel="preload"
        href="/_next/static/css/app.css"
        as="style"
      />

      {/* Prefetch non-critical resources */}
      <link rel="prefetch" href="/api/forum/posts" as="fetch" />
      <link rel="prefetch" href="/api/user/progress" as="fetch" />
    </>
  );
}

/**
 * Service Worker Registration Hook
 * Registers service worker for offline functionality
 */
export function useServiceWorkerRegistration(): void {
  React.useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log(
            "Service Worker registered with scope:",
            registration.scope
          );

          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60000); // Check every minute
        })
        .catch((error) => {
          logger.error("Service Worker registration failed:", error);
        });

      // Listen for service worker updates
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        logger.debug("Service Worker updated, reloading page...");
        window.location.reload();
      });
    }
  }, []);
}

/**
 * Performance Observer Hook
 * Monitors and reports performance metrics
 */
export function usePerformanceObserver(): void {
  React.useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "PerformanceObserver" in window &&
      process.env.NODE_ENV === "development"
    ) {
      // Observe Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        logger.debug("LCP:", lastEntry.startTime, "ms");
      });
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });

      // Observe First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          logger.debug("FID:", entry.processingStart - entry.startTime, "ms");
        });
      });
      fidObserver.observe({ entryTypes: ["first-input"] });

      // Observe Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let cls = 0;
        list.getEntries().forEach((entry: PerformanceEntry) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (!(entry as any).hadRecentInput) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cls += (entry as any).value;
          }
        });
        logger.debug("CLS:", cls);
      });
      clsObserver.observe({ entryTypes: ["layout-shift"] });

      return () => {
        lcpObserver.disconnect();
        fidObserver.disconnect();
        clsObserver.disconnect();
      };
    }
  }, []);
}
