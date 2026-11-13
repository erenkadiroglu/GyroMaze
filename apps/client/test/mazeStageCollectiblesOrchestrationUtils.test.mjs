import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  normalizeStageVector3,
  resolveCrystalsMetrics,
  resolveGoalPortalDescriptor,
  resolveCrystalRenderItems,
  formatStageCollectiblesTelemetry,
  resolveStageCollectiblesOrchestrationBundle,
} from '../src/utils/mazeStageCollectiblesOrchestrationUtils.ts';

describe('mazeStageCollectiblesOrchestrationUtils — 3B Sahne Toplanabilirleri Orkestrasyon Motoru', () => {
  describe('normalizeStageVector3', () => {
    it('geçerli 3B koordinat vektörünü korumalıdır', () => {
      const vec = normalizeStageVector3([1.5, 0.42, -3.2]);
      assert.deepEqual(vec, [1.5, 0.42, -3.2]);
    });

    it('bozuk veya tanımsız girdilerde varsayılan fallback değerine dönmelidir', () => {
      assert.deepEqual(normalizeStageVector3(undefined, [1, 2, 3]), [1, 2, 3]);
      assert.deepEqual(normalizeStageVector3([null, NaN, 5], [0, 0, 0]), [0, 0, 5]);
    });
  });

  describe('resolveCrystalsMetrics', () => {
    it('kristal bulunmayan düzeylerde tamamlama durumunu doğru vermelidir', () => {
      const metrics = resolveCrystalsMetrics([], []);
      assert.equal(metrics.totalCount, 0);
      assert.equal(metrics.collectedCount, 0);
      assert.equal(metrics.remainingCount, 0);
      assert.equal(metrics.completionPercentage, 100);
      assert.equal(metrics.isAllCollected, true);
    });

    it('kısmi toplanmış kristallerde metrikleri ve yüzdeleri doğru hesaplamalıdır', () => {
      const crystals = [
        [1, 1],
        [2, 2],
        [3, 3],
        [4, 4],
        [5, 5],
      ];
      const collected = [0, 2]; // 2 kristal toplandı, 3 kaldı

      const metrics = resolveCrystalsMetrics(crystals, collected);
      assert.equal(metrics.totalCount, 5);
      assert.equal(metrics.collectedCount, 2);
      assert.equal(metrics.remainingCount, 3);
      assert.equal(metrics.completionPercentage, 40);
      assert.equal(metrics.isAllCollected, false);
    });

    it('mükerrer veya geçersiz kristal indekslerini güvenle filtrelemelidir', () => {
      const crystals = [
        [0, 0],
        [1, 1],
      ];
      // 0 indeksi mükerrer, 99 indeksi geçersiz
      const collected = [0, 0, 99, -1];

      const metrics = resolveCrystalsMetrics(crystals, collected);
      assert.equal(metrics.totalCount, 2);
      assert.equal(metrics.collectedCount, 1);
      assert.equal(metrics.remainingCount, 1);
      assert.equal(metrics.completionPercentage, 50);
      assert.equal(metrics.isAllCollected, false);
    });
  });

  describe('resolveGoalPortalDescriptor', () => {
    it('kilitli hedef portalı için doğru metin ve uyarı rengi dönmelidir', () => {
      const portal = resolveGoalPortalDescriptor([4, 0, -3], false);
      assert.equal(portal.isUnlocked, false);
      assert.equal(portal.statusLabel, 'Hedef Kilitli');
      assert.equal(portal.visuals.lightColor, '#f59e0b');
      assert.deepEqual(portal.position, [4, 0, -3]);
    });

    it('açık hedef portalı için açık metin ve yeşil renk dönmelidir', () => {
      const portal = resolveGoalPortalDescriptor([4, 0, -3], true);
      assert.equal(portal.isUnlocked, true);
      assert.equal(portal.statusLabel, 'Hedef Açık');
      assert.equal(portal.visuals.lightColor, '#10b981');
    });
  });

  describe('resolveCrystalRenderItems', () => {
    it('kristal dizisini görünürlük ve anahtarlarıyla doğru tanımlayıcılara dönüştürmelidir', () => {
      const crystals = [
        [1.2, -2.4],
        [3.0, 4.0],
      ];
      const collected = [0]; // 0. kristal toplandı

      const items = resolveCrystalRenderItems(crystals, collected, 'rev-lvl-3');
      assert.equal(items.length, 2);

      // Toplanan kristal
      assert.equal(items[0].key, 'crystal-rev-lvl-3-0');
      assert.equal(items[0].isVisible, false);
      assert.equal(items[0].isCollected, true);
      assert.deepEqual(items[0].position, [1.2, 0.42, -2.4]);

      // Kalan kristal
      assert.equal(items[1].key, 'crystal-rev-lvl-3-1');
      assert.equal(items[1].isVisible, true);
      assert.equal(items[1].isCollected, false);
      assert.deepEqual(items[1].position, [3.0, 0.42, 4.0]);
    });
  });

  describe('formatStageCollectiblesTelemetry', () => {
    it('açıklayıcı Türkçe telemetri dizesi üretmelidir', () => {
      const summary = formatStageCollectiblesTelemetry({
        metrics: {
          totalCount: 4,
          collectedCount: 3,
          remainingCount: 1,
          completionRatio: 0.75,
          completionPercentage: 75,
          isAllCollected: false,
        },
        startPosition: [0, 0, 0],
        goalPortal: {
          position: [5, 0, 5],
          isUnlocked: false,
          statusLabel: 'Hedef Kilitli',
          visuals: {},
        },
      });

      assert.match(summary, /Toplanabilirler: 3\/4 Kristal \(%75, Kalan: 1\)/);
      assert.match(summary, /Başlangıç: \[0\.0, 0\.0\]/);
      assert.match(summary, /Hedef: Hedef Kilitli \(\[5\.0, 5\.0\]\)/);
    });
  });

  describe('resolveStageCollectiblesOrchestrationBundle', () => {
    it('tüm toplanabilirler ve geçitler demetini deterministik ve eksiksiz olarak paketlemelidir', () => {
      const bundle = resolveStageCollectiblesOrchestrationBundle({
        levelRevisionKey: 'rev-stage-c-test',
        startPosition: [0, 0, 0],
        goalPosition: [5, 0, 5],
        crystals: [
          [1, 1],
          [2, 2],
        ],
        collectedCrystals: [0],
        isGoalUnlocked: false,
      });

      assert.equal(bundle.safeRevisionKey, 'rev-stage-c-test');
      assert.deepEqual(bundle.startPosition, [0, 0, 0]);
      assert.deepEqual(bundle.startRingPosition, [0, 0.02, 0]);
      assert.deepEqual(bundle.goalPosition, [5, 0, 5]);
      assert.equal(bundle.crystalsMetrics.totalCount, 2);
      assert.equal(bundle.crystalsMetrics.collectedCount, 1);
      assert.equal(bundle.crystalRenderItems.length, 2);
      assert.equal(bundle.goalPortal.isUnlocked, false);
      assert.match(bundle.telemetrySummary, /Toplanabilirler: 1\/2 Kristal/);
    });
  });
});
