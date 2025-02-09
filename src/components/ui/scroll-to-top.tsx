"use client";

import { ArrowUp } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function ScrollToTop(): React.ReactElement {
  const [isVisible, setIsVisible] = React.useState(false);

  const toggleVisibility = (): void => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = (): void => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  React.useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        "fixed bottom-4 right-4 z-50 rounded-full transition-opacity duration-200",
        isVisible ? "opacity-100" : "opacity-0",
      )}
      onClick={scrollToTop}
    >
      <ArrowUp className="h-4 w-4" />
    </Button>
  );
}

export { ScrollToTop };
