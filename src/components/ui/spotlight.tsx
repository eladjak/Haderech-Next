"use client"

import * as React from "react"
import { motion, useMotionTemplate, useMotionValue } from "framer-motion"

import { cn } from "@/lib/utils"

interface SpotlightProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number
}

const Spotlight = React.forwardRef<HTMLDivElement, SpotlightProps>(
  ({ className, size = 400, children, ...props }, ref) => {
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
      const { left, top } = currentTarget.getBoundingClientRect()

      mouseX.set(clientX - left)
      mouseY.set(clientY - top)
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
        {children}
      </div>
    )
  }
)
Spotlight.displayName = "Spotlight"

export { Spotlight } 