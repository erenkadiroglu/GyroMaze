/**
 * HUD Durum, Süre ve Bağlantı Yardımcıları
 */

/**
 * İki yıldız barajına göre Süreye Karşı (Time Attack) modunun azami süresini hesaplar.
 * Formül: max(14, round(twoStarLimit * 1.15))
 */
export function calculateTimeAttackLimit(starThresholds?: [number, number]): number {
  const [, twoStarLimit] = starThresholds ?? [15, 24];
  return Math.max(14, Math.round(twoStarLimit * 1.15));
}

/**
 * Süreye Karşı modu için kalan süreyi hesaplar ve 0'ın altına inmesini engeller.
 */
export function calculateTimeRemaining(limit: number, elapsed: number): number {
  return Math.max(0, Number((limit - elapsed).toFixed(1)));
}

/**
 * Süre değerine ve oyun moduna göre arayüz metin rengi sınıfını belirler.
 */
export function resolveTimerColorClass(isTimeAttack: boolean, timeRemaining: number): string {
  if (!isTimeAttack) return 'text-fg';
  if (timeRemaining <= 4) return 'text-danger';
  if (timeRemaining <= 8) return 'text-warn';
  return 'text-fg';
}

/**
 * Socket.IO sunucusu ve kontrolcü bağlantı durumuna göre renk ve metin sınıflandırır.
 */
export function resolveConnectionStatus(
  isSocketConnected: boolean,
  isControllerPaired: boolean,
  isSecondControllerPaired: boolean = false,
): {
  isAnyPaired: boolean;
  dotColor: string;
  statusLabel: string;
} {
  const isAnyPaired = isSocketConnected && (isControllerPaired || isSecondControllerPaired);
  if (isAnyPaired) {
    return {
      isAnyPaired: true,
      dotColor: 'bg-ok',
      statusLabel: 'Kontrolcü bağlı',
    };
  }
  if (isSocketConnected) {
    return {
      isAnyPaired: false,
      dotColor: 'bg-brass',
      statusLabel: 'Sunucuya bağlı, eşleşme bekleniyor',
    };
  }
  return {
    isAnyPaired: false,
    dotColor: 'bg-danger',
    statusLabel: 'Bağlantı kesildi',
  };
}

/**
 * Kristal toplama ve portal kilit durumunu insan okunabilir ipucu ve durumla formatlar.
 */
export function formatPortalStatus(
  totalCrystals: number,
  collectedCount: number,
): {
  isUnlocked: boolean;
  tooltip: string;
  ratioText: string;
} {
  const isUnlocked = collectedCount >= totalCrystals;
  const remaining = Math.max(0, totalCrystals - collectedCount);
  const tooltip = isUnlocked
    ? 'Hedef portalı açık'
    : `Portalı açmak için ${remaining} kristal kaldı`;
  const ratioText = `${collectedCount}/${totalCrystals}`;

  return { isUnlocked, tooltip, ratioText };
}

/**
 * Kamera moduna göre insan okunabilir Türkçe etiket döner.
 */
export function formatCameraModeLabel(cameraMode: 'isometric' | 'topdown' | 'follow'): string {
  switch (cameraMode) {
    case 'isometric':
      return 'İzometrik';
    case 'topdown':
      return 'Üstten';
    case 'follow':
      return 'Takip';
    default:
      return 'Kamera';
  }
}

/**
 * Oyun içi sayacın aktif olarak çalışıp çalışmayacağını denetler.
 */
export function shouldRunGameTimer(
  gameStatus: string,
  isAnyOverlayOpen: boolean,
  isPageHidden: boolean,
): boolean {
  return gameStatus === 'playing' && !isAnyOverlayOpen && !isPageHidden;
}

/**
 * Süreye Karşı modunda azami sürenin aşılıp aşılmadığını doğrular.
 */
export function isTimerExpired(
  isTimeAttack: boolean,
  elapsed: number,
  limit: number,
): boolean {
  return isTimeAttack && elapsed >= limit;
}

/**
 * Süreye Karşı modunda kalan son 5 saniyede metronom uyarısı verilip verilmeyeceğini denetler.
 */
export function shouldWarnTimerTick(
  isTimeAttack: boolean,
  remainingCeil: number,
  lastWarnedSecond: number | null,
): boolean {
  return (
    isTimeAttack &&
    remainingCeil <= 5 &&
    remainingCeil > 0 &&
    lastWarnedSecond !== remainingCeil
  );
}

/**
 * Sahne üstü HUD bildirim tonuna göre CSS sınır ve metin renk sınıflarını çözümler.
 */
export function resolveHudNotificationTone(
  tone?: 'info' | 'warn' | 'success',
): { borderClass: string; textClass: string } {
  switch (tone) {
    case 'warn':
      return { borderClass: 'border-warn/50', textClass: 'text-warn' };
    case 'success':
      return { borderClass: 'border-ok/50', textClass: 'text-ok' };
    case 'info':
    default:
      return { borderClass: 'border-signal/50', textClass: 'text-fg' };
  }
}

