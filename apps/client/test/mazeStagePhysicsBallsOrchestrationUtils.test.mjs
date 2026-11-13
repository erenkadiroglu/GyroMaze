import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_PHYSICS_BALL_RADIUS,
  DEFAULT_PHYSICS_RESTITUTION,
  DEFAULT_PHYSICS_FRICTION,
  DEFAULT_ENABLED_TRANSLATIONS,
  DEFAULT_ENABLED_ROTATIONS,
  resolvePhysicsBallRigidBodyConfig,
  resolvePhysicsBallsSpawnPair,
  createSafeBallCollisionHandler,
  formatPhysicsBallsTelemetry,
  resolvePhysicsBallsOrchestrationBundle,
} from '../src/utils/mazeStagePhysicsBallsOrchestrationUtils.ts';

describe('mazeStagePhysicsBallsOrchestrationUtils — 3B Fizik Küreleri Orkestrasyon Motoru', () => {
  it('varsayılan fizik sabitleri doğru ve beklenen zıplamasız değerleri taşımalıdır', () => {
    assert.equal(DEFAULT_PHYSICS_BALL_RADIUS, 0.34);
    assert.equal(DEFAULT_PHYSICS_RESTITUTION, 0.22);
    assert.equal(DEFAULT_PHYSICS_FRICTION, 0.08);
    assert.deepEqual(DEFAULT_ENABLED_TRANSLATIONS, [true, false, true]);
    assert.deepEqual(DEFAULT_ENABLED_ROTATIONS, [false, false, false]);
  });

  describe('resolvePhysicsBallRigidBodyConfig', () => {
    it('1. ve 2. oyuncu için dinamik rigid body yapılandırmasını doğru üretmelidir', () => {
      const p1Config = resolvePhysicsBallRigidBodyConfig(1, [0, 0.34, 0]);
      assert.equal(p1Config.name, 'ball-p1');
      assert.equal(p1Config.slot, 1);
      assert.equal(p1Config.type, 'dynamic');
      assert.equal(p1Config.colliders, false);
      assert.deepEqual(p1Config.position, [0, 0.34, 0]);
      assert.deepEqual(p1Config.enabledTranslations, [true, false, true]);
      assert.deepEqual(p1Config.enabledRotations, [false, false, false]);
      assert.equal(p1Config.restitution, 0.22);
      assert.equal(p1Config.friction, 0.08);
      assert.equal(p1Config.ccd, true);
      assert.equal(p1Config.colliderRadius, 0.34);

      const p2Config = resolvePhysicsBallRigidBodyConfig(2, [1.5, 0.34, -2]);
      assert.equal(p2Config.name, 'ball-p2');
      assert.equal(p2Config.slot, 2);
      assert.deepEqual(p2Config.position, [1.5, 0.34, -2]);
    });

    it('özel fizik seçeneklerini ve sınırlandırmaları güvenle uygulamalıdır', () => {
      const customConfig = resolvePhysicsBallRigidBodyConfig(1, [0, 0.34, 0], {
        restitution: 0.85,
        friction: 0.15,
        ccd: false,
        colliderRadius: 0.4,
      });

      assert.equal(customConfig.restitution, 0.85);
      assert.equal(customConfig.friction, 0.15);
      assert.equal(customConfig.ccd, false);
      assert.equal(customConfig.colliderRadius, 0.4);

      // Sınırlandırma (clamp) testi
      const clampedConfig = resolvePhysicsBallRigidBodyConfig(1, [0, 0.34, 0], {
        restitution: 2.5, // 1'i aşamaz
        friction: -0.5, // 0'ın altına inemez
        colliderRadius: -1, // 0.05 altına inemez
      });

      assert.equal(clampedConfig.restitution, 1);
      assert.equal(clampedConfig.friction, 0);
      assert.equal(clampedConfig.colliderRadius, 0.05);
    });
  });

  describe('resolvePhysicsBallsSpawnPair', () => {
    it('1P ve 2P doğuş pozisyonlarını başlangıç ve ofsetlere göre doğru hesaplamalıdır', () => {
      const pair = resolvePhysicsBallsSpawnPair([0, 0.34, 0], 0.8, -0.4);

      assert.deepEqual(pair.p1Spawn.position, [0, 0.34, 0]);
      assert.deepEqual(pair.p2Spawn.position, [0.8, 0.34, -0.4]);
      assert.equal(pair.offsetX, 0.8);
      assert.equal(pair.offsetZ, -0.4);
    });

    it('tanımsız veya bozuk ofsetlerde güvenli varsayılan değerleri kullanmalıdır', () => {
      const pair = resolvePhysicsBallsSpawnPair([-2, 0.34, 4]);

      assert.deepEqual(pair.p1Spawn.position, [-2, 0.34, 4]);
      assert.deepEqual(pair.p2Spawn.position, [-1.28, 0.34, 4]); // -2 + 0.72 = -1.28
      assert.equal(pair.offsetX, 0.72);
      assert.equal(pair.offsetZ, 0);
    });
  });

  describe('createSafeBallCollisionHandler', () => {
    it('çarpışma geri çağrısını slot parametresi ile doğru tetiklemelidir', () => {
      let triggeredSlot = null;
      const handler = createSafeBallCollisionHandler(1, (slot) => {
        triggeredSlot = slot;
      });

      handler();
      assert.equal(triggeredSlot, 1);

      const handlerP2 = createSafeBallCollisionHandler(2, (slot) => {
        triggeredSlot = slot;
      });

      handlerP2();
      assert.equal(triggeredSlot, 2);
    });

    it('geri çağrı fonksiyonu verilmediğinde veya hata fırlattığında güvenle çalışmalıdır', () => {
      const noopHandler = createSafeBallCollisionHandler(1);
      assert.doesNotThrow(() => noopHandler());

      const errorHandler = createSafeBallCollisionHandler(2, () => {
        throw new Error('Test Hatası');
      });
      assert.doesNotThrow(() => errorHandler());
    });
  });

  describe('formatPhysicsBallsTelemetry', () => {
    it('tek oyunculu modda açıklayıcı telemetri dizesi üretmelidir', () => {
      const summary = formatPhysicsBallsTelemetry({
        isMultiplayer: false,
        p1Position: [0, 0.34, 0],
        ccd: true,
      });

      assert.match(summary, /Fizik Küreleri: 1P Aktif/);
      assert.match(summary, /Doğuş: \[0\.00, 0\.34, 0\.00\]/);
      assert.match(summary, /Sıfır Zıplama/);
      assert.match(summary, /CCD: Açık/);
    });

    it('çok oyunculu modda her iki kürenin konumlarını içermelidir', () => {
      const summary = formatPhysicsBallsTelemetry({
        isMultiplayer: true,
        p1Position: [-1.5, 0.34, 2.5],
        p2Position: [-0.78, 0.34, 2.5],
        ccd: false,
      });

      assert.match(summary, /Fizik Küreleri: 1P & 2P Aktif/);
      assert.match(summary, /P1: \[-1\.50, 0\.34, 2\.50\]/);
      assert.match(summary, /P2: \[-0\.78, 0\.34, 2\.50\]/);
      assert.match(summary, /CCD: Kapalı/);
    });
  });

  describe('resolvePhysicsBallsOrchestrationBundle', () => {
    it('tüm fizik küreleri demetini deterministik ve eksiksiz olarak paketlemelidir', () => {
      const bundle = resolvePhysicsBallsOrchestrationBundle({
        startPosition: [0, 0.34, 0],
        p2SpawnOffsetX: 0.72,
        p2SpawnOffsetZ: 0,
        isMultiplayer: true,
      });

      assert.equal(bundle.isMultiplayer, true);
      assert.equal(bundle.p1BallConfig.name, 'ball-p1');
      assert.equal(bundle.p2BallConfig.name, 'ball-p2');
      assert.deepEqual(bundle.p1BallConfig.position, [0, 0.34, 0]);
      assert.deepEqual(bundle.p2BallConfig.position, [0.72, 0.34, 0]);
      assert.match(bundle.telemetrySummary, /Fizik Küreleri: 1P & 2P Aktif/);
    });
  });
});

