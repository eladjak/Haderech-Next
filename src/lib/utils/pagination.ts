import { NextRequest } from "next/server";

/**
 * @file pagination.ts
 * @description Pagination utilities for API endpoints
 */

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Extracts and validates pagination parameters from the request URL
 *
 * @param request - The Next.js request object
 * @returns PaginationParams with validated page, limit, and calculated offset
 *
 * @example
 * const { page, limit, offset } = getPaginationParams(request);
 * // Default: page=1, limit=20, offset=0
 * // URL: ?page=2&limit=50 -> page=2, limit=50, offset=50
 */
export function getPaginationParams(request: NextRequest): PaginationParams {
  const { searchParams } = new URL(request.url);

  // Parse and validate page (minimum 1)
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));

  // Parse and validate limit (minimum 1, maximum 100)
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));

  // Calculate offset for database query
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Creates a standardized pagination response object
 *
 * @param data - Array of data items for the current page
 * @param total - Total number of items across all pages
 * @param params - Pagination parameters used for the query
 * @returns PaginatedResponse with data and pagination metadata
 *
 * @example
 * const response = createPaginationResponse(posts, 150, { page: 2, limit: 20, offset: 20 });
 * // Returns: { data: [...], pagination: { page: 2, limit: 20, total: 150, totalPages: 8, hasNext: true, hasPrev: true } }
 */
export function createPaginationResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginatedResponse<T> {
  return {
    data,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages: Math.ceil(total / params.limit),
      hasNext: params.offset + params.limit < total,
      hasPrev: params.page > 1,
    },
  };
}
