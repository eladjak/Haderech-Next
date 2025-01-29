/**
 * @file sparkles.tsx
 * @description A component that adds a sparkling effect to its children. Creates animated sparkle
 * elements that appear and disappear around the wrapped content.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <Sparkles>
 *   <h1>Sparkly Text</h1>
 * </Sparkles>
 * 
 * // Custom configuration
 * <Sparkles
 *   color="#FFD700"
 *   minSparkles={5}
 *   maxSparkles={8}
 *   sparkleInterval={300}
 * >
 *   <button>Magic Button</button>
 * </Sparkles>
 * ```
 */

'use client'

import { useCallback, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'

/**
 * Interface defining the style properties for individual sparkle elements
 */
interface SparkleStyle {
  position: 'absolute'
  top: string
  left: string
  zIndex: number
}

/**
 * Individual sparkle component that renders an animated SVG star
 * 
 * @param color - The color of the sparkle
 * @param size - The size of the sparkle in pixels
 * @param style - Positioning and z-index styles
 */
function Sparkle({ color, size, style }: { color: string; size: number; style: SparkleStyle }) {
  // SVG path for star shape
  const path = `M${size / 2} 0
               L${size / 2 + size / 4} ${size / 2}
               L${size} ${size / 2}
               L${size / 2 + size / 4} ${size / 2}
               L${size / 2} ${size}
               L${size / 2 - size / 4} ${size / 2}
               L0 ${size / 2}
               L${size / 2 - size / 4} ${size / 2}
               Z`

  return (
    <motion.svg
      style={style}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      initial={{ scale: 0, rotate: 0 }}
      animate={{
        scale: [0, 1, 0],
        rotate: [0, 90, 180],
      }}
      transition={{
        duration: 1,
        repeat: 0,
        ease: 'easeInOut',
      }}
      exit={{ scale: 0, rotate: 180 }}
    >
      <path d={path} fill={color} />
    </motion.svg>
  )
}

/**
 * Generates a random number between min and max (inclusive)
 */
function random(min: number, max: number) {
  return Math.floor(Math.random() * (max - min)) + min
}

/**
 * Generates a sparkle object with random position and size
 * 
 * @param color - The color of the sparkle
 * @returns A sparkle object with unique ID, creation timestamp, color, size, and positioning
 */
function generateSparkle(color: string) {
  return {
    id: String(random(10000, 99999)),
    createdAt: Date.now(),
    color,
    size: random(10, 20),
    style: {
      position: 'absolute' as const,
      top: random(0, 100) + '%',
      left: random(0, 100) + '%',
      zIndex: 2,
    },
  }
}

/**
 * Props for the Sparkles component
 */
interface SparklesProps {
  /** The content to wrap with sparkles */
  children: React.ReactNode
  /** Additional CSS classes to apply to the container */
  className?: string
  /** The color of the sparkles (default: '#FFD700' - gold) */
  color?: string
  /** Minimum number of sparkles to show at once (default: 3) */
  minSparkles?: number
  /** Maximum number of sparkles to show at once (default: 5) */
  maxSparkles?: number
  /** Time interval in milliseconds between sparkle updates (default: 500) */
  sparkleInterval?: number
}

/**
 * A component that adds animated sparkles around its children
 * 
 * @component
 */
export function Sparkles({
  children,
  className,
  color = '#FFD700',
  minSparkles = 3,
  maxSparkles = 5,
  sparkleInterval = 500,
}: SparklesProps) {
  const [sparkles, setSparkles] = useState<Array<ReturnType<typeof generateSparkle>>>([])

  const generateSparkles = useCallback(() => {
    const numSparkles = random(minSparkles, maxSparkles)
    return Array.from({ length: numSparkles }, () => generateSparkle(color))
  }, [color, minSparkles, maxSparkles])

  useEffect(() => {
    const interval = setInterval(() => {
      setSparkles(generateSparkles())
    }, sparkleInterval)

    return () => clearInterval(interval)
  }, [generateSparkles, sparkleInterval])

  return (
    <span className={cn('relative inline-block', className)}>
      <AnimatePresence>
        {sparkles.map(sparkle => (
          <Sparkle
            key={sparkle.id}
            color={sparkle.color}
            size={sparkle.size}
            style={sparkle.style}
          />
        ))}
      </AnimatePresence>
      <span className="relative z-1">{children}</span>
    </span>
  )
} 
