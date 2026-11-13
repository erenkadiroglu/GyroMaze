export interface OverlaySwitchConfig {
  id: 'trail' | 'ghost' | 'miniMap' | 'haptic';
  label: string;
  description: string;
}

export const OVERLAY_SWITCH_CONFIGS: OverlaySwitchConfig[] = [
  {
    id: 'trail',
    label: 'Neon hareket izi',
    description: 'Bilyenin arkasındaki parlak iz halkaları',
  },
  {
    id: 'ghost',
    label: '3B hayalet yarışçı',
    description: 'Bölümdeki en iyi turunun canlı hologramı',
  },
  {
    id: 'miniMap',
    label: '2B canlı radar',
    description: 'Sol alt göstergede üstten harita konumu',
  },
  {
    id: 'haptic',
    label: 'Mobil titreşim (Haptik)',
    description: 'Çarpma, lazer ve portallarda telefon titreşimi',
  },
];

/**
 * Katman anahtarı için ekran okuyucu erişilebilir etiketini formatlar.
 */
export function formatOverlayToggleAriaLabel(label: string, checked: boolean): string {
  return `${label}: ${checked ? 'Açık' : 'Kapalı'}`;
}

/**
 * Kimliğe göre katman anahtarı tanımını bulur.
 */
export function getOverlaySwitchConfig(
  id: OverlaySwitchConfig['id'],
): OverlaySwitchConfig | undefined {
  return OVERLAY_SWITCH_CONFIGS.find((cfg) => cfg.id === id);
}

/**
 * Ses seviyesi yüzdesini erişilebilir metin olarak üretir.
 */
export function formatVolumeAriaLabel(volumeLabel: string): string {
  return `Ses seviyesi: ${volumeLabel}`;
}
