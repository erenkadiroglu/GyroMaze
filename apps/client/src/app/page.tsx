'use client';

import dynamic from 'next/dynamic';
import { DesktopHUD } from '@/components/ui/DesktopHUD';
import { useSocket } from '@/hooks/useSocket';
import { useKeyboardFallback } from '@/hooks/useKeyboardFallback';

/**
 * WebGL ve Rapier WASM fizik motorunu yalnızca tarayıcı ortamında (CSR) yükler.
 */
const MazeScene = dynamic(
  () => import('@/components/scene/MazeScene').then((mod) => mod.MazeScene),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-zinc-950 text-zinc-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-800 border-t-emerald-400" />
        <span className="mt-4 text-xs tracking-wider uppercase">
          3B Fizik ve WebGL Sahnesi Hazırlanıyor...
        </span>
      </div>
    ),
  },
);

/**
 * GyroMaze Masaüstü Ana Ekranı.
 * Gerçek zamanlı Socket.io odasını başlatır, 3B Rapier sahnesini ve HUD katmanını birleştirir.
 */
export default function HomePage() {
  useSocket({ role: 'host' });
  useKeyboardFallback();

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-zinc-950">
      <MazeScene />
      <DesktopHUD />
    </main>
  );
}
