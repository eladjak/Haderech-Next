/**
 * Input Component
 * 
 * A reusable input component with RTL support and consistent styling.
 * Supports all standard HTML input attributes plus custom styling options.
 * 
 * @example
 * ```tsx
 * <Input 
 *   type="text" 
 *   placeholder="Enter your name"
 *   onChange={(e) => console.log(e.target.value)} 
 * />
 * ```
 */

import * as React from "react"

import { cn } from "@/lib/utils"

// Input props interface extending HTML input attributes
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  // Add any custom props here
}

/**
 * Input component with consistent styling and RTL support
 * 
 * @param props - Standard HTML input attributes plus any custom props
 * @returns A styled input component
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "rtl:text-right",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input } 