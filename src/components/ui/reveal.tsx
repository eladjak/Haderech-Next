"use client";

import * as React from "react";
import { motion, useInView } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";

import { cn } from "@/lib/utils";

interface RevealProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
  delay?: number;
  duration?: number;
  once?: boolean;
  threshold?: number;
}

const Reveal = React.forwardRef<HTMLDivElement, RevealProps>(
  (
    {
      className,
      children,
      direction = "up",
      distance = 20,
      delay = 0,
      duration = 0.5,
      once = true,
      threshold = 0.1,
      ...props
    },
    ref,
  ) => {
    const elementRef = React.useRef<HTMLDivElement>(null);
    const isInView = useInView(elementRef, {
      once,
      amount: threshold,
    });

    const getInitialTransform = () => {
      switch (direction) {
        case "up":
          return { y: distance };
        case "down":
          return { y: -distance };
        case "left":
          return { x: distance };
        case "right":
          return { x: -distance };
        default:
          return { y: distance };
      }
    };

    const getFinalTransform = () => {
      switch (direction) {
        case "up":
        case "down":
          return { y: 0 };
        case "left":
        case "right":
          return { x: 0 };
        default:
          return { y: 0 };
      }
    };

    return (
      <motion.div
        ref={(node) => {
          elementRef.current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        className={cn("relative", className)}
        initial={{
          opacity: 0,
          ...getInitialTransform(),
        }}
        animate={
          isInView
            ? {
                opacity: 1,
                ...getFinalTransform(),
              }
            : undefined
        }
        transition={{
          duration,
          delay,
          ease: "easeOut",
        }}
        {...props}
      >
        {children}
      </motion.div>
    );
  },
);
Reveal.displayName = "Reveal";

export { Reveal };
