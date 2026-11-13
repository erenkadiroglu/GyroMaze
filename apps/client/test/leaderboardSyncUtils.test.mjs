import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_SYNC_ERROR_MESSAGE,
  CUSTOM_MAP_LEVEL_ID,
  resolveInitialSelectedLevel,
  resolveActiveLevelNumber,
  resolveEffectiveSelectedLevelOnOpen,
  calculateLeaderboardMetrics,
  resolveLeaderboardEmptyStateMessage,
  resolveLevelTabAriaLabel,
  resolveRefreshButtonAriaLabel,
  canSubmitNewRecord,
} from '../src/utils/leaderboardSyncUtils.ts';

describe('leaderboardSyncUtils — Liderlik Tablosu ve Senkronizasyon Yardımcıları', () => {
  test('sabit değerler eksiksiz ve doğrudur', () => {
    assert.equal(CUSTOM_MAP_LEVEL_ID, 99);
    assert.match(DEFAULT_SYNC_ERROR_MESSAGE, /Sunucu skorları yenilenemedi/);
  });

  test('resolveInitialSelectedLevel: başlangıç bölümünü güvenle çözümler', () => {
    assert.equal(resolveInitialSelectedLevel(3), 3);
    assert.equal(resolveInitialSelectedLevel(3.8), 3);
    assert.equal(resolveInitialSelectedLevel(99), 1);
    assert.equal(resolveInitialSelectedLevel(0), 1);
    assert.equal(resolveInitialSelectedLevel(-4), 1);
    assert.equal(resolveInitialSelectedLevel(NaN), 1);
    assert.equal(resolveInitialSelectedLevel(undefined), 1);
  });

  test('resolveActiveLevelNumber: aktif sayısal bölümü çözümler', () => {
    assert.equal(resolveActiveLevelNumber(5), 5);
    assert.equal(resolveActiveLevelNumber(5.9), 5);
    assert.equal(resolveActiveLevelNumber('all'), 1);
    assert.equal(resolveActiveLevelNumber(-1), 1);
    assert.equal(resolveActiveLevelNumber(NaN), 1);
  });

  test('resolveEffectiveSelectedLevelOnOpen: modal açılışında bölümü korur veya günceller', () => {
    assert.equal(resolveEffectiveSelectedLevelOnOpen(2, 'all'), 2);
    assert.equal(resolveEffectiveSelectedLevelOnOpen(99, 'all'), 'all');
    assert.equal(resolveEffectiveSelectedLevelOnOpen(99, 4), 4);
    assert.equal(resolveEffectiveSelectedLevelOnOpen(undefined, 'all'), 'all');
    assert.equal(resolveEffectiveSelectedLevelOnOpen(0, 3), 3);
  });

  test('calculateLeaderboardMetrics: boş listede güvenli varsayılanlar üretir', () => {
    const metrics = calculateLeaderboardMetrics([]);
    assert.deepEqual(metrics, {
      bestTime: null,
      averageTime: null,
      totalCount: 0,
      uniquePlayerCount: 0,
    });
  });

  test('calculateLeaderboardMetrics: kayıtlar üzerinden özet istatistikleri hesaplar', () => {
    const entries = [
      { id: '1', levelId: 1, playerName: 'Eren', timeSeconds: 12.4, createdAt: 1000 },
      { id: '2', levelId: 1, playerName: 'eren', timeSeconds: 10.2, createdAt: 2000 },
      { id: '3', levelId: 1, playerName: 'Ada', timeSeconds: 16.4, createdAt: 3000 },
    ];
    const metrics = calculateLeaderboardMetrics(entries);
    assert.equal(metrics.bestTime, 10.2);
    assert.equal(metrics.averageTime, 13);
    assert.equal(metrics.totalCount, 3);
    assert.equal(metrics.uniquePlayerCount, 2); // 'Eren' ve 'eren' aynı oyuncu
  });

  test('resolveLeaderboardEmptyStateMessage: kayıt ve arama durumuna göre doğru mesajı döner', () => {
    assert.equal(
      resolveLeaderboardEmptyStateMessage({
        hasEntries: true,
        isSearching: false,
        selectedLevel: 1,
      }),
      '',
    );
    assert.equal(
      resolveLeaderboardEmptyStateMessage({
        hasEntries: false,
        isSearching: true,
        selectedLevel: 1,
        searchQuery: 'Gizemli',
      }),
      '"Gizemli" araması için skor kaydı bulunamadı.',
    );
    assert.equal(
      resolveLeaderboardEmptyStateMessage({
        hasEntries: false,
        isSearching: false,
        selectedLevel: 4,
      }),
      'Bölüm 4 için henüz kayıtlı rekor bulunmuyor.',
    );
    assert.equal(
      resolveLeaderboardEmptyStateMessage({
        hasEntries: false,
        isSearching: false,
        selectedLevel: 'all',
      }),
      'Henüz hiçbir bölümde kayıtlı skor bulunmuyor.',
    );
  });

  test('resolveLevelTabAriaLabel: seçili ve normal etiketleri üretir', () => {
    assert.equal(resolveLevelTabAriaLabel('all', true), 'Tüm Bölümler (seçili)');
    assert.equal(resolveLevelTabAriaLabel('all', false), 'Tüm Bölümler');
    assert.equal(resolveLevelTabAriaLabel(3, true), 'Bölüm 3 (seçili)');
    assert.equal(resolveLevelTabAriaLabel(3, false), 'Bölüm 3');
  });

  test('resolveRefreshButtonAriaLabel: yenilenme durumuna göre etiket döner', () => {
    assert.equal(resolveRefreshButtonAriaLabel(true), 'Skor tablosu yenileniyor...');
    assert.equal(
      resolveRefreshButtonAriaLabel(false),
      'Skor tablosunu sunucudan yenile',
    );
  });

  test('canSubmitNewRecord: yeni rekor koşullarını doğrular', () => {
    assert.equal(canSubmitNewRecord(12.5, null), true);
    assert.equal(canSubmitNewRecord(12.5, undefined), true);
    assert.equal(canSubmitNewRecord(12.5, 14.0), true);
    assert.equal(canSubmitNewRecord(14.0, 12.5), false);
    assert.equal(canSubmitNewRecord(12.5, 12.5), false);
    assert.equal(canSubmitNewRecord(0, 10), false);
    assert.equal(canSubmitNewRecord(-2, 10), false);
    assert.equal(canSubmitNewRecord(NaN, 10), false);
  });
});
