import type { EditorCellTool } from '@/components/scene/mazeLevels';

export type CellTool = EditorCellTool;

export const EDITOR_GRID_SIZE = 8;
export const BOARD_SIZE_OPTIONS = [12, 14, 16] as const;

/**
 * 8x8 editör ızgarasında bir hücreye seçili aracı uygular.
 * Başlangıç ('start') ve hedef ('goal') araçları tekil olmak zorundadır.
 * Mevcut başlangıç/hedef üzerine tıklanırsa işlem yapılmaz; başka bir hücreye
 * yerleştirilirse eski konumu silinir veya yer değiştirilir.
 */
export function applyToolToCell(
  grid: CellTool[][],
  r: number,
  c: number,
  activeTool: CellTool,
  gridSize: number = EDITOR_GRID_SIZE,
): CellTool[][] {
  const next = grid.map((row) => [...row]);

  if (activeTool === 'start' || activeTool === 'goal') {
    if (next[r][c] === activeTool) {
      return grid;
    }
    const displacedTool =
      next[r][c] === 'start' || next[r][c] === 'goal' ? next[r][c] : 'erase';

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (next[i][j] === activeTool) {
          next[i][j] = displacedTool;
        }
      }
    }
    next[r][c] = activeTool;
    return next;
  }

  // Normal araçlar başlangıç veya hedef hücresinin üzerine doğrudan yazılamaz
  if (next[r][c] === 'start' || next[r][c] === 'goal') {
    return grid;
  }

  // Aynı araca tekrar basılırsa temizler (toggle), farklı araca basılırsa atar
  next[r][c] = next[r][c] === activeTool ? 'erase' : activeTool;
  return next;
}

/**
 * Izgaradaki kuantum portalı ('portal') sayısını döner.
 */
export function countGridPortals(grid: CellTool[][]): number {
  return grid.flat().filter((cell) => cell === 'portal').length;
}

/**
 * Kuantum portallarının çiftli (balanced) yerleştirilip yerleştirilmediğini denetler.
 */
export function isPortalCountBalanced(grid: CellTool[][]): boolean {
  return countGridPortals(grid) % 2 === 0;
}

/**
 * 8x8 ızgarayı başlangıç/hedef korumalı ve opsiyonel doğrulayıcı ile çözülebilir rastgele engellerle doldurur.
 */
export function generateRandomEditorGrid(
  gridSize: number = EDITOR_GRID_SIZE,
  validator?: (grid: CellTool[][]) => { ok: boolean },
): CellTool[][] {
  for (let attempt = 0; attempt < 25; attempt++) {
    const next: CellTool[][] = Array.from({ length: gridSize }, () =>
      Array.from({ length: gridSize }, () => 'erase'),
    );
    next[0][0] = 'start';
    next[gridSize - 1][gridSize - 1] = 'goal';

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        // Başlangıç ve hedef çevresindeki 2x2 alanları boş bırak
        if (
          (r <= 1 && c <= 1) ||
          (r >= gridSize - 2 && c >= gridSize - 2)
        ) {
          continue;
        }
        const roll = Math.random();
        if (roll < 0.16) next[r][c] = 'wall';
        else if (roll < 0.23) next[r][c] = 'crystal';
        else if (roll < 0.28) next[r][c] = 'hole';
        else if (roll < 0.31) next[r][c] = 'boost';
        else if (roll < 0.34) next[r][c] = 'moving';
      }
    }

    if (!validator || validator(next).ok) {
      return next;
    }
  }

  // Güvenli yedek şablon (fallback)
  const fallback: CellTool[][] = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => 'erase'),
  );
  fallback[0][0] = 'start';
  fallback[gridSize - 1][gridSize - 1] = 'goal';
  fallback[2][2] = 'crystal';
  fallback[5][5] = 'crystal';
  fallback[3][3] = 'wall';
  fallback[4][4] = 'wall';
  return fallback;
}
