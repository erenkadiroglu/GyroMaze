import {
  resolveHapticButtonLabel,
  resolveHapticButtonClass,
  resolveThemeButtonLabel,
  resolveRoomCodeButtonLabel,
  resolveConnectionAriaLabel,
  resolvePlayerSlotBadgeClasses,
} from './controllerHeaderUtils.ts';

export interface ControllerHeaderStateInput {
  activeRoomCode?: string;
  playerSlot?: 1 | 2;
  isHapticEnabled?: boolean;
  colorScheme?: 'dark' | 'light';
  isRoomEditorOpen?: boolean;
  isControllerPaired?: boolean;
  isSocketConnected?: boolean;
  latencyMs?: number;
}

export interface HeaderContainerProps {
  role: 'banner';
  className: string;
  'aria-label': string;
  'data-room': string;
  'data-player-slot': 1 | 2;
  'data-paired': boolean;
  'data-connected': boolean;
  'data-latency': number;
}

export interface ResolvedControllerHeaderState {
  haptic: {
    isEnabled: boolean;
    ariaLabel: string;
    title: string;
    className: string;
  };
  theme: {
    colorScheme: 'dark' | 'light';
    ariaLabel: string;
  };
  room: {
    activeRoomCode: string;
    buttonLabel: string;
    isOpen: boolean;
  };
  connection: {
    isPaired: boolean;
    isConnected: boolean;
    latencyMs: number;
    ariaLabel: string;
  };
  player: {
    slot: 1 | 2;
    badgeClass: string;
  };
  telemetrySummary: string;
  containerProps: HeaderContainerProps;
}

/**
 * Mobil kontrolcü başlık kapsayıcısının standart stil sınıflarını döner.
 */
export function getControllerHeaderClassName(): string {
  return 'flex items-center justify-between gap-2 rounded-2xl border border-line bg-surface px-3.5 py-2.5';
}

/**
 * Mobil kontrolcü başlık telemetrisini tek satırlık insan tarafından okunabilir özet metne formatlar.
 */
export function formatControllerHeaderTelemetry(
  input: ControllerHeaderStateInput = {},
): string {
  const slot = input.playerSlot === 2 ? 2 : 1;
  const room = input.activeRoomCode?.trim() || 'Oda Yok';
  const haptic = input.isHapticEnabled ? 'Titreşim Açık' : 'Titreşim Kapalı';
  const theme = input.colorScheme === 'light' ? 'Gündüz' : 'Gece';

  let connText = 'Kopuk';
  if (input.isControllerPaired) {
    connText = `Bağlı (${input.latencyMs ?? 0}ms)`;
  } else if (input.isSocketConnected) {
    connText = 'Hazır';
  }

  return `GyroMaze P${slot} | ${room} | ${connText} | ${haptic} | ${theme}`;
}

/**
 * Başlık kapsayıcısı için semantik ve denetim özniteliklerini üretir.
 */
export function resolveHeaderContainerProps(
  input: ControllerHeaderStateInput = {},
): HeaderContainerProps {
  const slot: 1 | 2 = input.playerSlot === 2 ? 2 : 1;
  const room = input.activeRoomCode?.trim() || 'none';

  return {
    role: 'banner',
    className: getControllerHeaderClassName(),
    'aria-label': 'Mobil Kontrolcü Başlık Çubuğu',
    'data-room': room,
    'data-player-slot': slot,
    'data-paired': Boolean(input.isControllerPaired),
    'data-connected': Boolean(input.isSocketConnected),
    'data-latency': input.latencyMs ?? 0,
  };
}

/**
 * Mobil kontrolcü üst başlık ve hızlı eylemler çubuğunun tüm durumunu çözer.
 */
export function resolveControllerHeaderState(
  input: ControllerHeaderStateInput = {},
): ResolvedControllerHeaderState {
  const isHapticEnabled = Boolean(input.isHapticEnabled);
  const colorScheme: 'dark' | 'light' = input.colorScheme === 'light' ? 'light' : 'dark';
  const activeRoomCode = input.activeRoomCode?.trim() || '';
  const isRoomEditorOpen = Boolean(input.isRoomEditorOpen);
  const isControllerPaired = Boolean(input.isControllerPaired);
  const isSocketConnected = Boolean(input.isSocketConnected);
  const latencyMs = typeof input.latencyMs === 'number' ? input.latencyMs : 0;
  const slot: 1 | 2 = input.playerSlot === 2 ? 2 : 1;

  const hapticLabels = resolveHapticButtonLabel(isHapticEnabled);
  const hapticClass = resolveHapticButtonClass(isHapticEnabled);
  const themeAriaLabel = resolveThemeButtonLabel(colorScheme);
  const roomButtonLabel = resolveRoomCodeButtonLabel(activeRoomCode);
  const connectionAria = resolveConnectionAriaLabel(
    isControllerPaired,
    isSocketConnected,
    latencyMs,
  );
  const playerBadgeClass = resolvePlayerSlotBadgeClasses(slot);

  const containerProps = resolveHeaderContainerProps(input);
  const telemetrySummary = formatControllerHeaderTelemetry(input);

  return {
    haptic: {
      isEnabled: isHapticEnabled,
      ariaLabel: hapticLabels.ariaLabel,
      title: hapticLabels.title,
      className: hapticClass,
    },
    theme: {
      colorScheme,
      ariaLabel: themeAriaLabel,
    },
    room: {
      activeRoomCode,
      buttonLabel: roomButtonLabel,
      isOpen: isRoomEditorOpen,
    },
    connection: {
      isPaired: isControllerPaired,
      isConnected: isSocketConnected,
      latencyMs,
      ariaLabel: connectionAria,
    },
    player: {
      slot,
      badgeClass: playerBadgeClass,
    },
    telemetrySummary,
    containerProps,
  };
}
