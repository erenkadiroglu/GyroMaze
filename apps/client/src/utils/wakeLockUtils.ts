export interface WakeLockSentinelLike {
  release: () => Promise<void>;
}

export interface WakeLockNavigatorLike {
  wakeLock?: {
    request: (type: 'screen') => Promise<WakeLockSentinelLike>;
  };
}

/**
 * Tarayıcının Screen Wake Lock API'sini destekleyip desteklemediğini denetler.
 */
export function isWakeLockSupported(nav: unknown = typeof navigator !== 'undefined' ? navigator : undefined): boolean {
  if (!nav || typeof nav !== 'object') return false;
  const n = nav as WakeLockNavigatorLike;
  return typeof n.wakeLock?.request === 'function';
}

/**
 * Ekran uyanık kalma kilidinin talep edilip edilmeyeceğini kurallara göre belirler.
 */
export function shouldAcquireWakeLock(
  enabled: boolean,
  isSupported: boolean,
  visibilityState: string = typeof document !== 'undefined' ? document.visibilityState : 'visible',
): boolean {
  return enabled && isSupported && visibilityState === 'visible';
}

/**
 * Screen Wake Lock talebinde bulunur; hata veya destek yoksa null döner (çökme koruması).
 */
export async function requestScreenWakeLock(
  nav: unknown = typeof navigator !== 'undefined' ? navigator : undefined,
): Promise<WakeLockSentinelLike | null> {
  if (!isWakeLockSupported(nav)) return null;
  try {
    const n = nav as WakeLockNavigatorLike;
    return await n.wakeLock!.request('screen');
  } catch {
    // Düşük pil modu veya işletim sistemi ilkesi kısıtlamasında sessizce geç
    return null;
  }
}

/**
 * Aktif ekran kilidini güvenle serbest bırakır.
 */
export async function releaseWakeLock(
  sentinel: WakeLockSentinelLike | null | undefined,
): Promise<void> {
  if (!sentinel || typeof sentinel.release !== 'function') return;
  try {
    await sentinel.release();
  } catch {
    // Zaten serbest bırakılmışsa hatayı yoksay
  }
}

/**
 * Ekran kilidi durumuna göre erişilebilirlik (ARIA) etiketini üretir.
 */
export function resolveWakeLockAriaLabel(isActive: boolean): string {
  return isActive
    ? 'Ekran uyanık kalma kilidi aktif (ekran kararmayacak)'
    : 'Ekran uyanık kalma kilidi devre dışı';
}

/**
 * Ekran kilidi durumu ve desteğine göre kullanıcı durum mesajını üretir.
 */
export function resolveWakeLockStatusMessage(
  isActive: boolean,
  isSupported: boolean,
): string {
  if (!isSupported) {
    return 'Tarayıcınız ekran uyanık kalma kilidini desteklemiyor.';
  }
  return isActive
    ? 'Oyun boyunca ekran uyanık tutuluyor.'
    : 'Ekran kilidi pasif.';
}
