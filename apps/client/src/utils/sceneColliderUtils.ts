/**
 * Rapier CuboidCollider için `[genişlik, yükseklik, derinlik]` tam boyutunu
 * yarı-boyut (half-extents: [w/2, h/2, d/2]) formatına dönüştürür.
 */
export function calculateCuboidHalfExtents(
  size: [number, number, number],
): [number, number, number] {
  return [size[0] / 2, size[1] / 2, size[2] / 2];
}

/**
 * Tuzak deliğinin fiziksel sensör yarıçapını hesaplar.
 * Bilyenin kenarı değil, ağırlık merkezi deliğin içine girdiğinde düşmesi için
 * görsel yarıçapın %68'i olarak ölçeklenir.
 */
export function calculateHoleSensorRadius(holeRadius?: number): number {
  return (holeRadius ?? 0.42) * 0.68;
}

/**
 * Sensöre temas eden Rapier RigidBody nesnesinin adına göre oyuncu yuvasını (1 veya 2) çözümler.
 */
export function resolveSensorSlot(rigidBodyObjectName?: string): 1 | 2 {
  return rigidBodyObjectName === 'ball-p2' ? 2 : 1;
}

/**
 * Tuzak deliğine düşme sensörünün tetiklenip tetiklenmeyeceğini denetler:
 * - Oyun 'playing' durumunda olmalı.
 * - Tarayıcı sekmesi gizli (hidden) olmamalı.
 * - Herhangi bir modal (Pairing, Settings, Editor, Leaderboard) açık olmamalı.
 * - Son düşme üzerinden en az cooldownMs (varsayılan 350ms) süre geçmiş olmalı.
 */
export function shouldTriggerHoleFall(
  gameStatus: string,
  isPageHidden: boolean,
  isAnyModalOpen: boolean,
  nowMs: number,
  lastHitMs: number,
  cooldownMs = 350,
): boolean {
  if (gameStatus !== 'playing') return false;
  if (isPageHidden) return false;
  if (isAnyModalOpen) return false;
  if (nowMs - lastHitMs < cooldownMs) return false;
  return true;
}

/**
 * Seçilen tabla tepkisellik katsayısına (tiltResponsiveness) ve kare delta süresine göre
 * `Quaternion.slerp` enterpolasyon katsayısını hesaplar.
 */
export function calculateSlerpAlpha(
  responsiveness: number,
  delta: number,
): number {
  const safeDelta = Math.max(0, Math.min(delta, 0.05));
  return 1 - Math.exp(-Math.max(0.1, responsiveness) * safeDelta);
}

/**
 * Oyunun üstünde tam ekran/katman açan herhangi bir modilin açık olup olmadığını denetler.
 */
export function isAnyOverlayModalOpen(state: {
  isPairingModalOpen?: boolean;
  isSettingsOpen?: boolean;
  isEditorOpen?: boolean;
  isLeaderboardOpen?: boolean;
}): boolean {
  return Boolean(
    state.isPairingModalOpen ||
    state.isSettingsOpen ||
    state.isEditorOpen ||
    state.isLeaderboardOpen,
  );
}

/**
 * Oyuncu yuvasına göre (1P veya 2P) hedef bilye gövdesini çözümler.
 */
export function resolveTargetBallBody<T>(slot: 1 | 2, ball1: T, ball2: T): T {
  return slot === 2 ? ball2 : ball1;
}

/**
 * Oyuncu yuvasına göre (1P veya 2P) ilgili bilyenin takip rota (runPath) geçmişini döner.
 */
export function resolveGoalRunPath(
  slot: 1 | 2,
  pathP1: Array<[number, number]>,
  pathP2: Array<[number, number]>,
): Array<[number, number]> {
  return slot === 2 ? pathP2 : pathP1;
}


