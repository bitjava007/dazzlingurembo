import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@dazzling/ui', '@dazzling/utils', '@dazzling/types'],
  output: 'standalone',
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.dazzlingurembo.com',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['@dazzling/ui', 'lucide-react'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
