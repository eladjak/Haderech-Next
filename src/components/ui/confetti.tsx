import confetti from "canvas-confetti";
import React, { useEffect } from "react";

("use client");

interface ConfettiProps {
  onComplete?: () => void;
  duration?: number;
  particleCount?: number;
  spread?: number;
  origin?: { x: number; y: number };
}

const Confetti = ({
  onComplete,
  duration = 3000,
  particleCount = 100,
  spread = 70,
  origin = { x: 0.5, y: 0.5 },
}: ConfettiProps): React.ReactElement | null => {
  useEffect(() => {
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount,
        spread,
        origin,
        disableForReducedMotion: true,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      } else {
        onComplete?.();
      }
    };

    frame();

    return () => {
      confetti.reset();
    };
  }, [duration, onComplete, particleCount, spread, origin]);

  return null;
};
Confetti.displayName = "Confetti";

export { Confetti };
