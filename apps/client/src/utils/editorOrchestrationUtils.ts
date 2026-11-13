import type { MazeLevelDefinition } from '../components/scene/mazeLevels.ts';
import {
  parseCustomMazeLevel,
  encodeCustomMazeLevelForUrl,
  decodeCustomMazeLevelFromUrl,
  CUSTOM_MAP_URL_PARAM,
} from '../components/scene/mazeLevels.ts';
import type { CellTool } from './editorUtils.ts';
import { isPortalCountBalanced } from './editorUtils.ts';
import { createShareUrl, detectClipboardMapType } from './editorActionUtils.ts';

/**
 * Haritanın dışa aktarım için uygun (portalları dengeli vb.) olup olmadığını denetler.
 */
export function canExportGrid(grid: CellTool[][]): { canExport: boolean; reason?: string } {
  if (!isPortalCountBalanced(grid)) {
    return {
      canExport: false,
      reason: 'Dışa aktarmadan önce açıkta kalan kuantum portal için bir eş daha yerleştirin.',
    };
  }
  return { canExport: true };
}

/**
 * JSON veya bağlantı türüne göre dışa aktarılacak metin yükünü oluşturur.
 */
export function resolveExportPayload(
  levelDef: MazeLevelDefinition,
  kind: 'json' | 'link',
  currentUrl: string,
): string {
  if (kind === 'link') {
    const encoded = encodeCustomMazeLevelForUrl(levelDef);
    return createShareUrl(currentUrl, encoded);
  }
  return JSON.stringify(levelDef, null, 2);
}

/**
 * Panodan okunan ham metni (JSON veya paylaşım URL'si/tokeni) doğrulanmış MazeLevelDefinition nesnesine dönüştürür.
 */
export function parseClipboardMapData(raw: string): MazeLevelDefinition | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const type = detectClipboardMapType(trimmed);
  if (type === 'json') {
    try {
      const parsed: unknown = JSON.parse(trimmed);
      return parseCustomMazeLevel(parsed);
    } catch {
      return null;
    }
  }

  let encodedParam: string | null = null;
  try {
    const parsedUrl = new URL(trimmed);
    encodedParam = parsedUrl.searchParams.get(CUSTOM_MAP_URL_PARAM);
  } catch {
    encodedParam = trimmed;
  }

  if (encodedParam) {
    return decodeCustomMazeLevelFromUrl(encodedParam);
  }

  return null;
}

/**
 * Editör açıldığında harita başlığını çözer.
 */
export function getEditorInitialTitle(customLevelTitle?: string): string {
  if (typeof customLevelTitle === 'string' && customLevelTitle.trim().length > 0) {
    return customLevelTitle.trim();
  }
  return 'Özel Labirent — Tasarım 1';
}

/**
 * Editör açıldığında tahta boyutunu çözer.
 */
export function getEditorInitialBoardSize(customLevelBoardSize?: number): number {
  if (typeof customLevelBoardSize === 'number' && customLevelBoardSize > 0) {
    return customLevelBoardSize;
  }
  return 12;
}
