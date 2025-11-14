import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* Fix workspace root warning */
  outputFileTracingRoot: path.join(__dirname),
  
  /* Production optimizations */
  reactStrictMode: true,
  compress: true,
  
  /* Production compiler optimizations */
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'], // Keep error and warn logs
    } : false,
  },
  
  /* Image optimization - AVIF + WebP for better performance */
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  /* Experimental optimizations */
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', '@radix-ui/react-icons'],
  },
  
  /* Security headers */
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  /* Webpack optimization */
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
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
  
  /* Disable strict ESLint during build */
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  /* TypeScript configuration */
  typescript: {
    ignoreBuildErrors: false,
  },
  
  /* Skip error pages prerendering */
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
  
  /* Skip static generation for error pages */
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
};

export default nextConfig;
