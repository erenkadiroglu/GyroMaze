import type * as THREE from 'three';
import { stepTrailHistory } from './sceneCameraUtils.ts';
import { calculateTrailScale } from './sceneUtils.ts';

export const DEFAULT_TRAIL_COUNT = 8;
export const DEFAULT_TRAIL_Y_OFFSET = 0.025;
export const DEFAULT_TRAIL_SMOOTH_FACTOR = 0.42;

export interface TrailPoint {
  x: number;
  z: number;
}

export interface TrailMeshTransform {
  visible: boolean;
  position: [number, number, number];
  scale: [number, number, number];
}

/**
 * Başlangıç spawn koordinatlarından belirtilen uzunlukta başlangıç iz tamponu oluşturur.
 */
export function createInitialTrailHistory(
  startPosition: [number, number, number],
  count: number = DEFAULT_TRAIL_COUNT,
): TrailPoint[] {
  const [sx, , sz] = startPosition;
  return Array.from({ length: Math.max(1, count) }, () => ({
    x: sx,
    z: sz,
  }));
}

/**
 * Mevcut iz tamponundaki tüm koordinatları sıfırlayarak yeni başlangıç noktasına eşitler (Zero GC).
 */
export function resetTrailHistoryBuffer(
  history: TrailPoint[],
  startPosition: [number, number, number],
): void {
  const [sx, , sz] = startPosition;
  for (let i = 0; i < history.length; i++) {
    history[i].x = sx;
    history[i].z = sz;
  }
}

/**
 * Belirli bir iz halkası için Three.js konum ve ölçek vektörlerini hesaplar.
 */
export function calculateTrailTransform(
  index: number,
  totalCount: number,
  x: number,
  z: number,
  yOffset: number = DEFAULT_TRAIL_Y_OFFSET,
): { position: [number, number, number]; scale: [number, number, number] } {
  const scale = calculateTrailScale(index, totalCount);
  return {
    position: [x, yOffset, z],
    scale: [scale, scale, 1],
  };
}

/**
 * Bilyenin yeni konumuna göre iz geçmişini öteler ve her halkanın dönüştürme matrisini çözer.
 */
export function stepAndResolveTrail(
  history: TrailPoint[],
  newPos: TrailPoint,
  showTrail: boolean,
  smoothFactor: number = DEFAULT_TRAIL_SMOOTH_FACTOR,
  yOffset: number = DEFAULT_TRAIL_Y_OFFSET,
): TrailMeshTransform[] {
  stepTrailHistory(history, newPos, smoothFactor);

  const len = history.length;
  const result: TrailMeshTransform[] = new Array(len);

  for (let i = 0; i < len; i++) {
    const pt = history[i];
    const { position, scale } = calculateTrailTransform(
      i,
      len,
      pt.x,
      pt.z,
      yOffset,
    );
    result[i] = {
      visible: showTrail,
      position,
      scale,
    };
  }

  return result;
}

/**
 * Çözülen iz dönüşümlerini Three.js Mesh dizisine güvenle uygular.
 */
export function applyTrailMeshTransforms(
  meshes: Array<THREE.Mesh | null | undefined>,
  transforms: TrailMeshTransform[],
): void {
  const count = Math.min(meshes.length, transforms.length);
  for (let i = 0; i < count; i++) {
    const mesh = meshes[i];
    if (mesh) {
      const t = transforms[i];
      mesh.visible = t.visible;
      mesh.position.set(t.position[0], t.position[1], t.position[2]);
      mesh.scale.set(t.scale[0], t.scale[1], t.scale[2]);
    }
  }
}

