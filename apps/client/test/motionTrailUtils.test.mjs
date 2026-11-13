import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_TRAIL_COUNT,
  DEFAULT_TRAIL_Y_OFFSET,
  DEFAULT_TRAIL_SMOOTH_FACTOR,
  createInitialTrailHistory,
  resetTrailHistoryBuffer,
  calculateTrailTransform,
  stepAndResolveTrail,
  applyTrailMeshTransforms,
} from '../src/utils/motionTrailUtils.ts';

describe('motionTrailUtils — Bilye Neon Hareket İzi ve Kuyruk Simülasyon Motoru', () => {
  describe('Sabitler', () => {
    test('hareket izi sabitleri beklenen degerlere sahip olmali', () => {
      assert.equal(DEFAULT_TRAIL_COUNT, 8);
      assert.equal(DEFAULT_TRAIL_Y_OFFSET, 0.025);
      assert.equal(DEFAULT_TRAIL_SMOOTH_FACTOR, 0.42);
    });
  });

  describe('createInitialTrailHistory', () => {
    test('belirtilen uzunlukta ve koordinatta baslangic dizisi uretmeli', () => {
      const history = createInitialTrailHistory([-4.5, 0.34, 2.5], 4);
      assert.equal(history.length, 4);
      for (const pt of history) {
        assert.equal(pt.x, -4.5);
        assert.equal(pt.z, 2.5);
      }
    });

    test('varsayilan uzunluk 8 olmali', () => {
      const history = createInitialTrailHistory([0, 0, 0]);
      assert.equal(history.length, 8);
    });
  });

  describe('resetTrailHistoryBuffer', () => {
    test('in-place olarak tum noktalari yeni koordinata esitlemeli', () => {
      const buffer = [
        { x: 1, z: 1 },
        { x: 2, z: 2 },
        { x: 3, z: 3 },
      ];
      resetTrailHistoryBuffer(buffer, [-1, 0, -2]);

      assert.equal(buffer.length, 3);
      assert.deepEqual(buffer, [
        { x: -1, z: -2 },
        { x: -1, z: -2 },
        { x: -1, z: -2 },
      ]);
    });
  });

  describe('calculateTrailTransform', () => {
    test('konum ve olcek vektorlerini dogru formatlamali', () => {
      const t = calculateTrailTransform(0, 8, 2.5, -1.5, 0.03);
      assert.deepEqual(t.position, [2.5, 0.03, -1.5]);
      // index 0 icin scale = 1 - 0/9 = 1
      assert.equal(t.scale[0], 1);
      assert.equal(t.scale[1], 1);
      assert.equal(t.scale[2], 1);
    });
  });

  describe('stepAndResolveTrail', () => {
    test('gecmisi yumusatarak ilerletmeli ve donusturme listesi uretmeli', () => {
      const history = [
        { x: 0, z: 0 },
        { x: 0, z: 0 },
      ];

      const transforms = stepAndResolveTrail(
        history,
        { x: 10, z: 10 },
        true,
        0.5,
      );

      assert.equal(transforms.length, 2);
      assert.equal(transforms[0].visible, true);
      // newPos'a gore ilk eleman ilerlemis olmali
      assert.ok(history[0].x > 0);
      assert.ok(history[0].z > 0);
    });

    test('showTrail false iken tum donusturmelerde visible false olmali', () => {
      const history = [{ x: 1, z: 1 }];
      const transforms = stepAndResolveTrail(history, { x: 2, z: 2 }, false);
      assert.equal(transforms[0].visible, false);
    });
  });

  describe('applyTrailMeshTransforms', () => {
    test('null veya eksik mesh durumunda hata firlatmamali', () => {
      assert.doesNotThrow(() => {
        applyTrailMeshTransforms([null, undefined], [
          { visible: true, position: [0, 0, 0], scale: [1, 1, 1] },
        ]);
      });
    });

    test('var olan Three.js mesh nesnelerine konumlari ve olcekleri uygulamali', () => {
      const dummyMesh = {
        visible: false,
        position: {
          x: 0,
          y: 0,
          z: 0,
          set(x, y, z) {
            this.x = x;
            this.y = y;
            this.z = z;
          },
        },
        scale: {
          x: 0,
          y: 0,
          z: 0,
          set(x, y, z) {
            this.x = x;
            this.y = y;
            this.z = z;
          },
        },
      };

      applyTrailMeshTransforms(
        [dummyMesh],
        [
          {
            visible: true,
            position: [1.2, 0.025, -3.4],
            scale: [0.85, 0.85, 1],
          },
        ],
      );

      assert.equal(dummyMesh.visible, true);
      assert.equal(dummyMesh.position.x, 1.2);
      assert.equal(dummyMesh.position.y, 0.025);
      assert.equal(dummyMesh.position.z, -3.4);
      assert.equal(dummyMesh.scale.x, 0.85);
      assert.equal(dummyMesh.scale.y, 0.85);
      assert.equal(dummyMesh.scale.z, 1);
    });
  });
});
