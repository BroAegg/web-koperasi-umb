import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* Fix workspace root warning */
  outputFileTracingRoot: path.join(__dirname),
  
  /* Production optimizations for cPanel */
  output: 'standalone',
  
  /* Disable strict ESLint during build */
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  /* TypeScript configuration */
  typescript: {
    ignoreBuildErrors: false,
  },
  
  /* Image optimization for cPanel */
  images: {
    unoptimized: true, // Disable built-in image optimization for cPanel compatibility
  },
  
  /* Experimental features */
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  /* Security Headers */
  async headers() {
    return [
      {
        // Apply to all API routes
        source: '/api/:path*',
        headers: [
          // CORS - Allow requests from mekarmukti.id
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: process.env.NODE_ENV === 'production' ? 'https://mekarmukti.id' : '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
          // Security headers
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        // Apply to all routes
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
