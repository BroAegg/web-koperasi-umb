import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* Fix workspace root warning */
  outputFileTracingRoot: path.join(__dirname),
  
  /* Disable strict ESLint during build */
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  /* Experimental features */
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
