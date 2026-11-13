import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  GHOST_SAMPLE_RATE,
  GHOST_SAMPLE_INTERVAL_SECONDS,
  MAX_GHOST_RECORDING_POINTS,
  DEFAULT_GHOST_BALL_RADIUS,
  createInitialGhostPaths,
  evaluateGhostRecordingStep,
  resolveGhostMeshTransform,
  applyGhostMeshTransform,
} from '../src/utils/ghostReplayUtils.ts';

describe('ghostReplayUtils — Hayalet Yarışçı Yeniden Oynatma ve Örnekleme Motoru', () => {
  describe('Sabitler', () => {
    test('ornekleme ve fizik sabitleri beklenen degerlere sahip olmali', () => {
      assert.equal(GHOST_SAMPLE_RATE, 10);
      assert.equal(GHOST_SAMPLE_INTERVAL_SECONDS, 0.1);
      assert.equal(MAX_GHOST_RECORDING_POINTS, 600);
      assert.equal(DEFAULT_GHOST_BALL_RADIUS, 0.34);
    });
  });

  describe('createInitialGhostPaths', () => {
    test('1P ve 2P baslangic koordinatlarini dogru formatlamali', () => {
      const { runPath1, runPath2 } = createInitialGhostPaths([-4.5, 0.34, -4.5], 0.6, 0.2);
      assert.deepEqual(runPath1, [[-4.5, -4.5]]);
      assert.deepEqual(runPath2, [[-3.9, -4.3]]);
    });

    test('varsayilan offset degerleri ile calismali', () => {
      const { runPath1, runPath2 } = createInitialGhostPaths([0, 0, 0]);
      assert.deepEqual(runPath1, [[0, 0]]);
      assert.deepEqual(runPath2, [[0.6, 0]]);
    });
  });

  describe('evaluateGhostRecordingStep', () => {
    test('isInteractive false ise ornekleme yapilmamali ve zaman ilerlememeli', () => {
      const res = evaluateGhostRecordingStep({
        safeDelta: 0.016,
        isInteractive: false,
        currentElapsed: 2.5,
        lastSampleTime: 2.4,
        pos1: { x: 1, z: 2 },
        pos2: null,
        path1Length: 10,
        path2Length: 0,
      });

      assert.equal(res.shouldSample, false);
      assert.equal(res.nextElapsed, 2.5);
      assert.equal(res.nextSampleTime, 2.4);
      assert.equal(res.newPoint1, null);
      assert.equal(res.newPoint2, null);
    });

    test('sure esigi asilmadiginda ornekleme tetiklenmemeli', () => {
      const res = evaluateGhostRecordingStep({
        safeDelta: 0.016,
        isInteractive: true,
        currentElapsed: 1.0,
        lastSampleTime: 1.0,
        pos1: { x: 1, z: 2 },
        pos2: null,
        path1Length: 10,
        path2Length: 0,
      });

      assert.equal(res.shouldSample, false);
      assert.equal(res.nextElapsed, 1.016);
      assert.equal(res.nextSampleTime, 1.0);
      assert.equal(res.newPoint1, null);
    });

    test('sure esigi doldugunda 1P ve 2P icin yeni noktalar uretilmeli', () => {
      const res = evaluateGhostRecordingStep({
        safeDelta: 0.11,
        isInteractive: true,
        currentElapsed: 1.0,
        lastSampleTime: 1.0,
        pos1: { x: 2.3456, z: -1.7891 },
        pos2: { x: 3.1234, z: -0.5678 },
        path1Length: 10,
        path2Length: 10,
      });

      assert.equal(res.shouldSample, true);
      assert.equal(res.nextElapsed, 1.11);
      assert.deepEqual(res.newPoint1, [2.35, -1.79]);
      assert.deepEqual(res.newPoint2, [3.12, -0.57]);
    });

    test('maksimum nokta siniri asildiginda yeni nokta eklenmemeli', () => {
      const res = evaluateGhostRecordingStep({
        safeDelta: 0.11,
        isInteractive: true,
        currentElapsed: 1.0,
        lastSampleTime: 1.0,
        pos1: { x: 1, z: 1 },
        pos2: { x: 2, z: 2 },
        path1Length: 600,
        path2Length: 600,
        maxPoints: 600,
      });

      assert.equal(res.shouldSample, true);
      assert.equal(res.newPoint1, null);
      assert.equal(res.newPoint2, null);
    });
  });

  describe('resolveGhostMeshTransform', () => {
    test('showGhost false veya isInteractive false durumunda gorunmez olmali', () => {
      const res1 = resolveGhostMeshTransform({
        showGhost: false,
        isInteractive: true,
        ghostPath: [[0, 0], [1, 1]],
        runElapsed: 0.5,
      });
      assert.equal(res1.isVisible, false);
      assert.equal(res1.position, null);

      const res2 = resolveGhostMeshTransform({
        showGhost: true,
        isInteractive: false,
        ghostPath: [[0, 0], [1, 1]],
        runElapsed: 0.5,
      });
      assert.equal(res2.isVisible, false);
      assert.equal(res2.position, null);
    });

    test('yol yokken veya yetersiz nokta varken gorunmez olmali', () => {
      const res = resolveGhostMeshTransform({
        showGhost: true,
        isInteractive: true,
        ghostPath: [[0, 0]],
        runElapsed: 0.5,
      });
      assert.equal(res.isVisible, false);
      assert.equal(res.position, null);
    });

    test('gecerli yolda enterpole edilmis koordinat ve yuksekligi uretmeli', () => {
      const samplePath = [
        [0, 0],
        [1, 1],
        [2, 2],
      ];
      // 10 Hz'de runElapsed: 0.1 saniye tam 1. indekstir: [1, 1]
      const res = resolveGhostMeshTransform({
        showGhost: true,
        isInteractive: true,
        ghostPath: samplePath,
        runElapsed: 0.1,
        ballRadius: 0.35,
      });

      assert.equal(res.isVisible, true);
      assert.ok(res.position);
      assert.equal(res.position[0], 1);
      assert.equal(res.position[1], 0.35);
      assert.equal(res.position[2], 1);
    });
  });

  describe('applyGhostMeshTransform', () => {
    test('null mesh durumunda guvenle hicbir sey yapmamali', () => {
      assert.doesNotThrow(() => {
        applyGhostMeshTransform(null, { isVisible: true, position: [1, 1, 1] });
      });
    });

    test('mesh gorunurlugunu ve konumunu basariyla ayarlamali', () => {
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
      };

      applyGhostMeshTransform(dummyMesh, {
        isVisible: true,
        position: [2, 0.34, 3],
      });

      assert.equal(dummyMesh.visible, true);
      assert.equal(dummyMesh.position.x, 2);
      assert.equal(dummyMesh.position.y, 0.34);
      assert.equal(dummyMesh.position.z, 3);
    });
  });
});

