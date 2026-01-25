import { logger } from "@/lib/utils/logger";

/**
 * Performance monitoring utilities for tracking Core Web Vitals and custom metrics
 *
 * Monitors:
 * - Core Web Vitals (CLS, FID, FCP, LCP, TTFB)
 * - Custom performance marks and measures
 * - Application initialization time
 *
 * @example
 * ```typescript
 * // Initialize in _app.tsx or layout.tsx
 * initMonitoring();
 * ```
 */

/**
 * Metric handler that logs performance data
 *
 * @param metric - Web Vitals metric object
 */
function handleMetric(metric: any) {
  logger.info(`Web Vital: ${metric.name}`, {
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
  });

  // In production, send to analytics service
  if (process.env.NODE_ENV === "production") {
    // Send to Google Analytics
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", metric.name, {
        event_category: "Web Vitals",
        value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
        event_label: metric.id,
        non_interaction: true,
      });
    }
  }
}

/**
 * Initializes performance monitoring for the application
 *
 * Sets up:
 * - Web Vitals tracking (CLS, FID, FCP, LCP, TTFB)
 * - Custom performance marks
 * - Load time measurements
 *
 * @example
 * ```typescript
 * // In app/layout.tsx
 * useEffect(() => {
 *   initMonitoring();
 * }, []);
 * ```
 */
export function initMonitoring() {
  if (typeof window === "undefined") {
    return;
  }

  // Web Vitals tracking
  import("web-vitals").then(({ onCLS, onFID, onFCP, onLCP, onTTFB, onINP }) => {
    onCLS(handleMetric);
    onFID(handleMetric);
    onFCP(handleMetric);
    onLCP(handleMetric);
    onTTFB(handleMetric);
    onINP(handleMetric);
  }).catch((error) => {
    logger.error("Failed to load web-vitals", error);
  });

  // Custom performance marks
  performance.mark("app-init");

  // Measure load time
  window.addEventListener("load", () => {
    performance.measure("app-load-time", "app-init");

    const measures = performance.getEntriesByType("measure");
    measures.forEach((measure) => {
      logger.info(`Performance: ${measure.name}`, {
        duration: measure.duration,
      });
    });

    // Navigation timing
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    if (navigation) {
      logger.info("Navigation timing", {
        dns: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcp: navigation.connectEnd - navigation.connectStart,
        ttfb: navigation.responseStart - navigation.requestStart,
        download: navigation.responseEnd - navigation.responseStart,
        domInteractive: navigation.domInteractive - navigation.fetchStart,
        domComplete: navigation.domComplete - navigation.fetchStart,
        loadComplete: navigation.loadEventEnd - navigation.fetchStart,
      });
    }
  });

  // Resource timing (only log slow resources)
  window.addEventListener("load", () => {
    const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    const slowResources = resources.filter((resource) => resource.duration > 1000);

    if (slowResources.length > 0) {
      logger.warn(`Found ${slowResources.length} slow resources`, {
        resources: slowResources.map((r) => ({
          name: r.name,
          duration: r.duration,
          size: r.transferSize,
        })),
      });
    }
  });
}

/**
 * Creates a custom performance mark
 *
 * @param name - Name of the performance mark
 *
 * @example
 * ```typescript
 * markPerformance('data-fetch-start');
 * // ... fetch data
 * measurePerformance('data-fetch', 'data-fetch-start');
 * ```
 */
export function markPerformance(name: string) {
  if (typeof window !== "undefined" && performance.mark) {
    performance.mark(name);
  }
}

/**
 * Measures time between performance marks
 *
 * @param name - Name of the measurement
 * @param startMark - Name of the start mark
 * @param endMark - Optional name of end mark (defaults to now)
 *
 * @returns Duration in milliseconds or undefined if measurement failed
 *
 * @example
 * ```typescript
 * markPerformance('api-call-start');
 * await fetchData();
 * const duration = measurePerformance('api-call', 'api-call-start');
 * console.log(`API call took ${duration}ms`);
 * ```
 */
export function measurePerformance(
  name: string,
  startMark: string,
  endMark?: string
): number | undefined {
  if (typeof window === "undefined" || !performance.measure) {
    return undefined;
  }

  try {
    performance.measure(name, startMark, endMark);
    const measure = performance.getEntriesByName(name, "measure")[0];

    logger.debug(`Performance measure: ${name}`, {
      duration: measure.duration,
    });

    return measure.duration;
  } catch (error) {
    logger.error(`Failed to measure performance: ${name}`, error);
    return undefined;
  }
}

/**
 * Clears all performance marks and measures
 *
 * @example
 * ```typescript
 * clearPerformanceMetrics();
 * ```
 */
export function clearPerformanceMetrics() {
  if (typeof window !== "undefined") {
    performance.clearMarks();
    performance.clearMeasures();
  }
}

/**
 * Gets all performance entries of a specific type
 *
 * @param type - Type of performance entries to retrieve
 * @returns Array of performance entries
 *
 * @example
 * ```typescript
 * const navigationTimings = getPerformanceEntries('navigation');
 * const resources = getPerformanceEntries('resource');
 * ```
 */
export function getPerformanceEntries(
  type: "navigation" | "resource" | "mark" | "measure" | "paint"
): PerformanceEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  return performance.getEntriesByType(type);
}
