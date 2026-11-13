/**
 * Mobil sensör kartı yardımcı fonksiyonları ve metin formatlayıcıları.
 */

export const INSECURE_CONTEXT_MESSAGE =
  'Bu sayfa HTTP üzerinden açıldığı için mobil tarayıcı jiroskop sensörlerini kısıtlayabilir. Sensör yanıt vermezse aşağıdaki Dokunmatik gimbal ile oyna seçeneğini kullan.';

export const ACTIVATE_SENSORS_ARIA_LABEL = 'Telefon jiroskop sensörlerini başlat ve izin iste';
export const TOUCH_MODE_ARIA_LABEL = 'Sensörsüz dokunmatik gimbal kontrol modunu etkinleştir';

/**
 * HTTP / Güvensiz bağlam uyarısının gösterilip gösterilmeyeceğini belirler.
 */
export function shouldShowInsecureWarning(isInsecureContext: boolean): boolean {
  return Boolean(isInsecureContext);
}

/**
 * Güvensiz bağlam için açıklayıcı metin döner veya null döndürür.
 */
export function resolveInsecureContextNotice(isInsecureContext: boolean): string | null {
  return isInsecureContext ? INSECURE_CONTEXT_MESSAGE : null;
}

/**
 * Sensör ve dokunmatik butonları için erişilebilirlik etiketlerini döner.
 */
export function resolveSensorActionAriaLabels() {
  return {
    activateSensorsLabel: ACTIVATE_SENSORS_ARIA_LABEL,
    touchModeLabel: TOUCH_MODE_ARIA_LABEL,
  };
}

