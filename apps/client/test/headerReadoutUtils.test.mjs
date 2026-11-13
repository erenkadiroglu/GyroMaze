import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolvePortalLockAriaLabel,
  formatRecordBadgeText,
  resolveMultiplayerBadgeAriaLabel,
  resolveTimerStatusTitle,
} from '../src/utils/headerReadoutUtils.ts';

test('headerReadoutUtils — Masaüstü HUD Üst Gösterge Yardımcıları', async (t) => {
  await t.test('resolvePortalLockAriaLabel kilit durumuna göre doğru etiket döner', () => {
    assert.equal(resolvePortalLockAriaLabel(true), 'Portal açık');
    assert.equal(resolvePortalLockAriaLabel(false), 'Portal kilitli');
  });

  await t.test('formatRecordBadgeText süreyi tek ondalıklı formatlar', () => {
    assert.equal(formatRecordBadgeText(14.24), '14.2');
    assert.equal(formatRecordBadgeText(8), '8.0');
    assert.equal(formatRecordBadgeText(NaN), '0.0');
  });

  await t.test('resolveMultiplayerBadgeAriaLabel oyun moduna göre erişilebilir etiket üretir', () => {
    assert.equal(
      resolveMultiplayerBadgeAriaLabel(true),
      'Çok oyunculu mod: 2 Oyuncu aktif',
    );
    assert.equal(
      resolveMultiplayerBadgeAriaLabel(false),
      'Tek oyunculu mod',
    );
  });

  await t.test('resolveTimerStatusTitle süreye karşı modunda Kalan süre döner', () => {
    assert.equal(resolveTimerStatusTitle(true, 12.4), 'Kalan süre');
    assert.equal(resolveTimerStatusTitle(true), 'Kalan süre');
  });

  await t.test('resolveTimerStatusTitle standart modda rekor varsa rekoru, yoksa Geçen süre döner', () => {
    assert.equal(resolveTimerStatusTitle(false, 15.5), 'Bölüm rekoru: 15.5 sn');
    assert.equal(resolveTimerStatusTitle(false), 'Geçen süre');
  });
});
