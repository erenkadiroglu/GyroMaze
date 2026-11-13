'use client';

import { Wrench, Medal, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/primitives';

export interface SettingsDrawerFooterProps {
  onOpenEditor: () => void;
  onOpenLeaderboard: () => void;
  onResetDefaults: () => void;
}

/**
 * Ayarlar çekmecesinin alt eylem çubuğu:
 * - Harita editörüne geçiş kısayolu
 * - Skor tablosuna geçiş kısayolu
 * - Varsayılan tercihleri geri yükleme düğmesi
 */
export function SettingsDrawerFooter({
  onOpenEditor,
  onOpenLeaderboard,
  onResetDefaults,
}: SettingsDrawerFooterProps) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="secondary"
          size="sm"
          icon={<Wrench className="h-3.5 w-3.5" aria-hidden="true" />}
          onClick={onOpenEditor}
        >
          Harita editörü
        </Button>
        <Button
          variant="secondary"
          size="sm"
          icon={<Medal className="h-3.5 w-3.5" aria-hidden="true" />}
          onClick={onOpenLeaderboard}
        >
          Skor tablosu
        </Button>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="w-full text-muted hover:text-fg"
        icon={<RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />}
        onClick={onResetDefaults}
      >
        Varsayılanlara dön
      </Button>
    </div>
  );
}

