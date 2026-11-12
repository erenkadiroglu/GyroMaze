export interface PairingLocation {
  origin: string;
  hostname: string;
  port?: string;
}

export interface ResolveBaseUrlOptions {
  tunnelUrl?: string | null;
  lanIp?: string | null;
  location: PairingLocation;
}

export interface ResolvedBaseUrl {
  activeBaseUrl: string;
  routeLabel: string;
}

/**
 * Kontrolcü bağlantısı için en güvenilir temel URL'i ve kullanıcıya
 * gösterilecek rota açıklamasını belirler.
 * Öncelik sırası:
 * 1. HTTPS tüneli (ngrok vb.) -> Dış ağlar ve mobil sensörler için en iyisi.
 * 2. Yerel Wi-Fi LAN IP (loopback durumunda) -> Aynı ağdaki telefonlar için.
 * 3. Tarayıcının mevcut adresi (`window.location.origin`).
 */
export function resolveControllerBaseUrl(
  options: ResolveBaseUrlOptions,
): ResolvedBaseUrl {
  const { tunnelUrl, lanIp, location } = options;

  if (tunnelUrl && tunnelUrl.trim()) {
    return {
      activeBaseUrl: tunnelUrl.trim().replace(/\/+$/, ''),
      routeLabel: 'Güvenli HTTPS tüneli aktif (ngrok)',
    };
  }

  const hostname = (location.hostname ?? '').toLowerCase();
  const isLocalLoopback =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname === '[::1]';

  if (isLocalLoopback && lanIp && lanIp.trim()) {
    const portPart = location.port ? `:${location.port}` : '';
    return {
      activeBaseUrl: `http://${lanIp.trim()}${portPart}`,
      routeLabel: `Yerel Wi-Fi ağı (${lanIp.trim()}) • HTTP’de dokunmatik gimbal hazırdır`,
    };
  }

  return {
    activeBaseUrl: (location.origin ?? 'http://localhost:3000').replace(
      /\/+$/,
      '',
    ),
    routeLabel: 'Geçerli tarayıcı adresi kullanılıyor',
  };
}

/**
 * Mobil kontrolcü tam URL'ini oda kodu ve isteğe bağlı oyuncu yuvası (P2) ile oluşturur.
 */
export function buildControllerUrl(
  baseUrl: string,
  roomId?: string | null,
  playerSlot?: 1 | 2,
): string {
  const cleanBase = (baseUrl ?? '').trim().replace(/\/+$/, '');
  const base = cleanBase ? `${cleanBase}/controller` : '/controller';
  const cleanRoom = (roomId ?? '').trim().toUpperCase();

  if (!cleanRoom) {
    return base;
  }

  const params = new URLSearchParams();
  params.set('room', cleanRoom);
  if (playerSlot === 2) {
    params.set('slot', '2');
  }

  return `${base}?${params.toString()}`;
}
