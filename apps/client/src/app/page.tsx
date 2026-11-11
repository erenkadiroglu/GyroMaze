'use client';

import dynamic from 'next/dynamic';
import { DesktopHUD } from '@/components/ui/DesktopHUD';
import { useSocket } from '@/hooks/useSocket';
import { useKeyboardFallback } from '@/hooks/useKeyboardFallback';
import { useAppPreferences } from '@/hooks/useAppPreferences';

/**
 * WebGL ve Rapier WASM fizik motorunu yalnızca tarayıcı ortamında (CSR) yükler.
 */
const MazeScene = dynamic(
  () => import('@/components/scene/MazeScene').then((mod) => mod.MazeScene),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-base text-muted">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-brass" />
        <span className="mt-4 text-sm font-medium">
          3B fizik sahnesi hazırlanıyor...
        </span>
      </div>
    ),
  },
);

/**
 * GyroMaze Masaüstü Ana Ekranı.
 * Kalıcı tercihleri yükler, Socket.io odasını başlatır ve 3B sahne ile HUD katmanını birleştirir.
 */
export default function HomePage() {
  useAppPreferences();
  useSocket({ role: 'host' });
  useKeyboardFallback();

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-base text-fg">
      <MazeScene />
      <DesktopHUD />
    </main>
  );
}
