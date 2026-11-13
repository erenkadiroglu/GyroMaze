export interface KeyboardHintItemConfig {
  key: string;
  label: string;
}

/**
 * Tek oyunculu (solo) masaüstü kontrol ipuçları listesini döner.
 */
export function getSoloKeyboardHintItems(): KeyboardHintItemConfig[] {
  return [
    { key: 'WASD', label: 'Eğim' },
    { key: 'R', label: 'Sıfırla' },
    { key: 'L', label: 'Gece/Gündüz' },
  ];
}

/**
 * 1. Oyuncu (P1) için çok oyunculu klavye ipucu yapılandırmasını döner.
 */
export function getMultiplayerP1Hint(): KeyboardHintItemConfig {
  return {
    key: 'WASD',
    label: '1. Bilye',
  };
}

/**
 * 2. Oyuncu (P2) için çok oyunculu klavye ipucu yapılandırmasını döner.
 */
export function getMultiplayerP2Hint(): KeyboardHintItemConfig {
  return {
    key: 'Oklar',
    label: '2. Bilye',
  };
}

/**
 * Aktif kontrol ve çok oyunculu yuva durumuna göre ekran okuyucu özet etiketini formatlar.
 */
export function formatKeyboardHintAriaLabel(
  isMultiplayer: boolean,
  p1Needed = true,
  p2Needed = true,
): string {
  if (!isMultiplayer) {
    return 'Klavye kontrolleri: WASD ile eğim ver, R ile sıfırla, L ile tema değiştir';
  }

  if (p1Needed && p2Needed) {
    return 'Çok oyunculu klavye kontrolleri: 1. Bilye için WASD, 2. Bilye için Ok tuşları';
  }

  if (p1Needed) {
    return 'Klavye kontrolü: 1. Bilye için WASD';
  }

  if (p2Needed) {
    return 'Klavye kontrolü: 2. Bilye için Ok tuşları';
  }

  return 'Klavye kontrol ipuçları';
}

