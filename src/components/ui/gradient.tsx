"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import * as React from "react";
import { cn } from "@/lib/utils";

interface GradientProps extends React.HTMLAttributes<HTMLDivElement> {
  conic?: boolean;
  className?: string;
  small?: boolean;
}

function Gradient({
  conic,
  className,
  small,
  ...props
}: GradientProps): React.ReactElement {
  return (
    <div
      className={cn(
        "absolute inset-0 -z-10 opacity-20 transition-opacity duration-1000 group-hover:opacity-100",
        conic ? "bg-gradient-conic" : "bg-gradient-radial",
        small ? "scale-[2]" : "scale-[3]",
        className
      )}
      {...props}
    />
  );
}

export { Gradient };
