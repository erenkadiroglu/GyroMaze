export interface WebGLRecoveryConfig {
  title: string;
  message: string;
  retryButtonText: string;
}

/**
 * WebGL contextlost olay dinleyicisi için standart sarmalayıcı.
 * Varsayılan tarayıcı davranışını engeller (preventDefault) ve geri çağırmayı tetikler.
 */
export function createContextLostHandler(
  onLost: () => void,
): (e: { preventDefault: () => void }) => void {
  return (e: { preventDefault: () => void }) => {
    if (typeof e?.preventDefault === 'function') {
      e.preventDefault();
    }
    onLost();
  };
}

/**
 * WebGL contextrestored olay dinleyicisi için standart sarmalayıcı.
 */
export function createContextRestoredHandler(onRestored: () => void): () => void {
  return () => {
    onRestored();
  };
}

/**
 * React Three Fiber Canvas anahtarını (key) revizyona göre üretir.
 * Bu anahtar değiştiğinde Canvas bileşeni temiz bir WebGL context ile yeniden monte edilir.
 */
export function resolveCanvasKey(canvasRevision: number): string {
  const safeRev = Number.isInteger(canvasRevision) && canvasRevision >= 0 ? canvasRevision : 0;
  return `gyromaze_stage_canvas_rev_${safeRev}`;
}

/**
 * Sahne yeniden deneme tıklandığında sıradaki geçerli revizyon sayısını üretir.
 */
export function resolveNextCanvasRevision(currentRevision: number): number {
  if (typeof currentRevision !== 'number' || !Number.isFinite(currentRevision) || currentRevision < 0) {
    return 1;
  }
  return Math.floor(currentRevision) + 1;
}

/**
 * WebGL bağlamı koptuğunda kurtarma uyarısının gösterilip gösterilmeyeceğini belirler.
 */
export function shouldShowRecoveryBanner(isContextLost: boolean): boolean {
  return Boolean(isContextLost);
}

/**
 * WebGL bağlam kaybı durumunda ekranda gösterilecek uyarı ve buton metinlerini döner.
 */
export function getRecoveryBannerConfig(): WebGLRecoveryConfig {
  return {
    title: '3B Grafik Bağlamı Kesildi',
    message: 'Grafik kartı sürücüsü veya tarayıcı belleği sebebiyle WebGL bağlantısı koptu. Sahneyi yeniden başlatmak için tıklayın.',
    retryButtonText: 'Sahneyi Yeniden Başlat',
  };
}
