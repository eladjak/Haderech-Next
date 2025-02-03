"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  pauseOnHover?: boolean;
  reverse?: boolean;
  speed?: number;
  spacing?: number;
}

const Marquee = React.forwardRef<HTMLDivElement, MarqueeProps>(
  (
    {
      className,
      children,
      pauseOnHover = false,
      reverse = false,
      speed = 50,
      spacing = 16,
      ...props
    },
    ref,
  ) => {
    const [contentWidth, setContentWidth] = React.useState(0);
    const contentRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      if (contentRef.current) {
        setContentWidth(contentRef.current.scrollWidth);
      }
    }, [children]);

    return (
      <div
        ref={ref}
        className={cn("relative overflow-hidden", className)}
        {...props}
      >
        <motion.div
          className="flex min-w-full shrink-0 gap-[var(--gap)] [--gap:theme(spacing.4)]"
          style={{ "--gap": `${spacing}px` } as React.CSSProperties}
          initial={{ x: reverse ? -contentWidth : 0 }}
          animate={{ x: reverse ? 0 : -contentWidth }}
          transition={{
            duration: contentWidth / speed,
            repeat: Infinity,
            ease: "linear",
            ...(pauseOnHover && { paused: true }),
          }}
        >
          <div
            ref={contentRef}
            className="flex shrink-0 items-center gap-[var(--gap)]"
          >
            {children}
          </div>
          <div
            aria-hidden
            className="flex shrink-0 items-center gap-[var(--gap)]"
          >
            {children}
          </div>
        </motion.div>
      </div>
    );
  },
);
Marquee.displayName = "Marquee";

export { Marquee };
