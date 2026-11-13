import type { CameraMode, GameStatus } from '@gyromaze/shared';
import type {
  CameraRigModalState,
  CameraRigStepResult,
} from './mazeCameraRigUtils.ts';
import { isAnyCameraRigModalOpen } from './mazeCameraRigUtils.ts';
import { resolveIsInteractive } from './stageLoopUtils.ts';

export interface CameraRigEnvironmentInput {
  isPageHidden: boolean;
  gameStatus: GameStatus;
  modals: CameraRigModalState;
}

export interface CameraRigEnvironmentState {
  isInteractive: boolean;
  reason: 'active' | 'page_hidden' | 'modal_open' | 'game_paused';
  isAnyModalOpen: boolean;
}

export interface CameraRigTelemetryParams {
  cameraMode: CameraMode;
  isInteractive: boolean;
  currentFov?: number;
  targetPos?: [number, number, number];
  reason?: string;
}

export interface ResolvedCameraRigOrchestrationBundle {
  environment: CameraRigEnvironmentState;
  modeLabel: string;
  telemetrySummary: string;
}

/**
 * Kamera modu için Türkçe açıklayıcı etiketi döner.
 */
export function resolveCameraModeLabel(mode: CameraMode): string {
  switch (mode) {
    case 'isometric':
      return 'İzometrik';
    case 'topdown':
      return 'Kuş Bakışı';
    case 'follow':
      return 'Bilye Takibi';
    default:
      return 'Standart';
  }
}

/**
 * Sayfa gizliliği, açık modallar ve oyun durumuna göre kamera rig ortamının
 * interaktifliğini ve pasifleşme gerekçesini çözümler.
 */
export function resolveCameraRigEnvironmentState({
  isPageHidden,
  gameStatus,
  modals,
}: CameraRigEnvironmentInput): CameraRigEnvironmentState {
  const isAnyModalOpen = isAnyCameraRigModalOpen(modals);
  const isInteractive = resolveIsInteractive(
    gameStatus,
    isPageHidden,
    isAnyModalOpen,
  );

  let reason: CameraRigEnvironmentState['reason'] = 'active';
  if (isPageHidden) {
    reason = 'page_hidden';
  } else if (isAnyModalOpen) {
    reason = 'modal_open';
  } else if (!isInteractive) {
    reason = 'game_paused';
  }

  return {
    isInteractive,
    reason,
    isAnyModalOpen,
  };
}

/**
 * Kamera rig için tek satırlık telemetri ve hata ayıklama dizesi formatlar.
 */
export function formatCameraRigTelemetry({
  cameraMode,
  isInteractive,
  currentFov,
  targetPos,
  reason,
}: CameraRigTelemetryParams): string {
  const modeLabel = resolveCameraModeLabel(cameraMode);
  const fovText =
    typeof currentFov === 'number' && Number.isFinite(currentFov)
      ? `${currentFov.toFixed(1)}°`
      : 'Sabit';

  if (!isInteractive) {
    const reasonText = reason ? ` (${reason})` : '';
    return `Kamera Rig: ${modeLabel} | Duraklatıldı${reasonText} | FOV: ${fovText}`;
  }

  const posText = targetPos
    ? `[${targetPos[0].toFixed(1)}, ${targetPos[1].toFixed(1)}, ${targetPos[2].toFixed(1)}]`
    : 'Hazır';

  return `Kamera Rig: ${modeLabel} | Hedef: ${posText} | FOV: ${fovText} | Durum: Aktif`;
}

/**
 * Hesaplanan kare adımı sonucunu tek satırlık telemetriye dönüştürür.
 */
export function resolveCameraRigStepSummary(
  stepResult: CameraRigStepResult,
  cameraMode: CameraMode,
): string {
  const fov = stepResult.fovUpdate?.nextFov;
  return formatCameraRigTelemetry({
    cameraMode,
    isInteractive: stepResult.isInteractive,
    currentFov: fov,
    targetPos: stepResult.targetPos,
  });
}

/**
 * Tüm kamera rig durumunu, mod etiketini ve telemetri özetini tek bir saf nesnede toplar.
 */
export function resolveCameraRigOrchestrationBundle({
  cameraMode,
  isPageHidden,
  gameStatus,
  modals,
  currentFov,
}: CameraRigEnvironmentInput & {
  cameraMode: CameraMode;
  currentFov?: number;
}): ResolvedCameraRigOrchestrationBundle {
  const environment = resolveCameraRigEnvironmentState({
    isPageHidden,
    gameStatus,
    modals,
  });
  const modeLabel = resolveCameraModeLabel(cameraMode);
  const telemetrySummary = formatCameraRigTelemetry({
    cameraMode,
    isInteractive: environment.isInteractive,
    currentFov,
    reason: environment.reason,
  });

  return {
    environment,
    modeLabel,
    telemetrySummary,
  };
}

