'use client';

import { Suspense } from 'react';
import { MobileControllerView } from './MobileControllerView';
import {
  getControllerFallbackText,
  getControllerFallbackClass,
} from '@/utils/controllerViewUtils';

/**
 * Mobil jiroskop ve dokunmatik kontrolcü sayfası:
 * Next.js 15 App Router useSearchParams için Suspense sarmalayıcısı.
 */
export default function ControllerPage() {
  return (
    <Suspense
      fallback={
        <div className={getControllerFallbackClass()}>
          {getControllerFallbackText()}
        </div>
      }
    >
      <MobileControllerView />
    </Suspense>
  );
}
