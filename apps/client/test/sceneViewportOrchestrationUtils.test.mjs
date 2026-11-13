import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  formatSceneViewportAriaLabel,
  formatSceneViewportTelemetry,
  resolveSceneViewportContainerProps,
  resolveSceneLightingConfig,
  resolveSceneCanvasConfig,
  resolveSceneViewportState,
  resolveSceneStageProps,
} from '../src/utils/sceneViewportOrchestrationUtils.ts';

describe('sceneViewportOrchestrationUtils — 3B Sahne Görünümü Orkestrasyon Motoru', () => {
  it('formatSceneViewportAriaLabel başlık varlığında ve yokluğunda doğru etiketi üretir', () => {
    assert.equal(
      formatSceneViewportAriaLabel(1, 'Klasik Başlangıç'),
      '3B Labirent Sahnesi — Bölüm 1: Klasik Başlangıç',
    );
    assert.equal(
      formatSceneViewportAriaLabel(2),
      '3B Labirent Sahnesi — Bölüm 2',
    );
    assert.equal(
      formatSceneViewportAriaLabel(NaN),
      '3B Labirent Sahnesi — Bölüm 1',
    );
    assert.equal(
      formatSceneViewportAriaLabel(0),
      '3B Labirent Sahnesi — Bölüm 1',
    );
  });

  it('formatSceneViewportTelemetry bağlam kesintisi ve aktif durumlarda doğru telemetri üretir', () => {
    const lostSummary = formatSceneViewportTelemetry({
      level: 3,
      isContextLost: true,
      canvasRevision: 2,
      boardSize: 14,
      shadowMargin: 11,
      isLightScene: false,
    });
    assert.equal(
      lostSummary,
      '3B Sahne: Bölüm 3 | WebGL Bağlamı Kesildi (Revizyon: 2)',
    );

    const activeSummary = formatSceneViewportTelemetry({
      level: 1,
      boardTheme: 'daylight',
      isLightScene: true,
      boardSize: 12,
      shadowMargin: 10,
      canvasRevision: 0,
      isGoalUnlocked: false,
      remainingCrystalsCount: 2,
    });
    assert.equal(
      activeSummary,
      '3B Sahne: Bölüm 1 (12x12) | Tema: daylight (Aydınlık) | Gölge: 10 | Revizyon: 0 | Durum: Aktif (Portal: Kilitli, Kalan Kristal: 2)',
    );
  });

  it('resolveSceneViewportContainerProps semantik region rolünü ve veri denetim özniteliklerini döner', () => {
    const mockLevel = {
      id: 2,
      title: 'Hız Koridoru',
      boardSize: 14,
      startPosition: [0, 0.34, 4],
      goalPosition: [0, 0.35, -4],
      innerWalls: [],
      voidHoles: [],
      crystals: [],
      laserGates: [],
      boostPads: [],
      teleporters: [],
      movingObstacles: [],
    };

    const props = resolveSceneViewportContainerProps(
      {
        boardTheme: 'neon',
        colorScheme: 'dark',
        isContextLost: false,
        canvasRevision: 1,
      },
      mockLevel,
    );

    assert.equal(props.role, 'region');
    assert.equal(
      props['aria-label'],
      '3B Labirent Sahnesi — Bölüm 2: Hız Koridoru',
    );
    assert.match(props.className, /fixed inset-0 z-0 h-screen w-screen/);
    assert.equal(props['data-level'], 2);
    assert.equal(props['data-theme'], 'neon');
    assert.equal(props['data-scheme'], 'dark');
    assert.equal(props['data-context-lost'], false);
    assert.equal(props['data-revision'], 1);
  });

  it('resolveSceneLightingConfig açık ve koyu temalara uygun aydınlatma ve gölge sınırını belirler', () => {
    const lightConfig = resolveSceneLightingConfig(12, 'light', 'wood');
    assert.equal(lightConfig.isLightScene, true);
    assert.equal(lightConfig.sceneBgColor, '#e9eef5');
    assert.equal(lightConfig.fogNear, 18);
    assert.equal(lightConfig.fogFar, 38);
    assert.equal(lightConfig.shadowMargin, 10);

    const darkConfig = resolveSceneLightingConfig(16, 'dark', 'metal');
    assert.equal(darkConfig.isLightScene, false);
    assert.equal(darkConfig.sceneBgColor, '#0f1a2b');
    assert.equal(darkConfig.shadowMargin, 13);
  });

  it('resolveSceneCanvasConfig kamera, gölge, dpr ve fizik yerçekimi ayarlarını paketler', () => {
    const config = resolveSceneCanvasConfig();

    assert.equal(config.shadows, true);
    assert.deepEqual(config.dpr, [1, 1.5]);
    assert.deepEqual(config.physicsGravity, [0, 0, 0]);
    assert.equal(config.camera.fov, 42);
    assert.deepEqual(config.camera.position, [0, 14.5, 10.2]);
    assert.equal(config.gl.powerPreference, 'high-performance');
    assert.equal(config.gl.antialias, true);
  });

  it('resolveSceneViewportState varsayılan parametrelerle Bölüm 1 durumunu eksiksiz üretir', () => {
    const state = resolveSceneViewportState();

    assert.equal(state.activeLevel.id, 1);
    assert.equal(state.activeLevel.boardSize, 12);
    assert.equal(state.isContextLost, false);
    assert.equal(state.canvasRevision, 0);
    assert.equal(state.lightingConfig.isLightScene, false);
    assert.equal(state.containerProps['data-level'], 1);
    assert.match(state.telemetrySummary, /Bölüm 1 \(12x12\)/);
  });

  it('resolveSceneViewportState özel harita ve aydınlık tema ile tam durumu doğru üretir', () => {
    const customLevel = {
      id: 99,
      title: 'Özel Labirent',
      boardSize: 16,
      startPosition: [-5, 0.34, 5],
      goalPosition: [5, 0.35, -5],
      innerWalls: [],
      voidHoles: [],
      crystals: [],
      laserGates: [],
      boostPads: [],
      teleporters: [],
      movingObstacles: [],
    };

    const state = resolveSceneViewportState({
      level: 99,
      customLevel,
      colorScheme: 'light',
      boardTheme: 'wood',
      isContextLost: false,
      canvasRevision: 3,
      isGoalUnlocked: true,
      remainingCrystalsCount: 0,
    });

    assert.equal(state.activeLevel.id, 99);
    assert.equal(state.activeLevel.title, 'Özel Labirent');
    assert.equal(state.activeLevel.boardSize, 16);
    assert.equal(state.isLightScene, true);
    assert.equal(state.canvasRevision, 3);
    assert.equal(state.containerProps['data-level'], 99);
    assert.match(state.telemetrySummary, /Portal: Açık, Kalan Kristal: 0/);
  });

  it('resolveSceneStageProps MazeStage için tüm prop ve dinleyicileri eksiksiz eşler', () => {
    let collectCalled = false;
    let reachGoalCalled = false;

    const mockLevel = {
      id: 1,
      title: 'Klasik',
      boardSize: 12,
      startPosition: [0, 0.34, 4],
      goalPosition: [0, 0.35, -4],
      innerWalls: [],
      voidHoles: [],
      crystals: [],
      laserGates: [],
      boostPads: [],
      teleporters: [],
      movingObstacles: [],
    };

    const stageProps = resolveSceneStageProps({
      levelData: mockLevel,
      isGoalUnlocked: true,
      collectedCrystals: [0, 1],
      ghostPath: [[0, 0]],
      onCollectCrystal: () => {
        collectCalled = true;
      },
      onReachGoal: () => {
        reachGoalCalled = true;
      },
      onFallIntoHole: () => {},
      onLaserHit: () => {},
      onBoostHit: () => {},
      onTeleportHit: () => {},
      onWallHit: () => {},
    });

    assert.equal(stageProps.levelData.id, 1);
    assert.equal(stageProps.isGoalUnlocked, true);
    assert.deepEqual(stageProps.collectedCrystals, [0, 1]);
    assert.deepEqual(stageProps.ghostPath, [[0, 0]]);

    stageProps.onCollectCrystal(0);
    assert.equal(collectCalled, true);

    stageProps.onReachGoal([]);
    assert.equal(reachGoalCalled, true);
  });
});

