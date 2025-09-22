import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['@prisma/client', 'prisma'],
  images: {
    domains: ['images.unsplash.com', 'pub-8b25a422bd234ffab965d339ba7bc4aa.r2.dev'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-8b25a422bd234ffab965d339ba7bc4aa.r2.dev',
        port: '',
        pathname: '/product-images/**',
      },
      {
        protocol: 'https',
        hostname: 'pub-8b25a422bd234ffab965d339ba7bc4aa.r2.dev',
        port: '',
        pathname: '/product-images_*',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000',
    NEXT_PUBLIC_WEBSITE_URL: process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://www.seengrp.com',
  },
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;