'use client';

import dynamic from 'next/dynamic';
import {
  getDesktopLoadingContainerClassName,
  getDesktopLoadingSpinnerClassName,
  getDesktopLoadingMessage,
} from '@/utils/desktopHomeViewUtils';

/**
 * WebGL ve Rapier WASM fizik motorunu yalnızca istemci ortamında (CSR) yükleyen dinamik bileşen.
 */
export const DesktopSceneLoader = dynamic(
  () => import('@/components/scene/MazeScene').then((mod) => mod.MazeScene),
  {
    ssr: false,
    loading: () => (
      <div
        className={getDesktopLoadingContainerClassName()}
        role="status"
        aria-live="polite"
      >
        <div
          className={getDesktopLoadingSpinnerClassName()}
          aria-hidden="true"
        />
        <span className="mt-4 text-sm font-medium">
          {getDesktopLoadingMessage()}
        </span>
      </div>
    ),
  },
);
