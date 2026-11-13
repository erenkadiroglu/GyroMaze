import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  resolveEffectiveColorScheme,
  resolveEffectiveSoundVolume,
  resolveCustomMapImport,
  stripUrlParam,
  resolveSettingsModalNavigation,
  resolveNextCycleOption,
} from '../src/utils/settingsDrawerUtils.ts';
import { encodeCustomMazeLevelForUrl } from '../src/utils/customMapCodec.ts';

describe('settingsDrawerUtils — Ayarlar Çekmecesi ve Tercihler Motoru', () => {
  describe('resolveEffectiveColorScheme', () => {
    test('colorScheme light veya boardTheme daylight iken light donmeli', () => {
      assert.equal(resolveEffectiveColorScheme('light', 'emerald'), 'light');
      assert.equal(resolveEffectiveColorScheme('dark', 'daylight'), 'light');
      assert.equal(resolveEffectiveColorScheme('light', 'daylight'), 'light');
    });

    test('diger durumlarda dark donmeli', () => {
      assert.equal(resolveEffectiveColorScheme('dark', 'emerald'), 'dark');
      assert.equal(resolveEffectiveColorScheme('dark', 'cyberpunk'), 'dark');
      assert.equal(resolveEffectiveColorScheme('dark', 'crimson'), 'dark');
    });
  });

  describe('resolveEffectiveSoundVolume', () => {
    test('isSoundMuted true ise 0 donmeli', () => {
      assert.equal(resolveEffectiveSoundVolume(true, 1), 0);
      assert.equal(resolveEffectiveSoundVolume(true, 0.5), 0);
    });

    test('isSoundMuted false iken gercek ses seviyesini guvenle sinirlayarak donmeli', () => {
      assert.equal(resolveEffectiveSoundVolume(false, 0.75), 0.75);
      assert.equal(resolveEffectiveSoundVolume(false, 1.5), 1);
      assert.equal(resolveEffectiveSoundVolume(false, -0.2), 0);
      assert.equal(resolveEffectiveSoundVolume(false, Number.NaN), 0);
    });
  });

  describe('resolveCustomMapImport', () => {
    test('bos veya gecersiz girdilerde null sonuc donmeli', () => {
      assert.deepEqual(resolveCustomMapImport(null), { level: null, notification: null });
      assert.deepEqual(resolveCustomMapImport(''), { level: null, notification: null });
      assert.deepEqual(resolveCustomMapImport('   '), { level: null, notification: null });
    });

    test('bozuk parametrede uyari bildirimi uretmeli', () => {
      const res = resolveCustomMapImport('invalid-map-data');
      assert.equal(res.level, null);
      assert.ok(res.notification);
      assert.equal(res.notification.tone, 'warn');
    });

    test('gecerli kodlanmis haritada seviye nesnesi ve basari bildirimi donmeli', () => {
      const sample = {
        id: 99,
        title: 'Macera Labirenti',
        subtitle: 'Ozel Harita',
        boardSize: 10,
        startPosition: [-4, 0.35, -4],
        goalPosition: [4, 0.35, 4],
        innerWalls: [],
        voidHoles: [],
        crystals: [],
        laserGates: [],
        boostPads: [],
        teleporters: [],
        movingObstacles: [],
        starThresholds: [20, 40],
      };

      const encoded = encodeCustomMazeLevelForUrl(sample);
      const res = resolveCustomMapImport(encoded);
      assert.ok(res.level);
      assert.equal(res.level.title, 'Macera Labirenti');
      assert.ok(res.notification);
      assert.equal(res.notification.tone, 'success');
      assert.ok(res.notification.message.includes('Macera Labirenti'));
    });
  });

  describe('stripUrlParam', () => {
    test('belirtilen arama parametresini silmeli ve digerlerini korumali', () => {
      const original = 'https://gyromaze.com/play?map=xyz123&mode=turbo#stage';
      const stripped = stripUrlParam(original, 'map');
      assert.equal(stripped, '/play?mode=turbo#stage');
    });

    test('parametre bulunmuyorsa url aynen korunmali', () => {
      const original = 'https://gyromaze.com/controller?room=ABC123';
      const stripped = stripUrlParam(original, 'map');
      assert.equal(stripped, original);
    });

    test('gecersiz url dizesinde hata firlatmadan orijinal diziyi donmeli', () => {
      assert.equal(stripUrlParam('not-a-valid-url', 'map'), 'not-a-valid-url');
    });
  });

  describe('resolveSettingsModalNavigation', () => {
    test('editor hedefine geciste settings kapanmali ve editor acilmali', () => {
      const nav = resolveSettingsModalNavigation('editor');
      assert.deepEqual(nav, {
        isSettingsOpen: false,
        isEditorOpen: true,
        isLeaderboardOpen: false,
      });
    });

    test('leaderboard hedefine geciste settings kapanmali ve leaderboard acilmali', () => {
      const nav = resolveSettingsModalNavigation('leaderboard');
      assert.deepEqual(nav, {
        isSettingsOpen: false,
        isEditorOpen: false,
        isLeaderboardOpen: true,
      });
    });
  });

  describe('resolveNextCycleOption', () => {
    test('secenekler arasinda dongusel ilerlemeli', () => {
      const options = ['a', 'b', 'c'];
      assert.equal(resolveNextCycleOption('a', options), 'b');
      assert.equal(resolveNextCycleOption('b', options), 'c');
      assert.equal(resolveNextCycleOption('c', options), 'a');
    });

    test('secenek dizisi bos veya eleman bulunamadiginda guvenle baslangica donmeli', () => {
      assert.equal(resolveNextCycleOption('z', ['a', 'b']), 'a');
      assert.equal(resolveNextCycleOption('x', []), 'x');
    });
  });
});
