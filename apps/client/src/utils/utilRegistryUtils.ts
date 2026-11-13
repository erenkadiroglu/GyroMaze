export type UtilCategory = 'controller' | 'desktop' | 'editor' | 'gameplay' | 'scene';

export const UTIL_CATEGORIES: readonly UtilCategory[] = [
  'controller',
  'desktop',
  'editor',
  'gameplay',
  'scene',
] as const;

/**
 * Belirtilen util dosya adının ait olduğu mimari kategoriyi belirler.
 */
export function categorizeUtilFileName(fileName: string): UtilCategory {
  const lower = fileName.toLowerCase();

  // Mobil Kontrolcü yardımcıları
  if (
    lower.startsWith('controller') ||
    lower.startsWith('gimbal') ||
    lower.startsWith('roomcard') ||
    lower.startsWith('sensorcard')
  ) {
    return 'controller';
  }

  // Harita Editörü yardımcıları
  if (
    lower.startsWith('editor') ||
    lower.startsWith('custommap')
  ) {
    return 'editor';
  }

  // 3B Sahne, Ses ve Fizik yardımcıları
  if (
    lower.startsWith('scene') ||
    lower.startsWith('stage') ||
    lower.startsWith('wall') ||
    lower.startsWith('celebration') ||
    lower.startsWith('dialog') ||
    lower.startsWith('primitive') ||
    lower === 'soundengine.ts' ||
    lower === 'soundengine'
  ) {
    return 'scene';
  }

  // Oyun Durumu, Bölüm İlerlemesi ve Skor Tablosu yardımcıları
  if (
    lower.startsWith('gameoutcome') ||
    lower.startsWith('levelmenu') ||
    lower.startsWith('levelprogress') ||
    lower.startsWith('levelselect') ||
    lower.startsWith('leaderboard') ||
    lower.startsWith('victorymodal') ||
    lower.startsWith('defeatmodal') ||
    lower.startsWith('collectibles') ||
    lower.startsWith('hazard')
  ) {
    return 'gameplay';
  }

  // Varsayılan: Masaüstü HUD, Modallar, Ayarlar ve Üst/Alt Çubuk
  return 'desktop';
}

/**
 * Dosya listesini kategorilere göre gruplar ve her kategorideki dosya sayısını döndürür.
 */
export function getUtilStatsByCategory(
  fileNames: string[],
): Record<UtilCategory, number> {
  const stats: Record<UtilCategory, number> = {
    controller: 0,
    desktop: 0,
    editor: 0,
    gameplay: 0,
    scene: 0,
  };

  if (!Array.isArray(fileNames)) return stats;

  for (const name of fileNames) {
    if (typeof name === 'string' && name.trim()) {
      const category = categorizeUtilFileName(name);
      stats[category] += 1;
    }
  }

  return stats;
}

/**
 * Belirli bir kategoriye ait yardımcı dosyaları filtreler.
 */
export function filterUtilsByCategory(
  fileNames: string[],
  category: UtilCategory,
): string[] {
  if (!Array.isArray(fileNames)) return [];
  return fileNames.filter((name) => typeof name === 'string' && categorizeUtilFileName(name) === category);
}
