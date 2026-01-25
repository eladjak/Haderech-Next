"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import * as React from "react";
import { cn } from "@/lib/utils";

interface SpotlightProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
  className?: string;
  fill?: string;
}

const Spotlight = React.forwardRef<HTMLDivElement, SpotlightProps>(
  ({ className, size = 400, children, _fill = "white", ...props }, ref) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({
      currentTarget,
      clientX,
      clientY,
    }: React.MouseEvent) {
      const { left, top } = currentTarget.getBoundingClientRect();

      mouseX.set(clientX - left);
      mouseY.set(clientY - top);
    }

    return (
      <div
        ref={ref}
        className={cn("group relative", className)}
        onMouseMove={handleMouseMove}
        {...props}
      >
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                ${size}px circle at ${mouseX}px ${mouseY}px,
                rgba(var(--spotlight-color), 0.15),
                transparent 80%
              )
            `,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-[100px]" />
        {children}
      </div>
    );
  }
);
Spotlight.displayName = "Spotlight";

export { Spotlight };
