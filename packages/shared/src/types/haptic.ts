/**
 * Mobil cihazda tetiklenecek titreşim (Haptic Feedback) tipi.
 */
export type HapticType =
  | 'wall'
  | 'hole'
  | 'goal'
  | 'calibrate'
  | 'crystal'
  | 'laser'
  | 'boost'
  | 'teleport';

/**
 * Mobil cihazda dokunsal titreşim tetiklemek için gönderilen veri yükü.
 */
export interface HapticPayload {
  roomId: string;
  type: HapticType;
  /** Yalnızca belirli bir oyuncunun cihazına gönderilecekse yuva numarası */
  playerSlot?: 1 | 2;
}
