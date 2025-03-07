"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * @file glow.tsx
 * @description A component that adds a dynamic glowing effect to its children.
 * The glow can follow mouse movement, creating an interactive lighting effect.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Glow>
 *   <button>Glowing Button</button>
 * </Glow>
 *
 * // Custom configuration
 * <Glow
 *   color="#3B82F6"
 *   size={300}
 *   blur={150}
 *   opacity={0.2}
 *   followMouse={true}
 *   delay={0.15}
 * >
 *   <div>Content with custom glow</div>
 * </Glow>
 *
 * // Static glow effect
 * <Glow followMouse={false}>
 *   <div>Static glow content</div>
 * </Glow>
 * ```
 */

/**
 * Props for the Glow component
 */
interface GlowProps {
  /** The content to wrap with the glow effect */
  children: React.ReactNode;
  /** Additional CSS classes to apply to the container */
  className?: string;
  /** The color of the glow effect (default: '#3B82F6' - blue) */
  color?: string;
  /** The size of the glow in pixels (default: 200) */
  size?: number;
  /** The blur radius of the glow in pixels (default: 100) */
  blur?: number;
  /** The opacity of the glow effect (default: 0.15) */
  opacity?: number;
  /** Whether the glow should follow mouse movement (default: true) */
  followMouse?: boolean;
  /** The delay in movement response when following mouse (default: 0.1) */
  delay?: number;
}

/**
 * A component that adds a dynamic glowing effect to its children
 *
 * @component
 */
export function Glow({
  children,
  className,
  color = "#3B82F6", // כחול ברירת מחדל
  size = 200,
  blur = 100,
  opacity = 0.15,
  followMouse = true,
  delay = 0.1,
}: GlowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mousePosition = useRef({ x: 0, y: 0 });
  const glowPosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!followMouse) return;

    const container = containerRef.current;
    if (!container) return;

    /**
     * Updates stored mouse position relative to container
     */
    const updateMousePosition = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mousePosition.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    /**
     * Updates glow position with smooth interpolation
     */
    const updateGlowPosition = () => {
      const dx = mousePosition.current.x - glowPosition.current.x;
      const dy = mousePosition.current.y - glowPosition.current.y;

      glowPosition.current = {
        x: glowPosition.current.x + dx * delay,
        y: glowPosition.current.y + dy * delay,
      };

      if (container) {
        container.style.setProperty("--glow-x", `${glowPosition.current.x}px`);
        container.style.setProperty("--glow-y", `${glowPosition.current.y}px`);
      }

      requestAnimationFrame(updateGlowPosition);
    };

    // Set up event listeners and start animation
    window.addEventListener("mousemove", updateMousePosition);
    const animationFrame = requestAnimationFrame(updateGlowPosition);

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      cancelAnimationFrame(animationFrame);
    };
  }, [followMouse, delay]);

  return (
    <motion.div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="pointer-events-none absolute"
        style={{
          left: "var(--glow-x)",
          top: "var(--glow-y)",
          width: size,
          height: size,
          transform: "translate(-50%, -50%)",
          background: color,
          borderRadius: "50%",
          filter: `blur(${blur}px)`,
          opacity,
        }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
