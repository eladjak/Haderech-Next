"use client";

import { motion } from "framer-motion";
import * as React from "react";

import { cn } from "@/lib/utils";

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** מהירות האנימציה */
  speed?: number;
  /** מרווח בין הפריטים */
  spacing?: number;
  /** האם להפעיל אנימציה */
  animate?: boolean;
  /** האם להפעיל אנימציה בהפוך */
  reverse?: boolean;
  /** האם להפעיל אנימציה בלופ */
  loop?: boolean;
}

/**
 * קומפוננטת מרקי לאנימציית טקסט רץ
 */
export function Marquee({
  children,
  className,
  speed = 50,
  spacing = 16,
  animate = true,
  reverse = false,
  loop = true,
  ...props
}: MarqueeProps): React.ReactElement {
  const [contentWidth, setContentWidth] = React.useState(0);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (contentRef.current) {
      setContentWidth(contentRef.current.scrollWidth);
    }
  }, [children]);

  const duration = React.useMemo(() => {
    return contentWidth / speed;
  }, [contentWidth, speed]);

  const marqueeVariants = {
    animate: {
      x: reverse ? [0, -contentWidth] : [-contentWidth, 0],
      transition: {
        x: {
          repeat: loop ? Infinity : 0,
          repeatType: "loop" as const,
          duration,
          ease: "linear",
        },
      },
    },
  };

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <motion.div
        ref={contentRef}
        className="flex min-w-full"
        variants={marqueeVariants}
        animate={animate ? "animate" : "initial"}
        style={
          {
            "--gap": `${spacing}px`,
          } as Record<string, string>
        }
      >
        {children}
      </motion.div>
    </div>
  );
}
