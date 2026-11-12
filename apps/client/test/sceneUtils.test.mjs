import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  isLaserGateActive,
  calculateMovingObstacleOffset,
  calculateCameraTargetTransform,
  calculateGhostPlaybackCoord,
  calculateTrailScale,
  resolveThemePalette,
  resolveBallSkinColors,
} from '../src/utils/sceneUtils.ts';

describe('sceneUtils — 3B Sahne Matematik Motoru ve Simülasyon Testleri', () => {
  test('isLaserGateActive lazer periyodunun %52 süresinde aktif, kalanında pasif döner', () => {
    const period = 2.0;
    const phase = 0;

    // t = 0.5 sn (periyodun %25'i) -> aktif olmalı
    assert.equal(isLaserGateActive(0.5, period, phase), true);

    // t = 1.0 sn (periyodun %50'si) -> %52 altında, aktif olmalı
    assert.equal(isLaserGateActive(1.0, period, phase), true);

    // t = 1.2 sn (periyodun %60'ı) -> pasif olmalı
    assert.equal(isLaserGateActive(1.2, period, phase), false);

    // t = 1.9 sn (periyodun %95'i) -> pasif olmalı
    assert.equal(isLaserGateActive(1.9, period, phase), false);

    // t = 2.1 sn (yeni döngü başlangıcı) -> aktif olmalı
    assert.equal(isLaserGateActive(2.1, period, phase), true);
  });

  test('calculateMovingObstacleOffset genlik ve hız sınırları içinde sinüzoidal değer üretir', () => {
    const amplitude = 1.8;
    const speed = 2.0;

    // t = 0 -> sin(0) = 0
    assert.equal(calculateMovingObstacleOffset(0, speed, 0, amplitude), 0);

    // Herhangi bir t anında değer [-amplitude, +amplitude] aralığında olmalıdır
    for (let t = 0; t < 10; t += 0.5) {
      const offset = calculateMovingObstacleOffset(t, speed, 0.5, amplitude);
      assert.ok(offset >= -amplitude - 1e-6);
      assert.ok(offset <= amplitude + 1e-6);
    }
  });

  test('calculateCameraTargetTransform tüm kamera modları için doğru konum ve odak döner', () => {
    const ballPos = { x: 2.0, z: -3.0 };
    const roll = 0.1;
    const pitch = -0.2;

    // 1. Üstten (Topdown) Modu
    const topdown = calculateCameraTargetTransform('topdown', ballPos, roll, pitch);
    assert.deepEqual(topdown.lookAt, [0, 0, 0]);
    assert.equal(topdown.targetPos[1], 18.2);

    // 2. Takip (Follow) Modu
    const follow = calculateCameraTargetTransform('follow', ballPos, roll, pitch);
    assert.ok(follow.lookAt[0] !== 0 || follow.lookAt[2] !== 0);
    assert.equal(follow.targetPos[1], 10.8);

    // 3. İzometrik (Isometric) Modu
    const iso = calculateCameraTargetTransform('isometric', ballPos, roll, pitch);
    assert.deepEqual(iso.lookAt, [0, 0, 0]);
    assert.equal(iso.targetPos[1], 14.5);
  });

  test('calculateGhostPlaybackCoord hayalet yarışçı yolunu enterpole eder ve bitişte gizler', () => {
    const ghostPath = [
      [0, 0],
      [10, 10],
      [20, 20],
    ];

    // t = 0.0 sn -> [0, 0]
    const p0 = calculateGhostPlaybackCoord(ghostPath, 0.0, 10);
    assert.equal(p0.isVisible, true);
    assert.equal(p0.coord[0], 0);
    assert.equal(p0.coord[1], 0);

    // t = 0.05 sn -> 0.5 indeks -> [5, 5]
    const pMid = calculateGhostPlaybackCoord(ghostPath, 0.05, 10);
    assert.equal(pMid.isVisible, true);
    assert.equal(pMid.coord[0], 5);
    assert.equal(pMid.coord[1], 5);

    // t = 0.25 sn -> yolun sonu aşıldığında isVisible false olmalı
    const pEnd = calculateGhostPlaybackCoord(ghostPath, 0.25, 10);
    assert.equal(pEnd.isVisible, false);

    // Geçersiz yol veya negatif süre
    assert.equal(calculateGhostPlaybackCoord(undefined, 1.0).isVisible, false);
    assert.equal(calculateGhostPlaybackCoord(ghostPath, -1.0).isVisible, false);
  });

  test('calculateTrailScale halka sırasına göre orantılı küçülür ve taban sınırı korur', () => {
    const totalCount = 7;
    const scale0 = calculateTrailScale(0, totalCount);
    const scaleLast = calculateTrailScale(6, totalCount);

    assert.ok(scale0 > scaleLast);
    assert.ok(scaleLast >= 0.15);
    assert.equal(calculateTrailScale(100, totalCount), 0.15);
  });

  test('resolveThemePalette ve resolveBallSkinColors doğru renk paletlerini döner', () => {
    // Açık zemin modu
    const light = resolveThemePalette('daylight', 'dark');
    assert.equal(light.boardColor, '#ffffff');

    // Siberpunk modu
    const cyber = resolveThemePalette('cyberpunk', 'dark');
    assert.equal(cyber.boardColor, '#0f1026');

    // Kızıl Kor modu
    const crimson = resolveThemePalette('crimson', 'dark');
    assert.equal(crimson.boardColor, '#1c1214');

    // Bilye kaplamaları
    const emeraldSkin = resolveBallSkinColors('emerald', false);
    assert.equal(emeraldSkin.color, '#10b981');
    assert.ok(emeraldSkin.trailColor);

    const plasmaSkin = resolveBallSkinColors('plasma', false);
    assert.equal(plasmaSkin.color, '#a855f7');

    const chromeDark = resolveBallSkinColors('chrome', false);
    assert.equal(chromeDark.color, '#f4f4f5');

    const chromeLight = resolveBallSkinColors('chrome', true);
    assert.equal(chromeLight.color, '#18181b');
  });
});

