"use client";

import clsx from "clsx";
import * as React from "react";
import { logger } from "@/lib/utils/logger";

/**
 * Checkbox Component
 *
 * A customizable checkbox component with RTL support and consistent styling.
 *
 * @example
 * ```tsx
 * <Checkbox
 *   label="זכור אותי"
 *   onChange={(checked) => console.log(checked)}
 * />
 * ```
 */

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  /** תווית תיבת הסימון */
  label?: string;
  /** האם תיבת הסימון במצב שגיאה */
  error?: boolean;
  /** האם תיבת הסימון במצב הצלחה */
  success?: boolean;
  /** פונקציה שתופעל בעת שינוי הערך */
  onChange?: (checked: boolean) => void;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    { label, error, success, onChange, className, ...props },
    ref
  ): React.ReactElement => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
      if (onChange) {
        onChange(e.target.checked);
      }
    };

    return (
      <label className="inline-flex items-center gap-2">
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            className={clsx(
              "peer h-4 w-4 appearance-none rounded border transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-offset-2",
              {
                "border focus:border-primary focus:ring-primary/20":
                  !error && !success,
                "border-destructive focus:border-destructive focus:ring-destructive/20":
                  error,
                "border-green-600 focus:border-green-600 focus:ring-green-600/20":
                  success,
              },
              className
            )}
            onChange={handleChange}
            {...props}
          />
          <svg
            className={clsx(
              "pointer-events-none absolute inset-0 h-4 w-4 opacity-0 transition-opacity",
              "peer-checked:opacity-100",
              {
                "text-primary": !error && !success,
                "text-destructive": error,
                "text-green-600": success,
              }
            )}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        {label && (
          <span className="text-foreground select-none text-sm">{label}</span>
        )}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";
