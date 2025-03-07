"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TypewriterProps {
  text: string;
  delay?: number;
  className?: string;
  onComplete?: () => void;
}

function Typewriter({
  text,
  delay = 50,
  className,
  onComplete,
}: TypewriterProps): React.ReactElement {
  const [displayText, setDisplayText] = React.useState("");
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    if (currentIndex >= text.length) {
      onComplete?.();
      return;
    }

    const timeout = setTimeout(() => {
      setDisplayText((prev) => prev + text[currentIndex]);
      setCurrentIndex((prev) => prev + 1);
    }, delay);

    return () => clearTimeout(timeout);
  }, [currentIndex, delay, onComplete, text]);

  return <span className={className}>{displayText}</span>;
}

export { Typewriter };
