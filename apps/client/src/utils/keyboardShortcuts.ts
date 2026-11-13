export type ShortcutAction =
  | 'help'
  | 'reset'
  | 'camera'
  | 'mute'
  | 'theme'
  | 'editor'
  | 'leaderboard'
  | 'pairing'
  | 'calibrate'
  | { type: 'level'; level: number };

export interface ResolveShortcutOptions {
  key: string;
  code?: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  repeat?: boolean;
  isInputFocused?: boolean;
  isGameOver?: boolean;
  isAnyOverlayOpen?: boolean;
  isHelpOpen?: boolean;
}

/**
 * Masaüstü sahnesi için klavye girdisini çözümleyip ilgili oyun/HUD eylemine dönüştürür.
 * Giriş alanı odağı, değiştirici tuşlar ve açık modal durumlarını dikkate alır.
 */
export function resolveKeyboardShortcut(
  opts: ResolveShortcutOptions,
): ShortcutAction | null {
  if (
    opts.repeat ||
    opts.ctrlKey ||
    opts.metaKey ||
    opts.altKey ||
    opts.isInputFocused
  ) {
    return null;
  }

  const rawKey = opts.key;
  const lowerKey = rawKey.toLowerCase();

  // Yardım / Kısayol modalı her zaman H veya ? tuşuyla açılıp kapanabilir
  if (rawKey === '?' || lowerKey === 'h') {
    return 'help';
  }

  // Oyun sonlandıysa veya bir modal açıksa diğer kısayollar engellenir
  if (opts.isGameOver || opts.isAnyOverlayOpen) {
    return null;
  }

  if (lowerKey === 'r') return 'reset';
  if (lowerKey === 'c') return 'camera';
  if (lowerKey === 'm') return 'mute';
  if (lowerKey === 'l') return 'theme';
  if (lowerKey === 'e') return 'editor';
  if (lowerKey === 'k') return 'leaderboard';
  if (lowerKey === 'p') return 'pairing';
  if (rawKey === ' ' || opts.code === 'Space') return 'calibrate';

  if (rawKey >= '1' && rawKey <= '5') {
    const lvl = parseInt(rawKey, 10);
    return { type: 'level', level: lvl };
  }

  return null;
}

export interface ShortcutGuideItem {
  keys: string[];
  description: string;
}

export interface ShortcutGuideGroup {
  id: string;
  title: string;
  icon: 'movement' | 'camera' | 'menu';
  items: ShortcutGuideItem[];
}

export const SHORTCUT_GUIDE_GROUPS: ShortcutGuideGroup[] = [
  {
    id: 'movement',
    title: 'Bilye Hareketi ve Fizik',
    icon: 'movement',
    items: [
      {
        keys: ['W', 'A', 'S', 'D'],
        description: 'Bilyeyi yönlendir (Sanal eğim)',
      },
      {
        keys: ['↑', '←', '↓', '→'],
        description: 'Alternatif yön tuşları',
      },
      {
        keys: ['Space'],
        description: 'Merkezi kalibre et / duraklat',
      },
      {
        keys: ['R'],
        description: 'Topu başlangıç noktasına sıfırla',
      },
    ],
  },
  {
    id: 'camera',
    title: 'Kamera ve Görsel Tema',
    icon: 'camera',
    items: [
      {
        keys: ['C'],
        description: 'Kamera modu (İzometrik / Üstten / Takip)',
      },
      {
        keys: ['L'],
        description: 'Aydınlık / Karanlık renk paleti',
      },
      {
        keys: ['M'],
        description: 'Ses efektlerini aç / kapat',
      },
      {
        keys: ['Esc'],
        description: 'Açık menü ve pencereleri kapat',
      },
    ],
  },
  {
    id: 'menu',
    title: 'Hızlı Erişim ve Menüler',
    icon: 'menu',
    items: [
      {
        keys: ['1', '—', '5'],
        description: 'Standart bölümlere doğrudan geç',
      },
      {
        keys: ['E'],
        description: 'Harita Editörünü aç (Portal, Lazer, Rampa)',
      },
      {
        keys: ['K'],
        description: 'Küresel Skor Tablosu',
      },
      {
        keys: ['P'],
        description: 'Telefon Eşleştirme QR penceresi',
      },
    ],
  },
];

export interface MobileGuideFeature {
  id: string;
  title: string;
  description: string;
  badge?: string;
  icon: 'gyro' | 'touch' | 'multiplayer';
}

export const MOBILE_GUIDE_FEATURES: MobileGuideFeature[] = [
  {
    id: 'gyro',
    title: 'Jiroskop',
    description:
      'Telefonunuzu elinizde eğerek labirenti üç boyutta sıfır gecikmeyle kontrol edin.',
    icon: 'gyro',
  },
  {
    id: 'touch',
    title: 'Dokunmatik Gimbal',
    description:
      'Sensör izni verilmeyen veya HTTP ortamlarında ekrana dokunup sürükleyerek yönlendirin.',
    icon: 'touch',
  },
  {
    id: 'multiplayer',
    title: 'Çok Oyunculu',
    description:
      'İki telefon bağlayarak 1. ve 2. oyuncu bilyeleriyle eşzamanlı yarışın.',
    badge: '2P',
    icon: 'multiplayer',
  },
];

/**
 * Ekran okuyucular için tuş kombinasyonunu sesli okunabilir metne dönüştürür.
 */
export function formatShortcutKeyAriaLabel(keys: string[]): string {
  if (!keys || keys.length === 0) return 'Kısayol tuşu atanmamış';
  return `Kısayol: ${keys.join(' + ')}`;
}

/**
 * Kısayol grubu simgesinin tema renk sınıfını döner.
 */
export function resolveShortcutGroupIconColor(
  iconType: 'movement' | 'camera' | 'menu',
): string {
  switch (iconType) {
    case 'movement':
      return 'text-brass';
    case 'camera':
      return 'text-signal';
    case 'menu':
      return 'text-ok';
    default:
      return 'text-fg';
  }
}


