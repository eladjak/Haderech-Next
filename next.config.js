// Import at the top of the file
/* eslint-disable @typescript-eslint/no-var-requires */
const withBundleAnalyzer =
  process.env.ANALYZE === "true"
    ? require("@next/bundle-analyzer")()
    : (config) => config;

/** @type {import('next').NextConfig} */
let config = {
  reactStrictMode: true,
  images: {
    domains: ["localhost", "res.cloudinary.com"],
  },
  i18n: {
    locales: ["he"],
    defaultLocale: "he",
    localeDetection: false,
  },
  // הגדרות בנייה ודפים דינמיים
  // output: "standalone", // הוסר כדי למנוע בעיות symlink ב-Windows
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  experimental: {
    // serverActions: true, // הוסר כיוון שכבר כלול כברירת מחדל ב-Next.js 14
  },
  webpack: (config, { dev, isServer }) => {
    // שיפורי ביצועים
    if (!dev && !isServer) {
      Object.assign(config.resolve.alias, {
        "react/jsx-runtime.js": "preact/compat/jsx-runtime",
        react: "preact/compat",
        "react-dom/test-utils": "preact/test-utils",
        "react-dom": "preact/compat",
      });
    }

    return config;
  },
  // הגדרות אבטחה
  headers: async () => [
    {
      source: "/:path*",
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
          key: "X-Frame-Options",
          value: "SAMEORIGIN",
        },
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
        {
          key: "Referrer-Policy",
          value: "origin-when-cross-origin",
        },
      ],
    },
  ],
  // הגדרות אופטימיזציה
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  optimizeFonts: true,
  productionBrowserSourceMaps: false,
};

// Apply bundle analyzer wrapper
config = withBundleAnalyzer(config);

module.exports = config;
