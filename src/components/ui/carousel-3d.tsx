"use client"

import * as React from "react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Carousel3DProps extends React.HTMLAttributes<HTMLDivElement> {
  items: React.ReactNode[]
  initialActive?: number
  perspective?: number
  radius?: number
  showControls?: boolean
  autoRotate?: boolean
  rotateInterval?: number
}

const Carousel3D = React.forwardRef<HTMLDivElement, Carousel3DProps>(
  ({
    className,
    items,
    initialActive = 0,
    perspective = 1000,
    radius = 400,
    showControls = true,
    autoRotate = false,
    rotateInterval = 3000,
    ...props
  }, ref) => {
    const [active, setActive] = React.useState(initialActive)
    const itemCount = items.length
    const theta = 360 / itemCount
    const containerRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
      if (autoRotate) {
        const timer = setInterval(() => {
          setActive((prev) => (prev + 1) % itemCount)
        }, rotateInterval)
        return () => clearInterval(timer)
      }
    }, [autoRotate, itemCount, rotateInterval])

    const rotate = (direction: number) => {
      setActive((prev) => {
        let next = prev + direction
        if (next >= itemCount) next = 0
        if (next < 0) next = itemCount - 1
        return next
      })
    }

    return (
      <div
        ref={ref}
        className={cn("relative h-[400px] w-full select-none", className)}
        {...props}
      >
        <div
          ref={containerRef}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            perspective: `${perspective}px`,
            transformStyle: "preserve-3d",
          }}
        >
          <motion.div
            animate={{ rotateY: active * -theta }}
            transition={{ duration: 0.5 }}
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              transformStyle: "preserve-3d",
            }}
          >
            {items.map((item, i) => (
              <div
                key={i}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{
                  transform: `rotateY(${i * theta}deg) translateZ(${radius}px)`,
                  transformStyle: "preserve-3d",
                  backfaceVisibility: "hidden",
                }}
              >
                {item}
              </div>
            ))}
          </motion.div>
        </div>

        {showControls && (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => rotate(-1)}
              className="rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">הקודם</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => rotate(1)}
              className="rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">הבא</span>
            </Button>
          </div>
        )}
      </div>
    )
  }
)
Carousel3D.displayName = "Carousel3D"

export { Carousel3D } 
