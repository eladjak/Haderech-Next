"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { useWatchTime } from "@/hooks/useWatchTime";
import type { Id } from "@/../convex/_generated/dataModel";

// ---- Types ----

interface VideoPlayerProps {
  videoUrl: string;
  lessonId: Id<"lessons">;
  courseId: Id<"courses">;
  onProgress?: (percent: number) => void;
  onComplete?: () => void;
  initialProgress?: number; // 0-100, resume position
}

type PlaybackSpeed = 0.5 | 0.75 | 1 | 1.25 | 1.5 | 2;

const PLAYBACK_SPEEDS: PlaybackSpeed[] = [0.5, 0.75, 1, 1.25, 1.5, 2];
const CONTROLS_HIDE_DELAY = 3000;
const COMPLETION_THRESHOLD = 90;
const SEEK_STEP = 10; // seconds

// ---- Helpers ----

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

// ---- Component ----

export function VideoPlayer({
  videoUrl,
  lessonId,
  courseId,
  onProgress,
  onComplete,
  initialProgress,
}: VideoPlayerProps) {
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completedRef = useRef(false);
  const hasResumedRef = useRef(false);

  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);

  // Watch time tracking
  const {
    startTracking,
    stopTracking,
    setProgress: setWatchTimeProgress,
  } = useWatchTime(lessonId, courseId);

  // ---- Controls visibility ----

  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) {
        setShowControls(false);
        setShowSpeedMenu(false);
      }
    }, CONTROLS_HIDE_DELAY);
  }, []);

  const handleMouseMove = useCallback(() => {
    resetHideTimer();
  }, [resetHideTimer]);

  const handleMouseLeave = useCallback(() => {
    if (videoRef.current && !videoRef.current.paused) {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => {
        setShowControls(false);
        setShowSpeedMenu(false);
      }, 1000);
    }
  }, []);

  // ---- Playback ----

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {
        // Autoplay blocked - ignore
      });
    } else {
      video.pause();
    }
  }, []);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    startTracking();
    resetHideTimer();
  }, [startTracking, resetHideTimer]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
    stopTracking();
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
  }, [stopTracking]);

  // ---- Time & Progress ----

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || isSeeking) return;

    const time = video.currentTime;
    const dur = video.duration;
    setCurrentTime(time);

    if (dur > 0) {
      const percent = Math.min(Math.round((time / dur) * 100), 100);
      setWatchTimeProgress(percent);
      onProgress?.(percent);

      // Auto-complete at threshold
      if (percent >= COMPLETION_THRESHOLD && !completedRef.current) {
        completedRef.current = true;
        onComplete?.();
      }
    }
  }, [isSeeking, setWatchTimeProgress, onProgress, onComplete]);

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    setDuration(video.duration);
    setHasError(false);

    // Resume from initial progress
    if (
      initialProgress &&
      initialProgress > 0 &&
      initialProgress < 95 &&
      !hasResumedRef.current &&
      video.duration > 0
    ) {
      const resumeTime = (initialProgress / 100) * video.duration;
      video.currentTime = resumeTime;
      hasResumedRef.current = true;
    }
  }, [initialProgress]);

  const handleProgress = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.buffered.length === 0) return;
    const end = video.buffered.end(video.buffered.length - 1);
    setBuffered(end);
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    stopTracking();
    setShowControls(true);
    if (!completedRef.current) {
      completedRef.current = true;
      onComplete?.();
    }
  }, [stopTracking, onComplete]);

  // ---- Seeking ----

  const seekTo = useCallback(
    (time: number) => {
      const video = videoRef.current;
      if (!video) return;
      const clamped = Math.max(0, Math.min(time, video.duration || 0));
      video.currentTime = clamped;
      setCurrentTime(clamped);
    },
    []
  );

  const handleProgressBarClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const bar = progressBarRef.current;
      const video = videoRef.current;
      if (!bar || !video || !video.duration) return;

      const rect = bar.getBoundingClientRect();
      // RTL: clicking right side = start, left side = end
      const clickX = e.clientX - rect.left;
      const ratio = clickX / rect.width;
      seekTo(ratio * video.duration);
    },
    [seekTo]
  );

  const handleProgressBarMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      setIsSeeking(true);
      handleProgressBarClick(e);

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const bar = progressBarRef.current;
        const video = videoRef.current;
        if (!bar || !video || !video.duration) return;

        const rect = bar.getBoundingClientRect();
        const x = Math.max(0, Math.min(moveEvent.clientX - rect.left, rect.width));
        const ratio = x / rect.width;
        seekTo(ratio * video.duration);
      };

      const handleMouseUp = () => {
        setIsSeeking(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [handleProgressBarClick, seekTo]
  );

  // ---- Volume ----

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value);
      const video = videoRef.current;
      if (!video) return;

      video.volume = val;
      setVolume(val);
      if (val === 0) {
        video.muted = true;
        setIsMuted(true);
      } else if (video.muted) {
        video.muted = false;
        setIsMuted(false);
      }
    },
    []
  );

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  // ---- Speed ----

  const changeSpeed = useCallback((speed: PlaybackSpeed) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = speed;
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
  }, []);

  // ---- Fullscreen ----

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      container.requestFullscreen().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // ---- Buffering ----

  const handleWaiting = useCallback(() => setIsBuffering(true), []);
  const handleCanPlay = useCallback(() => setIsBuffering(false), []);

  // ---- Error ----

  const handleError = useCallback(() => {
    setHasError(true);
    setIsPlaying(false);
    setIsBuffering(false);
  }, []);

  const retryLoad = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setHasError(false);
    video.load();
  }, []);

  // ---- Keyboard shortcuts ----

  const handleKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLDivElement>) => {
      // Only handle when focus is on the player container (not inputs inside)
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT"
      ) {
        return;
      }

      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;
        case "ArrowRight":
          e.preventDefault();
          seekTo(currentTime + SEEK_STEP);
          break;
        case "ArrowLeft":
          e.preventDefault();
          seekTo(currentTime - SEEK_STEP);
          break;
        default:
          break;
      }
    },
    [togglePlay, toggleFullscreen, toggleMute, seekTo, currentTime]
  );

  // ---- Cleanup ----

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  // ---- Progress percentages ----

  const progressPercent =
    duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;
  const bufferedPercent =
    duration > 0 ? Math.min((buffered / duration) * 100, 100) : 0;

  // ---- Render ----

  return (
    <div
      ref={containerRef}
      className="group relative aspect-video w-full overflow-hidden rounded-2xl bg-zinc-900 shadow-lg"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="application"
      aria-label="נגן וידאו"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="h-full w-full cursor-pointer"
        playsInline
        onClick={togglePlay}
        onPlay={handlePlay}
        onPause={handlePause}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onProgress={handleProgress}
        onEnded={handleEnded}
        onWaiting={handleWaiting}
        onCanPlay={handleCanPlay}
        onError={handleError}
      >
        <track kind="captions" />
      </video>

      {/* Resume banner */}
      {initialProgress &&
        initialProgress > 0 &&
        initialProgress < 95 &&
        !hasResumedRef.current && (
          <div className="absolute top-3 right-3 z-20 rounded-lg bg-black/80 px-3 py-2 text-sm text-white backdrop-blur-sm">
            ממשיך מ-{initialProgress}%
          </div>
        )}

      {/* Buffering spinner */}
      {isBuffering && !hasError && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-3 border-zinc-500 border-t-white" />
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-zinc-900/90">
          <div className="text-center">
            <svg
              className="mx-auto mb-3 h-12 w-12 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
            <p className="mb-4 text-sm text-zinc-300">
              שגיאה בטעינת הוידאו
            </p>
            <button
              type="button"
              onClick={retryLoad}
              className="rounded-full bg-white/10 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
            >
              נסה שוב
            </button>
          </div>
        </div>
      )}

      {/* Large center play button (when paused and not buffering/error) */}
      {!isPlaying && !isBuffering && !hasError && (
        <button
          type="button"
          onClick={togglePlay}
          className="absolute inset-0 z-10 flex items-center justify-center"
          aria-label="נגן"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-transform hover:scale-110">
            <svg
              className="h-8 w-8 translate-x-0.5 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M8 5.14v14l11-7-11-7z" />
            </svg>
          </div>
        </button>
      )}

      {/* Controls overlay */}
      <div
        className={`absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pb-3 pt-12 transition-opacity duration-200 ${
          showControls ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {/* Progress bar */}
        <div
          ref={progressBarRef}
          className="group/progress mb-3 h-1.5 cursor-pointer rounded-full bg-zinc-600 transition-all hover:h-2.5"
          onClick={handleProgressBarClick}
          onMouseDown={handleProgressBarMouseDown}
          role="slider"
          aria-label="מיקום בוידאו"
          aria-valuenow={Math.round(progressPercent)}
          aria-valuemin={0}
          aria-valuemax={100}
          tabIndex={0}
        >
          {/* Buffered */}
          <div
            className="absolute h-full rounded-full bg-zinc-500/50"
            style={{ width: `${bufferedPercent}%` }}
          />
          {/* Played */}
          <div
            className="relative h-full rounded-full bg-brand-500 transition-all"
            style={{ width: `${progressPercent}%` }}
          >
            {/* Thumb */}
            <div className="absolute left-0 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-brand-500 shadow-md transition-transform group-hover/progress:scale-100" />
          </div>
        </div>

        {/* Bottom controls */}
        <div className="flex items-center justify-between">
          {/* Right side (RTL: play, volume, time) */}
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <button
              type="button"
              onClick={togglePlay}
              className="text-white transition-colors hover:text-brand-300"
              aria-label={isPlaying ? "השהה" : "נגן"}
            >
              {isPlaying ? (
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M8 5.14v14l11-7-11-7z" />
                </svg>
              )}
            </button>

            {/* Volume */}
            <div className="group/vol flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleMute}
                className="text-white transition-colors hover:text-brand-300"
                aria-label={isMuted ? "בטל השתקה" : "השתק"}
              >
                {isMuted || volume === 0 ? (
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0021 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 003.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                  </svg>
                ) : volume < 0.5 ? (
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M18.5 12A4.5 4.5 0 0016 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                  </svg>
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="hidden h-1 w-16 cursor-pointer appearance-none rounded-full bg-zinc-600 accent-brand-500 group-hover/vol:block [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                aria-label="עוצמת שמע"
              />
            </div>

            {/* Time display */}
            <span className="select-none text-xs text-zinc-300" dir="ltr">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Left side (RTL: speed, fullscreen) */}
          <div className="flex items-center gap-3">
            {/* Playback speed */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSpeedMenu((prev) => !prev)}
                className="rounded px-1.5 py-0.5 text-xs font-medium text-white transition-colors hover:bg-white/10"
                aria-label="מהירות נגינה"
                aria-expanded={showSpeedMenu}
              >
                {playbackSpeed}x
              </button>
              {showSpeedMenu && (
                <div className="absolute bottom-full left-0 mb-2 rounded-lg bg-zinc-800 py-1 shadow-xl">
                  {PLAYBACK_SPEEDS.map((speed) => (
                    <button
                      key={speed}
                      type="button"
                      onClick={() => changeSpeed(speed)}
                      className={`block w-full px-4 py-1.5 text-right text-xs transition-colors hover:bg-white/10 ${
                        speed === playbackSpeed
                          ? "font-bold text-brand-400"
                          : "text-zinc-300"
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="text-white transition-colors hover:text-brand-300"
              aria-label={isFullscreen ? "צא ממסך מלא" : "מסך מלא"}
            >
              {isFullscreen ? (
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
