/**
 * Global configuration for all API routes
 * Forces routes to be dynamic by default
 * This file ensures all API endpoints can use dynamic features like cookies and request parameters
 */
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
