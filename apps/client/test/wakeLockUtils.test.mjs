import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  isWakeLockSupported,
  shouldAcquireWakeLock,
  requestScreenWakeLock,
  releaseWakeLock,
  resolveWakeLockAriaLabel,
  resolveWakeLockStatusMessage,
} from '../src/utils/wakeLockUtils.ts';

describe('wakeLockUtils — Mobil Ekran Uyanık Kalma Kilidi Yardımcı Motoru', () => {
  describe('isWakeLockSupported', () => {
    test('navigator nesnesi yoksa veya bos ise false donmeli', () => {
      assert.equal(isWakeLockSupported(null), false);
      assert.equal(isWakeLockSupported(undefined), false);
      assert.equal(isWakeLockSupported({}), false);
    });

    test('wakeLock.request fonksiyonu mevcutsa true donmeli', () => {
      const mockNav = {
        wakeLock: {
          request: async () => ({ release: async () => {} }),
        },
      };
      assert.equal(isWakeLockSupported(mockNav), true);
    });
  });

  describe('shouldAcquireWakeLock', () => {
    test('destekleniyorsa, etkinse ve sekme gorunurse true donmeli', () => {
      assert.equal(shouldAcquireWakeLock(true, true, 'visible'), true);
    });

    test('desteklenmiyorsa, devre disiysa veya sekme gizliyse false donmeli', () => {
      assert.equal(shouldAcquireWakeLock(false, true, 'visible'), false);
      assert.equal(shouldAcquireWakeLock(true, false, 'visible'), false);
      assert.equal(shouldAcquireWakeLock(true, true, 'hidden'), false);
    });
  });

  describe('requestScreenWakeLock & releaseWakeLock', () => {
    test('destekleyen nesnede lock objesi donmeli ve guvenle release edilmeli', async () => {
      let released = false;
      const mockSentinel = {
        release: async () => {
          released = true;
        },
      };
      const mockNav = {
        wakeLock: {
          request: async (type) => {
            assert.equal(type, 'screen');
            return mockSentinel;
          },
        },
      };

      const lock = await requestScreenWakeLock(mockNav);
      assert.equal(lock, mockSentinel);

      await releaseWakeLock(lock);
      assert.equal(released, true);
    });

    test('desteklenmeyen veya hata firlatan ortamda null donmeli ve cokmemeli', async () => {
      const mockNavError = {
        wakeLock: {
          request: async () => {
            throw new Error('Not allowed');
          },
        },
      };
      const lock = await requestScreenWakeLock(mockNavError);
      assert.equal(lock, null);

      // null release cagirildiginda hata firlatmamali
      await assert.doesNotReject(async () => {
        await releaseWakeLock(null);
      });
    });
  });

  describe('Metin ve Erisilebilirlik Yardimcilari', () => {
    test('resolveWakeLockAriaLabel aktif ve pasif durumlarda dogru metin donmeli', () => {
      assert.ok(resolveWakeLockAriaLabel(true).includes('aktif'));
      assert.ok(resolveWakeLockAriaLabel(false).includes('devre dışı'));
    });

    test('resolveWakeLockStatusMessage destek ve duruma gore aciklayici metin donmeli', () => {
      assert.ok(resolveWakeLockStatusMessage(false, false).includes('desteklemiyor'));
      assert.ok(resolveWakeLockStatusMessage(true, true).includes('uyanık tutuluyor'));
      assert.ok(resolveWakeLockStatusMessage(false, true).includes('pasif'));
    });
  });
});
