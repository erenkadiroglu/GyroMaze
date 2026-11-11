import type { NextConfig } from 'next';

/**
 * GyroMaze Next.js yapılandırması.
 * Tek port üzerinden (3000) hem Next.js arayüzünü hem de NestJS Socket.io (4000)
 * bağlantılarını sunabilmek için skipTrailingSlashRedirect ve /socket.io/ rewrite kuralları tanımlanmıştır.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three', '@gyromaze/shared'],
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      {
        source: '/socket.io',
        destination: 'http://127.0.0.1:4000/socket.io/',
      },
      {
        source: '/socket.io/',
        destination: 'http://127.0.0.1:4000/socket.io/',
      },
      {
        source: '/socket.io/:path*',
        destination: 'http://127.0.0.1:4000/socket.io/:path*',
      },
    ];
  },
};

export default nextConfig;
