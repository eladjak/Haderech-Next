/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  
  // Internationalization
  i18n: {
    locales: ['he', 'en'],
    defaultLocale: 'he',
    localeDetection: true
  },
  
  // Image optimization
  images: {
    domains: [
      'lh3.googleusercontent.com', // Google OAuth
      'avatars.githubusercontent.com', // GitHub
      'res.cloudinary.com', // Cloudinary
      'images.unsplash.com', // Unsplash
    ],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Headers
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  },
  
  // Redirects
  redirects: async () => {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/dashboard',
        destination: '/app/dashboard',
        permanent: true,
      }
    ]
  },
  
  // Webpack configuration
  webpack: (config, { dev, isServer }) => {
    // SVG optimization
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    })

    // Only run in production and client-side
    if (!dev && !isServer) {
      // Enable tree shaking and purging
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: true
      }
    }

    return config
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version,
  },
  
  // Experimental features
  experimental: {
    serverActions: true,
    typedRoutes: true,
    serverComponentsExternalPackages: ['@prisma/client']
  },
  
  // Compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Output options
  output: 'standalone',
  
  // Powered by header
  poweredByHeader: false,
  
  // Compression
  compress: true,
  
  // Generate ETags
  generateEtags: true,
  
  // Disable x-powered-by
  xPoweredBy: false,
} 