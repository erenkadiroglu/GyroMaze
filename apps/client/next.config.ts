import type { NextConfig } from 'next';

/**
 * GyroMaze Next.js yapılandırması.
 * Tek port üzerinden (3000) hem Next.js arayüzünü hem de NestJS Socket.io (4000)
 * bağlantılarını sunabilmek için /socket.io proxy (rewrite) kuralı tanımlanmıştır.
 * Bu sayede HTTPS tünelleri (ngrok vb.) ve güvenlik duvarları arkasında mobil cihazlar
 * ikinci bir porta ihtiyaç duymadan doğrudan bağlanabilir.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three', '@gyromaze/shared'],
  async rewrites() {
    return [
      {
        source: '/socket.io/:path*',
        destination: 'http://127.0.0.1:4000/socket.io/:path*',
      },
    ];
  },
};

export default nextConfig;
