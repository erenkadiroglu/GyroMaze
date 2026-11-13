import { resolveSlotChange } from './controllerUtils.ts';

export type CenterStageMode = 'room' | 'sensor' | 'gimbal';

/**
 * Oda kodu, oda düzenleme modu ve gimbal yüzey görünürlüğüne göre
 * mobil kontrolcü ekranının merkezinde hangi kartın gösterileceğini belirler.
 */
export function resolveCenterStageMode(
  activeRoomCode: string,
  isRoomEditorOpen: boolean,
  showGimbalSurface: boolean,
): CenterStageMode {
  if (!activeRoomCode || isRoomEditorOpen) {
    return 'room';
  }
  if (!showGimbalSurface) {
    return 'sensor';
  }
  return 'gimbal';
}

/**
 * Oyuncu yuva değişimini doğrular ve jiroskop sıfırlaması gerekip gerekmediğini bildirir.
 */
export function handleSlotSelection(
  currentSlot: 1 | 2,
  selectedSlot: 1 | 2,
): { changed: boolean; nextSlot: 1 | 2 } {
  return resolveSlotChange(currentSlot, selectedSlot);
}
