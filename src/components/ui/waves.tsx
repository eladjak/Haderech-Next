"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * @file waves.tsx
 * @description A component that creates an animated wave effect using HTML5 Canvas.
 * Perfect for creating dynamic, fluid backgrounds or decorative elements.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Waves />
 *
 * // Custom configuration
 * <Waves
 *   color="#3B82F6"
 *   amplitude={30}
 *   frequency={0.015}
 *   speed={0.7}
 *   height={200}
 * />
 *
 * // With custom positioning
 * <div className="relative h-screen">
 *   <Waves className="absolute bottom-0" />
 *   <main>Content</main>
 * </div>
 * ```
 */

/**
 * Props for the Waves component
 */
interface WavesProps {
  /** Additional CSS classes to apply to the canvas element */
  className?: string;
  /** The color of the waves (default: '#3B82F6' - blue) */
  color?: string;
  /** The height of the wave peaks in pixels (default: 20) */
  amplitude?: number;
  /** The frequency of the waves - controls how many waves appear (default: 0.02) */
  frequency?: number;
  /** The speed of the wave animation (default: 0.5) */
  speed?: number;
  /** The height of the canvas in pixels (default: 150) */
  height?: number;
}

/**
 * A component that renders animated waves using HTML5 Canvas
 *
 * @component
 */
export function Waves({
  className,
  color = "#3B82F6",
  amplitude = 20,
  frequency = 0.02,
  speed = 0.5,
  height = 150,
}: WavesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let offset = 0;

    /**
     * Updates the canvas dimensions based on window size
     */
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = height;
    };

    /**
     * Draws a single frame of the wave animation
     */
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);

      // Draw the wave path
      for (let x = 0; x < canvas.width; x++) {
        const y =
          Math.sin(x * frequency + offset) * amplitude + canvas.height / 2;

        ctx.lineTo(x, y);
      }

      // Complete the wave shape
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();

      // Fill the wave
      ctx.fillStyle = color;
      ctx.fill();

      // Animate the wave
      offset += speed;
      animationFrameId = requestAnimationFrame(draw);
    };

    // Set up event listeners and start animation
    window.addEventListener("resize", resize);
    resize();
    draw();

    // Cleanup
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [color, amplitude, frequency, speed, height]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("absolute bottom-0 left-0 w-full", className)}
      style={{ height }}
    />
  );
}
