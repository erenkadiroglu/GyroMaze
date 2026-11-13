import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  resolveCameraModeLabel,
  resolveCameraRigEnvironmentState,
  formatCameraRigTelemetry,
  resolveCameraRigStepSummary,
  resolveCameraRigOrchestrationBundle,
} from '../src/utils/mazeCameraRigOrchestrationUtils.ts';

describe('mazeCameraRigOrchestrationUtils — 3B Kamera Teçhizatı Orkestrasyon Motoru', () => {
  it('resolveCameraModeLabel bilinen ve bilinmeyen kamera modlarına doğru Türkçe etiketleri döner', () => {
    assert.equal(resolveCameraModeLabel('isometric'), 'İzometrik');
    assert.equal(resolveCameraModeLabel('topdown'), 'Kuş Bakışı');
    assert.equal(resolveCameraModeLabel('follow'), 'Bilye Takibi');
    // @ts-expect-error bilinmeyen mod kontrolü
    assert.equal(resolveCameraModeLabel('unknown'), 'Standart');
  });

  it('resolveCameraRigEnvironmentState aktif oyun koşulunda interaktif durumu döner', () => {
    const env = resolveCameraRigEnvironmentState({
      isPageHidden: false,
      gameStatus: 'playing',
      modals: {
        isPairingModalOpen: false,
        isSettingsOpen: false,
        isEditorOpen: false,
        isLeaderboardOpen: false,
      },
    });

    assert.equal(env.isInteractive, true);
    assert.equal(env.reason, 'active');
    assert.equal(env.isAnyModalOpen, false);
  });

  it('resolveCameraRigEnvironmentState sekme gizliyken page_hidden nedenini işaretler', () => {
    const env = resolveCameraRigEnvironmentState({
      isPageHidden: true,
      gameStatus: 'playing',
      modals: {
        isPairingModalOpen: false,
        isSettingsOpen: false,
        isEditorOpen: false,
        isLeaderboardOpen: false,
      },
    });

    assert.equal(env.isInteractive, false);
    assert.equal(env.reason, 'page_hidden');
  });

  it('resolveCameraRigEnvironmentState herhangi bir modal açıkken modal_open nedenini işaretler', () => {
    const env = resolveCameraRigEnvironmentState({
      isPageHidden: false,
      gameStatus: 'playing',
      modals: {
        isPairingModalOpen: true,
        isSettingsOpen: false,
        isEditorOpen: false,
        isLeaderboardOpen: false,
      },
    });

    assert.equal(env.isInteractive, false);
    assert.equal(env.reason, 'modal_open');
    assert.equal(env.isAnyModalOpen, true);
  });

  it('resolveCameraRigEnvironmentState oyun bittiğinde veya duraklatıldığında game_paused döner', () => {
    const env = resolveCameraRigEnvironmentState({
      isPageHidden: false,
      gameStatus: 'game_over',
      modals: {
        isPairingModalOpen: false,
        isSettingsOpen: false,
        isEditorOpen: false,
        isLeaderboardOpen: false,
      },
    });

    assert.equal(env.isInteractive, false);
    assert.equal(env.reason, 'game_paused');
  });

  it('formatCameraRigTelemetry aktif ve pasif durumlarda doğru metin formatı üretir', () => {
    const activeText = formatCameraRigTelemetry({
      cameraMode: 'follow',
      isInteractive: true,
      currentFov: 44.5,
      targetPos: [0, 14.5, 10.2],
    });
    assert.equal(
      activeText,
      'Kamera Rig: Bilye Takibi | Hedef: [0.0, 14.5, 10.2] | FOV: 44.5° | Durum: Aktif',
    );

    const pausedText = formatCameraRigTelemetry({
      cameraMode: 'isometric',
      isInteractive: false,
      currentFov: 42,
      reason: 'modal_open',
    });
    assert.equal(
      pausedText,
      'Kamera Rig: İzometrik | Duraklatıldı (modal_open) | FOV: 42.0°',
    );
  });

  it('resolveCameraRigStepSummary adım sonucundan telemetri formatlar', () => {
    const summary = resolveCameraRigStepSummary(
      {
        isInteractive: true,
        safeDelta: 0.016,
        lerpAlpha: 0.15,
        targetPos: [1.2, 10.0, 5.5],
        lookAt: [1.2, 0.35, 2.0],
        fovUpdate: { shouldUpdate: true, nextFov: 43.2 },
      },
      'isometric',
    );

    assert.equal(
      summary,
      'Kamera Rig: İzometrik | Hedef: [1.2, 10.0, 5.5] | FOV: 43.2° | Durum: Aktif',
    );
  });

  it('resolveCameraRigOrchestrationBundle tüm ortam, etiket ve telemetriyi eksiksiz paketler', () => {
    const bundle = resolveCameraRigOrchestrationBundle({
      cameraMode: 'topdown',
      isPageHidden: false,
      gameStatus: 'playing',
      modals: {
        isPairingModalOpen: false,
        isSettingsOpen: false,
        isEditorOpen: false,
        isLeaderboardOpen: false,
      },
      currentFov: 42.0,
    });

    assert.equal(bundle.modeLabel, 'Kuş Bakışı');
    assert.equal(bundle.environment.isInteractive, true);
    assert.match(bundle.telemetrySummary, /Kamera Rig: Kuş Bakışı/);
  });
});

