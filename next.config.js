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
    removeConsole: process.env.NODE_ENV === "production",
  },
  images: {
    formats: ["image/avif", "image/webp"],
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
    ],
    instrumentationHook: true,
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

    // SWC optimizations in production
    if (!dev) {
      config.optimization.minimizer = [];
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
