"use client";

import * as React from "react";

import {
  motion,
  useMotionValue,
  useSpring,
  type HTMLMotionProps,
} from "framer-motion";

import { cn } from "@/lib/utils";

interface TiltProps extends React.HTMLAttributes<HTMLDivElement> {
  perspective?: number;
  scale?: number;
  speed?: number;
  max?: number;
  reset?: boolean;
  easing?: string;
  glare?: boolean;
  glareOpacity?: number;
  glareColor?: string;
  glarePosition?: "all" | "top" | "bottom" | "left" | "right";
  children?: React.ReactNode;
}

function Tilt({
  children,
  className,
  perspective = 1000,
  scale = 1,
  speed = 500,
  max = 15,
  reset = true,
  easing = "cubic-bezier(.03,.98,.52,.99)",
  glare = false,
  glareOpacity = 0.2,
  glareColor = "white",
  glarePosition = "all",
  ...props
}: TiltProps): React.ReactElement {
  const [tiltStyle, setTiltStyle] = React.useState({
    transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(${scale}, ${scale}, ${scale})`,
    transition: `${speed}ms ${easing}`,
  });

  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;

      const element = containerRef.current;
      const rect = element.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const x = (mouseY / height - 0.5) * 2;
      const y = (mouseX / width - 0.5) * -2;
      const rotateX = (max * x).toFixed(2);
      const rotateY = (max * y).toFixed(2);

      setTiltStyle({
        transform: `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`,
        transition: `${speed}ms ${easing}`,
      });
    },
    [max, perspective, scale, speed, easing]
  );

  const handleMouseLeave = React.useCallback(() => {
    if (!reset) return;

    setTiltStyle({
      transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(${scale}, ${scale}, ${scale})`,
      transition: `${speed}ms ${easing}`,
    });
  }, [reset, perspective, scale, speed, easing]);

  const getGlarePosition = () => {
    switch (glarePosition) {
      case "top":
        return "top-0 left-0 right-0 h-1/2";
      case "bottom":
        return "bottom-0 left-0 right-0 h-1/2";
      case "left":
        return "top-0 left-0 bottom-0 w-1/2";
      case "right":
        return "top-0 right-0 bottom-0 w-1/2";
      default:
        return "inset-0";
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={tiltStyle}
      {...props}
    >
      {children}
      {glare && (
        <div
          className={cn(
            "pointer-events-none absolute bg-gradient-to-r from-transparent to-white opacity-0 transition-opacity group-hover:opacity-20",
            getGlarePosition()
          )}
          style={{
            opacity: glareOpacity,
            background: `linear-gradient(90deg, transparent, ${glareColor})`,
          }}
        />
      )}
    </div>
  );
}

export { Tilt };
