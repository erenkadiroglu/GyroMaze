import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_STAGE_COLLIDER_FRICTION,
  DEFAULT_STAGE_COLLIDER_RESTITUTION,
  resolveCollidersRevisionKey,
  resolveCollidersRigidBodyConfig,
  normalizeColliderWalls,
  normalizeColliderGoalPosition,
  normalizeColliderVoidHoles,
  resolveStageCollidersMetrics,
  formatStageCollidersTelemetry,
  resolveStageCollidersOrchestrationBundle,
} from '../src/utils/mazeStageCollidersOrchestrationUtils.ts';

describe('mazeStageCollidersOrchestrationUtils — 3B Sabit Fizik Çarpıştırıcıları Orkestrasyon Motoru', () => {
  it('varsayılan sürtünme ve sekme sabitleri mevcut fizik ayarlarıyla eşleşmelidir', () => {
    assert.equal(DEFAULT_STAGE_COLLIDER_FRICTION, 0.12);
    assert.equal(DEFAULT_STAGE_COLLIDER_RESTITUTION, 0.18);
  });

  describe('resolveCollidersRevisionKey', () => {
    it('geçerli anahtarı trim ederek korumalı, boş girdilerde varsayılana dönmelidir', () => {
      assert.equal(resolveCollidersRevisionKey('  lvl-3-rev  '), 'lvl-3-rev');
      assert.equal(resolveCollidersRevisionKey(), 'rev-colliders-default');
      assert.equal(resolveCollidersRevisionKey('   '), 'rev-colliders-default');
    });
  });

  describe('resolveCollidersRigidBodyConfig', () => {
    it('varsayılan sabit gövde yapılandırmasını üretmelidir', () => {
      assert.deepEqual(resolveCollidersRigidBodyConfig(), {
        type: 'fixed',
        colliders: false,
        friction: 0.12,
        restitution: 0.18,
      });
    });

    it('özel değerleri uygulamalı, aralık dışı ve bozuk değerleri sınırlamalıdır', () => {
      const custom = resolveCollidersRigidBodyConfig({ friction: 0.3, restitution: 0.05 });
      assert.equal(custom.friction, 0.3);
      assert.equal(custom.restitution, 0.05);

      const clamped = resolveCollidersRigidBodyConfig({ friction: -2, restitution: 5 });
      assert.equal(clamped.friction, 0);
      assert.equal(clamped.restitution, 1);

      const fallback = resolveCollidersRigidBodyConfig({ friction: NaN, restitution: Infinity });
      assert.equal(fallback.friction, 0.12);
      assert.equal(fallback.restitution, 0.18);
    });
  });

  describe('normalizeColliderWalls', () => {
    it('geçerli duvarları korumalı, bozuk elemanları filtrelemeli ve boyutları sınırlamalıdır', () => {
      const result = normalizeColliderWalls([
        { position: [0, 0.4, 6], size: [12, 0.8, 0.36] },
        null,
        { position: [0, 0, 0] },
        { position: [NaN, 1, 2], size: [-3, 0, NaN] },
      ]);

      assert.equal(result.length, 2);
      assert.deepEqual(result[0], { position: [0, 0.4, 6], size: [12, 0.8, 0.36] });
      assert.deepEqual(result[1].position, [0, 1, 2]);
      assert.deepEqual(result[1].size, [0.01, 0.01, 1]);
    });

    it('dizi olmayan girdilerde boş dizi dönmelidir', () => {
      assert.deepEqual(normalizeColliderWalls(), []);
      assert.deepEqual(normalizeColliderWalls(null), []);
    });
  });

  describe('normalizeColliderGoalPosition', () => {
    it('hedef konumunu doğrulamalı ve bozuk değerleri sıfırlamalıdır', () => {
      assert.deepEqual(normalizeColliderGoalPosition([4, 0.4, -4]), [4, 0.4, -4]);
      assert.deepEqual(normalizeColliderGoalPosition([NaN, 1, null]), [0, 1, 0]);
      assert.deepEqual(normalizeColliderGoalPosition(), [0, 0, 0]);
    });
  });

  describe('normalizeColliderVoidHoles', () => {
    it('tuzak deliklerini doğrulamalı, varsayılan ve minimum yarıçapı uygulamalıdır', () => {
      const result = normalizeColliderVoidHoles([
        { position: [1, 2], radius: 0.5 },
        { position: [3, 4] },
        { position: [5, 6], radius: 0.02 },
        { radius: 0.4 },
        undefined,
      ]);

      assert.equal(result.length, 3);
      assert.deepEqual(result[0], { position: [1, 2], radius: 0.5 });
      assert.equal(result[1].radius, 0.42);
      assert.equal(result[2].radius, 0.1);
    });
  });

  describe('resolveStageCollidersMetrics', () => {
    it('katı duvar, sensör ve toplam çarpıştırıcı sayılarını doğru hesaplamalıdır', () => {
      const metrics = resolveStageCollidersMetrics({
        outerWallsCount: 4,
        innerWallsCount: 10,
        voidHoleSensorsCount: 3,
        isMultiplayer: true,
      });

      assert.equal(metrics.totalSolidWallColliders, 14);
      assert.equal(metrics.totalSensorColliders, 4);
      assert.equal(metrics.totalCollidersCount, 18);
      assert.equal(metrics.hasGoalSensor, true);
      assert.equal(metrics.isMultiplayer, true);
    });

    it('negatif sayıları sıfıra sınırlamalıdır', () => {
      const metrics = resolveStageCollidersMetrics({
        outerWallsCount: -1,
        innerWallsCount: -5,
        voidHoleSensorsCount: -2,
        hasGoalSensor: false,
      });
      assert.equal(metrics.totalCollidersCount, 0);
    });
  });

  describe('formatStageCollidersTelemetry', () => {
    it('açıklayıcı Türkçe telemetri dizesi üretmelidir', () => {
      const summary = formatStageCollidersTelemetry(
        resolveStageCollidersMetrics({
          outerWallsCount: 4,
          innerWallsCount: 8,
          voidHoleSensorsCount: 2,
        }),
        resolveCollidersRigidBodyConfig(),
        'lvl-2',
      );

      assert.match(summary, /4 Dış \+ 8 İç Duvar/);
      assert.match(summary, /2 Tuzak Sensörü/);
      assert.match(summary, /Hedef Sensörü/);
      assert.match(summary, /Toplam: 15/);
      assert.match(summary, /Sürtünme: 0\.12, Sekme: 0\.18/);
      assert.match(summary, /Mod: 1P, Rev: lvl-2/);
    });
  });

  describe('resolveStageCollidersOrchestrationBundle', () => {
    it('levelData üzerinden tüm çarpıştırıcı demetini deterministik olarak paketlemelidir', () => {
      const bundle = resolveStageCollidersOrchestrationBundle({
        levelRevisionKey: 'rev-col-test',
        levelData: {
          innerWalls: [{ position: [0, 0.4, 0], size: [4, 0.8, 0.36] }],
          goalPosition: [5, 0.4, 5],
          voidHoles: [{ position: [2, 2] }],
        },
        outerWalls: [
          { position: [0, 0.4, 6], size: [12, 0.8, 0.36] },
          { position: [0, 0.4, -6], size: [12, 0.8, 0.36] },
        ],
        isMultiplayer: true,
      });

      assert.equal(bundle.safeRevisionKey, 'rev-col-test');
      assert.equal(bundle.rigidBodyConfig.type, 'fixed');
      assert.equal(bundle.outerWalls.length, 2);
      assert.equal(bundle.innerWalls.length, 1);
      assert.deepEqual(bundle.goalPosition, [5, 0.4, 5]);
      assert.equal(bundle.voidHoles[0].radius, 0.42);
      assert.equal(bundle.metrics.totalCollidersCount, 5);
      assert.match(bundle.telemetrySummary, /Mod: 2P/);
    });

    it('parametresiz çağrıda çökmeden güvenli varsayılan demet dönmelidir', () => {
      const bundle = resolveStageCollidersOrchestrationBundle();
      assert.equal(bundle.safeRevisionKey, 'rev-colliders-default');
      assert.equal(bundle.metrics.totalCollidersCount, 1);
      assert.deepEqual(bundle.goalPosition, [0, 0, 0]);
    });
  });
});

