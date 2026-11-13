'use client';

import dynamic from 'next/dynamic';
import { DesktopSceneLoadingFallback } from './DesktopSceneLoadingFallback';

/**
 * WebGL ve Rapier WASM fizik motorunu yalnızca istemci ortamında (CSR) yükleyen dinamik bileşen.
 * Yükleme esnasında DesktopSceneLoadingFallback saf orkestrasyon bileşenini sunar.
 */
export const DesktopSceneLoader = dynamic(
  () => import('@/components/scene/MazeScene').then((mod) => mod.MazeScene),
  {
    ssr: false,
    loading: () => <DesktopSceneLoadingFallback />,
  },
);
