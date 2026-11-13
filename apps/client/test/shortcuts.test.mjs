import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveKeyboardShortcut,
  SHORTCUT_GUIDE_GROUPS,
  MOBILE_GUIDE_FEATURES,
  formatShortcutKeyAriaLabel,
  resolveShortcutGroupIconColor,
} from '../src/utils/keyboardShortcuts.ts';

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

  it('SHORTCUT_GUIDE_GROUPS, MOBILE_GUIDE_FEATURES ve yardımcı formatlayıcıları doğrular', () => {
    // SHORTCUT_GUIDE_GROUPS yapısı
    assert.equal(SHORTCUT_GUIDE_GROUPS.length, 3);
    assert.equal(SHORTCUT_GUIDE_GROUPS[0].id, 'movement');
    assert.equal(SHORTCUT_GUIDE_GROUPS[1].id, 'camera');
    assert.equal(SHORTCUT_GUIDE_GROUPS[2].id, 'menu');
    assert.equal(SHORTCUT_GUIDE_GROUPS[0].items.length, 4);

    // MOBILE_GUIDE_FEATURES yapısı
    assert.equal(MOBILE_GUIDE_FEATURES.length, 3);
    assert.equal(MOBILE_GUIDE_FEATURES[0].id, 'gyro');
    assert.equal(MOBILE_GUIDE_FEATURES[1].id, 'touch');
    assert.equal(MOBILE_GUIDE_FEATURES[2].id, 'multiplayer');
    assert.equal(MOBILE_GUIDE_FEATURES[2].badge, '2P');

    // formatShortcutKeyAriaLabel
    assert.equal(
      formatShortcutKeyAriaLabel(['W', 'A', 'S', 'D']),
      'Kısayol: W + A + S + D',
    );
    assert.equal(
      formatShortcutKeyAriaLabel([]),
      'Kısayol tuşu atanmamış',
    );

    // resolveShortcutGroupIconColor
    assert.equal(resolveShortcutGroupIconColor('movement'), 'text-brass');
    assert.equal(resolveShortcutGroupIconColor('camera'), 'text-signal');
    assert.equal(resolveShortcutGroupIconColor('menu'), 'text-ok');
  });
});

