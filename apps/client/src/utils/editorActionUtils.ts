import type { CellTool } from './editorUtils.ts';

export const CUSTOM_MAP_URL_PARAM = 'map';

/**
 * Harita editörü için varsayılan başlangıç ızgarasını (başlangıç, bitiş, duvarlar ve kristal) üretir.
 */
export function buildInitialEditorGrid(gridSize: number): CellTool[][] {
  const initial: CellTool[][] = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => 'erase'),
  );
  if (gridSize > 0) {
    initial[0][0] = 'start';
    initial[gridSize - 1][gridSize - 1] = 'goal';
  }
  if (gridSize >= 6) {
    initial[2][2] = 'wall';
    initial[2][3] = 'wall';
    initial[3][5] = 'crystal';
    initial[5][2] = 'hole';
    initial[4][4] = 'laser';
  }
  return initial;
}

/**
 * Kodlanmış harita verisini temel URL ile birleştirip temiz bir paylaşım bağlantısı üretir.
 */
export function createShareUrl(rawUrl: string, encodedLevel: string): string {
  try {
    const url = new URL(rawUrl);
    url.pathname = '/';
    url.search = '';
    url.hash = '';
    url.searchParams.set(CUSTOM_MAP_URL_PARAM, encodedLevel);
    return url.toString();
  } catch {
    return `/?${CUSTOM_MAP_URL_PARAM}=${encodedLevel}`;
  }
}

/**
 * Panodan okunan ham metnin türünü (JSON mu yoksa URL/token mi) tespit eder.
 */
export function detectClipboardMapType(raw: string): 'json' | 'url_or_token' {
  const trimmed = raw.trim();
  if (trimmed.startsWith('{')) {
    return 'json';
  }
  return 'url_or_token';
}
