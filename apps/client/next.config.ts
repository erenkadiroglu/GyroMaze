import type { NextConfig } from 'next';

/**
 * GyroMaze Next.js yapılandırması.
 * Three.js ve paylaşılan monorepo paketlerinin sorunsuz derlenmesi için transpilePackages tanımlanmıştır.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three', '@gyromaze/shared'],
};

export default nextConfig;
