import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ROOM_CODE_ALPHABET,
  generateRandomCode,
  resolveLeaderboardStoragePath,
  normalizeLeaderboardEntries,
  selectPreferredLanIp,
  validateScorePayload,
} from '../src/gateway/roomServiceUtils.ts';

test('roomServiceUtils — Sunucu Oda ve Liderlik Tablosu Yardımcıları', async (t) => {
  await t.test('generateRandomCode 6 karakterli ve yalnızca alfabeden kod üretir', () => {
    const code = generateRandomCode(ROOM_CODE_ALPHABET, 6);
    assert.equal(code.length, 6);
    for (const char of code) {
      assert.ok(ROOM_CODE_ALPHABET.includes(char));
    }
  });

  await t.test('resolveLeaderboardStoragePath null ve açık yolları doğru çözümler', () => {
    assert.equal(resolveLeaderboardStoragePath(null), null);
    const resolved = resolveLeaderboardStoragePath('./custom-data/test.json');
    assert.ok(resolved && resolved.endsWith('test.json'));
  });

  await t.test('normalizeLeaderboardEntries bozuk verileri eler ve süreye göre sıralar', () => {
    const raw = [
      { id: '1', playerName: 'Ali', levelId: 1, timeSeconds: 15.2, createdAt: 1000 },
      { id: '2', playerName: 'Veli', levelId: 1, timeSeconds: 10.4, createdAt: 2000 },
      { id: 'bad', playerName: '', levelId: -1, timeSeconds: -5, createdAt: 0 },
      null,
      { id: 'custom', playerName: 'Can', levelId: 99, timeSeconds: 8.0, createdAt: 3000 },
    ];
    const normalized = normalizeLeaderboardEntries(raw);
    assert.equal(normalized.length, 2);
    assert.equal(normalized[0].playerName, 'Veli'); // 10.4 sn
    assert.equal(normalized[1].playerName, 'Ali');  // 15.2 sn
  });

  await t.test('selectPreferredLanIp sanal WSL ve link-local adresleri eler', () => {
    const mockNets = {
      'vEthernet (WSL)': [
        { address: '172.28.16.1', family: 'IPv4', internal: false },
      ],
      'Wi-Fi': [
        { address: '192.168.1.105', family: 'IPv4', internal: false },
      ],
      'Loopback': [
        { address: '127.0.0.1', family: 'IPv4', internal: true },
      ],
      'LinkLocal': [
        { address: '169.254.10.20', family: 'IPv4', internal: false },
      ],
    };
    const preferred = selectPreferredLanIp(mockNets);
    assert.equal(preferred, '192.168.1.105');
  });

  await t.test('validateScorePayload geçerli ve geçersiz skor veri yüklerini doğrular', () => {
    const valid = validateScorePayload({
      levelId: 2,
      timeSeconds: 12.34,
      playerName: '  Test Pilot  ',
    });
    assert.equal(valid.isValid, true);
    assert.equal(valid.normalizedTime, 12.3);
    assert.equal(valid.normalizedPlayer, 'Test Pilot');

    const invalidLevel = validateScorePayload({
      levelId: 99,
      timeSeconds: 12,
      playerName: 'Player',
    });
    assert.equal(invalidLevel.isValid, false);

    const invalidTime = validateScorePayload({
      levelId: 1,
      timeSeconds: -1,
      playerName: 'Player',
    });
    assert.equal(invalidTime.isValid, false);
  });
});
