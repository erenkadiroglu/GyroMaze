import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  normalizeWallItems,
  resolveStageWallsRevisionKey,
  resolveWallRenderDescriptors,
  resolveStageWallsMetrics,
  formatStageWallsTelemetry,
  resolveStageWallsOrchestrationBundle,
} from '../src/utils/mazeStageWallsOrchestrationUtils.ts';

describe('mazeStageWallsOrchestrationUtils — 3B Sahne Duvarları Orkestrasyon Motoru', () => {
  describe('normalizeWallItems', () => {
    it('geçerli duvar listesini koordinat ve boyutlarıyla korumalıdır', () => {
      const input = [
        { position: [0, 0.4, -6], size: [12, 0.8, 0.36] },
        { position: [2, 0.4, 1], size: [0.36, 0.8, 4] },
      ];

      const result = normalizeWallItems(input);
      assert.equal(result.length, 2);
      assert.deepEqual(result[0].position, [0, 0.4, -6]);
      assert.deepEqual(result[0].size, [12, 0.8, 0.36]);
    });

    it('bozuk veya tanımsız elemanları güvenle filtrelemelidir', () => {
      const input = [
        null,
        undefined,
        { position: 'gecersiz', size: [1, 1, 1] },
        { position: [0, 0, 0] },
        { position: [1, 2, 3], size: [-5, 0, NaN] },
      ];

      const result = normalizeWallItems(input);
      assert.equal(result.length, 1);
      assert.deepEqual(result[0].position, [1, 2, 3]);
      // -5, 0 ve NaN için min 0.01 veya 1 fallback
      assert.equal(result[0].size[0], 0.01);
      assert.equal(result[0].size[1], 0.01);
      assert.equal(result[0].size[2], 1);
    });

    it('boş veya dizi olmayan girdilerde boş dizi dönmelidir', () => {
      assert.deepEqual(normalizeWallItems(), []);
      assert.deepEqual(normalizeWallItems(null), []);
      assert.deepEqual(normalizeWallItems([]), []);
    });
  });

  describe('resolveStageWallsRevisionKey', () => {
    it('geçerli revizyon anahtarını trim ederek korumalıdır', () => {
      assert.equal(resolveStageWallsRevisionKey('rev-level-1'), 'rev-level-1');
      assert.equal(resolveStageWallsRevisionKey('  rev-custom-42  '), 'rev-custom-42');
    });

    it('boş, tanımsız veya geçersiz girdilerde varsayılan rev-default dönmelidir', () => {
      assert.equal(resolveStageWallsRevisionKey(), 'rev-default');
      assert.equal(resolveStageWallsRevisionKey(''), 'rev-default');
      assert.equal(resolveStageWallsRevisionKey('   '), 'rev-default');
      assert.equal(resolveStageWallsRevisionKey(null), 'rev-default');
    });
  });

  describe('resolveWallRenderDescriptors', () => {
    it('dış ve iç duvarlar için doğru anahtar, geometri ve hacim üretmelidir', () => {
      const walls = [
        { position: [0, 0.4, 6], size: [12, 0.8, 0.36] },
      ];

      const descriptors = resolveWallRenderDescriptors(walls, 'outer', 'lvl-rev-1');
      assert.equal(descriptors.length, 1);
      assert.equal(descriptors[0].key, 'vis-outer-lvl-rev-1-0');
      assert.equal(descriptors[0].type, 'outer');
      assert.deepEqual(descriptors[0].position, [0, 0.4, 6]);
      assert.deepEqual(descriptors[0].geometryArgs, [12, 0.8, 0.36]);
      assert.equal(descriptors[0].volume, 3.456);
    });
  });

  describe('resolveStageWallsMetrics', () => {
    it('duvar adetleri ve toplam hacmi doğru hesaplamalıdır', () => {
      const outerDescriptors = [
        { key: 'o1', type: 'outer', position: [0, 0, 0], size: [10, 1, 1], geometryArgs: [10, 1, 1], volume: 10 },
        { key: 'o2', type: 'outer', position: [0, 0, 0], size: [10, 1, 1], geometryArgs: [10, 1, 1], volume: 10 },
      ];
      const innerDescriptors = [
        { key: 'i1', type: 'inner', position: [0, 0, 0], size: [2, 1, 1], geometryArgs: [2, 1, 1], volume: 2 },
      ];

      const metrics = resolveStageWallsMetrics(outerDescriptors, innerDescriptors);
      assert.equal(metrics.outerWallsCount, 2);
      assert.equal(metrics.innerWallsCount, 1);
      assert.equal(metrics.totalWallsCount, 3);
      assert.equal(metrics.totalVolume, 22);
    });
  });

  describe('formatStageWallsTelemetry', () => {
    it('açıklayıcı Türkçe telemetri dizesi üretmelidir', () => {
      const summary = formatStageWallsTelemetry(
        { outerWallsCount: 4, innerWallsCount: 16, totalWallsCount: 20, totalVolume: 18.5 },
        'lvl-1-rev',
      );

      assert.match(summary, /Labirent Duvarları: 4 Dış Sınır, 16 İç Duvar/);
      assert.match(summary, /Toplam: 20/);
      assert.match(summary, /Hacim: 18\.50m³/);
      assert.match(summary, /Rev: lvl-1-rev/);
    });
  });

  describe('resolveStageWallsOrchestrationBundle', () => {
    it('tüm sahne duvarları demetini deterministik ve eksiksiz olarak paketlemelidir', () => {
      const bundle = resolveStageWallsOrchestrationBundle({
        levelRevisionKey: 'rev-stage-test',
        outerWalls: [
          { position: [0, 0.4, 6], size: [12, 0.8, 0.36] },
          { position: [0, 0.4, -6], size: [12, 0.8, 0.36] },
        ],
        innerWalls: [
          { position: [0, 0.4, 0], size: [4, 0.8, 0.36] },
        ],
      });

      assert.equal(bundle.safeRevisionKey, 'rev-stage-test');
      assert.equal(bundle.outerWalls.length, 2);
      assert.equal(bundle.innerWalls.length, 1);
      assert.equal(bundle.metrics.totalWallsCount, 3);
      assert.equal(bundle.outerDescriptors[0].key, 'vis-outer-rev-stage-test-0');
      assert.equal(bundle.innerDescriptors[0].key, 'vis-inner-rev-stage-test-0');
      assert.match(bundle.telemetrySummary, /Toplam: 3/);
    });
  });
});

