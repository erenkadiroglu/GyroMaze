import type { EditorCellTool } from '@/components/scene/mazeLevels';

export interface EditorTemplate {
  id: string;
  name: string;
  description: string;
  boardSize: 12 | 14 | 16;
  grid: EditorCellTool[][];
}

/**
 * 8x8 boyutunda boş silinmiş ızgara matrisi oluşturur.
 */
export function createEmptyGrid(gridSize = 8): EditorCellTool[][] {
  const grid: EditorCellTool[][] = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => 'erase'),
  );
  grid[0][0] = 'start';
  grid[gridSize - 1][gridSize - 1] = 'goal';
  return grid;
}

/**
 * Harita editöründe oyuncuya anında ilham ve hızlı başlangıç sağlayan
 * matematiksel olarak BFS-geçerli 4 küratörlü şablon.
 */
export const EDITOR_TEMPLATES: EditorTemplate[] = [
  {
    id: 'spiral',
    name: 'Spiral Koridor',
    description: 'Dış çeperden başlayıp merkeze doğru kıvrılan, kristalli sarmal labirent.',
    boardSize: 14,
    grid: [
      ['start', 'erase', 'erase', 'erase', 'erase', 'erase', 'erase', 'crystal'],
      ['erase', 'wall',  'wall',  'wall',  'wall',  'wall',  'wall',  'erase'],
      ['erase', 'wall',  'erase', 'erase', 'erase', 'erase', 'wall',  'erase'],
      ['erase', 'wall',  'erase', 'wall',  'wall',  'erase', 'wall',  'erase'],
      ['erase', 'wall',  'erase', 'wall',  'goal',  'erase', 'wall',  'erase'],
      ['erase', 'wall',  'erase', 'wall',  'wall',  'erase', 'wall',  'erase'],
      ['erase', 'wall',  'erase', 'erase', 'boost', 'erase', 'crystal', 'erase'],
      ['erase', 'erase', 'erase', 'erase', 'erase', 'erase', 'erase', 'erase'],
    ],
  },
  {
    id: 'quantum-bridge',
    name: 'Kuantum Köprüsü',
    description: 'Aşılmaz bir duvarla bölünmüş iki odayı birbirine bağlayan kuantum portal bulmacası.',
    boardSize: 16,
    grid: [
      ['start', 'erase', 'erase', 'wall', 'erase', 'erase', 'erase', 'erase'],
      ['erase', 'erase', 'erase', 'wall', 'erase', 'wall',  'erase', 'erase'],
      ['erase', 'crystal', 'erase', 'wall', 'erase', 'portal', 'erase', 'erase'],
      ['erase', 'erase', 'erase', 'wall', 'erase', 'erase', 'erase', 'erase'],
      ['erase', 'wall',  'erase', 'wall', 'wall',  'erase', 'wall',  'erase'],
      ['erase', 'portal', 'erase', 'wall', 'erase', 'crystal', 'erase', 'erase'],
      ['erase', 'erase', 'erase', 'wall', 'erase', 'erase', 'erase', 'erase'],
      ['erase', 'erase', 'erase', 'wall', 'erase', 'erase', 'erase', 'goal'],
    ],
  },
  {
    id: 'crystal-hunt',
    name: 'Kristal Avı',
    description: 'Çoklu rotalar, lazer kapıları ve 4 parlak enerji kristali içeren geniş arena.',
    boardSize: 14,
    grid: [
      ['start', 'erase', 'erase', 'wall', 'erase', 'erase', 'erase', 'crystal'],
      ['erase', 'wall',  'erase', 'laser', 'erase', 'wall',  'erase', 'erase'],
      ['erase', 'erase', 'erase', 'erase', 'erase', 'erase', 'erase', 'erase'],
      ['wall',  'erase', 'crystal', 'wall', 'wall',  'erase', 'crystal', 'wall'],
      ['erase', 'erase', 'erase', 'wall', 'boost', 'erase', 'erase', 'erase'],
      ['erase', 'wall',  'erase', 'laser', 'erase', 'wall',  'erase', 'erase'],
      ['crystal', 'erase', 'erase', 'erase', 'erase', 'erase', 'erase', 'erase'],
      ['erase', 'erase', 'wall',  'erase', 'erase', 'wall',  'erase', 'goal'],
    ],
  },
  {
    id: 'speedway',
    name: 'Hız Parkuru',
    description: 'Hızlandırma rampaları, köşe tuzak delikleri ve refleks testi gerektiren dinamik pist.',
    boardSize: 14,
    grid: [
      ['start', 'erase', 'boost', 'erase', 'erase', 'erase', 'hole',  'erase'],
      ['erase', 'wall',  'wall',  'wall',  'erase', 'wall',  'wall',  'erase'],
      ['erase', 'wall',  'crystal', 'erase', 'erase', 'erase', 'wall',  'boost'],
      ['erase', 'erase', 'erase', 'moving', 'erase', 'erase', 'erase', 'erase'],
      ['boost', 'wall',  'erase', 'erase', 'crystal', 'wall', 'erase', 'erase'],
      ['erase', 'wall',  'wall',  'erase', 'wall',  'wall',  'erase', 'erase'],
      ['erase', 'hole',  'erase', 'boost', 'erase', 'erase', 'erase', 'erase'],
      ['erase', 'erase', 'erase', 'erase', 'erase', 'erase', 'erase', 'goal'],
    ],
  },
];

/**
 * ID değerine göre kayıtlı şablonu getirir.
 */
export function getEditorTemplateById(id: string): EditorTemplate | undefined {
  return EDITOR_TEMPLATES.find((t) => t.id === id);
}

