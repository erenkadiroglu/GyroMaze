import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HAPTIC_PATTERNS,
  getHapticVibrationPattern,
  resolveSocketServerUrl,
  shouldThrottleGyroEmit,
  calculatePingLatency,
  normalizeRoomCodeForJoin,
} from '../src/utils/socketConnectionUtils.ts';

test('socketConnectionUtils — İstemci WebSocket Bağlantı ve Haptik İletişim Motoru', async (t) => {
  await t.test('getHapticVibrationPattern geçerli türleri döner, geçersizlerde undefined döner', () => {
    assert.equal(getHapticVibrationPattern('wall'), 18);
    assert.deepEqual(getHapticVibrationPattern('hole'), [70, 40, 110]);
    assert.deepEqual(getHapticVibrationPattern('goal'), [50, 50, 50, 50, 140]);
    assert.equal(getHapticVibrationPattern('invalid'), undefined);
    assert.equal(getHapticVibrationPattern(null), undefined);
  });

  await t.test('resolveSocketServerUrl ortam değişkenini (NEXT_PUBLIC_SOCKET_URL) önceliklendirir', () => {
    const url = resolveSocketServerUrl('https://my-tunnel.ngrok.app');
    assert.equal(url, 'https://my-tunnel.ngrok.app');
  });

  await t.test('resolveSocketServerUrl HTTPS ve genel ağlarda origin kullanır', () => {
    const httpsLoc = {
      protocol: 'https:',
      hostname: 'example.com',
      origin: 'https://example.com',
    };
    assert.equal(resolveSocketServerUrl(undefined, httpsLoc), 'https://example.com');

    const lanLoc = {
      protocol: 'http:',
      hostname: '192.168.1.100',
      origin: 'http://192.168.1.100:3000',
    };
    assert.equal(resolveSocketServerUrl(undefined, lanLoc), 'http://192.168.1.100:3000');
  });

  await t.test('resolveSocketServerUrl localhost ortamında port 4000 döner', () => {
    const localLoc = {
      protocol: 'http:',
      hostname: 'localhost',
      origin: 'http://localhost:3000',
    };
    assert.equal(resolveSocketServerUrl(undefined, localLoc), 'http://localhost:4000');
  });

  await t.test('shouldThrottleGyroEmit sıfıra dönüş anında frenleme yapmaz (hemen iletir)', () => {
    const throttled = shouldThrottleGyroEmit(
      1005,
      1000, // 5ms geçmiş (< 15ms)
      0,
      0, // şu an sıfır
      10,
      5, // önceden sıfır değildi
    );
    assert.equal(throttled, false);
  });

  await t.test('shouldThrottleGyroEmit zaman veya açı değişmediğinde frenler', () => {
    // 15ms dolmadı
    assert.equal(shouldThrottleGyroEmit(1005, 1000, 10, 5, 10.5, 5.5), true);

    // 20ms doldu ama açı farkı < 0.1
    assert.equal(shouldThrottleGyroEmit(1020, 1000, 10.02, 5.03, 10.0, 5.0), true);

    // 20ms doldu ve açı farkı >= 0.1 -> iletilmeli
    assert.equal(shouldThrottleGyroEmit(1020, 1000, 10.5, 5.0, 10.0, 5.0), false);
  });

  await t.test('calculatePingLatency gecikmeyi 1 ile 999 ms arasına sınırlar', () => {
    assert.equal(calculatePingLatency(1000, 1045), 45);
    assert.equal(calculatePingLatency(1000, 1000.2), 1);
    assert.equal(calculatePingLatency(1000, 5000), 999);
  });

  await t.test('normalizeRoomCodeForJoin oda kodunu temizler ve büyük harfe çevirir', () => {
    assert.equal(normalizeRoomCodeForJoin('  abc123  '), 'ABC123');
    assert.equal(normalizeRoomCodeForJoin('xyz'), 'XYZ');
    assert.equal(normalizeRoomCodeForJoin(''), null);
    assert.equal(normalizeRoomCodeForJoin('a'), null);
    assert.equal(normalizeRoomCodeForJoin('toolongroomcodehere'), null);
    assert.equal(normalizeRoomCodeForJoin(null), null);
  });
});

