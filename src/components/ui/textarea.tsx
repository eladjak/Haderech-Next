/**
 * Textarea Component
 *
 * A customizable textarea component with RTL support and consistent styling.
 *
 * @example
 * ```tsx
 * <Textarea
 *   placeholder="הזן את ההודעה שלך"
 *   onChange={(e) => console.log(e.target.value)}
 * />
 * ```
 */

import clsx from "clsx";
import React from "react";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** האם הטקסט אזור במצב שגיאה */
  error?: boolean;
  /** האם הטקסט אזור במצב הצלחה */
  success?: boolean;
  /** האם הטקסט אזור יתרחב אוטומטית לפי התוכן */
  autoResize?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, success, autoResize, className, onChange, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
    const [height, setHeight] = React.useState<number | undefined>(undefined);

    React.useImperativeHandle(ref, () => textareaRef.current!);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoResize) {
        e.target.style.height = "auto";
        e.target.style.height = `${e.target.scrollHeight}px`;
        setHeight(e.target.scrollHeight);
      }
      onChange?.(e);
    };

    React.useEffect(() => {
      if (autoResize && textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        setHeight(textareaRef.current.scrollHeight);
      }
    }, [autoResize]);

    return (
      <textarea
        ref={textareaRef}
        style={height ? { height } : undefined}
        className={clsx(
          "w-full rounded-md border transition-colors",
          "focus:outline-none focus:ring-2",
          "min-h-[80px] p-3 text-base",
          {
            "border-border-medium focus:border-brand-primary focus:ring-brand-primary/20":
              !error && !success,
            "border-action-error focus:border-action-error focus:ring-action-error/20":
              error,
            "border-action-success focus:border-action-success focus:ring-action-success/20":
              success,
            "resize-none": autoResize,
          },
          className,
        )}
        onChange={handleChange}
        {...props}
      />
    );
  },
);

Textarea.displayName = "Textarea";
