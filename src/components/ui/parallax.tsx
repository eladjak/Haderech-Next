"use client";

import * as React from "react";

import { motion, useScroll, useTransform } from "framer-motion";

import { cn } from "@/lib/utils";

interface ParallaxProps extends React.HTMLAttributes<HTMLDivElement> {
  offset?: number;
  direction?: "up" | "down" | "left" | "right";
}

const Parallax = React.forwardRef<HTMLDivElement, ParallaxProps>(
  ({ className, offset = 50, direction = "up", children, ...props }, ref) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
      target: containerRef,
      offset: ["start end", "end start"],
    });

    const transformY = useTransform(
      scrollYProgress,
      [0, 1],
      direction === "down" ? [-offset, offset] : [offset, -offset]
    );

    const transformX = useTransform(
      scrollYProgress,
      [0, 1],
      direction === "right" ? [-offset, offset] : [offset, -offset]
    );

    return (
      <div
        ref={ref}
        className={cn("relative overflow-hidden", className)}
        {...props}
      >
        <div ref={containerRef}>
          <motion.div
            style={{
              [direction === "left" || direction === "right" ? "x" : "y"]:
                direction === "left" || direction === "right"
                  ? transformX
                  : transformY,
            }}
            transition={{ type: "spring", stiffness: 400, damping: 90 }}
          >
            {children}
          </motion.div>
        </div>
      </div>
    );
  }
);
Parallax.displayName = "Parallax";

export { Parallax };
