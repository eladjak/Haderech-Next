import clsx from "clsx";
import React from "react";
import { logger } from "@/lib/utils/logger";

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

type CustomInputProps = {
  /** גודל הקלט */
  size?: "sm" | "md" | "lg";
  /** מצב הקלט */
  state?: "default" | "error" | "success";
  /** הודעת שגיאה */
  errorMessage?: string;
  /** הודעת הצלחה */
  successMessage?: string;
  /** תווית הקלט */
  label?: string;
  /** האם הקלט נדרש */
  required?: boolean;
};

export type InputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  keyof CustomInputProps
> &
  CustomInputProps;

/**
 * קומפוננטת קלט בסיסית
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = "md",
      state = "default",
      errorMessage,
      successMessage,
      label,
      required = false,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    const baseStyles =
      "w-full rounded-md border transition-colors focus:outline-none focus:ring-2";

    const sizeStyles = {
      sm: "text-sm px-2 py-1",
      md: "text-base px-3 py-2",
      lg: "text-lg px-4 py-3",
    };

    const stateStyles = {
      default:
        "border focus:border-primary focus:ring-primary/20",
      error:
        "border-destructive focus:border-destructive focus:ring-destructive/20",
      success:
        "border-green-600 focus:border-green-600 focus:ring-green-600/20",
    };

    const messageStyles = {
      error: "text-destructive",
      success: "text-green-600",
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={clsx("mb-1 block text-sm font-medium", {
              "text-destructive": state === "error",
              "text-green-600": state === "success",
            })}
          >
            {label}
            {required && <span className="text-destructive mr-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            baseStyles,
            sizeStyles[size],
            stateStyles[state],
            className
          )}
          aria-invalid={state === "error"}
          aria-describedby={
            state !== "default" ? `${inputId}-${state}-message` : undefined
          }
          required={required}
          {...props}
        />
        {state === "error" && errorMessage && (
          <p
            id={`${inputId}-error-message`}
            className={clsx("mt-1 text-sm", messageStyles.error)}
          >
            {errorMessage}
          </p>
        )}
        {state === "success" && successMessage && (
          <p
            id={`${inputId}-success-message`}
            className={clsx("mt-1 text-sm", messageStyles.success)}
          >
            {successMessage}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
