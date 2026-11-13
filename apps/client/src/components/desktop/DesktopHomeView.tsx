'use client';

import { useAppPreferences } from '@/hooks/useAppPreferences';
import { useSocket } from '@/hooks/useSocket';
import { useKeyboardFallback } from '@/hooks/useKeyboardFallback';
import { useGameStore } from '@/store/useGameStore';
import { DesktopHUD } from '@/components/ui';
import {
  getDesktopHomeMainClassName,
  getDesktopSocketRoleConfig,
  formatDesktopStageAriaLabel,
} from '@/utils/desktopHomeViewUtils';
import { DesktopSceneLoader } from './DesktopSceneLoader';

/**
 * GyroMaze Masaüstü Ana Ekran Görünüm Bileşeni.
 * Kalıcı tercihleri yükler, ev sahibi (host) Socket.io odasını başlatır,
 * klavye yedek kontrollerini dinler ve 3B sahne ile HUD katmanını semantik olarak sunar.
 */
export function DesktopHomeView() {
  useAppPreferences();
  useSocket(getDesktopSocketRoleConfig());
  useKeyboardFallback();

  const level = useGameStore((s) => s.level);
  const mainClass = getDesktopHomeMainClassName();
  const ariaLabel = formatDesktopStageAriaLabel(level);

  return (
    <main
      className={mainClass}
      role="main"
      aria-label={ariaLabel}
    >
      <DesktopSceneLoader />
      <DesktopHUD />
    </main>
  );
}
