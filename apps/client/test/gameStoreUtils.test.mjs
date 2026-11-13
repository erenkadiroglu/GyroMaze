import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  BEST_TIMES_STORAGE_KEY,
  GHOST_PATHS_STORAGE_KEY,
  CUSTOM_LEVEL_STORAGE_KEY,
  SETTINGS_STORAGE_KEY,
  DEFAULT_PREFERENCES,
  parseStoredBestTimes,
  parseStoredGhostPaths,
  parseStoredCustomLevel,
  resolvePairingGameStatus,
  resolveRecentRooms,
  getNextCameraMode,
  getNextBoardTheme,
  getNextColorScheme,
  createResetRunFields,
} from '../src/utils/gameStoreUtils.ts';

describe('gameStoreUtils', () => {
  describe('Depolama Sabitleri ve Varsayılan Tercihler', () => {
    test('sabit anahtarlar dogru versiyon formatina sahip olmali', () => {
      assert.equal(BEST_TIMES_STORAGE_KEY, 'gyromaze_best_times_v1');
      assert.equal(GHOST_PATHS_STORAGE_KEY, 'gyromaze_ghost_paths_v1');
      assert.equal(CUSTOM_LEVEL_STORAGE_KEY, 'gyromaze_custom_level_v1');
      assert.equal(SETTINGS_STORAGE_KEY, 'gyromaze_settings_v1');
    });

    test('varsayilan tercihler gecerli degerler icermeli', () => {
      assert.equal(DEFAULT_PREFERENCES.gravityScale, 36);
      assert.equal(DEFAULT_PREFERENCES.tiltResponsiveness, 32);
      assert.equal(DEFAULT_PREFERENCES.cameraMode, 'isometric');
      assert.equal(DEFAULT_PREFERENCES.boardTheme, 'emerald');
      assert.equal(DEFAULT_PREFERENCES.colorScheme, 'dark');
      assert.equal(DEFAULT_PREFERENCES.ballSkin, 'chrome');
      assert.equal(DEFAULT_PREFERENCES.gameMode, 'standard');
      assert.equal(DEFAULT_PREFERENCES.isHapticEnabled, true);
    });
  });

  describe('parseStoredBestTimes', () => {
    test('gecersiz veya bos girdilerde bos nesne donmeli', () => {
      assert.deepEqual(parseStoredBestTimes(null), {});
      assert.deepEqual(parseStoredBestTimes(undefined), {});
      assert.deepEqual(parseStoredBestTimes(''), {});
      assert.deepEqual(parseStoredBestTimes('   '), {});
      assert.deepEqual(parseStoredBestTimes('not-json'), {});
      assert.deepEqual(parseStoredBestTimes('[]'), {});
    });

    test('gecerli sureleri parse etmeli, gecersiz ve negatif olanlari elemeli', () => {
      const raw = JSON.stringify({
        '1': 14.5,
        '2': 28.2,
        '-1': 10,
        '0': 12,
        'abc': 15,
        '3': -5,
        '4': 'fast',
        '5': Infinity,
      });
      const parsed = parseStoredBestTimes(raw);
      assert.deepEqual(parsed, {
        1: 14.5,
        2: 28.2,
      });
    });
  });

  describe('parseStoredGhostPaths', () => {
    test('gecersiz veya bos verilerde bos nesne donmeli', () => {
      assert.deepEqual(parseStoredGhostPaths(null), {});
      assert.deepEqual(parseStoredGhostPaths('{ invalid }'), {});
      assert.deepEqual(parseStoredGhostPaths('[]'), {});
    });

    test('gecerli koordinat ciftlerini ayiklamali', () => {
      const raw = JSON.stringify({
        '1': [
          [-4.2, -4.2],
          [-4.0, -3.8],
          'invalid',
          [1],
          [1, '2'],
        ],
        '-5': [[0, 0]],
        'notNum': [[1, 1]],
        '2': [],
      });
      const parsed = parseStoredGhostPaths(raw);
      assert.deepEqual(parsed, {
        1: [
          [-4.2, -4.2],
          [-4.0, -3.8],
        ],
      });
    });
  });

  describe('parseStoredCustomLevel', () => {
    test('gecersiz json durumunda null donmeli', () => {
      assert.deepEqual(parseStoredCustomLevel(null), null);
      assert.deepEqual(parseStoredCustomLevel(''), null);
      assert.deepEqual(parseStoredCustomLevel('not json'), null);
    });

    test('gecerli labirent harita yapisini parse etmeli', () => {
      const level = {
        id: 99,
        title: 'Ozel Bolum',
        subtitle: 'Test Haritasi',
        boardSize: 10,
        startPosition: [-4, 0.35, -4],
        goalPosition: [4, 0.35, 4],
        innerWalls: [{ position: [0, 0.35, 0], size: [2, 0.7, 0.3] }],
        voidHoles: [],
        crystals: [],
        laserGates: [],
        boostPads: [],
        teleporters: [],
        movingObstacles: [],
        starThresholds: [20, 40],
      };
      const res = parseStoredCustomLevel(JSON.stringify(level));
      assert.ok(res);
      assert.equal(res.id, 99);
      assert.equal(res.title, 'Ozel Bolum');
      assert.equal(res.innerWalls.length, 1);
    });
  });

  describe('resolvePairingGameStatus', () => {
    test('baglanti kuruldugunda waiting veya paused durumundan playing durumuna gecmeli', () => {
      assert.equal(resolvePairingGameStatus(false, true, 'waiting'), 'playing');
      assert.equal(resolvePairingGameStatus(false, true, 'paused'), 'playing');
    });

    test('oyun oynanirken baglanti kesilirse paused durumuna gecmeli', () => {
      assert.equal(resolvePairingGameStatus(true, false, 'playing'), 'paused');
    });

    test('oyun zaten bitmisse durum degismemeli', () => {
      assert.equal(resolvePairingGameStatus(false, true, 'won'), 'won');
      assert.equal(resolvePairingGameStatus(true, false, 'game_over'), 'game_over');
    });
  });

  describe('resolveRecentRooms', () => {
    test('yeni odayi basa eklemeli, buyuk harfe cevirmeli ve tekrarlari temizlemeli', () => {
      const current = ['ROOM01', 'ROOM02'];
      const updated = resolveRecentRooms(current, 'room03');
      assert.deepEqual(updated, ['ROOM03', 'ROOM01', 'ROOM02']);
    });

    test('mevcut oda tekrar baglanirsa en basa tasinmali', () => {
      const current = ['ROOM01', 'ROOM02', 'ROOM03'];
      const updated = resolveRecentRooms(current, 'room02');
      assert.deepEqual(updated, ['ROOM02', 'ROOM01', 'ROOM03']);
    });

    test('maksimum eleman sayisini asmamali ve 6 karaktere kirpmali', () => {
      const current = ['ROOM01', 'ROOM02', 'ROOM03'];
      const updated = resolveRecentRooms(current, 'VERYLONGSUPERROOM', 3);
      assert.deepEqual(updated, ['VERYLO', 'ROOM01', 'ROOM02']);
    });

    test('gecersiz veya bos oda kodlarinda listeyi degistirmemeli', () => {
      const current = ['ROOM01'];
      assert.deepEqual(resolveRecentRooms(current, null), ['ROOM01']);
      assert.deepEqual(resolveRecentRooms(current, '   '), ['ROOM01']);
    });
  });

  describe('Kamera ve Tema Donguleri', () => {
    test('getNextCameraMode sirayla isometric -> topdown -> follow dongusunu saglamali', () => {
      assert.equal(getNextCameraMode('isometric'), 'topdown');
      assert.equal(getNextCameraMode('topdown'), 'follow');
      assert.equal(getNextCameraMode('follow'), 'isometric');
    });

    test('getNextBoardTheme sirayla emerald -> cyberpunk -> crimson -> daylight dongusunu ve colorScheme baglantisini saglamali', () => {
      assert.deepEqual(getNextBoardTheme('emerald'), {
        boardTheme: 'cyberpunk',
        colorScheme: 'dark',
      });
      assert.deepEqual(getNextBoardTheme('crimson'), {
        boardTheme: 'daylight',
        colorScheme: 'light',
      });
      assert.deepEqual(getNextBoardTheme('daylight'), {
        boardTheme: 'emerald',
        colorScheme: 'dark',
      });
    });

    test('getNextColorScheme temayi aydinlik ve karanlik gecislerinde dogru senkronize etmeli', () => {
      assert.deepEqual(getNextColorScheme('dark', 'emerald'), {
        colorScheme: 'light',
        boardTheme: 'daylight',
      });
      assert.deepEqual(getNextColorScheme('light', 'daylight'), {
        colorScheme: 'dark',
        boardTheme: 'emerald',
      });
      assert.deepEqual(getNextColorScheme('light', 'cyberpunk'), {
        colorScheme: 'dark',
        boardTheme: 'cyberpunk',
      });
    });
  });

  describe('createResetRunFields', () => {
    test('ortak tur sifirlama alanlarini dogru degerlerle uretmeli', () => {
      const reset = createResetRunFields(4);
      assert.equal(reset.resetCount, 5);
      assert.equal(reset.winnerPlayer, null);
      assert.equal(reset.gameStatus, 'playing');
      assert.equal(reset.elapsedSeconds, 0);
      assert.deepEqual(reset.collectedCrystals, []);
    });
  });
});
