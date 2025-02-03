"use client"

import * as React from "react"
import { motion, useMotionValue, useSpring, type HTMLMotionProps } from "framer-motion"

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
  children?: React.ReactNode
}

export const Tilt = React.forwardRef<HTMLDivElement, TiltProps>(
  (
    {
      children,
      className,
      perspective = 1000,
      scale = 1,
      speed = 500,
      max = 25,
      glare = false,
      glareOpacity = 0.2,
      glareColor = "white",
      glarePosition = "all",
      style,
      ...props
    },
    ref
  ) => {
    const rotateX = useMotionValue(0)
    const rotateY = useMotionValue(0)
    const scaleValue = useMotionValue(1)

    const springConfig = { stiffness: speed, damping: 50, mass: 0.5 }

    const springX = useSpring(rotateX, springConfig)
    const springY = useSpring(rotateY, springConfig)
    const springScale = useSpring(scaleValue, springConfig)

    function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
      const rect = currentTarget.getBoundingClientRect()
      const width = rect.width
      const height = rect.height
      const left = rect.left
      const top = rect.top

      const mouseX = clientX - left
      const mouseY = clientY - top
      const centerX = width / 2
      const centerY = height / 2

      const rotateXValue = ((mouseY - centerY) / centerY) * max
      const rotateYValue = ((mouseX - centerX) / centerX) * max

      rotateX.set(-rotateXValue)
      rotateY.set(rotateYValue)
      scaleValue.set(scale)
    }

    function onMouseLeave() {
      rotateX.set(0)
      rotateY.set(0)
      scaleValue.set(1)
    }

    const getGlarePosition = () => {
      switch (glarePosition) {
        case "top":
          return "top-0 left-0 right-0 h-1/2"
        case "bottom":
          return "bottom-0 left-0 right-0 h-1/2"
        case "left":
          return "top-0 left-0 bottom-0 w-1/2"
        case "right":
          return "top-0 right-0 bottom-0 w-1/2"
        default:
          return "inset-0"
      }
    }

    return (
      <motion.div
        ref={ref}
        className={cn("relative", className)}
        style={{
          perspective,
          transformStyle: "preserve-3d",
          ...style,
        }}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        {...props}
      >
        <motion.div
          style={{
            rotateX: springX,
            rotateY: springY,
            scale: springScale,
          }}
        >
          {children}
          {glare && (
            <div
              className={cn(
                "pointer-events-none absolute bg-gradient-to-r from-transparent to-white opacity-0 transition-opacity group-hover:opacity-20",
                getGlarePosition()
              )}
              style={{
                opacity: glareOpacity,
                background: `linear-gradient(90deg, transparent, ${glareColor})`,
              }}
            />
          )}
        </motion.div>
      </motion.div>
    )
  }
)
Tilt.displayName = "Tilt" 
