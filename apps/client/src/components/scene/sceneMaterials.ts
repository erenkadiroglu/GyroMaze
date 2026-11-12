import * as THREE from 'three';
import type { BoardTheme, ColorScheme, BallSkin } from '@gyromaze/shared';
import {
  resolveThemePalette,
  resolveBallSkinColors,
} from '../../utils/sceneUtils.ts';

// Garbage Collection (GC) duraksamalarını önlemek için modül seviyesinde önceden ayrılmış nesneler
export const _targetEuler = new THREE.Euler(0, 0, 0, 'XYZ');
export const _targetQuat = new THREE.Quaternion();
export const _currentQuat = new THREE.Quaternion();
export const _currentEuler = new THREE.Euler(0, 0, 0, 'XYZ');
export const _cameraTargetPos = new THREE.Vector3(0, 14.5, 10.2);
export const _cameraLookAt = new THREE.Vector3(0, 0, 0);

// GPU Shader ve bellek optimizasyonu için paylaşılan (singleton) materyaller
export const _boardMaterial = new THREE.MeshStandardMaterial({
  color: '#18181b',
  roughness: 0.55,
  metalness: 0.25,
});

export const _outerWallMaterial = new THREE.MeshStandardMaterial({
  color: '#27272a',
  roughness: 0.35,
  metalness: 0.45,
});

export const _innerWallMaterial = new THREE.MeshStandardMaterial({
  color: '#3f3f46',
  roughness: 0.3,
  metalness: 0.5,
});

export const _ballMaterial = new THREE.MeshStandardMaterial({
  color: '#f4f4f5',
  metalness: 0.88,
  roughness: 0.14,
});

export const _holeCoreMaterial = new THREE.MeshBasicMaterial({ color: '#050507' });

export const _holeRingMaterial = new THREE.MeshStandardMaterial({
  color: '#f43f5e',
  emissive: '#e11d48',
  emissiveIntensity: 1.4,
});

export const _goalUnlockedRingMaterial = new THREE.MeshStandardMaterial({
  color: '#10b981',
  emissive: '#10b981',
  emissiveIntensity: 1.7,
  roughness: 0.2,
});

export const _goalLockedRingMaterial = new THREE.MeshStandardMaterial({
  color: '#f59e0b',
  emissive: '#d97706',
  emissiveIntensity: 1.1,
  roughness: 0.3,
});

export const _goalUnlockedCoreMaterial = new THREE.MeshBasicMaterial({
  color: '#34d399',
  transparent: true,
  opacity: 0.38,
});

export const _goalLockedCoreMaterial = new THREE.MeshBasicMaterial({
  color: '#fbbf24',
  transparent: true,
  opacity: 0.22,
});

export const _startRingMaterial = new THREE.MeshBasicMaterial({
  color: '#38bdf8',
  transparent: true,
  opacity: 0.65,
});

export const _crystalMaterial = new THREE.MeshStandardMaterial({
  color: '#38bdf8',
  emissive: '#0284c7',
  emissiveIntensity: 1.6,
  roughness: 0.15,
  metalness: 0.8,
});

export const _laserBeamMaterial = new THREE.MeshBasicMaterial({
  color: '#fb7185',
  transparent: true,
  opacity: 0.88,
});

export const _laserPillarMaterial = new THREE.MeshStandardMaterial({
  color: '#52525b',
  metalness: 0.7,
  roughness: 0.25,
});

export const _trailMaterial = new THREE.MeshBasicMaterial({
  color: '#38bdf8',
  transparent: true,
  opacity: 0.28,
});

export const _boostBaseMaterial = new THREE.MeshBasicMaterial({
  color: '#a855f7',
  transparent: true,
  opacity: 0.25,
});

export const _boostArrowMaterial = new THREE.MeshStandardMaterial({
  color: '#c084fc',
  emissive: '#9333ea',
  emissiveIntensity: 1.8,
});

export const _teleporterRingMaterial = new THREE.MeshStandardMaterial({
  color: '#22d3ee',
  emissive: '#06b6d4',
  emissiveIntensity: 1.9,
});

export const _teleporterCoreMaterial = new THREE.MeshBasicMaterial({
  color: '#67e8f9',
  transparent: true,
  opacity: 0.32,
});

export const _ghostBallMaterial = new THREE.MeshStandardMaterial({
  color: '#34d399',
  emissive: '#10b981',
  emissiveIntensity: 1.4,
  transparent: true,
  opacity: 0.36,
});

export const _movingObstacleMaterial = new THREE.MeshStandardMaterial({
  color: '#f97316',
  emissive: '#ea580c',
  emissiveIntensity: 1.35,
  roughness: 0.25,
  metalness: 0.65,
});

export const _ball2Material = new THREE.MeshStandardMaterial({
  color: '#f59e0b',
  emissive: '#d97706',
  emissiveIntensity: 0.45,
  metalness: 0.88,
  roughness: 0.16,
});

export const MAX_TILT_RADIANS = THREE.MathUtils.degToRad(24);
export const BALL_RADIUS = 0.34;
export const TRAIL_COUNT = 7;

/**
 * 3B Sahne temasını, karanlık/aydınlık modunu ve bilye kaplamalarını
 * Three.js singleton materyallerine uygular.
 */
export function applySceneThemeMaterials(
  boardTheme: BoardTheme,
  colorScheme: ColorScheme,
  isLightBoard: boolean,
  ballSkin: BallSkin,
): void {
  const themePalette = resolveThemePalette(boardTheme, colorScheme);
  _boardMaterial.color.set(themePalette.boardColor);
  _boardMaterial.roughness = themePalette.boardRoughness;
  _boardMaterial.metalness = themePalette.boardMetalness;
  _outerWallMaterial.color.set(themePalette.outerWallColor);
  _innerWallMaterial.color.set(themePalette.innerWallColor);
  _trailMaterial.color.set(themePalette.trailColor);

  const skinColors = resolveBallSkinColors(ballSkin, isLightBoard);
  _ballMaterial.color.set(skinColors.color);
  _ballMaterial.emissive.set(skinColors.emissive);
  _ballMaterial.emissiveIntensity = skinColors.emissiveIntensity;
  if (skinColors.trailColor) {
    _trailMaterial.color.set(skinColors.trailColor);
  }
}
