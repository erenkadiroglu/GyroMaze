'use client';

import { cx } from '@/components/ui/primitives';
import { LevelSelectPopover } from '@/components/ui/LevelSelectPopover';

export interface HeaderBrandCapsuleProps {
  dotColor: string;
}

/**
 * Masaüstü HUD sol üst kapsülü:
 * - Ağ ve kontrolcü canlı bağlantı durum rengi noktası
 * - GyroMaze marka adı
 * - Modüler bölüm seçici popover açılır menüsü
 */
export function HeaderBrandCapsule({ dotColor }: HeaderBrandCapsuleProps) {
  return (
    <div className="gm-panel pointer-events-auto relative flex items-center gap-2.5 rounded-2xl px-3.5 py-2 shadow-lg">
      <div className="flex items-center gap-2 pr-1">
        <span
          className={cx('h-2.5 w-2.5 rounded-full', dotColor)}
          aria-hidden="true"
        />
        <span className="text-base font-semibold tracking-tight text-fg">
          GyroMaze
        </span>
      </div>

      <span className="h-4 w-px bg-line" aria-hidden="true" />

      <LevelSelectPopover />
    </div>
  );
}

