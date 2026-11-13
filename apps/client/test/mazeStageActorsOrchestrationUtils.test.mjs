import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_STAGE_BALL_RADIUS,
  DEFAULT_STAGE_TRAIL_COUNT,
  normalizeActorPosition,
  resolveActorSpawnPositions,
  resolveActorDescriptors,
  formatStageActorsTelemetry,
  resolveStageActorsOrchestrationBundle,
} from '../src/utils/mazeStageActorsOrchestrationUtils.ts';

describe('mazeStageActorsOrchestrationUtils — 3B Sahne Aktörleri Orkestrasyon Motoru', () => {
  it('varsayılan aktör sabitleri beklenen değerleri taşımalıdır', () => {
    assert.equal(DEFAULT_STAGE_BALL_RADIUS, 0.34);
    assert.equal(DEFAULT_STAGE_TRAIL_COUNT, 7);
  });

  describe('normalizeActorPosition', () => {
    it('geçerli 3B koordinat vektörünü korumalıdır', () => {
      const pos = normalizeActorPosition([2.5, 0.34, -4.0]);
      assert.deepEqual(pos, [2.5, 0.34, -4.0]);
    });

    it('tanımsız veya bozuk girdilerde varsayılan fallback vektörüne dönmelidir', () => {
      assert.deepEqual(normalizeActorPosition(undefined, [0, 0, 0]), [0, 0, 0]);
      assert.deepEqual(normalizeActorPosition([null, NaN, 3], [1, 1, 1]), [1, 1, 3]);
    });
  });

  describe('resolveActorSpawnPositions', () => {
    it('1P, 2P ve hayalet bilye koordinatlarını doğru hesaplamalıdır', () => {
      const { p1Spawn, p2Spawn, ghostSpawn } = resolveActorSpawnPositions(
        [0, 0.34, 0],
        0.8,
        -0.5,
        0.34,
      );

      assert.deepEqual(p1Spawn, [0, 0.34, 0]);
      assert.deepEqual(p2Spawn, [0.8, 0.34, -0.5]);
      assert.deepEqual(ghostSpawn, [0, 0.34, 0]);
    });
  });

  describe('resolveActorDescriptors', () => {
    it('aktörlerin tanımlayıcı nesnelerini, yarıçaplarını ve görünürlüklerini doğru üretmelidir', () => {
      const descriptors = resolveActorDescriptors({
        p1Spawn: [0, 0.34, 0],
        p2Spawn: [0.72, 0.34, 0],
        ghostSpawn: [0, 0.34, 0],
        trailInitialTransform: {
          position: [0, 0.025, 0],
          rotation: [-Math.PI / 2, 0, 0],
        },
      });

      // 1. Oyuncu Metalik Bilye
      assert.equal(descriptors.p1Ball.name, 'visual-ball-p1');
      assert.equal(descriptors.p1Ball.slot, 1);
      assert.equal(descriptors.p1Ball.initiallyVisible, true);
      assert.equal(descriptors.p1Ball.radius, 0.34);

      // 2. Oyuncu Altın Bilye (Başlangıçta gizli)
      assert.equal(descriptors.p2Ball.name, 'visual-ball-p2');
      assert.equal(descriptors.p2Ball.slot, 2);
      assert.equal(descriptors.p2Ball.initiallyVisible, false);

      // Hayalet Yarışçı Hologramı
      assert.equal(descriptors.ghostBall.name, 'ghost-ball');
      assert.equal(descriptors.ghostBall.initiallyVisible, false);
      assert.equal(descriptors.ghostBall.radius, 0.3128); // 0.34 * 0.92

      // Neon Hareket İzi
      assert.equal(descriptors.motionTrail.name, 'motion-trail');
      assert.equal(descriptors.motionTrail.count, 7);
      assert.equal(descriptors.motionTrail.circleRadius, 0.2312); // 0.34 * 0.68
    });
  });

  describe('formatStageActorsTelemetry', () => {
    it('açıklayıcı Türkçe telemetri dizesi üretmelidir', () => {
      const summary = formatStageActorsTelemetry({
        p1Spawn: [0, 0.34, 0],
        p2Spawn: [0.72, 0.34, 0],
        p2OffsetX: 0.72,
        p2OffsetZ: 0,
        trailCount: 7,
      });

      assert.match(summary, /Sahne Aktörleri: P1 \[0\.00, 0\.00\], P2 \[0\.72, 0\.00\]/);
      assert.match(summary, /Ofset: \[0\.72, 0\.00\]/);
      assert.match(summary, /7 Neon İzi/);
    });
  });

  describe('resolveStageActorsOrchestrationBundle', () => {
    it('tüm dinamik aktörler demetini deterministik ve eksiksiz olarak paketlemelidir', () => {
      const bundle = resolveStageActorsOrchestrationBundle({
        startPosition: [1, 0.34, -2],
        p2SpawnOffsetX: 0.72,
        p2SpawnOffsetZ: 0,
      });

      assert.deepEqual(bundle.startPosition, [1, 0.34, -2]);
      assert.deepEqual(bundle.p1Spawn, [1, 0.34, -2]);
      assert.deepEqual(bundle.p2Spawn, [1.72, 0.34, -2]);
      assert.equal(bundle.p2SpawnOffsetX, 0.72);
      assert.equal(bundle.descriptors.p1Ball.initiallyVisible, true);
      assert.equal(bundle.descriptors.motionTrail.count, 7);
      assert.match(bundle.telemetrySummary, /Sahne Aktörleri: P1 \[1\.00, -2\.00\]/);
    });
  });
});

