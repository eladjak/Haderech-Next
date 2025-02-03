"use client";

import * as React from "react";
import { motion, useAnimation } from "framer-motion";

import { cn } from "@/lib/utils";

interface TypewriterProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string;
  speed?: number;
  delay?: number;
  cursor?: boolean;
  onComplete?: () => void;
}

const Typewriter = React.forwardRef<HTMLDivElement, TypewriterProps>(
  (
    {
      className,
      text,
      speed = 50,
      delay = 0,
      cursor = true,
      onComplete,
      ...props
    },
    ref,
  ) => {
    const [displayText, setDisplayText] = React.useState("");
    const controls = useAnimation();

    React.useEffect(() => {
      let currentIndex = 0;
      let timer: NodeJS.Timeout;

      const startTyping = () => {
        timer = setInterval(() => {
          if (currentIndex < text.length) {
            setDisplayText(text.slice(0, currentIndex + 1));
            currentIndex++;
          } else {
            clearInterval(timer);
            onComplete?.();
          }
        }, speed);
      };

      const delayTimer = setTimeout(() => {
        startTyping();
      }, delay);

      return () => {
        clearTimeout(delayTimer);
        clearInterval(timer);
      };
    }, [text, speed, delay, onComplete]);

    React.useEffect(() => {
      if (cursor) {
        controls.start({
          opacity: [1, 0],
          transition: {
            duration: 0.8,
            repeat: Infinity,
            repeatType: "reverse",
          },
        });
      }
    }, [cursor, controls]);

    return (
      <div
        ref={ref}
        className={cn("relative inline-flex items-center", className)}
        {...props}
      >
        <span>{displayText}</span>
        {cursor && (
          <motion.span
            animate={controls}
            className="ml-0.5 inline-block h-full w-0.5 bg-current"
          />
        )}
      </div>
    );
  },
);
Typewriter.displayName = "Typewriter";

export { Typewriter };
