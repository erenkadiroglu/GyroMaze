import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  MAZE_LEVELS,
  getMazeLevel,
  findSafeP2SpawnOffset,
  getLevelRevisionKey,
  parseCustomMazeLevel,
  computeEditorBoostDirection,
  computeEditorLaserAxis,
  computeEditorMovingConfig,
  editorGridCellToWorld,
  worldToEditorGridCell,
  validateEditorGrid,
  levelDefinitionToEditorGrid,
  buildLevelFromEditorGrid,
  encodeCustomMazeLevelForUrl,
  decodeCustomMazeLevelFromUrl,
} from '../src/components/scene/mazeLevels.ts';

const BALL_RADIUS = 0.34;
const BOARD_HALF_LIMIT = 5.4;

/**
 * Bir noktanın [px, pz] dikdörtgen duvar bloğuna [wx, wz, width, depth] olan
 * en yakın mesafesini hesaplar.
 */
function distancePointToWall(px, pz, wall) {
  const [wx, , wz] = wall.position;
  const [w, , d] = wall.size;
  const halfW = w * 0.5;
  const halfD = d * 0.5;

  const dx = Math.max(Math.abs(px - wx) - halfW, 0);
  const dz = Math.max(Math.abs(pz - wz) - halfD, 0);
  return Math.hypot(dx, dz);
}

