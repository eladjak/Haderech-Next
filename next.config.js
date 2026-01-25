/**
 * @type {import('next').NextConfig}
 * Next.js configuration file
 *
 * Note: CommonJS syntax is used here as Next.js config doesn't support ES modules
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PHASE_DEVELOPMENT_SERVER } = require("next/constants");

// Analyze bundle size using @next/bundle-analyzer
// eslint-disable-next-line @typescript-eslint/no-var-requires
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: false,
    contentDispositionType: "attachment",
    contentSecurityPolicy:
      "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.cloudinary.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  i18n: {
    locales: ["he", "en"],
    defaultLocale: "he",
    localeDetection: false,
  },
  // הגדרות בנייה ודפים דינמיים
  // output: "standalone", // הוסר כדי למנוע בעיות symlink ב-Windows
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"],
    optimizePackageImports: [
      "@radix-ui/react-icons",
      "lucide-react",
      "date-fns",
      "@supabase/supabase-js",
      "framer-motion",
    ],
    instrumentationHook: true,
    optimizeCss: true,
    scrollRestoration: true,
  },
  webpack: (config, { dev, isServer }) => {
    // הוספת פלאגינים וכלים נוספים לווברפק
    if (!dev && isServer) {
      // הגדרות אופטימיזציה עבור הבנייה
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const webpack = require("webpack");
      config.plugins.push(
        new webpack.optimize.LimitChunkCountPlugin({
          maxChunks: 1,
        })
      );
    }

    // Production optimizations - Advanced code splitting
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        moduleIds: "deterministic",
        runtimeChunk: "single",
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            default: false,
            vendors: false,
            // Framework chunk (React, Next)
            framework: {
              name: "framework",
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|next)[\\/]/,
              priority: 40,
              enforce: true,
            },
            // UI library chunk
            ui: {
              name: "ui",
              test: /[\\/]node_modules[\\/](@radix-ui|framer-motion)[\\/]/,
              priority: 30,
            },
            // Vendor chunk
            vendor: {
              name: "vendor",
              chunks: "all",
              test: /node_modules/,
              priority: 20,
            },
            // Common chunk
            common: {
              name: "common",
              minChunks: 2,
              chunks: "all",
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
      };
    }

    return config;
  },
  // הגדרות אבטחה
  headers: async () => {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
        ],
      },
      {
        source: "/fonts/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  // הגדרות אופטימיזציה
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  optimizeFonts: true,
  productionBrowserSourceMaps: false,
};

// Apply bundle analyzer wrapper
module.exports = withBundleAnalyzer(nextConfig);
