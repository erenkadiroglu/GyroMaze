import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  CAMERA_MAX_SAFE_DELTA,
  CAMERA_LERP_SPEED,
  DEFAULT_MAX_TILT_RADIANS,
  isAnyCameraRigModalOpen,
  clampCameraFrameDelta,
  evaluateCameraRigStep,
  applyCameraRigTransform,
} from '../src/utils/mazeCameraRigUtils.ts';

describe('mazeCameraRigUtils — 3B Kamera Görüş ve Takip Rig Motoru', () => {
  describe('Sabitler', () => {
    test('kamera rig sabitleri beklenen degerlere sahip olmali', () => {
      assert.equal(CAMERA_MAX_SAFE_DELTA, 0.05);
      assert.equal(CAMERA_LERP_SPEED, 10);
      assert.ok(Math.abs(DEFAULT_MAX_TILT_RADIANS - (14 * Math.PI) / 180) < 1e-6);
    });
  });

  describe('isAnyCameraRigModalOpen', () => {
    test('tum modallar kapali iken false donmeli', () => {
      assert.equal(
        isAnyCameraRigModalOpen({
          isPairingModalOpen: false,
          isSettingsOpen: false,
          isEditorOpen: false,
          isLeaderboardOpen: false,
        }),
        false,
      );
    });

    test('herhangi bir modal acik iken true donmeli', () => {
      assert.equal(
        isAnyCameraRigModalOpen({
          isPairingModalOpen: true,
          isSettingsOpen: false,
          isEditorOpen: false,
          isLeaderboardOpen: false,
        }),
        true,
      );
      assert.equal(
        isAnyCameraRigModalOpen({
          isPairingModalOpen: false,
          isSettingsOpen: true,
          isEditorOpen: false,
          isLeaderboardOpen: false,
        }),
        true,
      );
      assert.equal(
        isAnyCameraRigModalOpen({
          isPairingModalOpen: false,
          isSettingsOpen: false,
          isEditorOpen: true,
          isLeaderboardOpen: false,
        }),
        true,
      );
      assert.equal(
        isAnyCameraRigModalOpen({
          isPairingModalOpen: false,
          isSettingsOpen: false,
          isEditorOpen: false,
          isLeaderboardOpen: true,
        }),
        true,
      );
    });
  });

  describe('clampCameraFrameDelta', () => {
    test('gecersiz veya negatif surelerde 0 donmeli', () => {
      assert.equal(clampCameraFrameDelta(-1), 0);
      assert.equal(clampCameraFrameDelta(Number.NaN), 0);
      assert.equal(clampCameraFrameDelta(null), 0);
    });

    test('normal kare surelerini korumali, 0.05 asimini 0.05 ile sinirlamali', () => {
      assert.equal(clampCameraFrameDelta(0.016), 0.016);
      assert.equal(clampCameraFrameDelta(0.033), 0.033);
      assert.equal(clampCameraFrameDelta(0.12), 0.05);
      assert.equal(clampCameraFrameDelta(2.5), 0.05);
    });
  });

  describe('evaluateCameraRigStep', () => {
    test('modal acikken etkilesimsiz olmali ve egim sifirlanmali', () => {
      const step = evaluateCameraRigStep({
        cameraMode: 'isometric',
        gameStatus: 'playing',
        isPageHidden: false,
        isAnyModalOpen: true,
        delta: 0.016,
        gyroBeta: 20,
        gyroGamma: 15,
        ballX: -4,
        ballZ: -4,
        ballSpeed: 0,
        currentFov: 45,
      });

      assert.equal(step.isInteractive, false);
      assert.equal(step.safeDelta, 0.016);
      assert.ok(step.lerpAlpha > 0);
      // Izometrik modda sifir egim ile standart pozisyona donmeli
      assert.deepEqual(step.lookAt, [0, 0, 0]);
      assert.equal(step.targetPos[1], 14.5);
    });

    test('topdown modunda dikey bakis acisi uretmeli', () => {
      const step = evaluateCameraRigStep({
        cameraMode: 'topdown',
        gameStatus: 'playing',
        isPageHidden: false,
        isAnyModalOpen: false,
        delta: 0.016,
        gyroBeta: 0,
        gyroGamma: 0,
        ballX: 0,
        ballZ: 0,
        ballSpeed: 0,
        currentFov: 45,
      });

      assert.equal(step.isInteractive, true);
      assert.equal(step.targetPos[1], 18.2);
      assert.deepEqual(step.lookAt, [0, 0, 0]);
    });

    test('follow modunda bilye koordinatlarini takip etmeli', () => {
      const step = evaluateCameraRigStep({
        cameraMode: 'follow',
        gameStatus: 'playing',
        isPageHidden: false,
        isAnyModalOpen: false,
        delta: 0.016,
        gyroBeta: 0,
        gyroGamma: 0,
        ballX: 3,
        ballZ: -2,
        ballSpeed: 0,
        currentFov: 45,
      });

      assert.equal(step.isInteractive, true);
      // ballX * 0.52 = 1.56, ballZ * 0.52 = -1.04
      assert.equal(step.lookAt[0], 3 * 0.52);
      assert.equal(step.lookAt[2], -2 * 0.52);
    });

    test('yuksek hizda dinamik FOV guncellemesi onermeli', () => {
      const step = evaluateCameraRigStep({
        cameraMode: 'isometric',
        gameStatus: 'playing',
        isPageHidden: false,
        isAnyModalOpen: false,
        delta: 0.016,
        gyroBeta: 0,
        gyroGamma: 0,
        ballX: 0,
        ballZ: 0,
        ballSpeed: 10,
        currentFov: 45,
        isPerspective: true,
      });

      assert.ok(step.fovUpdate);
      assert.equal(step.fovUpdate.shouldUpdate, true);
      assert.ok(step.fovUpdate.nextFov > 45);
    });

    test('perspektif olmayan kamerada fovUpdate null olmali', () => {
      const step = evaluateCameraRigStep({
        cameraMode: 'isometric',
        gameStatus: 'playing',
        isPageHidden: false,
        isAnyModalOpen: false,
        delta: 0.016,
        gyroBeta: 0,
        gyroGamma: 0,
        ballX: 0,
        ballZ: 0,
        ballSpeed: 5,
        isPerspective: false,
      });

      assert.equal(step.fovUpdate, null);
    });
  });

  describe('applyCameraRigTransform', () => {
    test('null kamera durumunda guvenle hicbir sey yapmamali', () => {
      assert.doesNotThrow(() => {
        applyCameraRigTransform(null, {
          isInteractive: true,
          safeDelta: 0.016,
          lerpAlpha: 0.1,
          targetPos: [0, 15, 12],
          lookAt: [0, 0, 0],
          fovUpdate: null,
        });
      });
    });

    test('kamera konumunu, bakis acisini ve fov projeksiyon matrisini guncellemeli', () => {
      let matrixUpdated = false;
      const dummyCamera = {
        fov: 45,
        position: {
          x: 0,
          y: 0,
          z: 0,
          lerp(target, alpha) {
            this.x += (target.x - this.x) * alpha;
            this.y += (target.y - this.y) * alpha;
            this.z += (target.z - this.z) * alpha;
          },
        },
        lookAtCalledWith: null,
        lookAt(vec) {
          this.lookAtCalledWith = vec;
        },
        updateProjectionMatrix() {
          matrixUpdated = true;
        },
      };

      const targetPosVec = {
        x: 0,
        y: 0,
        z: 0,
        set(x, y, z) {
          this.x = x;
          this.y = y;
          this.z = z;
        },
      };

      const lookAtVec = {
        x: 0,
        y: 0,
        z: 0,
        set(x, y, z) {
          this.x = x;
          this.y = y;
          this.z = z;
        },
      };

      applyCameraRigTransform(
        dummyCamera,
        {
          isInteractive: true,
          safeDelta: 0.016,
          lerpAlpha: 0.5,
          targetPos: [10, 20, 30],
          lookAt: [1, 2, 3],
          fovUpdate: { shouldUpdate: true, nextFov: 48.5 },
        },
        targetPosVec,
        lookAtVec,
      );

      assert.equal(dummyCamera.position.x, 5);
      assert.equal(dummyCamera.position.y, 10);
      assert.equal(dummyCamera.position.z, 15);
      assert.equal(dummyCamera.fov, 48.5);
      assert.equal(matrixUpdated, true);
      assert.equal(dummyCamera.lookAtCalledWith, lookAtVec);
    });
  });
});
