import type { GameMode } from '@gyromaze/shared';

export type PlayerCountValue = 'solo' | 'duo';

export const PLAYER_COUNT_OPTIONS: { value: PlayerCountValue; label: string }[] = [
  { value: 'solo', label: '1 Oyuncu' },
  { value: 'duo', label: '2 Oyuncu (1v1)' },
];

export const GAME_MODE_RULE_OPTIONS: {
  value: GameMode;
  label: string;
  hint?: string;
}[] = [
  { value: 'standard', label: 'Standart' },
  {
    value: 'time_attack',
    label: 'Süreye karşı',
    hint: 'Bölüm süresi dolmadan kristalleri toplayıp çıkışı bul',
  },
];

/**
 * Çok oyunculu boolean bayrağından 'solo' veya 'duo' Segmented değerini türetir.
 */
export function resolvePlayerCountValue(isMultiplayer: boolean): PlayerCountValue {
  return isMultiplayer ? 'duo' : 'solo';
}

/**
 * Segmented seçiminden yeni çok oyunculu boolean değerini döner.
 */
export function isMultiplayerValue(val: PlayerCountValue): boolean {
  return val === 'duo';
}

/**
 * Oyun modu kuralı için ekran okuyucu etiketini formatlar.
 */
export function formatGameModeAriaLabel(gameMode: GameMode): string {
  return gameMode === 'time_attack'
    ? 'Oyun modu: Süreye karşı'
    : 'Oyun modu: Standart';
}
