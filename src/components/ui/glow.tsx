'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface GlowProps {
  children: React.ReactNode
  className?: string
  color?: string
  size?: number
  blur?: number
  opacity?: number
  followMouse?: boolean
  delay?: number
}

export function Glow({
  children,
  className,
  color = '#3B82F6', // כחול ברירת מחדל
  size = 200,
  blur = 100,
  opacity = 0.15,
  followMouse = true,
  delay = 0.1,
}: GlowProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mousePosition = useRef({ x: 0, y: 0 })
  const glowPosition = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (!followMouse) return

    const container = containerRef.current
    if (!container) return

    const updateMousePosition = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      mousePosition.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }

    const updateGlowPosition = () => {
      const dx = mousePosition.current.x - glowPosition.current.x
      const dy = mousePosition.current.y - glowPosition.current.y

      glowPosition.current = {
        x: glowPosition.current.x + dx * delay,
        y: glowPosition.current.y + dy * delay,
      }

      if (container) {
        container.style.setProperty('--glow-x', `${glowPosition.current.x}px`)
        container.style.setProperty('--glow-y', `${glowPosition.current.y}px`)
      }

      requestAnimationFrame(updateGlowPosition)
    }

    window.addEventListener('mousemove', updateMousePosition)
    const animationFrame = requestAnimationFrame(updateGlowPosition)

    return () => {
      window.removeEventListener('mousemove', updateMousePosition)
      cancelAnimationFrame(animationFrame)
    }
  }, [followMouse, delay])

  return (
    <motion.div
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="absolute pointer-events-none"
        style={{
          left: 'var(--glow-x)',
          top: 'var(--glow-y)',
          width: size,
          height: size,
          transform: 'translate(-50%, -50%)',
          background: color,
          borderRadius: '50%',
          filter: `blur(${blur}px)`,
          opacity,
        }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
} 