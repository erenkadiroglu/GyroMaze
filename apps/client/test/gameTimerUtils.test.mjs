import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  GAME_TIMER_INTERVAL_MS,
  DEFAULT_FALLBACK_TIME_ATTACK_LIMIT,
  calculateElapsedSeconds,
  calculateTimerStartTime,
  evaluateGameTimerTick,
  resolveResetClickAction,
} from '../src/utils/gameTimerUtils.ts';

describe('gameTimerUtils — Oyun Süresi ve Geri Sayım Zamanlayıcı Motoru', () => {
  describe('Sabitler', () => {
    test('zamanlayici araligi ve varsayilan limitler beklenen degerlere sahip olmali', () => {
      assert.equal(GAME_TIMER_INTERVAL_MS, 100);
      assert.equal(DEFAULT_FALLBACK_TIME_ATTACK_LIMIT, 45);
    });
  });

  describe('calculateElapsedSeconds & calculateTimerStartTime', () => {
    test('calculateElapsedSeconds 0.1 saniye hassasiyetinde hesaplamali', () => {
      assert.equal(calculateElapsedSeconds(1000, 1000), 0);
      assert.equal(calculateElapsedSeconds(1000, 500), 0);
      assert.equal(calculateElapsedSeconds(1000, 2500), 1.5);
      assert.equal(calculateElapsedSeconds(0, 3420), 3.4);
    });

    test('calculateTimerStartTime baslangic zamanini dogru ofsetlemeli', () => {
      assert.equal(calculateTimerStartTime(5, 10000), 5000);
      assert.equal(calculateTimerStartTime(0, 10000), 10000);
      assert.equal(calculateTimerStartTime(-2, 10000), 10000);
      assert.equal(calculateTimerStartTime(Number.NaN, 10000), 10000);
    });
  });

  describe('evaluateGameTimerTick', () => {
    test('standart modda sure asimi veya tik uyarisi tetiklenmemeli', () => {
      const res = evaluateGameTimerTick({
        isTimeAttack: false,
        elapsed: 120.5,
        timeAttackLimit: 45,
        lastWarnedSecond: null,
      });

      assert.equal(res.isExpired, false);
      assert.equal(res.finalElapsed, 120.5);
      assert.equal(res.shouldWarnTick, false);
      assert.equal(res.isUrgentTick, false);
      assert.equal(res.nextWarnedSecond, null);
    });

    test('time attack modunda sure asildiginda isExpired true ve limit deger donmeli', () => {
      const res = evaluateGameTimerTick({
        isTimeAttack: true,
        elapsed: 45.1,
        timeAttackLimit: 45,
        lastWarnedSecond: 1,
      });

      assert.equal(res.isExpired, true);
      assert.equal(res.finalElapsed, 45);
      assert.equal(res.shouldWarnTick, false);
    });

    test('time attack modunda 5 saniye altinda tik uyarisi vermeli', () => {
      // 45 - 40.2 = 4.8 sn -> ceil = 5 sn
      const res = evaluateGameTimerTick({
        isTimeAttack: true,
        elapsed: 40.2,
        timeAttackLimit: 45,
        lastWarnedSecond: null,
      });

      assert.equal(res.isExpired, false);
      assert.equal(res.shouldWarnTick, true);
      assert.equal(res.nextWarnedSecond, 5);
      assert.equal(res.isUrgentTick, false);
    });

    test('time attack modunda 3 saniye ve altinda acil tik uyarisi vermeli', () => {
      // 45 - 42.5 = 2.5 sn -> ceil = 3 sn
      const res = evaluateGameTimerTick({
        isTimeAttack: true,
        elapsed: 42.5,
        timeAttackLimit: 45,
        lastWarnedSecond: 4,
      });

      assert.equal(res.isExpired, false);
      assert.equal(res.shouldWarnTick, true);
      assert.equal(res.nextWarnedSecond, 3);
      assert.equal(res.isUrgentTick, true);
    });

    test('ayni saniyede tekrar tik uyarisi uretmemeli', () => {
      // 45 - 42.8 = 2.2 sn -> ceil = 3 sn (zaten 3 sn uyarilmis)
      const res = evaluateGameTimerTick({
        isTimeAttack: true,
        elapsed: 42.8,
        timeAttackLimit: 45,
        lastWarnedSecond: 3,
      });

      assert.equal(res.shouldWarnTick, false);
      assert.equal(res.nextWarnedSecond, 3);
    });
  });

  describe('resolveResetClickAction', () => {
    test('ses acikken kalibrasyon tonu calinmali, sessizken calinmamali', () => {
      assert.equal(resolveResetClickAction(false).shouldPlayCalibrate, true);
      assert.equal(resolveResetClickAction(true).shouldPlayCalibrate, false);
    });
  });
});
