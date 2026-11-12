import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  MAZE_LEVELS,
  getMazeLevel,
  findSafeP2SpawnOffset,
  getLevelRevisionKey,
  parseCustomMazeLevel,
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
    }

    assert.equal(getMazeLevel(0).id, 1);
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
      boostPads: [{ position: [2, 2], direction: [0, 1] }],
      starThresholds: [12, 20],
    });

    assert.ok(valid);
    assert.equal(valid.id, 99);
    assert.equal(valid.title, 'Test Özel Harita');
    assert.equal(valid.boardSize, 18);
    assert.deepEqual(valid.crystals, [[1, 1]]);
    assert.equal(valid.boostPads?.length, 1);
    assert.deepEqual(valid.starThresholds, [12, 20]);

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
});

