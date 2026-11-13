import type { MazeLevelDefinition } from './types.ts';
import { MAZE_LEVELS } from './staticLevels.ts';
import { generateProceduralLevel } from './proceduralGenerator.ts';

/**
 * İstenen bölüm numarasına göre (1..5 el yapımı, 6..∞ prosedürel, 99 özel editör)
 * labirent tanımını döndürür.
 */
export function getMazeLevel(
  levelId: number,
  customLevel?: MazeLevelDefinition | null,
): MazeLevelDefinition {
  if (levelId === 99 && customLevel) {
    return customLevel;
  }
  const safeId = Number.isFinite(levelId)
    ? Math.max(1, Math.floor(levelId))
    : 1;
  if (safeId <= MAZE_LEVELS.length) {
    return MAZE_LEVELS[safeId - 1];
  }
  return generateProceduralLevel(safeId);
}

/**
 * 2. oyuncu bilyesinin tahta sınırları, iç duvarlar ve tuzak delikleriyle
 * çakışmayan en güvenli başlangıç sapmasını [offsetX, offsetZ] hesaplar.
 */
export function findSafeP2SpawnOffset(
  levelData: MazeLevelDefinition,
  ballRadius = 0.34,
): [number, number] {
  const [sx, , sz] = levelData.startPosition;
  const halfBoard = levelData.boardSize / 2;
  const minMargin = ballRadius + 0.04;
  const minMarginSq = minMargin * minMargin;
  const perimeterLimit = halfBoard - (ballRadius + 0.22);

  const candidates: Array<[number, number]> = [
    [0.72, 0],
    [-0.72, 0],
    [0, 0.72],
    [0, -0.72],
    [0.46, 0],
    [-0.46, 0],
    [0, 0.46],
    [0, -0.46],
  ];

  for (const [ox, oz] of candidates) {
    const px = sx + ox;
    const pz = sz + oz;
    if (Math.abs(px) > perimeterLimit || Math.abs(pz) > perimeterLimit) {
      continue;
    }

    let blocked = false;
    for (const wall of levelData.innerWalls) {
      const [wx, , wz] = wall.position;
      const halfW = wall.size[0] / 2;
      const halfD = wall.size[2] / 2;
      const dx = Math.max(Math.abs(px - wx) - halfW, 0);
      const dz = Math.max(Math.abs(pz - wz) - halfD, 0);
      if (dx * dx + dz * dz < minMarginSq) {
        blocked = true;
        break;
      }
    }
    if (blocked) continue;

    for (const hole of levelData.voidHoles) {
      const safeRadius = (hole.radius ?? 0.42) + minMargin;
      const dx = px - hole.position[0];
      const dz = pz - hole.position[1];
      if (dx * dx + dz * dz < safeRadius * safeRadius) {
        blocked = true;
        break;
      }
    }
    if (!blocked) {
      return [ox, oz];
    }
  }

  return [0, 0];
}

/**
 * Standart/prosedürel bölümlerde kimliği, özel editör haritalarında (`id === 99`)
 * ise geometriyi tanımlayan benzersiz anahtar üretir.
 */
export function getLevelRevisionKey(levelData: MazeLevelDefinition): string {
  if (levelData.id !== 99) {
    return String(levelData.id);
  }
  const wallsSig = levelData.innerWalls
    .map((w) => `${w.position[0]},${w.position[2]},${w.size[0]}x${w.size[2]}`)
    .join(';');
  const holesSig = levelData.voidHoles
    .map((h) => `${h.position[0]},${h.position[1]},${h.radius ?? 0.42}`)
    .join(';');
  const crystalsSig = levelData.crystals
    .map(([cx, cz]) => `${cx},${cz}`)
    .join(';');
  const lasersSig = levelData.laserGates
    .map(
      (g) =>
        `${g.position[0]},${g.position[1]},${g.axis},${g.length},${g.periodSeconds},${g.phaseOffset}`,
    )
    .join(';');
  const boostsSig = (levelData.boostPads ?? [])
    .map(
      (b) =>
        `${b.position[0]},${b.position[1]},${b.direction[0]},${b.direction[1]}`,
    )
    .join(';');
  const teleportersSig = (levelData.teleporters ?? [])
    .map((t) => `${t.entry[0]},${t.entry[1]}->${t.exit[0]},${t.exit[1]}`)
    .join(';');
  const movingSig = (levelData.movingObstacles ?? [])
    .map(
      (m) =>
        `${m.center[0]},${m.center[1]},${m.axis},${m.amplitude},${m.speed},${m.phaseOffset}`,
    )
    .join(';');
  return `99-${levelData.boardSize}-${levelData.startPosition.join(',')}-${levelData.goalPosition.join(',')}-${wallsSig}|${holesSig}|${crystalsSig}|${lasersSig}|${boostsSig}|${teleportersSig}|${movingSig}`;
}
