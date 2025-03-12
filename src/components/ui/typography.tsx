"use client";

import { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TypographyProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  variant?:
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "p"
    | "blockquote"
    | "small";
  className?: string;
}

/**
 * Typography component
 *
 * A flexible typography component supporting different text variants
 */
export function Typography({
  children,
  variant = "p",
  className,
  ...props
}: TypographyProps) {
  switch (variant) {
    case "h1":
      return (
        <h1
          className={cn(
            "scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl",
            className
          )}
          {...props}
        >
          {children}
        </h1>
      );
    case "h2":
      return (
        <h2
          className={cn(
            "scroll-m-20 text-3xl font-semibold tracking-tight",
            className
          )}
          {...props}
        >
          {children}
        </h2>
      );
    case "h3":
      return (
        <h3
          className={cn(
            "scroll-m-20 text-2xl font-semibold tracking-tight",
            className
          )}
          {...props}
        >
          {children}
        </h3>
      );
    case "h4":
      return (
        <h4
          className={cn(
            "scroll-m-20 text-xl font-semibold tracking-tight",
            className
          )}
          {...props}
        >
          {children}
        </h4>
      );
    case "h5":
      return (
        <h5
          className={cn(
            "scroll-m-20 text-lg font-semibold tracking-tight",
            className
          )}
          {...props}
        >
          {children}
        </h5>
      );
    case "h6":
      return (
        <h6
          className={cn(
            "scroll-m-20 text-base font-semibold tracking-tight",
            className
          )}
          {...props}
        >
          {children}
        </h6>
      );
    case "blockquote":
      return (
        <blockquote
          className={cn("mt-6 border-r-2 pr-6 italic", className)}
          {...props}
        >
          {children}
        </blockquote>
      );
    case "small":
      return (
        <small
          className={cn("text-sm font-medium leading-none", className)}
          {...props}
        >
          {children}
        </small>
      );
    case "p":
    default:
      return (
        <p className={cn("leading-7", className)} {...props}>
          {children}
        </p>
      );
  }
}
