/**
 * Avatar Components
 * 
 * A set of components for displaying user avatars with fallback support.
 * Built on top of Radix UI Avatar primitive with added RTL support.
 * 
 * @example
 * ```tsx
 * <Avatar>
 *   <AvatarImage src="user-avatar.jpg" alt="User name" />
 *   <AvatarFallback>UN</AvatarFallback>
 * </Avatar>
 * ```
 */

"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

// Avatar container component
const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

// Avatar image component
const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  Omit<React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>, 'src'> & {
    src: string | null | undefined;
  }
>(({ className, src, alt, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    src={src || undefined}
    alt={alt}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

// Avatar fallback component (shown when image fails to load)
const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback } 