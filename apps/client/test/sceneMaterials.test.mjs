import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';

import {
  _boardMaterial,
  _outerWallMaterial,
  _innerWallMaterial,
  _ballMaterial,
  _ball2Material,
  _holeCoreMaterial,
  _holeRingMaterial,
  _goalUnlockedRingMaterial,
  _goalLockedRingMaterial,
  _goalUnlockedCoreMaterial,
  _goalLockedCoreMaterial,
  _startRingMaterial,
  _crystalMaterial,
  _laserBeamMaterial,
  _laserPillarMaterial,
  _trailMaterial,
  _boostBaseMaterial,
  _boostArrowMaterial,
  _teleporterRingMaterial,
  _teleporterCoreMaterial,
  _ghostBallMaterial,
  _movingObstacleMaterial,
  _targetEuler,
  _targetQuat,
  _currentQuat,
  _currentEuler,
  _cameraTargetPos,
  _cameraLookAt,
  MAX_TILT_RADIANS,
  BALL_RADIUS,
  TRAIL_COUNT,
  applySceneThemeMaterials,
} from '../src/components/scene/sceneMaterials.ts';

test('sceneMaterials: Three.js singleton materyalleri gecerli orneklerdir', () => {
  assert.ok(_boardMaterial instanceof THREE.MeshStandardMaterial);
  assert.ok(_outerWallMaterial instanceof THREE.MeshStandardMaterial);
  assert.ok(_innerWallMaterial instanceof THREE.MeshStandardMaterial);
  assert.ok(_ballMaterial instanceof THREE.MeshStandardMaterial);
  assert.ok(_ball2Material instanceof THREE.MeshStandardMaterial);
  assert.ok(_holeCoreMaterial instanceof THREE.MeshBasicMaterial);
  assert.ok(_holeRingMaterial instanceof THREE.MeshStandardMaterial);
  assert.ok(_goalUnlockedRingMaterial instanceof THREE.MeshStandardMaterial);
  assert.ok(_crystalMaterial instanceof THREE.MeshStandardMaterial);
  assert.ok(_laserBeamMaterial instanceof THREE.MeshBasicMaterial);
  assert.ok(_boostArrowMaterial instanceof THREE.MeshStandardMaterial);
  assert.ok(_teleporterRingMaterial instanceof THREE.MeshStandardMaterial);
  assert.ok(_ghostBallMaterial instanceof THREE.MeshStandardMaterial);
  assert.ok(_movingObstacleMaterial instanceof THREE.MeshStandardMaterial);
});

test('sceneMaterials: sabit degerler ve onceden ayrilmis matematik nesneleri tanimlidir', () => {
  assert.equal(BALL_RADIUS, 0.34);
  assert.equal(TRAIL_COUNT, 7);
  assert.ok(Math.abs(MAX_TILT_RADIANS - THREE.MathUtils.degToRad(24)) < 1e-6);

  assert.ok(_targetEuler instanceof THREE.Euler);
  assert.ok(_targetQuat instanceof THREE.Quaternion);
  assert.ok(_currentQuat instanceof THREE.Quaternion);
  assert.ok(_currentEuler instanceof THREE.Euler);
  assert.ok(_cameraTargetPos instanceof THREE.Vector3);
  assert.ok(_cameraLookAt instanceof THREE.Vector3);
});

test('applySceneThemeMaterials: standart koyu zumrut temasinda dogru renkleri uygular', () => {
  applySceneThemeMaterials('emerald', 'dark', false, 'chrome');

  // Tahta rengi koyu cinko (#18181b)
  const hex = _boardMaterial.color.getHexString();
  assert.ok(typeof hex === 'string' && hex.length === 6);
  assert.equal(_boardMaterial.roughness, 0.55);
  assert.equal(_boardMaterial.metalness, 0.25);

  // Duvar renkleri
  assert.ok(_outerWallMaterial.color.getHexString().length === 6);
  assert.ok(_innerWallMaterial.color.getHexString().length === 6);
});

test('applySceneThemeMaterials: aydinlik gunduz temasinda acik renkleri uygular', () => {
  applySceneThemeMaterials('daylight', 'light', true, 'chrome');

  // Aydinlik temada tahta beyaz (#ffffff)
  const hex = _boardMaterial.color.getHexString();
  assert.equal(hex, 'ffffff');
  assert.equal(_boardMaterial.roughness, 0.42);
  assert.equal(_boardMaterial.metalness, 0.08);
});

test('applySceneThemeMaterials: siberpunk temasinda neon paleti uygular', () => {
  applySceneThemeMaterials('cyberpunk', 'dark', false, 'chrome');

  const hex = _boardMaterial.color.getHexString();
  assert.equal(hex, '0f1026');
  assert.equal(_boardMaterial.roughness, 0.55);
  assert.equal(_boardMaterial.metalness, 0.25);
  assert.equal(_trailMaterial.color.getHexString(), 'f472b6');
});

test('applySceneThemeMaterials: ozel bilye kaplamalarinda (emerald, plasma, crimson) emisyon ve iz renklerini gunceller', () => {
  // Zumrut kaplama
  applySceneThemeMaterials('emerald', 'dark', false, 'emerald');
  assert.equal(_ballMaterial.emissiveIntensity, 0.7);
  assert.equal(_trailMaterial.color.getHexString(), '34d399');

  // Plazma kaplama
  applySceneThemeMaterials('emerald', 'dark', false, 'plasma');
  assert.equal(_ballMaterial.emissiveIntensity, 0.75);
  assert.equal(_trailMaterial.color.getHexString(), 'c084fc');

  // Kizil kaplama
  applySceneThemeMaterials('emerald', 'dark', false, 'crimson');
  assert.equal(_ballMaterial.emissiveIntensity, 0.75);
  assert.equal(_trailMaterial.color.getHexString(), 'fb7185');
});
