import {
  getDesktopHomeMainClassName,
  getDesktopSocketRoleConfig,
} from './desktopHomeViewUtils.ts';

export interface DesktopHomeStateInput {
  level?: number | null;
  customLevel?: { title?: string } | null;
  gameMode?: string;
  isMultiplayer?: boolean;
  roomCode?: string | null;
}

export interface LevelDescriptor {
  label: string;
  isCustom: boolean;
}

export interface DesktopHomeContainerProps {
  className: string;
  role: 'main';
  'aria-label': string;
  'data-level': string | number;
  'data-mode': string;
  'data-multiplayer': boolean;
  'data-room': string;
  'data-custom': boolean;
}

export interface ResolvedDesktopHomeViewState {
  descriptor: LevelDescriptor;
  stageAriaLabel: string;
  telemetrySummary: string;
  containerProps: DesktopHomeContainerProps;
  socketConfig: { role: 'host' };
}

/**
 * Masaüstü sahnesi için aktif seviye tanımını (özel harita veya standart bölüm) çözümler.
 */
export function resolveActiveLevelDescriptor(
  level?: number | null,
  customLevel?: { title?: string } | null,
): LevelDescriptor {
  if (customLevel && typeof customLevel.title === 'string' && customLevel.title.trim().length > 0) {
    return {
      label: customLevel.title.trim(),
      isCustom: true,
    };
  }

  if (typeof level === 'number' && !Number.isNaN(level) && level > 0) {
    return {
      label: `Seviye ${Math.floor(level)}`,
      isCustom: false,
    };
  }

  return {
    label: 'Seviye 1',
    isCustom: false,
  };
}

/**
 * 3B sahne kapsayıcısı için erişilebilir ana bölge (main landmark) etiketini üretir.
 */
export function formatDesktopStageAriaLabel(
  level?: number | null,
  customLevel?: { title?: string } | null,
): string {
  const descriptor = resolveActiveLevelDescriptor(level, customLevel);
  if (descriptor.isCustom) {
    return `GyroMaze Masaüstü 3B Labirent Sahnesi — Özel: ${descriptor.label}`;
  }
  return `GyroMaze Masaüstü 3B Labirent Sahnesi — ${descriptor.label}`;
}

/**
 * Masaüstü ana görünümü için insan tarafından okunabilir özet telemetri metnini üretir.
 */
export function formatHomeTelemetrySummary(input: DesktopHomeStateInput = {}): string {
  const descriptor = resolveActiveLevelDescriptor(input.level, input.customLevel);
  const modeText = input.gameMode ? `Mod: ${input.gameMode}` : 'Mod: classic';

  if (input.isMultiplayer) {
    const roomText = input.roomCode && input.roomCode.trim().length > 0
      ? `Oda: ${input.roomCode.trim()}`
      : 'Oda Yok';
    return `${descriptor.label} | Çok Oyunculu (${roomText}) | ${modeText}`;
  }

  return `${descriptor.label} | Tek Oyunculu | ${modeText}`;
}

/**
 * <main> HTML elemanı için tüm semantik ve denetim özniteliklerini üretir.
 */
export function resolveDesktopHomeContainerProps(
  input: DesktopHomeStateInput = {},
): DesktopHomeContainerProps {
  const descriptor = resolveActiveLevelDescriptor(input.level, input.customLevel);
  const ariaLabel = formatDesktopStageAriaLabel(input.level, input.customLevel);

  return {
    className: getDesktopHomeMainClassName(),
    role: 'main',
    'aria-label': ariaLabel,
    'data-level': descriptor.isCustom ? descriptor.label : (input.level ?? 1),
    'data-mode': input.gameMode || 'classic',
    'data-multiplayer': Boolean(input.isMultiplayer),
    'data-room': input.roomCode?.trim() || 'none',
    'data-custom': descriptor.isCustom,
  };
}

/**
 * Masaüstü ana sayfa görünümünün tüm orkestrasyon durumunu tek noktada çözer.
 */
export function resolveDesktopHomeViewState(
  input: DesktopHomeStateInput = {},
): ResolvedDesktopHomeViewState {
  const descriptor = resolveActiveLevelDescriptor(input.level, input.customLevel);
  const stageAriaLabel = formatDesktopStageAriaLabel(input.level, input.customLevel);
  const telemetrySummary = formatHomeTelemetrySummary(input);
  const containerProps = resolveDesktopHomeContainerProps(input);
  const socketConfig = getDesktopSocketRoleConfig();

  return {
    descriptor,
    stageAriaLabel,
    telemetrySummary,
    containerProps,
    socketConfig,
  };
}

