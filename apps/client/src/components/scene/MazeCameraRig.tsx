'use client';

import { useMazeCameraRig } from '@/hooks/useMazeCameraRig';

/**
 * 3B Sahne Bağımsız Dinamik Kamera Teçhizatı (Rig).
 * Canvas seviyesinde bağımsız çalışır.
 * Seçili kamera moduna (izometrik, takip, kuş bakışı) göre kamera konumunu pürüzsüzce takip ettirir,
 * bilye hızına duyarlı dinamik FOV uygular ve kare hızından bağımsız sönümleme sağlar.
 */
export function MazeCameraRig() {
  useMazeCameraRig();
  return null;
}
