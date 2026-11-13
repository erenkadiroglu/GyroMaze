export interface CopyIconConfig {
  iconName: 'check' | 'copy';
  iconClass: string;
}

/**
 * Telefon eşleştirme modalı için standart başlık metnini döner.
 */
export function getPairingModalTitle(): string {
  return 'Telefonunu bağla';
}

/**
 * Telefon eşleştirme modalı için yönlendirici açıklama metnini döner.
 */
export function getPairingModalDescription(): string {
  return 'QR kodu okut veya 6 haneli oda kodunu kontrolcüye gir.';
}

/**
 * Sahneye devam etme butonunun metnini döner.
 */
export function getPairingProceedLabel(): string {
  return 'Sahneye geç';
}

/**
 * Kopyalama durumuna göre gösterilecek ikon tipini ve stil sınıfını çözer.
 */
export function resolveCopyIconState(isCopied: boolean): CopyIconConfig {
  return {
    iconName: isCopied ? 'check' : 'copy',
    iconClass: isCopied ? 'h-4 w-4 text-ok' : 'h-4 w-4',
  };
}

/**
 * Ekran okuyucular için eşleştirme modalı erişilebilir bağlam metnini formatlar.
 */
export function formatPairingModalAriaLabel(
  roomCode: string,
  slot?: 1 | 2 | null,
): string {
  const safeCode = roomCode || '......';
  if (slot) {
    return `Oda ${safeCode}, ${slot}. Oyuncu için telefon bağlama modalı`;
  }
  return `Oda ${safeCode} için telefon bağlama modalı`;
}

