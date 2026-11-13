export interface ToolButtonConfig {
  label: string;
  shortcut: string;
}

/**
 * Harita editörü butonu için erişilebilirlik etiketi ve kısayol bilgisini döner.
 */
export function getEditorButtonConfig(): ToolButtonConfig {
  return {
    label: 'Harita editörü',
    shortcut: 'E',
  };
}

/**
 * Küresel skor tablosu butonu için erişilebilirlik etiketi ve kısayol bilgisini döner.
 */
export function getLeaderboardButtonConfig(): ToolButtonConfig {
  return {
    label: 'Skor tablosu',
    shortcut: 'K',
  };
}

/**
 * Araçlar butonu için ekran okuyucu dostu birleşik etiket üretir.
 */
export function formatToolButtonAriaLabel(label: string, shortcut?: string): string {
  if (!shortcut) {
    return label;
  }
  return `${label} (${shortcut})`;
}

/**
 * Araçlar kontrol grubunun rol etiketini döner.
 */
export function getToolsGroupAriaLabel(): string {
  return 'Araçlar';
}

