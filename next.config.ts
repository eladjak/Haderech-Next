import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // תמונות מ-URLs חיצוניים (Clerk avatars, course images)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "images.clerk.dev",
      },
      {
        protocol: "https",
        hostname: "*.convex.cloud",
      },
    ],
  },

  // כותרות אבטחה
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.com https://*.clerk.dev https://*.googletagmanager.com https://*.google-analytics.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://*.clerk.com https://*.clerk.dev https://img.clerk.com https://images.clerk.dev https://*.convex.cloud https://*.google-analytics.com https://*.googletagmanager.com",
              "connect-src 'self' https://*.clerk.com https://*.clerk.dev https://*.convex.cloud https://*.google-analytics.com https://*.googletagmanager.com",
              "frame-src 'self' https://*.clerk.com https://*.clerk.dev",
              "worker-src 'self' blob:",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
