import type {
  VoidHoleDefinition,
  BoostPadDefinition,
  TeleporterPairDefinition,
  LaserGateDefinition,
} from '../components/scene/mazeLevels.ts';
import {
  calculateLaserGateGeometry,
  calculateBoostYaw,
} from './sceneGeometry.ts';

export interface VoidHoleRadii {
  r: number;
  innerRing: number;
  outerRing: number;
}

export interface BoostPadTransform {
  position: [number, number, number];
  rotation: [number, number, number];
}

export interface LaserGatePillars {
  p1: [number, number, number];
  p2: [number, number, number];
  beamSize: [number, number, number];
  beamPosition: [number, number, number];
}

/**
 * Tuzak deliği için çekirdek ve halka yarıçaplarını hesaplar.
 */
export function resolveVoidHoleRadii(hole: VoidHoleDefinition): VoidHoleRadii {
  const r = typeof hole.radius === 'number' && hole.radius > 0 ? hole.radius : 0.42;
  return {
    r,
    innerRing: r * 0.82,
    outerRing: r * 1.08,
  };
}

/**
 * Hızlandırma rampası (boost pad) pozisyon ve yönlenme rotasyonunu hesaplar.
 */
export function resolveBoostPadTransform(pad: BoostPadDefinition): BoostPadTransform {
  const [bx, bz] = pad.position;
  const yawAngle = calculateBoostYaw(pad.direction);
  return {
    position: [bx, 0.02, bz],
    rotation: [0, yawAngle, 0],
  };
}

/**
 * Lazer kapısı sütun ve ışın geometrilerini hesaplar.
 */
export function resolveLaserGatePillars(gate: LaserGateDefinition): LaserGatePillars {
  const { p1, p2, beamSize } = calculateLaserGateGeometry(gate);
  const [gx, gz] = gate.position;
  return {
    p1,
    p2,
    beamSize,
    beamPosition: [gx, 0.35, gz],
  };
}

/**
 * Çift yönlü kuantum ışınlanma portallarının giriş ve çıkış koordinatlarını düzleştirir.
 */
export function flattenTeleporterPortals(
  teleporters: TeleporterPairDefinition[] = [],
  levelRevisionKey: string = '0',
): Array<{ key: string; position: [number, number, number] }> {
  const list: Array<{ key: string; position: [number, number, number] }> = [];
  teleporters.forEach((pair, pairIdx) => {
    [pair.entry, pair.exit].forEach(([tx, tz], subIdx) => {
      list.push({
        key: `teleporter-${levelRevisionKey}-${pairIdx}-${subIdx}`,
        position: [tx, 0.025, tz],
      });
    });
  });
  return list;
}

