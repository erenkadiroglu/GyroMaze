import type { NextConfig } from 'next';

/**
 * GyroMaze Next.js yapılandırması.
 * Gerçek zamanlı WebSocket (ws:// ve wss://) proxy işlemi server.mjs tarafından
 * doğrudan TCP soket seviyesinde (TCP_NODELAY) gerçekleştirilir.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three', '@gyromaze/shared'],
};

export default nextConfig;
