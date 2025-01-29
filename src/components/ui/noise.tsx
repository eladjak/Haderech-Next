/**
 * @file noise.tsx
 * @description A component that creates an interactive noise effect using HTML5 Canvas.
 * The noise pattern can respond to mouse movement, creating a dynamic and engaging visual effect.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <Noise />
 * 
 * // Custom configuration
 * <Noise
 *   color="#000000"
 *   opacity={0.08}
 *   speed={3}
 *   interactive={true}
 * />
 * 
 * // Non-interactive noise background
 * <div className="relative">
 *   <Noise interactive={false} opacity={0.03} />
 *   <main>Content</main>
 * </div>
 * ```
 */

'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

/**
 * Props for the Noise component
 */
interface NoiseProps {
  /** Additional CSS classes to apply to the canvas element */
  className?: string
  /** The base color of the noise (default: '#000000' - black) */
  color?: string
  /** The opacity of the noise effect (default: 0.05) */
  opacity?: number
  /** The speed of the noise animation (default: 4) */
  speed?: number
  /** Whether the noise should react to mouse movement (default: true) */
  interactive?: boolean
}

/**
 * A component that creates an animated noise effect with optional mouse interactivity
 * 
 * @component
 */
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

    /**
     * Updates canvas dimensions and initializes pixel data arrays
     */
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      imageData = ctx.createImageData(canvas.width, canvas.height)
      noise = new Uint8ClampedArray(canvas.width * canvas.height * 4)
    }

    /**
     * Generates and applies the noise pattern to the canvas
     */
    const createNoise = () => {
      const { width } = canvas
      const data = imageData.data

      for (let i = 0; i < noise.length; i += 4) {
        // Calculate distance from mouse position for interactive effect
        const distance = interactive
          ? Math.sqrt(
              Math.pow(((i / 4) % width) - mousePos.current.x, 2) +
                Math.pow(Math.floor(i / 4 / width) - mousePos.current.y, 2)
            )
          : 0

        // Calculate noise intensity based on mouse distance
        const intensity = interactive
          ? Math.max(0, 1 - distance / (width / 2))
          : 1

        const value = Math.random() * 255 * intensity

        // Parse color components from hex color string
        const [r, g, b] = color
          .match(/\w\w/g)
          ?.map(x => parseInt(x, 16)) || [0, 0, 0]

        // Apply color and opacity to noise pixels
        data[i] = r
        data[i + 1] = g
        data[i + 2] = b
        data[i + 3] = value * opacity
      }

      ctx.putImageData(imageData, 0, 0)
    }

    /**
     * Animation loop for continuous noise updates
     */
    const updateNoise = () => {
      createNoise()
      animationFrameId = requestAnimationFrame(updateNoise)
    }

    /**
     * Handles mouse movement for interactive noise effect
     */
    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return
      const rect = canvas.getBoundingClientRect()
      mousePos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }

    // Set up event listeners and start animation
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', handleMouseMove)
    resize()
    updateNoise()

    // Cleanup
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
