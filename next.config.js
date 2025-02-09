/** @type {import('next').NextConfig} */

const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      "lh3.googleusercontent.com",
      "avatars.githubusercontent.com",
      "res.cloudinary.com",
      "images.unsplash.com",
    ],
    unoptimized: true,
  },
  swcMinify: false,
};

module.exports = nextConfig;
