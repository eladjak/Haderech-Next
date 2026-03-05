"use client";

import { useCallback } from "react";
import {
  trackEvent,
  AnalyticsEvent,
} from "@/components/analytics/analytics-provider";

export function useAnalytics() {
  const track = useCallback((event: AnalyticsEvent) => {
    trackEvent(event);
  }, []);

  return { track };
}
