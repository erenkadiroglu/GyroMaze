import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  PLAYER_NAME_STORAGE_KEY,
  DEFAULT_STAR_THRESHOLDS,
  loadStoredPlayerName,
  saveStoredPlayerName,
  prepareLeaderboardScorePayload,
  resolveGameOutcomeMetrics,
} from '../src/utils/gameOutcomeOrchestrationUtils.ts';

describe('gameOutcomeOrchestrationUtils — Oyun Bitiş ve Skor Orkestrasyonu', () => {
  test('sabitler eksiksiz ve geçerlidir', () => {
    assert.equal(PLAYER_NAME_STORAGE_KEY, 'gyromaze_player_name_v1');
    assert.deepEqual(DEFAULT_STAR_THRESHOLDS, [15, 24]);
  });

  test('loadStoredPlayerName: depolamadan ismi güvenle okur ve temizler', () => {
    const mockStorage = {
      getItem: (key) => (key === PLAYER_NAME_STORAGE_KEY ? '  Eren  ' : null),
    };
    assert.equal(loadStoredPlayerName(mockStorage), 'Eren');
    assert.equal(loadStoredPlayerName(null), 'Oyuncu');
    assert.equal(loadStoredPlayerName({ getItem: () => null }), 'Oyuncu');
  });

  test('saveStoredPlayerName: ismi temizleyerek kaydeder', () => {
    let savedKey = '';
    let savedVal = '';
    const mockStorage = {
      setItem: (key, val) => {
        savedKey = key;
        savedVal = val;
      },
    };
    saveStoredPlayerName(mockStorage, '  SiberKaptan  ');
    assert.equal(savedKey, PLAYER_NAME_STORAGE_KEY);
    assert.equal(savedVal, 'SiberKaptan');
  });

  test('prepareLeaderboardScorePayload: liderlik veri yükünü formatlar', () => {
    const payload = prepareLeaderboardScorePayload('  Ada Lovelace  ', 2, 14.285);
    assert.equal(payload.playerName, 'Ada Lovelace');
    assert.equal(payload.levelId, 2);
    assert.equal(payload.timeSeconds, 14.3);

    const safeZero = prepareLeaderboardScorePayload('', 1, -5);
    assert.equal(safeZero.playerName, 'Oyuncu');
    assert.equal(safeZero.timeSeconds, 0.1);
  });

  test('resolveGameOutcomeMetrics: Bölüm 1 için tam zafer ve PB metriklerini hesaplar', () => {
    const metrics = resolveGameOutcomeMetrics({
      level: 1,
      customLevel: null,
      elapsedSeconds: 9.5,
      bestTimes: { 1: 18.0 },
      collectedCrystalsCount: 3,
      gameStatus: 'won',
      winnerPlayer: 1,
    });

    assert.equal(metrics.currentLevelInfo.id, 1);
    assert.equal(metrics.totalCrystals, 3);
    assert.equal(metrics.isPB, true);
    assert.equal(metrics.earnedStars, 3);
    assert.equal(metrics.isCelebration, true);
    assert.match(metrics.winnerText, /1\. Oyuncu/);
  });

  test('resolveGameOutcomeMetrics: yenilgi durumunda doğru özet üretir', () => {
    const metrics = resolveGameOutcomeMetrics({
      level: 2,
      customLevel: null,
      elapsedSeconds: 35.0,
      bestTimes: {},
      collectedCrystalsCount: 1,
      gameStatus: 'lost',
    });

    assert.equal(metrics.isCelebration, false);
    assert.match(metrics.crystalSummary, /1\/3/);
  });
});
