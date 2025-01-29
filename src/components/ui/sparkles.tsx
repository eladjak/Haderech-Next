'use client'

import { useCallback, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'

// טיפוס עבור הסטייל של הניצוץ
interface SparkleStyle {
  position: 'absolute'
  top: string
  left: string
  zIndex: number
}

// ניצוץ בודד
function Sparkle({ color, size, style }: { color: string; size: number; style: SparkleStyle }) {
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

// יוצר מיקום אקראי בתוך האלמנט
function random(min: number, max: number) {
  return Math.floor(Math.random() * (max - min)) + min
}

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

// פרופס של הרכיב
interface SparklesProps {
  children: React.ReactNode
  className?: string
  color?: string
  minSparkles?: number
  maxSparkles?: number
  sparkleInterval?: number
}

export function Sparkles({
  children,
  className,
  color = '#FFD700', // צבע ברירת מחדל - זהב
  minSparkles = 3,
  maxSparkles = 5,
  sparkleInterval = 500, // מרווח זמן בין ניצוצות במילישניות
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
