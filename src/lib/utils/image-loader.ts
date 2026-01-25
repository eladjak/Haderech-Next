/**
 * Image optimization utilities
 * Provides loaders and helpers for optimized image loading
 */

export interface ImageLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

/**
 * Cloudinary image loader
 * Optimizes images through Cloudinary CDN
 */
export const cloudinaryLoader = ({
  src,
  width,
  quality,
}: ImageLoaderProps): string => {
  const params = [
    "f_auto", // Auto format selection
    "c_limit", // Limit dimensions
    `w_${width}`,
    `q_${quality || "auto"}`,
  ];
  return `https://res.cloudinary.com/your-cloud/${params.join(",")}/${src}`;
};

/**
 * Default Next.js image loader with optimization params
 */
export const defaultImageLoader = ({
  src,
  width,
  quality,
}: ImageLoaderProps): string => {
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 75}`;
};

/**
 * Get optimized image props for Next.js Image component
 */
export const getImageProps = (
  src: string,
  alt: string,
  priority = false
) => ({
  src,
  alt,
  loading: priority ? ("eager" as const) : ("lazy" as const),
  quality: 75,
  sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  ...(priority ? { priority: true } : {}),
});

/**
 * Generate responsive image sizes string
 */
export const getResponsiveSizes = (sizes: {
  mobile?: string;
  tablet?: string;
  desktop?: string;
}): string => {
  const { mobile = "100vw", tablet = "50vw", desktop = "33vw" } = sizes;
  return `(max-width: 640px) ${mobile}, (max-width: 1024px) ${tablet}, ${desktop}`;
};

/**
 * Preload critical images
 */
export const preloadImage = (src: string, as: "image" = "image"): void => {
  if (typeof window !== "undefined") {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = as;
    link.href = src;
    document.head.appendChild(link);
  }
};

/**
 * Generate blur data URL for placeholder
 */
export const shimmer = (w: number, h: number): string => {
  return `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f6f7f8" offset="0%" />
      <stop stop-color="#edeef1" offset="20%" />
      <stop stop-color="#f6f7f8" offset="40%" />
      <stop stop-color="#f6f7f8" offset="100%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#f6f7f8" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;
};

export const toBase64 = (str: string): string =>
  typeof window === "undefined"
    ? Buffer.from(str).toString("base64")
    : window.btoa(str);

export const placeholderDataUrl = (w: number, h: number): string =>
  `data:image/svg+xml;base64,${toBase64(shimmer(w, h))}`;
