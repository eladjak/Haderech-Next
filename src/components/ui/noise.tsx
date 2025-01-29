'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface NoiseProps {
  className?: string
  color?: string
  opacity?: number
  speed?: number
  interactive?: boolean
}

export function Noise({
  className,
  color = '#000000',
  opacity = 0.05,
  speed = 4,
  interactive = true,
}: NoiseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mousePos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let imageData: ImageData
    let noise: Uint8ClampedArray

    // מגדיר את גודל הקנבס בהתאם לגודל החלון
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      imageData = ctx.createImageData(canvas.width, canvas.height)
      noise = new Uint8ClampedArray(canvas.width * canvas.height * 4)
    }

    // יוצר רעש אקראי
    const createNoise = () => {
      const { width } = canvas
      const data = imageData.data

      for (let i = 0; i < noise.length; i += 4) {
        const distance = interactive
          ? Math.sqrt(
              Math.pow(((i / 4) % width) - mousePos.current.x, 2) +
                Math.pow(Math.floor(i / 4 / width) - mousePos.current.y, 2)
            )
          : 0

        const intensity = interactive
          ? Math.max(0, 1 - distance / (width / 2))
          : 1

        const value = Math.random() * 255 * intensity

        const [r, g, b] = color
          .match(/\w\w/g)
          ?.map(x => parseInt(x, 16)) || [0, 0, 0]

        data[i] = r
        data[i + 1] = g
        data[i + 2] = b
        data[i + 3] = value * opacity
      }

      ctx.putImageData(imageData, 0, 0)
    }

    // מעדכן את הרעש
    const updateNoise = () => {
      createNoise()
      animationFrameId = requestAnimationFrame(updateNoise)
    }

    // מטפל בתזוזת העכבר
    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return
      const rect = canvas.getBoundingClientRect()
      mousePos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }

    // מאזין לשינויי גודל החלון ותזוזת העכבר
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', handleMouseMove)
    resize()
    updateNoise()

    // ניקוי
    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [color, opacity, speed, interactive])

  return (
    <canvas
      ref={canvasRef}
      className={cn('fixed inset-0 pointer-events-none', className)}
      style={{ opacity }}
    />
  )
} 
