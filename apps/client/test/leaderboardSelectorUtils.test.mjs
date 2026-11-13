import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatLevelTabLabel,
  resolveLevelTabAriaLabel,
  resolveTabActiveClasses,
  resolvePrevLevelTarget,
  resolveNextLevelTarget,
  getLeaderboardRefreshLabel,
} from '../src/utils/leaderboardSelectorUtils.ts';

test('leaderboardSelectorUtils — Liderlik Tablosu Seviye Seçici Yardımcıları', async (t) => {
  await t.test('formatLevelTabLabel tek haneli bölümleri 0 ile doldurur ve iki hanelileri korur', () => {
    assert.equal(formatLevelTabLabel(1), '01');
    assert.equal(formatLevelTabLabel(7), '07');
    assert.equal(formatLevelTabLabel(10), '10');
    assert.equal(formatLevelTabLabel(25), '25');
    assert.equal(formatLevelTabLabel(0), '01');
    assert.equal(formatLevelTabLabel(Number.NaN), '01');
  });

  await t.test('resolveLevelTabAriaLabel ekran okuyucu için bölüm ve seçim durumunu açıklar', () => {
    assert.equal(resolveLevelTabAriaLabel(3, true), '3. bölüm skorları, seçili');
    assert.equal(resolveLevelTabAriaLabel(3, false), '3. bölüm skorları');
    assert.equal(resolveLevelTabAriaLabel(12, true), '12. bölüm skorları, seçili');
  });

  await t.test('resolveTabActiveClasses seçili olma durumuna göre Tailwind sınıflarını döndürür', () => {
    assert.equal(
      resolveTabActiveClasses(true),
      'bg-brass text-brass-fg shadow-sm',
    );
    assert.equal(
      resolveTabActiveClasses(false),
      'text-muted hover:text-fg',
    );
  });

  await t.test('resolvePrevLevelTarget önceki bölümü hesaplar ve 1 altında sınırlandırır', () => {
    assert.equal(resolvePrevLevelTarget(5), 4);
    assert.equal(resolvePrevLevelTarget(2), 1);
    assert.equal(resolvePrevLevelTarget(1), 1);
    assert.equal(resolvePrevLevelTarget(0), 1);
    assert.equal(resolvePrevLevelTarget(-3), 1);
  });

  await t.test('resolveNextLevelTarget sonraki bölüm numarasını 1 artırır', () => {
    assert.equal(resolveNextLevelTarget(1), 2);
    assert.equal(resolveNextLevelTarget(8), 9);
    assert.equal(resolveNextLevelTarget(0), 2);
  });

  await t.test('getLeaderboardRefreshLabel yenileme durumuna uygun buton başlığını döndürür', () => {
    assert.equal(getLeaderboardRefreshLabel(true), 'Yenileniyor...');
    assert.equal(getLeaderboardRefreshLabel(false), 'Skorları yenile');
  });
});

