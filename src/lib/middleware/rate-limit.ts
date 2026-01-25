import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/utils/logger";

/**
 * @file rate-limit.ts
 * @description Rate limiting middleware for API routes
 * Uses in-memory storage for simplicity. For production at scale, consider Redis.
 */

// Simple in-memory rate limiter
// Note: This will reset on server restart and doesn't work across multiple instances
// For production, use Redis or a similar distributed cache
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Cleanup old entries every 10 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 10 * 60 * 1000);

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

/**
 * Creates a rate limiter middleware function
 *
 * @param config - Rate limit configuration
 * @returns Middleware function that returns NextResponse if rate limit exceeded, null otherwise
 *
 * @example
 * ```typescript
 * const limiter = rateLimit({ windowMs: 60000, maxRequests: 10 });
 *
 * export async function POST(request: NextRequest) {
 *   const rateLimitResponse = await limiter(request);
 *   if (rateLimitResponse) return rateLimitResponse;
 *
 *   // Continue with normal request handling
 * }
 * ```
 */
export function rateLimit(config: RateLimitConfig) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    // Get client identifier (IP address)
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      request.ip ||
      "unknown";

    // Create a unique key combining IP and path
    const key = `${ip}:${request.nextUrl.pathname}`;
    const now = Date.now();

    const rateLimitInfo = rateLimitMap.get(key);

    if (!rateLimitInfo || now > rateLimitInfo.resetTime) {
      // New window - reset counter
      rateLimitMap.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return null; // Allow request
    }

    if (rateLimitInfo.count >= config.maxRequests) {
      // Rate limit exceeded
      const retryAfter = Math.ceil((rateLimitInfo.resetTime - now) / 1000);

      console.warn(
        `Rate limit exceeded for ${key}. ` +
        `${rateLimitInfo.count} requests in window. ` +
        `Retry after ${retryAfter}s`
      );

      return NextResponse.json(
        {
          error: "יותר מדי בקשות. אנא נסה שוב מאוחר יותר.",
          message: "Too many requests. Please try again later.",
          retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
            "X-RateLimit-Limit": String(config.maxRequests),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(rateLimitInfo.resetTime),
          }
        }
      );
    }

    // Increment count and allow request
    rateLimitInfo.count++;
    return null;
  };
}

/**
 * Preset rate limit configurations for different API endpoint types
 */
export const apiRateLimits = {
  /**
   * Very strict limits for authentication operations
   * 5 requests per 15 minutes
   * Use for: login, register, password reset
   */
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5
  },

  /**
   * Strict limits for mutation operations (POST, PUT, DELETE)
   * 10 requests per minute
   * Use for: creating posts, comments, enrollments
   */
  strict: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10
  },

  /**
   * Standard limits for read operations
   * 60 requests per minute
   * Use for: fetching data (GET requests)
   */
  standard: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60
  },

  /**
   * Loose limits for public endpoints
   * 120 requests per minute
   * Use for: public data, search
   */
  loose: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 120
  },

  /**
   * Very strict for file uploads
   * 5 requests per hour
   * Use for: avatar uploads, file uploads
   */
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5
  },

  /**
   * Moderate limits for chat/bot interactions
   * 30 requests per minute
   * Use for: bot messages, chat
   */
  chat: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30
  },
};

/**
 * Helper function to get rate limit info without blocking
 * Useful for adding rate limit headers to responses
 */
export function getRateLimitInfo(request: NextRequest, config: RateLimitConfig) {
  const ip =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    request.ip ||
    "unknown";

  const key = `${ip}:${request.nextUrl.pathname}`;
  const rateLimitInfo = rateLimitMap.get(key);
  const now = Date.now();

  if (!rateLimitInfo || now > rateLimitInfo.resetTime) {
    return {
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      reset: now + config.windowMs,
    };
  }

  return {
    limit: config.maxRequests,
    remaining: Math.max(0, config.maxRequests - rateLimitInfo.count),
    reset: rateLimitInfo.resetTime,
  };
}

/**
 * Helper function to add rate limit headers to any response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  request: NextRequest,
  config: RateLimitConfig
): NextResponse {
  const info = getRateLimitInfo(request, config);

  response.headers.set("X-RateLimit-Limit", String(info.limit));
  response.headers.set("X-RateLimit-Remaining", String(info.remaining));
  response.headers.set("X-RateLimit-Reset", String(info.reset));

  return response;
}
