"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";

const REPORT_INTERVAL_MS = 10_000; // Report every 10 seconds

export function useWatchTime(lessonId: Id<"lessons">, courseId: Id<"courses">) {
  const [watchTime, setWatchTime] = useState(0);
  const [isTracking, setIsTracking] = useState(false);

  const updateWatchTime = useMutation(api.progress.updateWatchTime);

  const accumulatedSecondsRef = useRef(0);
  const lastTickRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const latestProgressRef = useRef(0);

  const flush = useCallback(async () => {
    const seconds = accumulatedSecondsRef.current;
    if (seconds <= 0) return;

    accumulatedSecondsRef.current = 0;

    try {
      await updateWatchTime({
        lessonId,
        courseId,
        watchTimeSeconds: seconds,
        progressPercent: latestProgressRef.current,
      });
    } catch {
      // Restore seconds on failure so they are included in the next report
      accumulatedSecondsRef.current += seconds;
    }
  }, [lessonId, courseId, updateWatchTime]);

  const startTracking = useCallback(() => {
    if (intervalRef.current) return;
    setIsTracking(true);
    lastTickRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      if (lastTickRef.current) {
        const elapsed = Math.round((now - lastTickRef.current) / 1000);
        accumulatedSecondsRef.current += elapsed;
        setWatchTime((prev) => prev + elapsed);
      }
      lastTickRef.current = now;
      flush();
    }, REPORT_INTERVAL_MS);
  }, [flush]);

  const stopTracking = useCallback(() => {
    setIsTracking(false);

    // Account for time since last tick
    if (lastTickRef.current) {
      const elapsed = Math.round((Date.now() - lastTickRef.current) / 1000);
      accumulatedSecondsRef.current += elapsed;
      setWatchTime((prev) => prev + elapsed);
      lastTickRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Send remaining data
    flush();
  }, [flush]);

  const setProgress = useCallback((percent: number) => {
    latestProgressRef.current = percent;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Final flush with remaining seconds
      if (accumulatedSecondsRef.current > 0) {
        // Fire-and-forget on unmount
        flush();
      }
    };
  }, [flush]);

  return {
    watchTime,
    isTracking,
    startTracking,
    stopTracking,
    setProgress,
  };
}
