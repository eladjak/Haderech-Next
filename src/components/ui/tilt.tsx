"use client"

import * as React from "react"
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from "framer-motion"
import type { HTMLMotionProps } from "framer-motion"

import { cn } from "@/lib/utils"

interface TiltProps extends Omit<HTMLMotionProps<"div">, "scale"> {
  perspective?: number
  scale?: number
  speed?: number
  max?: number
  glare?: boolean
  glareOpacity?: number
  glareColor?: string
  glarePosition?: "all" | "top" | "bottom" | "left" | "right"
}

const Tilt = React.forwardRef<HTMLDivElement, TiltProps>(
  ({
    className,
    perspective = 1000,
    scale = 1.05,
    speed = 500,
    max = 15,
    glare = false,
    glareOpacity = 0.5,
    glareColor = "#ffffff",
    glarePosition = "all",
    children,
    ...props
  }, ref) => {
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [max, -max]), {
      stiffness: speed,
      damping: 50,
    })
    const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-max, max]), {
      stiffness: speed,
      damping: 50,
    })

    const transform = useMotionTemplate`rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`

    function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
      const { left, top, width, height } = currentTarget.getBoundingClientRect()
      const dx = (clientX - left) / width - 0.5
      const dy = (clientY - top) / height - 0.5
      x.set(dx)
      y.set(dy)
    }

    function onMouseLeave() {
      x.set(0)
      y.set(0)
    }

    const getGlarePosition = () => {
      switch (glarePosition) {
        case "top":
          return "inset-x-0 top-0 h-[50%]"
        case "bottom":
          return "inset-x-0 bottom-0 h-[50%]"
        case "left":
          return "inset-y-0 left-0 w-[50%]"
        case "right":
          return "inset-y-0 right-0 w-[50%]"
        default:
          return "inset-0"
      }
    }

    return (
      <motion.div
        ref={ref}
        className={cn("relative", className)}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        style={{
          perspective,
          transformStyle: "preserve-3d",
        }}
        {...props}
      >
        <motion.div
          style={{
            transform,
          }}
        >
          {children}
          {glare && (
            <div
              className={cn(
                "pointer-events-none absolute bg-gradient-to-tr from-white/0 to-white/80 opacity-0 transition-opacity duration-500 group-hover:opacity-100",
                getGlarePosition()
              )}
              style={{
                opacity: glareOpacity,
                background: `linear-gradient(to top right, transparent, ${glareColor})`,
              }}
            />
          )}
        </motion.div>
      </motion.div>
    )
  }
)
Tilt.displayName = "Tilt"

export { Tilt } 
