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
    formats: ["image/avif", "image/webp"],
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
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // NOTE: *.clerk.accounts.dev is REQUIRED for Clerk dev-instance keys
              // (pk_test). Without it clerk-js is CSP-blocked -> ConvexProviderWithClerk
              // never resolves -> every Convex query hangs (empty catalog/simulator).
              // Found+fixed 2026-07-05; this was the real cause behind the
              // "failed_to_load_clerk_js_timeout" noted in Phase 18.
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.com https://*.clerk.dev https://*.clerk.accounts.dev https://challenges.cloudflare.com https://*.googletagmanager.com https://*.google-analytics.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://*.clerk.com https://*.clerk.dev https://*.clerk.accounts.dev https://img.clerk.com https://images.clerk.dev https://*.convex.cloud https://*.google-analytics.com https://*.googletagmanager.com",
              // wss://*.convex.cloud is REQUIRED: an https:// source does NOT
              // match wss:// in Chrome, so without it the Convex sync WebSocket
              // is CSP-blocked and every useQuery hangs forever (verified
              // 2026-07-05: page fetch to convex OK, WebSocket -> WS_ERROR).
              "connect-src 'self' https://*.clerk.com https://*.clerk.dev https://*.clerk.accounts.dev https://*.convex.cloud wss://*.convex.cloud https://challenges.cloudflare.com https://*.google-analytics.com https://*.googletagmanager.com",
              "frame-src 'self' https://*.clerk.com https://*.clerk.dev https://*.clerk.accounts.dev https://challenges.cloudflare.com https://www.youtube.com https://www.youtube-nocookie.com",
              "media-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
              "worker-src 'self' blob:",
            ].join("; "),
          },
        ],
      },
    ];
  },

  // ביצועים
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
};

export default nextConfig;
