import {
  getCenterStageAriaLabel,
  getCenterStageContainerClass,
  type CenterStageMode,
} from './controllerCenterStageUtils.ts';

export type { CenterStageMode };

export interface ControllerCenterStageStateInput {
  stageMode?: CenterStageMode;
  isControllerPaired?: boolean;
  controllerTouchOverride?: boolean;
  controllerSensitivity?: 0.75 | 1 | 1.35;
  playerSlot?: 1 | 2;
  hasSensorSignal?: boolean;
  sensorSignalTimedOut?: boolean;
  errorMessage?: string | null;
  activeRoomCode?: string;
  recentRoomsCount?: number;
  isInsecureContext?: boolean;
}

export interface CenterStageDescriptor {
  mode: CenterStageMode;
  ariaLabel: string;
  isRoom: boolean;
  isSensor: boolean;
  isGimbal: boolean;
}

export interface CenterStageContainerProps {
  role: 'region';
  'aria-label': string;
  className: string;
  'data-stage-mode': string;
  'data-paired': boolean;
  'data-touch-override': boolean;
}

export interface ResolvedControllerCenterStageState {
  descriptor: CenterStageDescriptor;
  containerProps: CenterStageContainerProps;
  telemetrySummary: string;
  sensitivityLabel: string;
}

/**
 * Hassasiyet katsayısını insan tarafından okunabilir Türkçe etikete dönüştürür.
 */
export function resolveSensitivityLabel(sensitivity?: 0.75 | 1 | 1.35): string {
  switch (sensitivity) {
    case 0.75:
      return '0.75x (Düşük)';
    case 1.35:
      return '1.35x (Yüksek)';
    case 1:
    default:
      return '1.0x (Normal)';
  }
}

/**
 * Aktif merkez sahne aşamasının tanımlayıcı nesnesini üretir.
 */
export function resolveCenterStageDescriptor(
  stageMode?: CenterStageMode,
): CenterStageDescriptor {
  const mode: CenterStageMode = stageMode ?? 'room';
  const ariaLabel = getCenterStageAriaLabel(mode);

  return {
    mode,
    ariaLabel,
    isRoom: mode === 'room',
    isSensor: mode === 'sensor',
    isGimbal: mode === 'gimbal',
  };
}

/**
 * Merkez sahne kapsayıcısı için semantik DOM ve denetim özniteliklerini döner.
 */
export function resolveCenterStageContainerProps(
  stageMode?: CenterStageMode,
  isPaired?: boolean,
  isTouchOverride?: boolean,
): CenterStageContainerProps {
  const descriptor = resolveCenterStageDescriptor(stageMode);

  return {
    role: 'region',
    'aria-label': descriptor.ariaLabel,
    className: getCenterStageContainerClass(),
    'data-stage-mode': descriptor.mode,
    'data-paired': Boolean(isPaired),
    'data-touch-override': Boolean(isTouchOverride),
  };
}

/**
 * Merkez sahne telemetrisini tek satırlık detaylı özet metne dönüştürür.
 */
export function formatCenterStageDetailedSummary(
  input: ControllerCenterStageStateInput = {},
): string {
  const mode = input.stageMode ?? 'room';
  const pairText = input.isControllerPaired ? 'Eşleşti' : 'Bağlantı Yok';

  if (mode === 'room') {
    const code = input.activeRoomCode?.trim() || 'Yok';
    const recent = typeof input.recentRoomsCount === 'number' ? input.recentRoomsCount : 0;
    return `Merkez Sahne: Oda Kartı | Oda: ${code} | Son Odalar: ${recent} | ${pairText}`;
  }

  if (mode === 'sensor') {
    const insecure = input.isInsecureContext ? 'Evet' : 'Hayır';
    return `Merkez Sahne: Sensör İzni | Güvensiz Bağlam: ${insecure} | ${pairText}`;
  }

  // mode === 'gimbal'
  const control = input.controllerTouchOverride ? 'Dokunmatik' : 'Jiroskop';
  const sens = resolveSensitivityLabel(input.controllerSensitivity);
  const slot = input.playerSlot === 2 ? 'P2' : 'P1';

  let signalText = 'Bekleniyor';
  if (input.hasSensorSignal) {
    signalText = input.sensorSignalTimedOut ? 'Zaman Aşımı' : 'Aktif';
  }

  return `Merkez Sahne: Gimbal | ${control} (${sens}, ${slot}) | Sinyal: ${signalText} | ${pairText}`;
}

/**
 * Mobil kontrolcü merkez sahnesinin tüm orkestrasyon durumunu çözer.
 */
export function resolveControllerCenterStageState(
  input: ControllerCenterStageStateInput = {},
): ResolvedControllerCenterStageState {
  const descriptor = resolveCenterStageDescriptor(input.stageMode);
  const containerProps = resolveCenterStageContainerProps(
    input.stageMode,
    input.isControllerPaired,
    input.controllerTouchOverride,
  );
  const telemetrySummary = formatCenterStageDetailedSummary(input);
  const sensitivityLabel = resolveSensitivityLabel(input.controllerSensitivity);

  return {
    descriptor,
    containerProps,
    telemetrySummary,
    sensitivityLabel,
  };
}
