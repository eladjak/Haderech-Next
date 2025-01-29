'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface WavesProps {
  className?: string
  color?: string
  amplitude?: number
  frequency?: number
  speed?: number
  height?: number
}

export function Waves({
  className,
  color = '#3B82F6', // כחול ברירת מחדל
  amplitude = 20,
  frequency = 0.02,
  speed = 0.5,
  height = 150,
}: WavesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let offset = 0

    // מגדיר את גודל הקנבס בהתאם לגודל החלון
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = height
    }

    // מצייר את הגלים
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.beginPath()
      ctx.moveTo(0, canvas.height)

      // מצייר את הגל
      for (let x = 0; x < canvas.width; x++) {
        const y =
          Math.sin(x * frequency + offset) * amplitude +
          canvas.height / 2

        ctx.lineTo(x, y)
      }

      // סוגר את הצורה
      ctx.lineTo(canvas.width, canvas.height)
      ctx.closePath()

      // צובע את הגל
      ctx.fillStyle = color
      ctx.fill()

      // מזיז את הגל
      offset += speed
      animationFrameId = requestAnimationFrame(draw)
    }

    // מאזין לשינויי גודל החלון
    window.addEventListener('resize', resize)
    resize()
    draw()

    // ניקוי
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [color, amplitude, frequency, speed, height])

  return (
    <canvas
      ref={canvasRef}
      className={cn('absolute bottom-0 left-0 w-full', className)}
      style={{ height }}
    />
  )
} 