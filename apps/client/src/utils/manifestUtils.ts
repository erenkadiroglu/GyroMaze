export interface ManifestIcon {
  src: string;
  sizes?: string;
  type?: string;
  purpose?: 'any' | 'maskable' | 'monochrome';
}

export interface ManifestShortcut {
  name: string;
  short_name: string;
  url: string;
}

export interface AppManifestData {
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  orientation: 'portrait' | 'landscape' | 'any';
  background_color: string;
  theme_color: string;
  icons: ManifestIcon[];
  shortcuts: ManifestShortcut[];
}

export const DEFAULT_MANIFEST_ICONS: ManifestIcon[] = [
  {
    src: '/icon.svg',
    sizes: 'any',
    type: 'image/svg+xml',
    purpose: 'maskable',
  },
];

export const DEFAULT_MANIFEST_SHORTCUTS: ManifestShortcut[] = [
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
];

/**
 * PWA manifest (webmanifest) yapılandırmasını üretir.
 */
export function buildAppManifest(): AppManifestData {
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
    icons: [...DEFAULT_MANIFEST_ICONS],
    shortcuts: [...DEFAULT_MANIFEST_SHORTCUTS],
  };
}
