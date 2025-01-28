"use client"

import * as React from "react"
import { motion, useMotionTemplate, useMotionValue } from "framer-motion"
import type { HTMLMotionProps } from "framer-motion"

import { cn } from "@/lib/utils"

interface GradientProps extends Omit<HTMLMotionProps<"div">, "children"> {
  size?: number
  blur?: number
  colors?: string[]
  interactive?: boolean
  speed?: number
}

const Gradient = React.forwardRef<HTMLDivElement, GradientProps>(
  ({
    className,
    size = 500,
    blur = 100,
    colors = ["#0ea5e9", "#10b981", "#8b5cf6"],
    interactive = true,
    speed = 0.5,
    ...props
  }, ref) => {
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
      if (!interactive) return
      const { left, top } = currentTarget.getBoundingClientRect()
      mouseX.set(clientX - left)
      mouseY.set(clientY - top)
    }

    const background = useMotionTemplate`
      radial-gradient(
        ${size}px circle at ${mouseX}px ${mouseY}px,
        ${colors.join(", ")}
      )
    `

    return (
      <motion.div
        ref={ref}
        className={cn("relative overflow-hidden", className)}
        onMouseMove={handleMouseMove}
        animate={{
          background: interactive ? undefined : `radial-gradient(${colors.join(", ")})`,
        }}
        transition={{ duration: speed }}
        {...props}
      >
        {interactive && (
          <motion.div
            className="pointer-events-none absolute inset-0"
            style={{
              background,
              filter: `blur(${blur}px)`,
            }}
          />
        )}
      </motion.div>
    )
  }
)
Gradient.displayName = "Gradient"

export { Gradient } 
