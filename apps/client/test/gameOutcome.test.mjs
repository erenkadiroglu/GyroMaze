import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateEarnedStars,
  formatStarGoalMessage,
  isPersonalBest,
  calculateTimeAttackLimit,
  cleanPlayerName,
  resolveMultiplayerWinnerText,
  formatOutcomeStarAriaLabel,
  formatDefeatCrystalSummary,
} from '../src/utils/gameOutcomeUtils.ts';

describe('gameOutcomeUtils — Zafer Değerlendirme, Yıldız ve Rekor Motoru', () => {
  it('süreye göre 3, 2 veya 1 yıldız derecelerini doğru hesaplar', () => {
    // Özel eşikler: [12, 20]
    assert.equal(calculateEarnedStars(8.5, [12, 20]), 3);
    assert.equal(calculateEarnedStars(12.0, [12, 20]), 3);
    assert.equal(calculateEarnedStars(12.1, [12, 20]), 2);
    assert.equal(calculateEarnedStars(20.0, [12, 20]), 2);
    assert.equal(calculateEarnedStars(20.1, [12, 20]), 1);
    assert.equal(calculateEarnedStars(45.0, [12, 20]), 1);

    // Varsayılan eşikler: [15, 24]
    assert.equal(calculateEarnedStars(14.9), 3);
    assert.equal(calculateEarnedStars(18.0), 2);
    assert.equal(calculateEarnedStars(30.0), 1);
  });

  it('kazanılan yıldız sayısına göre doğru hedef fark mesajı üretir', () => {
    const msg3 = formatStarGoalMessage(10.0, [12, 20]);
    assert.match(msg3, /Mükemmel! 3 yıldız hedefini/);

    const msg2 = formatStarGoalMessage(14.5, [12, 20]);
    assert.match(msg2, /3 yıldız hedefine yalnızca 2\.5 sn kaldı/);

    const msg1 = formatStarGoalMessage(25.0, [12, 20]);
    assert.match(msg1, /2 yıldız hedefine 5\.0 sn kaldı/);
  });

  it('kişisel en iyi süre (Personal Best) durumunu doğru tespit eder', () => {
    // İlk tamamlama (önceki rekor yok)
    assert.equal(isPersonalBest(15.4, undefined), true);
    assert.equal(isPersonalBest(15.4, 0), true);

    // Yeni rekor (daha hızlı)
    assert.equal(isPersonalBest(14.2, 16.0), true);

    // Eski rekor daha iyi veya eşit
    assert.equal(isPersonalBest(16.0, 16.0), false);
    assert.equal(isPersonalBest(18.5, 16.0), false);

    // Geçersiz süreler
    assert.equal(isPersonalBest(0, 16.0), false);
    assert.equal(isPersonalBest(-5, 16.0), false);
    assert.equal(isPersonalBest(NaN, 16.0), false);
  });

  it('calculateTimeAttackLimit, cleanPlayerName, resolveMultiplayerWinnerText ve formatlayıcıları doğrular', () => {
    // calculateTimeAttackLimit
    assert.equal(calculateTimeAttackLimit(24), 28);
    assert.equal(calculateTimeAttackLimit(10), 14); // En az 14 sn
    assert.equal(calculateTimeAttackLimit(0), 28); // Varsayılan 24 -> 28

    // cleanPlayerName
    assert.equal(cleanPlayerName('  Eren  '), 'Eren');
    assert.equal(cleanPlayerName(''), 'Oyuncu');
    assert.equal(cleanPlayerName(null), 'Oyuncu');
    assert.equal(cleanPlayerName('a'.repeat(30)), 'a'.repeat(24));

    // resolveMultiplayerWinnerText
    assert.equal(
      resolveMultiplayerWinnerText(1),
      '1. Oyuncu (Ana bilye) kazandı',
    );
    assert.equal(
      resolveMultiplayerWinnerText(2),
      '2. Oyuncu (Altın bilye) kazandı',
    );
    assert.equal(
      resolveMultiplayerWinnerText(null),
      'Kazanan belirlenemedi',
    );

    // formatOutcomeStarAriaLabel
    assert.equal(
      formatOutcomeStarAriaLabel(3),
      'Performans: 3 üzerinden 3 yıldız',
    );
    assert.equal(
      formatOutcomeStarAriaLabel(5),
      'Performans: 3 üzerinden 3 yıldız',
    );
    assert.equal(
      formatOutcomeStarAriaLabel(0),
      'Performans: 3 üzerinden 1 yıldız',
    );

    // formatDefeatCrystalSummary
    assert.equal(formatDefeatCrystalSummary(2, 5), '2/5');
    assert.equal(formatDefeatCrystalSummary(NaN, 3), '0/3');
  });
});

