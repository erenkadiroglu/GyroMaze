import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  normalizeHazardLists,
  resolveStageHazardsRevisionKey,
  resolveStageHazardsMetrics,
  formatStageHazardsTelemetry,
  resolveStageHazardsOrchestrationBundle,
} from '../src/utils/mazeStageHazardsOrchestrationUtils.ts';

describe('mazeStageHazardsOrchestrationUtils — 3B Sahne Tehlikeleri Orkestrasyon Motoru', () => {
  describe('normalizeHazardLists', () => {
    it('tanımsız ve eksik alanlarda boş diziler dönmelidir', () => {
      const result = normalizeHazardLists({});
      assert.deepEqual(result.voidHoles, []);
      assert.deepEqual(result.boostPads, []);
      assert.deepEqual(result.teleporters, []);
      assert.deepEqual(result.laserGates, []);
      assert.deepEqual(result.movingObstacles, []);
    });

    it('sağlanan tehlike listelerini korumalıdır', () => {
      const mockHoles = [{ position: [0, 0], radius: 0.42 }];
      const mockPads = [{ position: [1, 2], direction: 'up' }];

      const result = normalizeHazardLists({
        voidHoles: mockHoles,
        boostPads: mockPads,
      });

      assert.equal(result.voidHoles.length, 1);
      assert.equal(result.boostPads.length, 1);
      assert.equal(result.teleporters.length, 0);
    });
  });

  describe('resolveStageHazardsRevisionKey', () => {
    it('geçerli revizyon anahtarını trim ederek korumalıdır', () => {
      assert.equal(resolveStageHazardsRevisionKey('lvl-hazards-1'), 'lvl-hazards-1');
      assert.equal(resolveStageHazardsRevisionKey('  rev-custom-9  '), 'rev-custom-9');
    });

    it('boş veya tanımsız girdilerde varsayılan rev-hazards-default dönmelidir', () => {
      assert.equal(resolveStageHazardsRevisionKey(), 'rev-hazards-default');
      assert.equal(resolveStageHazardsRevisionKey(''), 'rev-hazards-default');
      assert.equal(resolveStageHazardsRevisionKey('   '), 'rev-hazards-default');
    });
  });

  describe('resolveStageHazardsMetrics', () => {
    it('tehlike bulunmadığında metrikleri sıfır ve hasActiveHazards false olarak belirlemelidir', () => {
      const metrics = resolveStageHazardsMetrics({
        voidHoles: [],
        boostPads: [],
        teleporters: [],
        laserGates: [],
        movingObstacles: [],
      });

      assert.equal(metrics.totalHazardsCount, 0);
      assert.equal(metrics.hasActiveHazards, false);
      assert.equal(metrics.teleporterPortalsCount, 0);
    });

    it('farklı tehlikelerin adetlerini ve ışınlanma kapılarını doğru hesaplamalıdır', () => {
      const metrics = resolveStageHazardsMetrics({
        voidHoles: [{ position: [0, 0], radius: 0.42 }, { position: [1, 1], radius: 0.42 }],
        boostPads: [{ position: [2, 2], direction: 'up' }],
        teleporters: [{ entry: [3, 3], exit: [4, 4] }], // 1 çift = 2 kapı
        laserGates: [{ position: [5, 5], orientation: 'horizontal', length: 3, interval: 2, dutyCycle: 0.5 }],
        movingObstacles: [{ start: [0, 0], end: [2, 2], speed: 1.5, size: [0.5, 0.5, 0.5] }],
      });

      assert.equal(metrics.voidHolesCount, 2);
      assert.equal(metrics.boostPadsCount, 1);
      assert.equal(metrics.teleportersCount, 1);
      assert.equal(metrics.teleporterPortalsCount, 2);
      assert.equal(metrics.laserGatesCount, 1);
      assert.equal(metrics.movingObstaclesCount, 1);
      assert.equal(metrics.totalHazardsCount, 6);
      assert.equal(metrics.hasActiveHazards, true);
    });
  });

  describe('formatStageHazardsTelemetry', () => {
    it('tehlike yoksa açıklayıcı boş durum dizesi üretmelidir', () => {
      const summary = formatStageHazardsTelemetry(
        {
          voidHolesCount: 0,
          boostPadsCount: 0,
          teleportersCount: 0,
          teleporterPortalsCount: 0,
          laserGatesCount: 0,
          movingObstaclesCount: 0,
          totalHazardsCount: 0,
          hasActiveHazards: false,
        },
        'rev-clean',
      );

      assert.match(summary, /Aktif tehlike veya engel bulunmuyor/);
      assert.match(summary, /Rev: rev-clean/);
    });

    it('tehlikeler mevcut olduğunda kategori detaylarını listelemelidir', () => {
      const summary = formatStageHazardsTelemetry(
        {
          voidHolesCount: 3,
          boostPadsCount: 2,
          teleportersCount: 1,
          teleporterPortalsCount: 2,
          laserGatesCount: 1,
          movingObstaclesCount: 1,
          totalHazardsCount: 8,
          hasActiveHazards: true,
        },
        'rev-hard',
      );

      assert.match(summary, /3 Tuzak Deliği/);
      assert.match(summary, /2 Hızlandırma Rampası/);
      assert.match(summary, /1 Işınlanma Çifti/);
      assert.match(summary, /1 Lazer Kapısı/);
      assert.match(summary, /1 Hareketli Engel/);
      assert.match(summary, /Toplam: 8 Tehlike Ögesi/);
      assert.match(summary, /Rev: rev-hard/);
    });
  });

  describe('resolveStageHazardsOrchestrationBundle', () => {
    it('tüm tehlike demetini deterministik ve eksiksiz olarak paketlemelidir', () => {
      const bundle = resolveStageHazardsOrchestrationBundle({
        levelRevisionKey: 'rev-stage-h-test',
        voidHoles: [{ position: [0, 0], radius: 0.42 }],
        boostPads: [{ position: [2, 2], direction: 'right' }],
      });

      assert.equal(bundle.safeRevisionKey, 'rev-stage-h-test');
      assert.equal(bundle.voidHoles.length, 1);
      assert.equal(bundle.boostPads.length, 1);
      assert.equal(bundle.metrics.totalHazardsCount, 2);
      assert.match(bundle.telemetrySummary, /Sahne Tehlikeleri: 1 Tuzak Deliği, 1 Hızlandırma Rampası/);
    });
  });
});
