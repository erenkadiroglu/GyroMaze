import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildHealthResponse,
  parseLevelQuery,
  formatLeaderboardResponse,
} from '../src/controllers/httpControllerUtils.ts';

test('httpControllerUtils — Sunucu HTTP Kontrolcü Yardımcıları', async (t) => {
  await t.test('buildHealthResponse standart sağlık yanıtını eksiksiz oluşturur', () => {
    const stats = {
      activeRooms: 3,
      connectedControllers: 4,
      leaderboardEntries: 12,
    };
    const response = buildHealthResponse(stats, 120.7, '2026-11-13T12:00:00.000Z');

    assert.equal(response.status, 'ok');
    assert.equal(response.service, 'gyromaze-server');
    assert.equal(response.uptimeSeconds, 120);
    assert.equal(response.timestamp, '2026-11-13T12:00:00.000Z');
    assert.equal(response.activeRooms, 3);
    assert.equal(response.connectedControllers, 4);
    assert.equal(response.leaderboardEntries, 12);
  });

  await t.test('buildHealthResponse negatif veya eksik değerleri güvenle sıfırlar', () => {
    const response = buildHealthResponse(
      { activeRooms: -1, connectedControllers: NaN, leaderboardEntries: undefined },
      -50,
    );

    assert.equal(response.status, 'ok');
    assert.equal(response.uptimeSeconds, 0);
    assert.equal(response.activeRooms, 0);
    assert.equal(response.connectedControllers, 0);
    assert.equal(response.leaderboardEntries, 0);
    assert.ok(typeof response.timestamp === 'string');
  });

  await t.test('parseLevelQuery geçerli bölüm numaralarını ayrıştırır', () => {
    assert.equal(parseLevelQuery('1'), 1);
    assert.equal(parseLevelQuery('  5  '), 5);
    assert.equal(parseLevelQuery('100'), 100);
    assert.equal(parseLevelQuery(2), 2);
  });

  await t.test('parseLevelQuery geçersiz bölüm parametrelerini reddeder ve null döner', () => {
    assert.equal(parseLevelQuery(null), null);
    assert.equal(parseLevelQuery(undefined), null);
    assert.equal(parseLevelQuery(''), null);
    assert.equal(parseLevelQuery('   '), null);
    assert.equal(parseLevelQuery('abc'), null);
    assert.equal(parseLevelQuery('0'), null);
    assert.equal(parseLevelQuery('-1'), null);
    assert.equal(parseLevelQuery('2.5'), null);
    assert.equal(parseLevelQuery(NaN), null);
  });

  await t.test('formatLeaderboardResponse bölüm filtresiz tüm kayıtları döner', () => {
    const sampleEntries = [
      { id: '1', levelId: 1, playerName: 'Eren', time: 10.5, date: '2026-11-13' },
      { id: '2', levelId: 2, playerName: 'Atlas', time: 12.0, date: '2026-11-13' },
    ];
    const res = formatLeaderboardResponse(sampleEntries, null);

    assert.equal(res.total, 2);
    assert.equal(res.levelId, null);
    assert.equal(res.entries.length, 2);
  });

  await t.test('formatLeaderboardResponse belirtilen bölüme göre kayıtları süzer', () => {
    const sampleEntries = [
      { id: '1', levelId: 1, playerName: 'Eren', time: 10.5, date: '2026-11-13' },
      { id: '2', levelId: 2, playerName: 'Atlas', time: 12.0, date: '2026-11-13' },
      { id: '3', levelId: 1, playerName: 'Bora', time: 11.2, date: '2026-11-13' },
    ];
    const res = formatLeaderboardResponse(sampleEntries, 1);

    assert.equal(res.total, 2);
    assert.equal(res.levelId, 1);
    assert.equal(res.entries.length, 2);
    assert.equal(res.entries[0].playerName, 'Eren');
    assert.equal(res.entries[1].playerName, 'Bora');
  });

  await t.test('formatLeaderboardResponse bozuk veri girişlerinde boş liste döner', () => {
    const res = formatLeaderboardResponse(null, 5);

    assert.equal(res.total, 0);
    assert.equal(res.levelId, 5);
    assert.deepEqual(res.entries, []);
  });
});
