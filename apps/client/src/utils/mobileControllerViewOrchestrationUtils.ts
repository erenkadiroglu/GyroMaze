import {
  getControllerMainAriaLabel,
  getControllerMainContainerClass,
  formatControllerDocumentTitle,
  isControllerReady,
} from './controllerViewUtils.ts';
import type { CenterStageMode } from './controllerCenterStageUtils.ts';

export interface MobileControllerViewStateInput {
  activeRoomCode?: string;
  playerSlot?: 1 | 2;
  isControllerPaired?: boolean;
  isSocketConnected?: boolean;
  stageMode?: CenterStageMode;
  level?: number;
  gameStatus?: string;
  hasSensorSignal?: boolean;
  latencyMs?: number;
}

export interface MobileControllerContainerProps {
  role: 'application';
  'aria-label': string;
  className: string;
  'data-room': string;
  'data-slot': 1 | 2;
  'data-paired': boolean;
  'data-connected': boolean;
  'data-stage': string;
}

export interface ResolvedMobileControllerViewState {
  documentTitle: string;
  isReady: boolean;
  telemetrySummary: string;
  containerProps: MobileControllerContainerProps;
}

/**
 * Mobil kontrolcü ana <main> kapsayıcısı için semantik DOM ve denetim özniteliklerini döner.
 */
export function resolveMobileControllerContainerProps(
  input: MobileControllerViewStateInput = {},
): MobileControllerContainerProps {
  const room = input.activeRoomCode?.trim() || 'none';
  const slot: 1 | 2 = input.playerSlot === 2 ? 2 : 1;
  const stage = input.stageMode || 'unknown';

  return {
    role: 'application',
    'aria-label': getControllerMainAriaLabel(),
    className: getControllerMainContainerClass(),
    'data-room': room,
    'data-slot': slot,
    'data-paired': Boolean(input.isControllerPaired),
    'data-connected': Boolean(input.isSocketConnected),
    'data-stage': stage,
  };
}

/**
 * Mobil kontrolcü görünüm telemetrisini tek satırlık insan tarafından okunabilir özet metne formatlar.
 */
export function formatMobileControllerTelemetry(
  input: MobileControllerViewStateInput = {},
): string {
  const slot = input.playerSlot === 2 ? 'P2' : 'P1';
  const room = input.activeRoomCode?.trim() || 'Oda Yok';
  const stage = input.stageMode || 'room';
  const lvl = input.level ? `Seviye ${input.level}` : 'Seviye 1';

  let connText = 'Kopuk';
  if (input.isControllerPaired) {
    connText = `Bağlı (${input.latencyMs ?? 0}ms)`;
  } else if (input.isSocketConnected) {
    connText = 'Hazır';
  }

  return `GyroMaze ${slot} | ${room} | ${connText} | Aşama: ${stage} | ${lvl}`;
}

/**
 * Mobil kontrolcü ana görünümünün tüm orkestrasyon durumunu çözer.
 */
export function resolveMobileControllerViewState(
  input: MobileControllerViewStateInput = {},
): ResolvedMobileControllerViewState {
  const documentTitle = formatControllerDocumentTitle(
    input.activeRoomCode,
    input.playerSlot,
  );
  const isReady = isControllerReady(
    input.isSocketConnected,
    input.isControllerPaired,
  );
  const telemetrySummary = formatMobileControllerTelemetry(input);
  const containerProps = resolveMobileControllerContainerProps(input);

  return {
    documentTitle,
    isReady,
    telemetrySummary,
    containerProps,
  };
}
