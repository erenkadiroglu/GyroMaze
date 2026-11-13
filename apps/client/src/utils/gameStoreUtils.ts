import type {
  BallSkin,
  BoardTheme,
  CameraMode,
  ColorScheme,
  GameMode,
  GameStatus,
} from '@gyromaze/shared';
import type { MazeLevelDefinition } from '../components/scene/levels/types.ts';
import { parseCustomMazeLevel } from './customMapCodec.ts';

export const BEST_TIMES_STORAGE_KEY = 'gyromaze_best_times_v1';
export const GHOST_PATHS_STORAGE_KEY = 'gyromaze_ghost_paths_v1';
export const CUSTOM_LEVEL_STORAGE_KEY = 'gyromaze_custom_level_v1';
export const SETTINGS_STORAGE_KEY = 'gyromaze_settings_v1';

/**
 * Kullanıcı tarafından özelleştirilebilen tüm oyun ve kontrolcü varsayılan tercihleri.
 */
export const DEFAULT_PREFERENCES = {
  gravityScale: 36,
  tiltResponsiveness: 32,
  soundVolume: 1,
  showTrail: true,
  showGhost: true,
  showMiniMap: true,
  cameraMode: 'isometric' as CameraMode,
  boardTheme: 'emerald' as BoardTheme,
  colorScheme: 'dark' as ColorScheme,
  ballSkin: 'chrome' as BallSkin,
  gameMode: 'standard' as GameMode,
  isHapticEnabled: true,
  controllerSensitivity: 1 as 0.75 | 1 | 1.35,
  controllerTouchOverride: false,
};

/**
 * LocalStorage'dan okunan en iyi süreleri güvenle parse eder ve doğrular.
 */
export function parseStoredBestTimes(rawJson: unknown): Record<number, number> {
  if (typeof rawJson !== 'string' || !rawJson.trim()) return {};
  try {
    const parsed: unknown = JSON.parse(rawJson);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }
    const result: Record<number, number> = {};
    for (const [key, val] of Object.entries(parsed as Record<string, unknown>)) {
      const levelNum = Number(key);
      if (
        Number.isInteger(levelNum) &&
        levelNum > 0 &&
        typeof val === 'number' &&
        Number.isFinite(val) &&
        val > 0
      ) {
        result[levelNum] = val;
      }
    }
    return result;
  } catch {
    return {};
  }
}

/**
 * LocalStorage'dan okunan hayalet yarışçı (Ghost Replay) koordinat izlerini güvenle doğrular.
 */
export function parseStoredGhostPaths(
  rawJson: unknown,
): Record<number, Array<[number, number]>> {
  if (typeof rawJson !== 'string' || !rawJson.trim()) return {};
  try {
    const parsed: unknown = JSON.parse(rawJson);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }
    const result: Record<number, Array<[number, number]>> = {};
    for (const [key, points] of Object.entries(parsed as Record<string, unknown>)) {
      const levelNum = Number(key);
      if (!Number.isInteger(levelNum) || levelNum <= 0 || !Array.isArray(points)) {
        continue;
      }
      const validPoints = points.filter(
        (pt): pt is [number, number] =>
          Array.isArray(pt) &&
          pt.length === 2 &&
          typeof pt[0] === 'number' &&
          Number.isFinite(pt[0]) &&
          typeof pt[1] === 'number' &&
          Number.isFinite(pt[1]),
      );
      if (validPoints.length > 0) {
        result[levelNum] = validPoints;
      }
    }
    return result;
  } catch {
    return {};
  }
}

/**
 * LocalStorage'dan okunan özel labirent tanımını doğrular.
 */
export function parseStoredCustomLevel(rawJson: unknown): MazeLevelDefinition | null {
  if (typeof rawJson !== 'string' || !rawJson.trim()) return null;
  try {
    const parsed: unknown = JSON.parse(rawJson);
    return parseCustomMazeLevel(parsed);
  } catch {
    return null;
  }
}

/**
 * Kontrolcü bağlantı durumundaki değişime göre oyun durumunu günceller.
 */
export function resolvePairingGameStatus(
  wasAny: boolean,
  nextAny: boolean,
  currentStatus: GameStatus,
): GameStatus {
  if (!wasAny && nextAny) {
    return currentStatus === 'waiting' || currentStatus === 'paused'
      ? 'playing'
      : currentStatus;
  }
  if (wasAny && !nextAny && currentStatus === 'playing') {
    return 'paused';
  }
  return currentStatus;
}

/**
 * Mobil kontrolcü son bağlanan odalar listesini günceller.
 */
export function resolveRecentRooms(
  existingRooms: string[],
  roomCode: unknown,
  maxCount: number = 3,
): string[] {
  if (typeof roomCode !== 'string') return existingRooms;
  const code = roomCode.trim().toUpperCase().slice(0, 6);
  if (!code) return existingRooms;
  const filtered = existingRooms.filter((r) => r !== code);
  return [code, ...filtered].slice(0, maxCount);
}

export const CAMERA_MODE_ORDER: readonly CameraMode[] = [
  'isometric',
  'topdown',
  'follow',
] as const;

/**
 * Sıradaki kamera modunu döner.
 */
export function getNextCameraMode(current: CameraMode): CameraMode {
  const idx = CAMERA_MODE_ORDER.indexOf(current);
  const nextIdx = (idx + 1) % CAMERA_MODE_ORDER.length;
  return CAMERA_MODE_ORDER[nextIdx >= 0 ? nextIdx : 0];
}

export const BOARD_THEME_ORDER: readonly BoardTheme[] = [
  'emerald',
  'cyberpunk',
  'crimson',
  'daylight',
] as const;

/**
 * Sıradaki 3B atmosfer temasını ve ilişkili renk şemasını döner.
 */
export function getNextBoardTheme(
  current: BoardTheme,
): { boardTheme: BoardTheme; colorScheme: ColorScheme } {
  const idx = BOARD_THEME_ORDER.indexOf(current);
  const nextIdx = (idx + 1) % BOARD_THEME_ORDER.length;
  const nextTheme = BOARD_THEME_ORDER[nextIdx >= 0 ? nextIdx : 0];
  return {
    boardTheme: nextTheme,
    colorScheme: nextTheme === 'daylight' ? 'light' : 'dark',
  };
}

/**
 * Aydınlık/karanlık renk düzeni geçişinde temayı senkronize eder.
 */
export function getNextColorScheme(
  currentScheme: ColorScheme,
  currentTheme: BoardTheme,
): { colorScheme: ColorScheme; boardTheme: BoardTheme } {
  const nextScheme: ColorScheme = currentScheme === 'dark' ? 'light' : 'dark';
  return {
    colorScheme: nextScheme,
    boardTheme:
      nextScheme === 'light'
        ? 'daylight'
        : currentTheme === 'daylight'
          ? 'emerald'
          : currentTheme,
  };
}

/**
 * Her yeni tur, mod değişimi veya harita sıfırlamasında ortak başlangıç alanlarını üretir.
 */
export function createResetRunFields(resetCount: number) {
  return {
    winnerPlayer: null as 1 | 2 | null,
    gameStatus: 'playing' as const,
    elapsedSeconds: 0,
    collectedCrystals: [] as number[],
    resetCount: resetCount + 1,
  };
}
