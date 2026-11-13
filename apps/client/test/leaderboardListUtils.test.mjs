import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveScoreTimeColorClass,
  shouldShowLevelBadge,
  shouldShowRecordDate,
  resolveRankAriaDescription,
  formatRowAriaLabel,
} from '../src/utils/leaderboardListUtils.ts';

test('leaderboardListUtils — Liderlik Tablosu Liste Kayıtları Yardımcıları', async (t) => {
  await t.test('resolveScoreTimeColorClass birincilik ve diğer derecelere doğru renk sınıfını verir', () => {
    assert.equal(resolveScoreTimeColorClass(true), 'text-brass');
    assert.equal(resolveScoreTimeColorClass(false), 'text-ok');
  });

  await t.test('shouldShowLevelBadge sadece "all" seçildiğinde true döner', () => {
    assert.equal(shouldShowLevelBadge('all'), true);
    assert.equal(shouldShowLevelBadge(1), false);
    assert.equal(shouldShowLevelBadge(5), false);
  });

  await t.test('shouldShowRecordDate pozitif zaman damgalarını kabul eder ve geçersizleri reddeder', () => {
    assert.equal(shouldShowRecordDate(1700000000000), true);
    assert.equal(shouldShowRecordDate(1), true);
    assert.equal(shouldShowRecordDate(0), false);
    assert.equal(shouldShowRecordDate(-100), false);
    assert.equal(shouldShowRecordDate(Number.NaN), false);
    assert.equal(shouldShowRecordDate(null), false);
    assert.equal(shouldShowRecordDate(undefined), false);
  });

  await t.test('resolveRankAriaDescription podyum ve sonraki sıralar için doğru açıklamaları üretir', () => {
    assert.equal(resolveRankAriaDescription(0), '1. sıra, altın madalya');
    assert.equal(resolveRankAriaDescription(1), '2. sıra, gümüş madalya');
    assert.equal(resolveRankAriaDescription(2), '3. sıra, bronz madalya');
    assert.equal(resolveRankAriaDescription(3), '4. sıra');
    assert.equal(resolveRankAriaDescription(9), '10. sıra');
    assert.equal(resolveRankAriaDescription(-1), '1. sıra, altın madalya');
  });

  await t.test('formatRowAriaLabel oyuncu adı, derece, süre ve seviye bilgisini birleştirir', () => {
    assert.equal(
      formatRowAriaLabel(0, 'Eren', '12.45s', 'Bölüm 01'),
      '1. sıra, altın madalya: Eren, süre 12.45s, Bölüm 01',
    );
    assert.equal(
      formatRowAriaLabel(3, '  Ahmet  ', '19.80s'),
      '4. sıra: Ahmet, süre 19.80s',
    );
    assert.equal(
      formatRowAriaLabel(1, '', '14.10s'),
      '2. sıra, gümüş madalya: Anonim, süre 14.10s',
    );
  });
});

