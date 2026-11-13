import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PLAYER_COUNT_OPTIONS,
  GAME_MODE_RULE_OPTIONS,
  resolvePlayerCountValue,
  isMultiplayerValue,
  formatGameModeAriaLabel,
} from '../src/utils/gameModeSectionUtils.ts';

test('gameModeSectionUtils — Ayarlar Oyun Modu Seçenekleri Yardımcıları', async (t) => {
  await t.test('PLAYER_COUNT_OPTIONS solo ve duo seçeneklerini içerir', () => {
    assert.equal(PLAYER_COUNT_OPTIONS.length, 2);
    assert.deepEqual(
      PLAYER_COUNT_OPTIONS.map((o) => o.value),
      ['solo', 'duo'],
    );
  });

  await t.test('GAME_MODE_RULE_OPTIONS standard ve time_attack seçeneklerini içerir', () => {
    assert.equal(GAME_MODE_RULE_OPTIONS.length, 2);
    assert.deepEqual(
      GAME_MODE_RULE_OPTIONS.map((o) => o.value),
      ['standard', 'time_attack'],
    );
    assert.ok(GAME_MODE_RULE_OPTIONS[1].hint);
  });

  await t.test('resolvePlayerCountValue boolean duruma göre solo veya duo döner', () => {
    assert.equal(resolvePlayerCountValue(true), 'duo');
    assert.equal(resolvePlayerCountValue(false), 'solo');
  });

  await t.test('isMultiplayerValue solo ve duo seçimlerini doğru boolean eşler', () => {
    assert.equal(isMultiplayerValue('duo'), true);
    assert.equal(isMultiplayerValue('solo'), false);
  });

  await t.test('formatGameModeAriaLabel oyun modunu doğru etiketler', () => {
    assert.equal(
      formatGameModeAriaLabel('standard'),
      'Oyun modu: Standart',
    );
    assert.equal(
      formatGameModeAriaLabel('time_attack'),
      'Oyun modu: Süreye karşı',
    );
  });
});
