/**
 * Kontrol modu (Jiroskop / Dokunmatik) butonu için stil sınıfını üretir.
 */
export function resolveGimbalModeButtonClass(isActive: boolean): string {
  const base =
    'flex min-h-[38px] cursor-pointer items-center justify-center gap-1.5 rounded-xl text-xs font-semibold transition-colors';
  if (isActive) {
    return `${base} bg-brass text-brass-fg`;
  }
  return `${base} text-muted hover:text-fg`;
}

/**
 * Hassasiyet seçici butonu için stil sınıfını üretir.
 */
export function resolveSensitivityButtonClass(isActive: boolean): string {
  const base =
    'min-h-[38px] cursor-pointer rounded-xl text-xs font-semibold transition-colors';
  if (isActive) {
    return `${base} bg-brass text-brass-fg`;
  }
  return `${base} text-muted hover:text-fg`;
}

/**
 * Çok oyunculu oyuncu yuvası (1P / 2P) butonu için stil sınıfını üretir.
 */
export function resolveSlotButtonClass(isActive: boolean, slot: 1 | 2): string {
  const base =
    'min-h-[38px] cursor-pointer rounded-xl text-xs font-semibold transition-colors';
  if (isActive) {
    if (slot === 1) {
      return `${base} bg-surface-2 text-brass ring-1 ring-brass/60`;
    }
    return `${base} bg-surface-2 text-warn ring-1 ring-warn/60`;
  }
  return `${base} text-muted hover:text-fg`;
}
