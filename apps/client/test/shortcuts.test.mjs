import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resolveKeyboardShortcut } from '../src/utils/keyboardShortcuts.ts';

describe('resolveKeyboardShortcut — Masaüstü Klavye Kısayolları ve Kural Çözümleyici', () => {
  it('yardım kısayolunu (H, h, ?) modal durumundan bağımsız olarak çözümler', () => {
    assert.equal(resolveKeyboardShortcut({ key: 'h' }), 'help');
    assert.equal(resolveKeyboardShortcut({ key: 'H' }), 'help');
    assert.equal(resolveKeyboardShortcut({ key: '?' }), 'help');
    assert.equal(
      resolveKeyboardShortcut({ key: 'h', isAnyOverlayOpen: true }),
      'help',
    );
  });

  it('değiştirici tuşlar (Ctrl, Meta, Alt), tekrar ve metin girişi odağında kısayolları engeller', () => {
    assert.equal(
      resolveKeyboardShortcut({ key: 'r', ctrlKey: true }),
      null,
      'Ctrl+R tarayıcı yenilemesini engellememeli',
    );
    assert.equal(
      resolveKeyboardShortcut({ key: 'c', metaKey: true }),
      null,
      'Meta+C kopyalama kısayolunu bozmamalı',
    );
    assert.equal(
      resolveKeyboardShortcut({ key: 'm', altKey: true }),
      null,
    );
    assert.equal(
      resolveKeyboardShortcut({ key: 'r', repeat: true }),
      null,
    );
    assert.equal(
      resolveKeyboardShortcut({ key: 'r', isInputFocused: true }),
      null,
      'Yazı yazarken r tuşu sıfırlama tetiklememeli',
    );
  });

  it('standart oyun kısayollarını (R, C, M, L, E, K, P, Space) doğru eyleme dönüştürür', () => {
    assert.equal(resolveKeyboardShortcut({ key: 'r' }), 'reset');
    assert.equal(resolveKeyboardShortcut({ key: 'R' }), 'reset');
    assert.equal(resolveKeyboardShortcut({ key: 'c' }), 'camera');
    assert.equal(resolveKeyboardShortcut({ key: 'm' }), 'mute');
    assert.equal(resolveKeyboardShortcut({ key: 'l' }), 'theme');
    assert.equal(resolveKeyboardShortcut({ key: 'e' }), 'editor');
    assert.equal(resolveKeyboardShortcut({ key: 'k' }), 'leaderboard');
    assert.equal(resolveKeyboardShortcut({ key: 'p' }), 'pairing');
    assert.equal(resolveKeyboardShortcut({ key: ' ' }), 'calibrate');
    assert.equal(resolveKeyboardShortcut({ key: 'Unidentified', code: 'Space' }), 'calibrate');
  });

  it('1..5 rakam tuşlarını doğrudan ilgili bölüm atamasına dönüştürür', () => {
    for (let id = 1; id <= 5; id++) {
      assert.deepEqual(resolveKeyboardShortcut({ key: String(id) }), {
        type: 'level',
        level: id,
      });
    }
    assert.equal(resolveKeyboardShortcut({ key: '0' }), null);
    assert.equal(resolveKeyboardShortcut({ key: '6' }), null);
    assert.equal(resolveKeyboardShortcut({ key: '9' }), null);
    assert.equal(resolveKeyboardShortcut({ key: 'x' }), null);
  });

  it('herhangi bir modal veya oyun sonu durumunda oyun içi kontrolleri engeller', () => {
    assert.equal(
      resolveKeyboardShortcut({ key: 'r', isAnyOverlayOpen: true }),
      null,
    );
    assert.equal(
      resolveKeyboardShortcut({ key: 'c', isAnyOverlayOpen: true }),
      null,
    );
    assert.equal(
      resolveKeyboardShortcut({ key: '1', isGameOver: true }),
      null,
    );
    assert.equal(
      resolveKeyboardShortcut({ key: 'r', isGameOver: true }),
      null,
    );
  });
});

