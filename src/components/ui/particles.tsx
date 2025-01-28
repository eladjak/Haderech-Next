"use client"

import * as React from "react"
import { motion, useAnimation } from "framer-motion"

import { cn } from "@/lib/utils"

interface ParticlesProps extends React.HTMLAttributes<HTMLDivElement> {
  count?: number
  size?: number
  speed?: number
  color?: string
  minSize?: number
  maxSize?: number
  interactive?: boolean
  interactiveDistance?: number
  interactiveForce?: number
}

const Particles = React.forwardRef<HTMLDivElement, ParticlesProps>(
  ({
    className,
    count = 50,
    size = 3,
    speed = 1,
    color = "currentColor",
    minSize = 1,
    maxSize = 5,
    interactive = true,
    interactiveDistance = 100,
    interactiveForce = 0.5,
    ...props
  }, ref) => {
    const containerRef = React.useRef<HTMLDivElement>(null)
    const particlesRef = React.useRef<(HTMLDivElement | null)[]>([])
    const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 })
    const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 })
    const controls = useAnimation()

    React.useEffect(() => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        setDimensions({ width, height })
      }
    }, [])

    React.useEffect(() => {
      const particles = Array.from({ length: count }).map(() => ({
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        size: Math.random() * (maxSize - minSize) + minSize,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
      }))

      const animate = () => {
        particles.forEach((particle, i) => {
          const el = particlesRef.current[i]
          if (!el) return

          // Update position
          particle.x += particle.vx
          particle.y += particle.vy

          // Bounce off walls
          if (particle.x < 0 || particle.x > dimensions.width) particle.vx *= -1
          if (particle.y < 0 || particle.y > dimensions.height) particle.vy *= -1

          // Interactive force
          if (interactive) {
            const dx = mousePosition.x - particle.x
            const dy = mousePosition.y - particle.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < interactiveDistance) {
              const force = (interactiveDistance - distance) * interactiveForce
              particle.vx -= (dx / distance) * force
              particle.vy -= (dy / distance) * force
            }
          }

          // Apply position
          el.style.transform = `translate(${particle.x}px, ${particle.y}px)`
        })

        requestAnimationFrame(animate)
      }

      animate()
    }, [dimensions, count, speed, minSize, maxSize, interactive, interactiveDistance, interactiveForce, mousePosition])

    const handleMouseMove = (e: React.MouseEvent) => {
      if (!interactive || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }

    return (
      <div
        ref={ref}
        className={cn("relative overflow-hidden", className)}
        onMouseMove={handleMouseMove}
        {...props}
      >
        <div
          ref={containerRef}
          className="absolute inset-0"
          style={{ perspective: "1000px" }}
        >
          {Array.from({ length: count }).map((_, i) => (
            <motion.div
              key={i}
              ref={(el) => {
                particlesRef.current[i] = el
              }}
              className="absolute left-0 top-0"
              animate={controls}
              style={{
                width: size,
                height: size,
                borderRadius: "50%",
                backgroundColor: color,
                opacity: 0.5,
              }}
            />
          ))}
        </div>
      </div>
    )
  }
)
Particles.displayName = "Particles"

export { Particles } 
