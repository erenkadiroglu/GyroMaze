import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatRecordTime,
  formatRecordDate,
  filterLeaderboardEntries,
  calculateLevelWindow,
  resolveRankBadgeStyle,
  formatLevelBadge,
  resolveEmptyLeaderboardMessage,
} from '../src/utils/leaderboardUtils.ts';

describe('leaderboardUtils — Liderlik Tablosu Formatlayıcı ve Filtreleme Motoru', () => {
  it('süreleri 60 saniye altında ve üstünde doğru formatlar', () => {
    assert.equal(formatRecordTime(0), '0.0 sn');
    assert.equal(formatRecordTime(14.24), '14.2 sn');
    assert.equal(formatRecordTime(59.9), '59.9 sn');
    assert.equal(formatRecordTime(60), '1:00.0 sn');
    assert.equal(formatRecordTime(65.4), '1:05.4 sn');
    assert.equal(formatRecordTime(125.8), '2:05.8 sn');
    assert.equal(formatRecordTime(-5), '0.0 sn');
    assert.equal(formatRecordTime(NaN), '0.0 sn');
  });

  it('zaman damgalarını güvenle formatlar ve geçersiz değerleri yakalar', () => {
    assert.equal(formatRecordDate(0), 'Bilinmiyor');
    assert.equal(formatRecordDate(-100), 'Bilinmiyor');
    assert.equal(formatRecordDate(NaN), 'Bilinmiyor');

    const now = Date.now();
    const formattedNow = formatRecordDate(now);
    assert.match(formattedNow, /^Bugün \d{2}:\d{2}$/);

    const pastDate = new Date('2026-05-10T14:30:00Z').getTime();
    const formattedPast = formatRecordDate(pastDate);
    assert.match(formattedPast, /^\d{2}\.\d{2} \d{2}:\d{2}$/);
  });

  it('kayıtları bölüm numarasına göre ve en hızlıdan en yavaşa doğru sıralar', () => {
    const mockEntries = [
      { id: '1', playerName: 'Eren', levelId: 1, timeSeconds: 15.4, createdAt: 1000 },
      { id: '2', playerName: 'Ahmet', levelId: 1, timeSeconds: 12.1, createdAt: 2000 },
      { id: '3', playerName: 'Can', levelId: 2, timeSeconds: 22.0, createdAt: 3000 },
      { id: '4', playerName: 'Zeynep', levelId: 1, timeSeconds: 18.9, createdAt: 4000 },
    ];

    const level1Filtered = filterLeaderboardEntries(mockEntries, { levelId: 1 });
    assert.equal(level1Filtered.length, 3);
    assert.equal(level1Filtered[0].playerName, 'Ahmet'); // 12.1 sn
    assert.equal(level1Filtered[1].playerName, 'Eren');  // 15.4 sn
    assert.equal(level1Filtered[2].playerName, 'Zeynep'); // 18.9 sn

    const allFiltered = filterLeaderboardEntries(mockEntries, { levelId: 'all' });
    assert.equal(allFiltered.length, 4);
    assert.equal(allFiltered[0].playerName, 'Ahmet');
    assert.equal(allFiltered[3].playerName, 'Can');
  });

  it('oyuncu adına göre büyük/küçük harf duyarsız arama yapar', () => {
    const mockEntries = [
      { id: '1', playerName: 'Eren Kadiroğlu', levelId: 1, timeSeconds: 15.4, createdAt: 1000 },
      { id: '2', playerName: 'Ahmet Yılmaz', levelId: 1, timeSeconds: 12.1, createdAt: 2000 },
      { id: '3', playerName: 'Eren Can', levelId: 2, timeSeconds: 22.0, createdAt: 3000 },
    ];

    const erenMatches = filterLeaderboardEntries(mockEntries, { searchQuery: 'eren' });
    assert.equal(erenMatches.length, 2);
    assert.equal(erenMatches[0].playerName, 'Eren Kadiroğlu');
    assert.equal(erenMatches[1].playerName, 'Eren Can');

    const emptyMatches = filterLeaderboardEntries(mockEntries, { searchQuery: 'mehmet' });
    assert.equal(emptyMatches.length, 0);

    const bozukGiris = filterLeaderboardEntries(null);
    assert.deepEqual(bozukGiris, []);
  });

  it('calculateLevelWindow, resolveRankBadgeStyle, formatLevelBadge ve resolveEmptyLeaderboardMessage kurallarını uygular', () => {
    // 1. calculateLevelWindow
    assert.deepEqual(calculateLevelWindow(1), [1, 2, 3, 4, 5]);
    assert.deepEqual(calculateLevelWindow(2), [1, 2, 3, 4, 5]);
    assert.deepEqual(calculateLevelWindow(5), [3, 4, 5, 6, 7]);
    assert.deepEqual(calculateLevelWindow(-1), [1, 2, 3, 4, 5]);

    // 2. resolveRankBadgeStyle
    const gold = resolveRankBadgeStyle(0);
    assert.equal(gold.isPodium, true);
    assert.equal(gold.medalType, 'gold');
    assert.ok(gold.badgeClass.includes('bg-brass'));

    const silver = resolveRankBadgeStyle(1);
    assert.equal(silver.isPodium, true);
    assert.equal(silver.medalType, 'silver');

    const bronze = resolveRankBadgeStyle(2);
    assert.equal(bronze.isPodium, true);
    assert.equal(bronze.medalType, 'bronze');

    const standard = resolveRankBadgeStyle(3);
    assert.equal(standard.isPodium, false);
    assert.equal(standard.medalType, undefined);

    // 3. formatLevelBadge
    assert.equal(formatLevelBadge(1), 'Böl. 01');
    assert.equal(formatLevelBadge(5), 'Böl. 05');
    assert.equal(formatLevelBadge(12), 'Böl. 12');

    // 4. resolveEmptyLeaderboardMessage
    const searchEmpty = resolveEmptyLeaderboardMessage('all', 'eren');
    assert.equal(searchEmpty.title, 'Eşleşen kayıt bulunamadı');
    assert.ok(searchEmpty.message.includes('eren'));

    const allEmpty = resolveEmptyLeaderboardMessage('all', '');
    assert.equal(allEmpty.title, undefined);
    assert.ok(allEmpty.message.includes('hiçbir skor'));

    const levelEmpty = resolveEmptyLeaderboardMessage(3, '');
    assert.ok(levelEmpty.message.includes('Bölüm 3'));
  });
});


