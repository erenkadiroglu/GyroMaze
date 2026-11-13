/**
 * Titreşim (Haptik) butonunun erişilebilirlik ve ipucu metinlerini çözer.
 */
export function resolveHapticButtonLabel(isHapticEnabled: boolean): {
  ariaLabel: string;
  title: string;
} {
  return {
    ariaLabel: isHapticEnabled ? 'Titreşimi kapat' : 'Titreşimi aç',
    title: isHapticEnabled ? 'Titreşim açık' : 'Titreşim kapalı',
  };
}

/**
 * Titreşim butonunun stil sınıflarını döner.
 */
export function resolveHapticButtonClass(isHapticEnabled: boolean): string {
  return isHapticEnabled ? 'text-brass' : 'text-muted/50 opacity-60';
}

/**
 * Tema değiştirme butonunun erişilebilir etiketini döner.
 */
export function resolveThemeButtonLabel(colorScheme: 'dark' | 'light'): string {
  return colorScheme === 'light' ? 'Gece moduna geç' : 'Gündüz moduna geç';
}

/**
 * Oda kodu düzenleme butonunun metnini çözer.
 */
export function resolveRoomCodeButtonLabel(activeRoomCode: string): string {
  return activeRoomCode ? 'Kod' : 'Kod gir';
}

/**
 * Ağ bağlantı kapsülünün ekran okuyucu etiketini formatlar.
 */
export function resolveConnectionAriaLabel(
  isControllerPaired: boolean,
  isSocketConnected: boolean,
  latencyMs: number,
): string {
  if (isControllerPaired) {
    return `Bağlantı durumu: Bağlı (${latencyMs}ms)`;
  }
  if (isSocketConnected) {
    return 'Bağlantı durumu: Hazır';
  }
  return 'Bağlantı durumu: Kopuk';
}

/**
 * Oyuncu yuvasına (1P / 2P) göre renk ve kenarlık sınıflarını döner.
 */
export function resolvePlayerSlotBadgeClasses(playerSlot: 1 | 2): string {
  return playerSlot === 2
    ? 'border-warn/40 bg-warn/10 text-warn'
    : 'border-brass/40 bg-brass/10 text-brass';
}
