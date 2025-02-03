"use client";

import * as React from "react";
import { ChevronUp } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ScrollToTopProps extends React.HTMLAttributes<HTMLButtonElement> {
  showAfter?: number;
}

const ScrollToTop = React.forwardRef<HTMLButtonElement, ScrollToTopProps>(
  ({ className, showAfter = 100, ...props }, ref) => {
    const [show, setShow] = React.useState(false);

    React.useEffect(() => {
      const handleScroll = () => {
        if (window.scrollY > showAfter) {
          setShow(true);
        } else {
          setShow(false);
        }
      };

      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }, [showAfter]);

    const handleClick = () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (!show) return null;

    return (
      <Button
        ref={ref}
        variant="outline"
        size="icon"
        className={cn(
          "fixed bottom-4 left-4 z-50 rounded-full shadow-md transition-opacity duration-300",
          className,
        )}
        onClick={handleClick}
        {...props}
      >
        <ChevronUp className="h-4 w-4" />
        <span className="sr-only">גלול למעלה</span>
      </Button>
    );
  },
);
ScrollToTop.displayName = "ScrollToTop";

export { ScrollToTop };
