import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getLeaderboardModalTitle,
  getLeaderboardModalDescription,
  formatLeaderboardSearchPlaceholder,
  isErrorBannerVisible,
  formatLeaderboardAriaLabel,
} from '../src/utils/leaderboardModalViewUtils.ts';

test('leaderboardModalViewUtils — Masaüstü Skor Tablosu Modalı Yardımcıları', async (t) => {
  await t.test('getLeaderboardModalTitle ve getLeaderboardModalDescription standart metinleri döner', () => {
    assert.equal(getLeaderboardModalTitle(), 'Skor tablosu');
    assert.equal(
      getLeaderboardModalDescription(),
      'Bölümlerde kaydedilen en hızlı tamamlama süreleri',
    );
  });

  await t.test('formatLeaderboardSearchPlaceholder oyuncu arama yer tutucu metnini döner', () => {
    assert.equal(
      formatLeaderboardSearchPlaceholder(),
      'Oyuncu adına göre filtrele...',
    );
  });

  await t.test('isErrorBannerVisible hata metni varlığına göre boolean döner', () => {
    assert.equal(isErrorBannerVisible('Bağlantı hatası'), true);
    assert.equal(isErrorBannerVisible('   '), false);
    assert.equal(isErrorBannerVisible(''), false);
    assert.equal(isErrorBannerVisible(null), false);
    assert.equal(isErrorBannerVisible(undefined), false);
  });

  await t.test('formatLeaderboardAriaLabel küresel ve bölüm bazlı özet üretir', () => {
    assert.equal(
      formatLeaderboardAriaLabel('global', 12),
      'Küresel skor tablosu, 12 kayıt listeleniyor',
    );
    assert.equal(
      formatLeaderboardAriaLabel(3, 5),
      'Seviye 3 skor tablosu, 5 kayıt listeleniyor',
    );
    assert.equal(
      formatLeaderboardAriaLabel(1, NaN),
      'Seviye 1 skor tablosu, 0 kayıt listeleniyor',
    );
  });
});

