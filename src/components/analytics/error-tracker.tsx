"use client";

import { useEffect } from "react";
import { trackEvent } from "./analytics-provider";

export function ErrorTracker() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      trackEvent({
        name: "error",
        properties: {
          message: event.message,
          stack: event.error?.stack?.slice(0, 500),
          component: "global",
        },
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackEvent({
        name: "error",
        properties: {
          message: String(event.reason),
          component: "promise",
        },
      });
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
    };
  }, []);

  return null;
}
