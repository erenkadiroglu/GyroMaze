import type {
  MazeLevelDefinition,
  WallDefinition,
  VoidHoleDefinition,
  LaserGateDefinition,
  BoostPadDefinition,
  TeleporterPairDefinition,
  MovingObstacleDefinition,
} from '../components/scene/mazeLevels';

export const CUSTOM_MAP_URL_PARAM = 'map';
export const MAX_ENCODED_MAP_LENGTH = 16_384;

function isVec2(value: unknown): value is [number, number] {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    value.every((n) => typeof n === 'number' && Number.isFinite(n))
  );
}

function isVec3(value: unknown): value is [number, number, number] {
  return (
    Array.isArray(value) &&
    value.length === 3 &&
    value.every((n) => typeof n === 'number' && Number.isFinite(n))
  );
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

/**
 * Editörden dışa aktarılan JSON veya yerel depolamadan okunan ham veriyi
 * sıkı şema doğrulamasından geçirerek güvenli bir `MazeLevelDefinition` (id: 99) döndürür.
 * Bozuk veya eksik veride `null` döner.
 */
export function parseCustomMazeLevel(raw: unknown): MazeLevelDefinition | null {
  if (!isPlainRecord(raw)) return null;
  if (
    !isVec3(raw.startPosition) ||
    !isVec3(raw.goalPosition) ||
    !Array.isArray(raw.innerWalls)
  ) {
    return null;
  }

  const boardSize =
    typeof raw.boardSize === 'number' && Number.isFinite(raw.boardSize)
      ? Math.max(8, Math.min(18, raw.boardSize))
      : 12;
  const maxCoord = Math.max(2, boardSize / 2 - 0.65);
  const clampCoord = (n: number): number =>
    Number(Math.max(-maxCoord, Math.min(maxCoord, n)).toFixed(2));
  const halfBoardLimit = Number((boardSize / 2).toFixed(2));
  const clampWallCoord = (n: number): number =>
    Number(Math.max(-halfBoardLimit, Math.min(halfBoardLimit, n)).toFixed(2));

  const innerWalls: WallDefinition[] = [];
  for (const w of raw.innerWalls) {
    if (
      !isPlainRecord(w) ||
      !isVec3(w.position) ||
      !isVec3(w.size) ||
      !w.size.every((dim) => dim > 0)
    ) {
      return null;
    }
    const wallW = Number(Math.max(0.1, Math.min(boardSize, w.size[0])).toFixed(2));
    const wallH = Number(Math.max(0.2, Math.min(2.5, w.size[1])).toFixed(2));
    const wallD = Number(Math.max(0.1, Math.min(boardSize, w.size[2])).toFixed(2));
    innerWalls.push({
      position: [
        clampWallCoord(w.position[0]),
        Number((wallH / 2).toFixed(3)),
        clampWallCoord(w.position[2]),
      ],
      size: [wallW, wallH, wallD],
    });
  }

  const safeStart: [number, number, number] = [
    clampCoord(raw.startPosition[0]),
    0.34,
    clampCoord(raw.startPosition[2]),
  ];
  const safeGoal: [number, number, number] = [
    clampCoord(raw.goalPosition[0]),
    0.35,
    clampCoord(raw.goalPosition[2]),
  ];

  const voidHoles: VoidHoleDefinition[] = [];
  if (Array.isArray(raw.voidHoles)) {
    for (const h of raw.voidHoles) {
      if (isPlainRecord(h) && isVec2(h.position)) {
        const radius =
          typeof h.radius === 'number' && Number.isFinite(h.radius) && h.radius > 0
            ? Number(Math.max(0.25, Math.min(0.75, h.radius)).toFixed(2))
            : undefined;
        const pos: [number, number] = [
          clampCoord(h.position[0]),
          clampCoord(h.position[1]),
        ];
        voidHoles.push(
          radius !== undefined
            ? { position: pos, radius }
            : { position: pos },
        );
      }
    }
  }

  const crystals: [number, number][] = Array.isArray(raw.crystals)
    ? raw.crystals
        .filter(isVec2)
        .map(([cx, cz]) => [clampCoord(cx), clampCoord(cz)])
    : [];

  const maxLaserLen = Math.max(1.2, boardSize - 0.8);
  const laserGates: LaserGateDefinition[] = [];
  if (Array.isArray(raw.laserGates)) {
    for (const g of raw.laserGates) {
      if (
        isPlainRecord(g) &&
        isVec2(g.position) &&
        typeof g.length === 'number' &&
        Number.isFinite(g.length) &&
        g.length > 0 &&
        (g.axis === 'x' || g.axis === 'z') &&
        typeof g.periodSeconds === 'number' &&
        Number.isFinite(g.periodSeconds) &&
        g.periodSeconds > 0 &&
        typeof g.phaseOffset === 'number' &&
        Number.isFinite(g.phaseOffset)
      ) {
        laserGates.push({
          position: [clampCoord(g.position[0]), clampCoord(g.position[1])],
          length: Number(Math.max(0.4, Math.min(maxLaserLen, g.length)).toFixed(2)),
          axis: g.axis,
          periodSeconds: Number(Math.max(0.4, Math.min(20, g.periodSeconds)).toFixed(2)),
          phaseOffset: Number(Math.max(-20, Math.min(20, g.phaseOffset)).toFixed(2)),
        });
      }
    }
  }

  const boostPads: BoostPadDefinition[] = [];
  if (Array.isArray(raw.boostPads)) {
    for (const b of raw.boostPads) {
      if (isPlainRecord(b) && isVec2(b.position) && isVec2(b.direction)) {
        const mag = Math.hypot(b.direction[0], b.direction[1]);
        if (mag > 0.001) {
          boostPads.push({
            position: [clampCoord(b.position[0]), clampCoord(b.position[1])],
            direction: [
              Number((b.direction[0] / mag).toFixed(3)),
              Number((b.direction[1] / mag).toFixed(3)),
            ],
          });
        }
      }
    }
  }

  const teleporters: TeleporterPairDefinition[] = [];
  if (Array.isArray(raw.teleporters)) {
    for (const t of raw.teleporters) {
      if (isPlainRecord(t) && isVec2(t.entry) && isVec2(t.exit)) {
        const entry: [number, number] = [
          clampCoord(t.entry[0]),
          clampCoord(t.entry[1]),
        ];
        const exit: [number, number] = [
          clampCoord(t.exit[0]),
          clampCoord(t.exit[1]),
        ];
        if (Math.hypot(entry[0] - exit[0], entry[1] - exit[1]) >= 0.75) {
          teleporters.push({ entry, exit });
        }
      }
    }
  }

  const maxMovingAmp = Math.max(0.4, boardSize / 2 - 0.8);
  const movingObstacles: MovingObstacleDefinition[] = [];
  if (Array.isArray(raw.movingObstacles)) {
    for (const m of raw.movingObstacles) {
      if (
        isPlainRecord(m) &&
        isVec2(m.center) &&
        (m.axis === 'x' || m.axis === 'z') &&
        typeof m.amplitude === 'number' &&
        Number.isFinite(m.amplitude) &&
        typeof m.speed === 'number' &&
        Number.isFinite(m.speed) &&
        typeof m.phaseOffset === 'number' &&
        Number.isFinite(m.phaseOffset)
      ) {
        movingObstacles.push({
          center: [clampCoord(m.center[0]), clampCoord(m.center[1])],
          axis: m.axis,
          amplitude: Number(Math.max(0, Math.min(maxMovingAmp, m.amplitude)).toFixed(2)),
          speed: Number(Math.max(0.1, Math.min(10, m.speed)).toFixed(2)),
          phaseOffset: Number(Math.max(-20, Math.min(20, m.phaseOffset)).toFixed(2)),
        });
      }
    }
  }

  const title =
    typeof raw.title === 'string' && raw.title.trim()
      ? raw.title.trim().slice(0, 48)
      : 'Özel İçe Aktarılan Harita';
  const subtitle =
    typeof raw.subtitle === 'string' && raw.subtitle.trim()
      ? raw.subtitle.trim().slice(0, 80)
      : 'Özel Editör Haritası';

  return {
    id: 99,
    title,
    subtitle,
    boardSize,
    startPosition: safeStart,
    goalPosition: safeGoal,
    innerWalls,
    voidHoles,
    crystals,
    laserGates,
    boostPads,
    teleporters,
    movingObstacles,
    starThresholds:
      isVec2(raw.starThresholds) &&
      raw.starThresholds[0] > 0 &&
      raw.starThresholds[1] > raw.starThresholds[0]
        ? raw.starThresholds
        : undefined,
  };
}

/**
 * Özel bir labirent tanımını UTF-8 Base64url dizesine kodlar.
 */
export function encodeCustomMazeLevelForUrl(level: MazeLevelDefinition): string {
  const json = JSON.stringify(level);
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

/**
 * URL `?map=` parametresinden gelen Base64url dizesini çözer ve doğrular.
 * Geçersiz veya bozuk veride `null` döndürür.
 */
export function decodeCustomMazeLevelFromUrl(
  encoded: string,
): MazeLevelDefinition | null {
  const trimmed = encoded.trim();
  if (
    !trimmed ||
    trimmed.length > MAX_ENCODED_MAP_LENGTH ||
    !/^[A-Za-z0-9_-]+$/.test(trimmed)
  ) {
    return null;
  }

  try {
    const base64 = trimmed.replace(/-/g, '+').replace(/_/g, '/');
    const padLen = (4 - (base64.length % 4)) % 4;
    const binary = atob(`${base64}${'='.repeat(padLen)}`);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    const parsed: unknown = JSON.parse(json);
    return parseCustomMazeLevel(parsed);
  } catch {
    return null;
  }
}

