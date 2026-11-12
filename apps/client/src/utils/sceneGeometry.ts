import type {
  WallDefinition,
  LaserGateDefinition,
  MazeLevelDefinition,
} from '../components/scene/mazeLevels.ts';

export interface LaserGeometry {
  p1: [number, number, number];
  p2: [number, number, number];
  beamSize: [number, number, number];
}

export interface OuterWallConfig {
  position: [number, number, number];
  size: [number, number, number];
}

/**
 * Lazer kapısı ekseni ('x' | 'z') ve uzunluğuna göre iki taşıyıcı sütunun
 * koordinatlarını ve lazer ışını kutu boyutlarını hesaplar.
 */
export function calculateLaserGateGeometry(gate: LaserGateDefinition): LaserGeometry {
  const [gx, gz] = gate.position;
  const halfLen = gate.length / 2;
  const p1: [number, number, number] =
    gate.axis === 'x'
      ? [gx - halfLen, 0.35, gz]
      : [gx, 0.35, gz - halfLen];
  const p2: [number, number, number] =
    gate.axis === 'x'
      ? [gx + halfLen, 0.35, gz]
      : [gx, 0.35, gz + halfLen];
  const beamSize: [number, number, number] =
    gate.axis === 'x'
      ? [gate.length, 0.14, 0.08]
      : [0.08, 0.14, gate.length];

  return { p1, p2, beamSize };
}

/**
 * Hızlandırma rampasının `[dx, dz]` yön vektörüne göre Three.js Euler Yaw (Y ekseni) açısını hesaplar.
 */
export function calculateBoostYaw(direction: [number, number]): number {
  const [dx, dz] = direction;
  return Math.atan2(dx, dz);
}

/**
 * Seçilen tahta boyutuna (`boardSize`) göre 4 çevreleyen dış sınır duvarının
 * konumlarını ve boyutlarını hesaplar.
 */
export function calculateOuterWallConfigs(
  boardSize: number,
  wallHeight = 0.85,
  wallThickness = 0.4,
): OuterWallConfig[] {
  const halfBoard = boardSize / 2;
  return [
    {
      position: [0, wallHeight / 2, -halfBoard],
      size: [boardSize + wallThickness, wallHeight, wallThickness],
    },
    {
      position: [0, wallHeight / 2, halfBoard],
      size: [boardSize + wallThickness, wallHeight, wallThickness],
    },
    {
      position: [-halfBoard, wallHeight / 2, 0],
      size: [wallThickness, wallHeight, boardSize],
    },
    {
      position: [halfBoard, wallHeight / 2, 0],
      size: [wallThickness, wallHeight, boardSize],
    },
  ];
}

/**
 * Seviyedeki toplam tehlike ve özel alan sayılarını özetler.
 */
export function summarizeLevelHazards(level: MazeLevelDefinition): {
  voidHolesCount: number;
  laserGatesCount: number;
  boostPadsCount: number;
  teleportersCount: number;
  movingObstaclesCount: number;
} {
  return {
    voidHolesCount: level.voidHoles.length,
    laserGatesCount: level.laserGates.length,
    boostPadsCount: level.boostPads?.length ?? 0,
    teleportersCount: (level.teleporters?.length ?? 0) * 2,
    movingObstaclesCount: level.movingObstacles?.length ?? 0,
  };
}

/**
 * Hedef portalının kristal toplama durumuna göre renk ve ışık konfigürasyonunu döner.
 */
export function resolveGoalPortalConfig(isGoalUnlocked: boolean): {
  ringEmissive: string;
  pointLightColor: string;
  pointLightIntensity: number;
} {
  return {
    ringEmissive: isGoalUnlocked ? '#10b981' : '#f59e0b',
    pointLightColor: isGoalUnlocked ? '#10b981' : '#f59e0b',
    pointLightIntensity: 3.0,
  };
}

