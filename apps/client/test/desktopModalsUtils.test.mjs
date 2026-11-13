import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DESKTOP_MODAL_KEYS,
  resolveInitialLeaderboardLevel,
  formatLeaderboardModalTitle,
  isAnyDesktopModalOpen,
  shouldRenderLeaderboardModal,
} from '../src/utils/desktopModalsUtils.ts';

test('desktopModalsUtils — Masaüstü Modallar Katmanı Yardımcıları', async (t) => {
  await t.test('DESKTOP_MODAL_KEYS 6 temel modal anahtarı içerir', () => {
    assert.equal(DESKTOP_MODAL_KEYS.length, 6);
    assert.deepEqual(Array.from(DESKTOP_MODAL_KEYS), [
      'editor',
      'settings',
      'help',
      'pairing',
      'leaderboard',
      'outcome',
    ]);
  });

  await t.test('resolveInitialLeaderboardLevel geçersiz ve uç değerleri 1 ile maxLevel arasına sınırlar', () => {
    assert.equal(resolveInitialLeaderboardLevel(3), 3);
    assert.equal(resolveInitialLeaderboardLevel(0), 1);
    assert.equal(resolveInitialLeaderboardLevel(-5), 1);
    assert.equal(resolveInitialLeaderboardLevel(10, 5), 5);
    assert.equal(resolveInitialLeaderboardLevel(NaN), 1);
    assert.equal(resolveInitialLeaderboardLevel(null), 1);
    assert.equal(resolveInitialLeaderboardLevel(undefined), 1);
    assert.equal(resolveInitialLeaderboardLevel(3.7), 3);
  });

  await t.test('formatLeaderboardModalTitle seviye numarasına göre başlık formatlar', () => {
    assert.equal(formatLeaderboardModalTitle(3), 'Seviye 3 Skor Tablosu');
    assert.equal(formatLeaderboardModalTitle(null), 'Küresel Skor Tablosu');
    assert.equal(formatLeaderboardModalTitle(undefined), 'Küresel Skor Tablosu');
    assert.equal(formatLeaderboardModalTitle(0), 'Küresel Skor Tablosu');
  });

  await t.test('isAnyDesktopModalOpen durum haritasında açık modal varsa true döner', () => {
    assert.equal(isAnyDesktopModalOpen({ editor: true, settings: false }), true);
    assert.equal(isAnyDesktopModalOpen({ editor: false, settings: false }), false);
    assert.equal(isAnyDesktopModalOpen({}), false);
  });

  await t.test('shouldRenderLeaderboardModal boolean değeri korur', () => {
    assert.equal(shouldRenderLeaderboardModal(true), true);
    assert.equal(shouldRenderLeaderboardModal(false), false);
  });
});

