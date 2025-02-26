import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

("use client");

interface Carousel3DProps {
  items: React.ReactNode[];
  className?: string;
  autoPlay?: boolean;
  interval?: number;
}

export function Carousel3D({
  items,
  className,
  autoPlay = false,
  interval = 3000,
}: Carousel3DProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [_isHovered, setIsHovered] = React.useState(false);

  const nextSlide = React.useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  React.useEffect(() => {
    if (!autoPlay) return;

    const timeoutId = window.setInterval(nextSlide, interval);

    return () => window.clearInterval(timeoutId);
  }, [interval, nextSlide, autoPlay]);

  return (
    <div
      className={cn("relative h-[400px] w-full", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="perspective-1000 relative h-full w-full">
        {items.map((item, index) => {
          const offset =
            ((index - activeIndex + items.length) % items.length) -
            Math.floor(items.length / 2);
          const isActive = index === activeIndex;
          const zIndex = items.length - Math.abs(offset);

          return (
            <div
              key={index}
              className={cn(
                "absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 transform-gpu transition-all duration-500",
                isActive && "z-10"
              )}
              style={{
                transform: `
                  translate(-50%, -50%)
                  translateX(${offset * 60}%)
                  scale(${1 - Math.abs(offset) * 0.2})
                  translateZ(${-Math.abs(offset) * 100}px)
                `,
                opacity: 1 - Math.abs(offset) * 0.3,
                zIndex,
              }}
            >
              {item}
            </div>
          );
        })}
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="absolute left-4 top-1/2 -translate-y-1/2 transform"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">הקודם</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="absolute right-4 top-1/2 -translate-y-1/2 transform"
        onClick={nextSlide}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">הבא</span>
      </Button>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 transform gap-2">
        {items.map((_, index) => (
          <button
            key={index}
            className={cn(
              "h-2 w-2 rounded-full transition-all",
              index === activeIndex
                ? "bg-primary"
                : "bg-primary/20 hover:bg-primary/40"
            )}
            onClick={() => setActiveIndex(index)}
          >
            <span className="sr-only">
              {index === activeIndex
                ? "שקופית נוכחית"
                : `עבור לשקופית ${index + 1}`}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
