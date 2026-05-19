import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: [
    '@dazzlingurembo/ui',
    '@dazzlingurembo/types',
    '@dazzlingurembo/config',
    '@dazzlingurembo/utils',
  ],
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
};

export default nextConfig;
