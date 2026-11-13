import type { MetadataRoute } from 'next';
import { buildAppManifest } from '@/utils/manifestUtils';

/**
 * GyroMaze PWA (Progressive Web App) bildirim dosyası.
 * Mobil kumanda (`/controller`) ve ana sahnenin telefon ana ekranından
 * tam ekran (`standalone`) modunda başlatılmasını sağlar.
 */
export default function manifest(): MetadataRoute.Manifest {
  return buildAppManifest();
}
