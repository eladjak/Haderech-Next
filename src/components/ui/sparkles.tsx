"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

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

/**
 * Interface defining the style properties for individual sparkle elements
 */
interface SparkleStyle {
  position: "absolute";
  top: string;
  left: string;
  zIndex: number;
}

interface SparkleProps {
  color: string;
  size: number;
  style: SparkleStyle;
}

/**
 * Individual sparkle component that renders an animated SVG star
 *
 * @param color - The color of the sparkle
 * @param size - The size of the sparkle in pixels
 * @param style - Positioning and z-index styles
 */
function Sparkle({ color, size, style }: SparkleProps) {
  // SVG path for star shape
  const path = `M${size / 2} 0
               L${size / 2 + size / 4} ${size / 2}
               L${size} ${size / 2}
               L${size / 2 + size / 4} ${size / 2}
               L${size / 2} ${size}
               L${size / 2 - size / 4} ${size / 2}
               L0 ${size / 2}
               L${size / 2 - size / 4} ${size / 2}
               Z`;

  return (
    <span className="animate-sparkle-spin absolute block" style={style}>
      <svg
        className="animate-sparkle-ping absolute inset-0"
        style={{
          display: "block",
          width: size,
          height: size,
        }}
        viewBox="0 0 68 68"
        fill="none"
      >
        <path d={path} fill={color} />
      </svg>
    </span>
  );
}

/**
 * Generates a random number between min and max (inclusive)
 */
function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min;
}

function useRandomInterval(
  callback: () => void,
  minDelay: number | null,
  maxDelay: number | null
): () => void {
  const timeoutId = React.useRef<number | null>(null);
  const savedCallback = React.useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (typeof minDelay === "number" && typeof maxDelay === "number") {
      const handleTick = () => {
        const nextTickAt = random(minDelay, maxDelay);
        timeoutId.current = window.setTimeout(() => {
          savedCallback.current();
          handleTick();
        }, nextTickAt);
      };
      handleTick();
    }
    return () => {
      if (timeoutId.current) {
        window.clearTimeout(timeoutId.current);
      }
    };
  }, [minDelay, maxDelay]);

  return React.useCallback(() => {
    if (timeoutId.current) {
      window.clearTimeout(timeoutId.current);
    }
  }, []);
}

/**
 * Generates a sparkle object with random position and size
 *
 * @param color - The color of the sparkle
 * @param minSize - The minimum size of the sparkle in pixels
 * @param maxSize - The maximum size of the sparkle in pixels
 * @returns A sparkle object with unique ID, creation timestamp, color, size, and positioning
 */
function generateSparkle(
  color: string,
  minSize = 10,
  maxSize = 20
): {
  id: string;
  createdAt: number;
  color: string;
  size: number;
  style: SparkleStyle;
} {
  return {
    id: String(random(10000, 99999)),
    createdAt: Date.now(),
    color,
    size: random(minSize, maxSize),
    style: {
      position: "absolute",
      top: `${random(0, 100)}%`,
      left: `${random(0, 100)}%`,
      zIndex: 2,
    },
  };
}

/**
 * Props for the Sparkles component
 */
interface SparklesProps {
  /** The content to wrap with sparkles */
  children: React.ReactNode;
  /** Additional CSS classes to apply to the container */
  className?: string;
  /** The color of the sparkles (default: '#FFD700' - gold) */
  color?: string;
  /** Minimum number of sparkles to show at once (default: 3) */
  minSparkles?: number;
  /** Maximum number of sparkles to show at once (default: 5) */
  maxSparkles?: number;
  /** Time interval in milliseconds between sparkle updates (default: 500) */
  sparkleInterval?: number;
}

/**
 * A component that adds animated sparkles around its children
 *
 * @component
 */
export function Sparkles({
  children,
  className,
  color = "#FFD700",
  minSparkles = 3,
  maxSparkles = 5,
  sparkleInterval = 500,
}: SparklesProps) {
  const [sparkles, setSparkles] = useState<
    Array<ReturnType<typeof generateSparkle>>
  >([]);

  const generateSparkles = React.useCallback(() => {
    const numSparkles = random(minSparkles, maxSparkles);
    return Array.from({ length: numSparkles }, () => generateSparkle(color));
  }, [color, minSparkles, maxSparkles]);

  const _stopInterval = useRandomInterval(
    () => {
      setSparkles(generateSparkles());
    },
    sparkleInterval,
    null
  );

  return (
    <span className={cn("relative inline-block", className)}>
      {sparkles.map((sparkle) => (
        <Sparkle
          key={sparkle.id}
          color={sparkle.color}
          size={sparkle.size}
          style={sparkle.style}
        />
      ))}
      <span className="z-1 relative">{children}</span>
    </span>
  );
}
