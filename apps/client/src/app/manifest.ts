import type { MetadataRoute } from 'next';

/**
 * GyroMaze PWA (Progressive Web App) bildirim dosyası.
 * Mobil kumanda (`/controller`) ve ana sahnenin telefon ana ekranından
 * tam ekran (`standalone`) modunda başlatılmasını sağlar.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GyroMaze — 3B Jiroskop Labirent',
    short_name: 'GyroMaze',
    description:
      'Telefon jiroskopuyla 3B WebGL labirentleri gerçek zamanlı kontrol edin.',
    start_url: '/controller',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0f1a2b',
    theme_color: '#0f1a2b',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Mobil Kumanda',
        short_name: 'Kumanda',
        url: '/controller',
      },
      {
        name: 'Masaüstü 3B Sahne',
        short_name: '3B Sahne',
        url: '/',
      },
    ],
  };
}

