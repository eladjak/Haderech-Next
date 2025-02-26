import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * @file noise.tsx
 * @description A component that creates an interactive noise effect using HTML5 Canvas.
 * The noise pattern can respond to mouse movement, creating a dynamic and engaging visual effect.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Noise />
 *
 * // Custom configuration
 * <Noise
 *   color="#000000"
 *   opacity={0.08}
 *   speed={3}
 *   interactive={true}
 * />
 *
 * // Non-interactive noise background
 * <div className="relative">
 *   <Noise interactive={false} opacity={0.03} />
 *   <main>Content</main>
 * </div>
 * ```
 */

("use client");

interface NoiseProps extends React.HTMLAttributes<HTMLDivElement> {
  /** עוצמת הרעש */
  intensity?: number;
  /** גודל הרעש */
  size?: number;
  /** מהירות האנימציה */
  speed?: number;
}

/**
 * קומפוננטת רעש אנימטיבי
 */
export function Noise({
  intensity = 0.5,
  size = 100,
  speed = 1,
  className,
  ...props
}: NoiseProps): React.ReactElement {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [context, setContext] = React.useState<CanvasRenderingContext2D | null>(
    null
  );

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setContext(ctx);
  }, []);

  React.useEffect(() => {
    if (!context) return;

    const width = context.canvas.width;
    const height = context.canvas.height;
    const imageData = context.createImageData(width, height);
    const data = imageData.data;

    let frame = 0;
    let animationFrameId: number;

    const render = () => {
      frame = (frame + speed) % 1000;

      for (let i = 0; i < data.length; i += 4) {
        const x = (i / 4) % width;
        const y = Math.floor(i / 4 / width);

        const r = Math.random() * 255 * intensity;
        const g = Math.random() * 255 * intensity;
        const b = Math.random() * 255 * intensity;
        const a = Math.random() * 255 * intensity;

        const s = size;
        const n =
          (Math.sin((x / s + frame / 100) * Math.PI * 2) +
            Math.sin((y / s + frame / 100) * Math.PI * 2)) /
          2;

        data[i] = r * n;
        data[i + 1] = g * n;
        data[i + 2] = b * n;
        data[i + 3] = a * n;
      }

      context.putImageData(imageData, 0, 0);
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [context, intensity, size, speed]);

  return (
    <div className={cn("relative overflow-hidden", className)} {...props}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        width={32}
        height={32}
      />
    </div>
  );
}