describe('MAZE_LEVELS — 3B Harita Geometrisi, Engel Konumları ve Fizik Doğrulama Testleri', () => {
  it('toplam 5 standart bölüm eksiksiz tanımlanmış olmalıdır', () => {
    assert.equal(MAZE_LEVELS.length, 5);
    MAZE_LEVELS.forEach((level, idx) => {
      assert.equal(level.id, idx + 1);
      assert.equal(level.boardSize, 12);
      assert.ok(level.crystals.length >= 3, `Bölüm ${level.id} en az 3 kristal içermelidir`);
    });
  });

  it('başlangıç (startPosition) ve hedef (goalPosition) noktaları hiçbir iç duvar veya tuzak deliği ile çakışmamalıdır', () => {
    for (const level of MAZE_LEVELS) {
      const [sx, , sz] = level.startPosition;
      const [gx, , gz] = level.goalPosition;

      assert.ok(Math.abs(sx) <= BOARD_HALF_LIMIT && Math.abs(sz) <= BOARD_HALF_LIMIT);
      assert.ok(Math.abs(gx) <= BOARD_HALF_LIMIT && Math.abs(gz) <= BOARD_HALF_LIMIT);

      for (const wall of level.innerWalls) {
        const startDist = distancePointToWall(sx, sz, wall);
        const goalDist = distancePointToWall(gx, gz, wall);
        assert.ok(
          startDist > BALL_RADIUS + 0.15,
          `Bölüm ${level.id}: Başlangıç noktası bir duvara çok yakın (${startDist.toFixed(2)})`,
        );
        assert.ok(
          goalDist > BALL_RADIUS + 0.15,
          `Bölüm ${level.id}: Hedef portalı bir duvara çok yakın (${goalDist.toFixed(2)})`,
        );
      }

      for (const hole of level.voidHoles) {
        const [hx, hz] = hole.position;
        const holeRadius = hole.radius ?? 0.42;
        assert.ok(
          Math.hypot(sx - hx, sz - hz) > holeRadius + BALL_RADIUS + 0.2,
          `Bölüm ${level.id}: Başlangıç noktası tuzak deliğine çok yakın`,
        );
        assert.ok(
          Math.hypot(gx - hx, gz - hz) > holeRadius + BALL_RADIUS + 0.2,
          `Bölüm ${level.id}: Hedef noktası tuzak deliğine çok yakın`,
        );
      }
    }
  });

  it('enerji kristalleri ve tuzak delikleri iç duvarlarla üst üste binmemelidir', () => {
    for (const level of MAZE_LEVELS) {
      for (const [cx, cz] of level.crystals) {
        for (const wall of level.innerWalls) {
          const dist = distancePointToWall(cx, cz, wall);
          assert.ok(
            dist > BALL_RADIUS,
            `Bölüm ${level.id}: Kristal [${cx}, ${cz}] bir duvarla çakışıyor (${dist.toFixed(2)})`,
          );
        }

        for (const hole of level.voidHoles) {
          const [hx, hz] = hole.position;
          const distToHole = Math.hypot(cx - hx, cz - hz);
          assert.ok(
            distToHole > (hole.radius ?? 0.42) + BALL_RADIUS,
            `Bölüm ${level.id}: Kristal [${cx}, ${cz}] bir tuzak deliği ile çakışıyor`,
          );
        }
      }
    }
  });

  it('hızlandırma rampaları (boostPads) ve 3 yıldız süre hedefleri (starThresholds) geçerli olmalıdır', () => {
    for (const level of MAZE_LEVELS) {
      assert.ok(Array.isArray(level.boostPads) && level.boostPads.length >= 1);
      assert.ok(Array.isArray(level.starThresholds));
      assert.ok(level.starThresholds[0] < level.starThresholds[1]);

      for (const pad of level.boostPads) {
        const [bx, bz] = pad.position;
        for (const wall of level.innerWalls) {
          const dist = distancePointToWall(bx, bz, wall);
          assert.ok(
            dist > BALL_RADIUS,
            `Bölüm ${level.id}: Hızlandırma rampası [${bx}, ${bz}] bir duvarla çakışıyor`,
          );
        }
      }

      for (const tp of level.teleporters ?? []) {
        for (const [tx, tz] of [tp.entry, tp.exit]) {
          for (const wall of level.innerWalls) {
            const dist = distancePointToWall(tx, tz, wall);
            assert.ok(
              dist > BALL_RADIUS,
              `Bölüm ${level.id}: Kuantum portal [${tx}, ${tz}] bir duvarla çakışıyor`,
            );
          }
        }
      }
    }
  });

  it('sonsuz prosedürel bölüm motoru (Bölüm 06..50) deterministik ve engelsiz/çakışmasız haritalar üretmelidir', () => {
    for (let id = 6; id <= 50; id++) {
      const lvlA = getMazeLevel(id);
      const lvlB = getMazeLevel(id);

      assert.equal(lvlA.id, id);
      assert.equal(lvlA.boardSize, 12);
      assert.deepEqual(
        lvlA.innerWalls,
        lvlB.innerWalls,
        `Bölüm ${id} deterministik olmalıdır`,
      );
      assert.ok(lvlA.crystals.length >= 3);
      assert.ok(lvlA.voidHoles.length >= 2);
      assert.ok(Array.isArray(lvlA.movingObstacles) && lvlA.movingObstacles.length >= 1);

      const [sx, , sz] = lvlA.startPosition;
      const [gx, , gz] = lvlA.goalPosition;

      for (const wall of lvlA.innerWalls) {
        assert.ok(
          distancePointToWall(sx, sz, wall) > BALL_RADIUS + 0.15,
          `Prosedürel Bölüm ${id}: Başlangıç duvara çok yakın`,
        );
        assert.ok(
          distancePointToWall(gx, gz, wall) > BALL_RADIUS + 0.15,
          `Prosedürel Bölüm ${id}: Hedef duvara çok yakın`,
        );
      }

      for (const [cx, cz] of lvlA.crystals) {
        for (const wall of lvlA.innerWalls) {
          assert.ok(
            distancePointToWall(cx, cz, wall) > BALL_RADIUS,
            `Prosedürel Bölüm ${id}: Kristal [${cx}, ${cz}] duvarla çakışıyor`,
          );
        }
      }

      for (const hole of lvlA.voidHoles) {
        const [hx, hz] = hole.position;
        assert.ok(
          Math.hypot(sx - hx, sz - hz) > (hole.radius ?? 0.4) + BALL_RADIUS,
          `Prosedürel Bölüm ${id}: Delik başlangıca çok yakın`,
        );
        assert.ok(
          Math.hypot(gx - hx, gz - hz) > (hole.radius ?? 0.4) + BALL_RADIUS,
          `Prosedürel Bölüm ${id}: Delik hedefe çok yakın`,
        );
      }

      for (const pad of lvlA.boostPads ?? []) {
        const [bx, bz] = pad.position;
        const [dx, dz] = pad.direction;
        const exitX = bx + dx * 1.5;
        const exitZ = bz + dz * 1.5;
        assert.ok(
          Math.abs(exitX) <= BOARD_HALF_LIMIT &&
            Math.abs(exitZ) <= BOARD_HALF_LIMIT,
          `Prosedürel Bölüm ${id}: Boost rampası dış sınıra yöneliyor`,
        );
        for (const wall of lvlA.innerWalls) {
          assert.ok(
            distancePointToWall(exitX, exitZ, wall) >= BALL_RADIUS,
            `Prosedürel Bölüm ${id}: Boost rampası duvara fırlatıyor`,
          );
        }
      }
    }

    assert.equal(getMazeLevel(0).id, 1);
    assert.equal(getMazeLevel(Number.NaN).id, 1);
    assert.equal(getMazeLevel(Number.POSITIVE_INFINITY).id, 1);
    assert.equal(getMazeLevel(99, null).id, 99);
  });

  it('findSafeP2SpawnOffset standart ve duvarlı başlangıçlarda çakışmasız konum seçmelidir', () => {
    for (let id = 1; id <= 15; id++) {
      const lvl = getMazeLevel(id);
      const [ox, oz] = findSafeP2SpawnOffset(lvl, BALL_RADIUS);
      const px = lvl.startPosition[0] + ox;
      const pz = lvl.startPosition[2] + oz;
      for (const wall of lvl.innerWalls) {
        assert.ok(
          distancePointToWall(px, pz, wall) >= BALL_RADIUS,
          `Bölüm ${id}: P2 başlangıcı iç duvarla çakışıyor`,
        );
      }
    }

    const blockedEastCustom = {
      id: 99,
      title: 'Sağı Duvarlı Özel',
      subtitle: 'Test',
      boardSize: 12,
      startPosition: [0, 0.34, 0],
      goalPosition: [4, 0.35, 4],
      innerWalls: [{ position: [0.85, 0.425, 0], size: [0.6, 0.85, 1.4] }],
      voidHoles: [],
      crystals: [[2, 2]],
      laserGates: [],
    };
    const [ox, oz] = findSafeP2SpawnOffset(blockedEastCustom, BALL_RADIUS);
    assert.notEqual(ox, 0.72);
    assert.notEqual(ox, 0.46);
    assert.ok(
      distancePointToWall(ox, oz, blockedEastCustom.innerWalls[0]) >= BALL_RADIUS,
    );
    assert.notEqual(
      getLevelRevisionKey(blockedEastCustom),
      getLevelRevisionKey({ ...blockedEastCustom, innerWalls: [] }),
    );
    assert.notEqual(
      getLevelRevisionKey(blockedEastCustom),
      getLevelRevisionKey({ ...blockedEastCustom, crystals: [[-2, 2]] }),
    );
    assert.notEqual(
      getLevelRevisionKey(blockedEastCustom),
      getLevelRevisionKey({ ...blockedEastCustom, boardSize: 16 }),
    );
  });

  it('parseCustomMazeLevel geçerli JSON haritasını normalize etmeli ve bozuk şemaları reddetmelidir', () => {
    const valid = parseCustomMazeLevel({
      id: 42,
      title: '   Test Özel Harita   ',
      boardSize: 25,
      startPosition: [-4, 0.34, -4],
      goalPosition: [4, 0.35, 4],
      innerWalls: [{ position: [0, 0.4, 0], size: [1, 0.8, 1] }],
      crystals: [[1, 1], ['bad', 2]],
      boostPads: [
        { position: [2, 2], direction: [3, 4] },
        { position: [1, 1], direction: [0, 0] },
      ],
      starThresholds: [12, 20],
    });

    assert.ok(valid);
    assert.equal(valid.id, 99);
    assert.equal(valid.title, 'Test Özel Harita');
    assert.equal(valid.boardSize, 18);
    assert.deepEqual(valid.crystals, [[1, 1]]);
    assert.equal(valid.boostPads?.length, 1);
    assert.deepEqual(valid.boostPads?.[0].direction, [0.6, 0.8]);
    assert.deepEqual(valid.starThresholds, [12, 20]);

    const clamped = parseCustomMazeLevel({
      boardSize: 12,
      startPosition: [-25, 9, 25],
      goalPosition: [40, -5, -40],
      innerWalls: [{ position: [50, 9, -50], size: [40, 20, 40] }],
      voidHoles: [{ position: [99, -99], radius: 50 }],
      crystals: [[50, -50]],
      teleporters: [
        { entry: [-30, 0], exit: [30, 0] },
        { entry: [12, 0], exit: [20, 0] },
      ],
      laserGates: [
        { position: [20, 0], length: 90, axis: 'x', periodSeconds: 0.01, phaseOffset: 0 },
      ],
      movingObstacles: [
        { center: [0, -30], axis: 'x', amplitude: 50, speed: 99, phaseOffset: 0 },
      ],
    });
    assert.ok(clamped);
    assert.deepEqual(clamped.startPosition, [-5.35, 0.34, 5.35]);
    assert.deepEqual(clamped.goalPosition, [5.35, 0.35, -5.35]);
    assert.deepEqual(clamped.innerWalls[0], {
      position: [6, 1.25, -6],
      size: [12, 2.5, 12],
    });
    assert.deepEqual(clamped.voidHoles[0], { position: [5.35, -5.35], radius: 0.75 });
    assert.deepEqual(clamped.crystals[0], [5.35, -5.35]);
    assert.deepEqual(clamped.teleporters, [
      { entry: [-5.35, 0], exit: [5.35, 0] },
    ]);
    assert.equal(clamped.laserGates[0].length, 11.2);
    assert.equal(clamped.laserGates[0].periodSeconds, 0.4);
    assert.equal(clamped.movingObstacles?.[0].amplitude, 5.2);
    assert.equal(clamped.movingObstacles?.[0].speed, 10);

    assert.equal(parseCustomMazeLevel(null), null);
    assert.equal(parseCustomMazeLevel({ startPosition: [0, 0, 0] }), null);
    assert.equal(
      parseCustomMazeLevel({
        startPosition: [-4, 0.34, -4],
        goalPosition: [4, 0.35, 4],
        innerWalls: [{ position: [0, 0.4, 0], size: [0, 0.8, 1] }],
      }),
      null,
    );
  });

  it('düzenleyici boost yönü duvar/sınırlardan kaçmalı ve hareketli engel güvenli eksen seçmelidir', () => {
    // Alt sınırda (satır 7) sağdaki hedefe giden koridor varken dış sınıra [0, 1] itmemeli
    assert.deepEqual(
      computeEditorBoostDirection(
        7,
        3,
        [7, 7],
        (r, c) => r < 0 || r >= 8 || c < 0 || c >= 8,
      ),
      [1, 0],
    );

    // Doğu komşusu da duvarla kapalıysa açık olan kuzey komşusuna [0, -1] yönelmeli
    assert.deepEqual(
      computeEditorBoostDirection(
        7,
        3,
        [7, 7],
        (r, c) =>
          r < 0 ||
          r >= 8 ||
          c < 0 ||
          c >= 8 ||
          (r === 7 && c === 4) ||
          (r === 7 && c === 2),
      ),
      [0, -1],
    );

    // Her 4 komşu kapalıysa güvenli varsayılan [0, 1] dönmeli
    assert.deepEqual(
      computeEditorBoostDirection(3, 3, [7, 7], () => true),
      [0, 1],
    );

    // Yatay koridor açık, dikeyde duvar varsa X ekseni ve 0.72 genlik seçilmeli
    assert.deepEqual(
      computeEditorMovingConfig(
        3,
        3,
        (r, _c) => r === 2 || r === 4,
      ),
      { axis: 'x', amplitude: 0.72 },
    );

    // Dikey koridor açık, yatayda duvar varsa Z ekseni ve 0.72 genlik seçilmeli
    assert.deepEqual(
      computeEditorMovingConfig(
        3,
        3,
        (_r, c) => c === 2 || c === 4,
      ),
      { axis: 'z', amplitude: 0.72 },
    );

    // İki eksen de duvarla sınırlıysa duvar içi taşmayı önleyen dar genlik (0.34) kullanılmalı
    const confined = computeEditorMovingConfig(
      3,
      3,
      (r, c) => (r === 2 && c === 3) || (r === 3 && c === 4),
    );
    assert.equal(confined.amplitude, 0.34);

    // Yatay koridorda (üst-alt duvar) lazer koridoru dik kesmek için Z eksenini seçmeli
    assert.equal(
      computeEditorLaserAxis(3, 3, (r, _c) => r === 2 || r === 4),
      'z',
    );
    // Dikey koridorda (sol-sağ duvar) lazer koridoru dik kesmek için X eksenini seçmeli
    assert.equal(
      computeEditorLaserAxis(3, 3, (_r, c) => c === 2 || c === 4),
      'x',
    );
  });

  it('worldToEditorGridCell farklı boardSize ölçeklerini 8x8 ızgaraya sıkıştırmadan eşler', () => {
    // Standart 12x12 tahtada gidiş-dönüş 1:1 korunmalı
    const [wx12, wz12] = editorGridCellToWorld(2, 6);
    assert.deepEqual(worldToEditorGridCell(wx12, wz12, 12), [2, 6]);

    // 18x18 büyük tahtada dış ve iç öğeler kenara yığılmadan ayrık hücrelere yerleşmeli
    assert.deepEqual(worldToEditorGridCell(-7.1, -7.1, 18), [0, 0]);
    assert.deepEqual(worldToEditorGridCell(-5.1, 5.1, 18), [6, 1]);
    assert.deepEqual(worldToEditorGridCell(7.1, 7.1, 18), [7, 7]);

    // 8x8 küçük tahtada köşe koordinatları merkeze sıkışmadan [0,0] ve [7,7] olmalı
    assert.deepEqual(worldToEditorGridCell(-3.15, -3.15, 8), [0, 0]);
    assert.deepEqual(worldToEditorGridCell(3.15, 3.15, 8), [7, 7]);

    // Geçersiz/NaN koordinatlar güvenli merkez hücresine düşmeli
    assert.deepEqual(worldToEditorGridCell(Number.NaN, Number.POSITIVE_INFINITY, 12), [4, 4]);
  });

  it('validateEditorGrid ve buildLevelFromEditorGrid kuantum portalları ile 16x16 tahta ölçeğini korur', () => {
    const mkGrid = () =>
      Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => 'erase'));

    // Tek/eşleşmemiş portal reddedilmeli
    const oddPortalGrid = mkGrid();
    oddPortalGrid[0][0] = 'start';
    oddPortalGrid[7][7] = 'goal';
    oddPortalGrid[1][1] = 'portal';
    assert.equal(validateEditorGrid(oddPortalGrid).ok, false);

    // Duvarla tamamen bölünmüş harita çift portal köprüsüyle çözülebilir kabul edilmeli
    const portalBridgeGrid = mkGrid();
    portalBridgeGrid[0][0] = 'start';
    portalBridgeGrid[0][1] = 'portal';
    for (let r = 0; r < 8; r++) {
      portalBridgeGrid[r][3] = 'wall';
    }
    portalBridgeGrid[5][5] = 'portal';
    portalBridgeGrid[6][6] = 'crystal';
    portalBridgeGrid[7][7] = 'goal';
    assert.deepEqual(validateEditorGrid(portalBridgeGrid), { ok: true });

    const built = buildLevelFromEditorGrid(portalBridgeGrid, {
      title: 'Portal Köprüsü',
      boardSize: 16,
    });
    assert.equal(built.boardSize, 16);
    assert.equal(built.teleporters?.length, 1);

    const parsed = parseCustomMazeLevel(built);
    assert.ok(parsed);
    assert.equal(parsed.boardSize, 16);
    assert.equal(parsed.teleporters?.length, 1);

    // Geri yüklemede portallar 8x8 ızgarada eksiksiz korunmalı
    const roundTrippedGrid = levelDefinitionToEditorGrid(parsed);
    assert.equal(roundTrippedGrid[0][0], 'start');
    assert.equal(roundTrippedGrid[7][7], 'goal');
    assert.equal(roundTrippedGrid[0][1], 'portal');
    assert.equal(roundTrippedGrid[5][5], 'portal');
  });

  it('encodeCustomMazeLevelForUrl ve decodeCustomMazeLevelFromUrl Türkçe haritaları Base64url ile gidiş-dönüş taşır', () => {
    const mkGrid = () =>
      Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => 'erase'));
    const grid = mkGrid();
    grid[0][0] = 'start';
    grid[7][7] = 'goal';
    grid[1][2] = 'portal';
    grid[5][4] = 'portal';
    grid[3][3] = 'crystal';

    const original = buildLevelFromEditorGrid(grid, {
      title: 'Şehir Işınlanma Üssü — Çağıl',
      boardSize: 14,
    });
    const encoded = encodeCustomMazeLevelForUrl(original);

    assert.match(encoded, /^[A-Za-z0-9_-]+$/);
    const decoded = decodeCustomMazeLevelFromUrl(encoded);
    assert.ok(decoded);
    assert.equal(decoded.id, 99);
    assert.equal(decoded.title, 'Şehir Işınlanma Üssü — Çağıl');
    assert.equal(decoded.boardSize, 14);
    assert.equal(decoded.teleporters?.length, 1);
    assert.deepEqual(decoded.crystals, original.crystals);

    assert.equal(decodeCustomMazeLevelFromUrl(''), null);
    assert.equal(decodeCustomMazeLevelFromUrl('%%%bozuk%%%'), null);
    assert.equal(decodeCustomMazeLevelFromUrl('e30'), null);
    assert.equal(decodeCustomMazeLevelFromUrl('a'.repeat(20_000)), null);
  });
});

