"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";

// YouTube IFrame API types
interface YTPlayerEvent {
  data: number;
  target: YTPlayer;
}

interface YTPlayer {
  getCurrentTime: () => number;
  getDuration: () => number;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  destroy: () => void;
}

declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        config: {
          videoId: string;
          playerVars?: Record<string, string | number>;
          events?: {
            onReady?: (event: YTPlayerEvent) => void;
            onStateChange?: (event: YTPlayerEvent) => void;
          };
        }
      ) => YTPlayer;
      PlayerState: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

// YouTube URL parser
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

interface YouTubePlayerProps {
  videoUrl: string;
  lessonTitle: string;
  userId: Id<"users"> | null;
  lessonId: Id<"lessons">;
  courseId: Id<"courses">;
  onComplete?: () => void;
}

export function YouTubePlayer({
  videoUrl,
  lessonTitle,
  userId,
  lessonId,
  courseId,
  onComplete,
}: YouTubePlayerProps) {
  const youtubeId = extractYouTubeId(videoUrl);
  const playerRef = useRef<YTPlayer | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<string>(
    `yt-player-${Math.random().toString(36).slice(2, 9)}`
  );
  const [isReady, setIsReady] = useState(false);
  const [hasResumed, setHasResumed] = useState(false);
  const completedRef = useRef(false);
  const watchedSecondsRef = useRef(0); // שניות צפייה מאז העדכון האחרון
  const lastTickRef = useRef<number | null>(null); // timestamp של הטיק האחרון

  const updateProgress = useMutation(api.progress.updateProgress);

  // Get existing progress to resume from
  const existingProgress = useQuery(
    api.progress.getForLesson,
    userId ? { userId, lessonId } : "skip"
  );

  // Load YouTube IFrame API
  useEffect(() => {
    if (!youtubeId) return;

    const loadApi = () => {
      if (window.YT) {
        initPlayer();
        return;
      }

      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScript = document.getElementsByTagName("script")[0];
      firstScript.parentNode?.insertBefore(tag, firstScript);

      window.onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
    };

    const initPlayer = () => {
      if (playerRef.current) return;

      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: youtubeId,
        playerVars: {
          rel: 0,
          modestbranding: 1,
          hl: "he",
        },
        events: {
          onReady: () => {
            setIsReady(true);
          },
          onStateChange: handleStateChange,
        },
      });
    };

    loadApi();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [youtubeId]);

  // Resume from last position
  useEffect(() => {
    if (
      !isReady ||
      !playerRef.current ||
      hasResumed ||
      !existingProgress ||
      existingProgress.completed
    ) {
      return;
    }

    const duration = playerRef.current.getDuration();
    if (duration > 0 && existingProgress.progressPercent > 0 && existingProgress.progressPercent < 95) {
      const resumeTime = (existingProgress.progressPercent / 100) * duration;
      playerRef.current.seekTo(resumeTime, true);
      setHasResumed(true);
    }
  }, [isReady, existingProgress, hasResumed]);

  const handleStateChange = useCallback(
    (event: YTPlayerEvent) => {
      // PLAYING = 1
      if (event.data === 1) {
        lastTickRef.current = Date.now();
        // Start tracking progress every 10 seconds
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
          // חישוב שניות צפייה אמיתיות
          const now = Date.now();
          if (lastTickRef.current) {
            const elapsed = Math.round((now - lastTickRef.current) / 1000);
            watchedSecondsRef.current += elapsed;
          }
          lastTickRef.current = now;
          trackProgress();
        }, 10000);
      }

      // PAUSED = 2 or ENDED = 0
      if (event.data === 2 || event.data === 0) {
        // חישוב שניות אחרונות לפני עצירה
        if (lastTickRef.current) {
          const elapsed = Math.round((Date.now() - lastTickRef.current) / 1000);
          watchedSecondsRef.current += elapsed;
          lastTickRef.current = null;
        }
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        // Save progress on pause/end
        trackProgress();
      }

      // ENDED = 0
      if (event.data === 0) {
        trackProgress(true);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userId, lessonId, courseId]
  );

  const trackProgress = useCallback(
    async (isEnded = false) => {
      if (!userId || !playerRef.current) return;

      const currentTime = playerRef.current.getCurrentTime();
      const duration = playerRef.current.getDuration();
      if (duration <= 0) return;

      const percent = isEnded
        ? 100
        : Math.min(Math.round((currentTime / duration) * 100), 100);

      // שליחת זמן צפייה מצטבר ואיפוס המונה
      const secondsToSend = watchedSecondsRef.current;
      watchedSecondsRef.current = 0;

      try {
        await updateProgress({
          userId,
          lessonId,
          courseId,
          progressPercent: percent,
          watchTimeSeconds: secondsToSend > 0 ? secondsToSend : undefined,
        });

        // Mark as complete when >80% watched
        if (percent >= 80 && !completedRef.current) {
          completedRef.current = true;
          onComplete?.();
        }
      } catch {
        // Silent fail - restore seconds for next attempt
        watchedSecondsRef.current += secondsToSend;
      }
    },
    [userId, lessonId, courseId, updateProgress, onComplete]
  );

  // Fallback: simple iframe if no YouTube ID
  if (!youtubeId) {
    const isDirectVideo = videoUrl && !youtubeId;

    if (isDirectVideo) {
      return (
        <div className="aspect-video overflow-hidden rounded-2xl bg-zinc-900">
          <video
            src={videoUrl}
            controls
            className="h-full w-full"
            playsInline
          >
            <track kind="captions" />
            הדפדפן שלך לא תומך בוידאו.
          </video>
        </div>
      );
    }

    return (
      <div className="flex aspect-video items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900">
        <div className="text-center">
          <svg
            className="mx-auto mb-2 h-12 w-12 text-zinc-300 dark:text-zinc-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z"
            />
          </svg>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            וידאו עדיין לא הועלה
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl bg-zinc-900">
      {/* Resume banner */}
      {existingProgress &&
        existingProgress.progressPercent > 0 &&
        existingProgress.progressPercent < 95 &&
        !existingProgress.completed &&
        !hasResumed && (
          <div className="absolute top-3 right-3 z-10 rounded-lg bg-black/80 px-3 py-2 text-sm text-white backdrop-blur-sm">
            <span>ממשיך מ-{existingProgress.progressPercent}%</span>
          </div>
        )}

      {/* Loading state */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-600 border-t-white" />
        </div>
      )}

      <div
        id={containerRef.current}
        className="h-full w-full"
        title={lessonTitle}
      />

      {/* Progress indicator */}
      {existingProgress && existingProgress.progressPercent > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-700">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${existingProgress.progressPercent}%` }}
          />
        </div>
      )}
    </div>
  );
}
