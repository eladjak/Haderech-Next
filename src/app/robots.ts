/**
 * @file robots.ts
 * @description Robots.txt configuration for search engine crawling
 * Defines which pages search engines can and cannot crawl
 */

import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/auth/callback',
          '/auth/confirm',
          '/private/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/auth/callback',
          '/auth/confirm',
          '/private/',
        ],
        crawlDelay: 0,
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/auth/callback',
          '/auth/confirm',
          '/private/',
        ],
        crawlDelay: 0,
      },
    ],
    sitemap: 'https://haderech.co.il/sitemap.xml',
  };
}
