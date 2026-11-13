'use client';

import { useDesktopHomeView } from '@/hooks/useDesktopHomeView';
import { DesktopHUD } from '@/components/ui';
import { DesktopSceneLoader } from './DesktopSceneLoader';

/**
 * GyroMaze Masaüstü Ana Ekran Görünüm Bileşeni.
 * Yaşam döngüsü tercihlerini, Socket.io ev sahibi odasını ve klavye kontrollerini
 * useDesktopHomeView kancası üzerinden koordine ederek 3B sahne ile HUD katmanını sunar.
 */
export function DesktopHomeView() {
  const { containerProps } = useDesktopHomeView();

  return (
    <main {...containerProps}>
      <DesktopSceneLoader />
      <DesktopHUD />
    </main>
  );
}
