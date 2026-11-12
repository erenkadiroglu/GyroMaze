import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getLevelProgress,
  calculateCampaignProgress,
  formatLevelStarBadges,
  STANDARD_LEVEL_THRESHOLDS,
} from '../src/utils/levelProgressUtils.ts';

describe('levelProgressUtils — Bölüm İlerleme, Yıldız ve Seviye Başarı Motoru', () => {
  it('getLevelProgress henüz oynanmamış bölümlerde tamamlanmadı ve 0 yıldız döndürür', () => {
    const progress = getLevelProgress(1, {});
    assert.equal(progress.levelId, 1);
    assert.equal(progress.completed, false);
    assert.equal(progress.bestTime, undefined);
    assert.equal(progress.stars, 0);
  });

  it('getLevelProgress standart eşiklere göre 1, 2 veya 3 yıldız derecesini doğru hesaplar', () => {
    // Bölüm 1 eşikleri: [11.0, 17.0]
    const threeStars = getLevelProgress(1, { 1: 9.8 });
    assert.equal(threeStars.completed, true);
    assert.equal(threeStars.bestTime, 9.8);
    assert.equal(threeStars.stars, 3);

    const twoStars = getLevelProgress(1, { 1: 14.5 });
    assert.equal(twoStars.completed, true);
    assert.equal(twoStars.stars, 2);

    const oneStar = getLevelProgress(1, { 1: 22.0 });
    assert.equal(oneStar.completed, true);
    assert.equal(oneStar.stars, 1);
  });

  it('calculateCampaignProgress boş kayıtlarda sıfır istatistik üretir', () => {
    const summary = calculateCampaignProgress({});
    assert.equal(summary.totalStars, 0);
    assert.equal(summary.maxStars, 15);
    assert.equal(summary.completedCount, 0);
    assert.equal(summary.totalLevels, 5);
    assert.equal(summary.percentage, 0);
    assert.equal(summary.isMaster, false);
  });

  it('calculateCampaignProgress kısmi tamamlamada yıldız toplamını ve yüzdeyi hesaplar', () => {
    // Bölüm 1: 9.0s (3★), Bölüm 2: 16.0s (2★)
    const summary = calculateCampaignProgress({ 1: 9.0, 2: 16.0 });
    assert.equal(summary.totalStars, 5);
    assert.equal(summary.completedCount, 2);
    assert.equal(summary.percentage, 33);
    assert.equal(summary.isMaster, false);
  });

  it('calculateCampaignProgress 5 bölümün tamamı 3 yıldız ile bittiğinde isMaster true döndürür', () => {
    const perfectTimes = {
      1: 9.0, // ≤ 11.0 -> 3★
      2: 13.0, // ≤ 15.5 -> 3★
      3: 17.0, // ≤ 19.5 -> 3★
      4: 16.0, // ≤ 18.0 -> 3★
      5: 20.0, // ≤ 22.0 -> 3★
      99: 12.0, // Özel harita kampanya toplamını etkilememeli
    };
    const summary = calculateCampaignProgress(perfectTimes);
    assert.equal(summary.totalStars, 15);
    assert.equal(summary.completedCount, 5);
    assert.equal(summary.percentage, 100);
    assert.equal(summary.isMaster, true);
  });

  it('formatLevelStarBadges 0..3 yıldızı metin sembollerine biçimlendirir ve sınırları korur', () => {
    assert.equal(formatLevelStarBadges(3), '★★★');
    assert.equal(formatLevelStarBadges(2), '★★☆');
    assert.equal(formatLevelStarBadges(1), '★☆☆');
    assert.equal(formatLevelStarBadges(0), '☆☆☆');
    assert.equal(formatLevelStarBadges(-1), '☆☆☆');
    assert.equal(formatLevelStarBadges(5), '★★★');
  });
});

