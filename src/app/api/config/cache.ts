/**
 * @file cache.ts
 * @description Cache configuration constants for Next.js API routes
 *
 * This file defines revalidation strategies for different types of content
 * to optimize performance while maintaining data freshness.
 */

/**
 * Static content cache configuration (1 hour)
 *
 * Use for: Published courses, course catalogs, static pages
 * - Content changes infrequently
 * - High read volume
 * - Low consistency requirements
 */
export const STATIC_CACHE_CONFIG = {
  revalidate: 3600, // 1 hour in seconds
} as const;

/**
 * Semi-static content cache configuration (5 minutes)
 *
 * Use for: Course lists with filters, popular forum posts, trending content
 * - Content updates occasionally
 * - Moderate freshness requirements
 * - High read volume
 */
export const SEMI_STATIC_CACHE_CONFIG = {
  revalidate: 300, // 5 minutes in seconds
} as const;

/**
 * Frequent update cache configuration (1 minute)
 *
 * Use for: Forum posts, comments, real-time discussions
 * - Content updates frequently
 * - Good balance between freshness and performance
 * - Reduces database load while maintaining reasonable freshness
 */
export const FREQUENT_CACHE_CONFIG = {
  revalidate: 60, // 1 minute in seconds
} as const;

/**
 * Dynamic content configuration (no cache)
 *
 * Use for: User profiles, personalized data, authentication-dependent content
 * - Content is user-specific
 * - Must always be fresh
 * - Cannot be shared between users
 */
export const DYNAMIC_CACHE_CONFIG = {
  revalidate: 0,
  dynamic: "force-dynamic" as const,
} as const;

/**
 * Helper type for route segment config
 */
export type CacheConfig = typeof STATIC_CACHE_CONFIG | typeof SEMI_STATIC_CACHE_CONFIG | typeof FREQUENT_CACHE_CONFIG | typeof DYNAMIC_CACHE_CONFIG;
