import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React Strict Mode for catching potential issues
  reactStrictMode: false,

  eslint:{
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  

  // Optimize image handling
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // Add any remote image domains you're using
      // { protocol: 'https', hostname: 'example.com' }
    ],
  },

  // Configure webpack for additional optimizations
  webpack: (config, { isServer }) => {
    // Minimize CSS
    config.optimization.minimizer = config.optimization.minimizer || [];

    // Add source map support for better debugging
    if (!isServer) {
      config.devtool = 'source-map';
    }

    return config;
  },

  // Compiler options for enhanced performance and compatibility
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,

    // Enable React's experimental features
    reactRemoveProperties: process.env.NODE_ENV === 'production',

  },

  // Performance optimizations
  poweredByHeader: false,
  productionBrowserSourceMaps: false,

  // Configure environment variables
  env: {
    // You can add global environment variables here
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },

  // Redirects and rewrites (if needed)
  async redirects() {
    return [
      // Example redirect
      // {
      //   source: '/old-path',
      //   destination: '/new-path',
      //   permanent: true,
      // }
    ];
  },

  // Configure headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Security headers
          { 
            key: 'X-Content-Type-Options', 
            value: 'nosniff' 
          },
          { 
            key: 'X-Frame-Options', 
            value: 'SAMEORIGIN' 
          },
          { 
            key: 'Referrer-Policy', 
            value: 'strict-origin-when-cross-origin' 
          },
          // Performance and caching headers
          { 
            key: 'Cache-Control', 
            value: 'public, max-age=31536000, immutable' 
          },
        ],
      },
    ];
  },
};

export default nextConfig;
