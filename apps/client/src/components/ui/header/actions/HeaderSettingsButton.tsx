'use client';

import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/primitives';

interface HeaderSettingsButtonProps {
  onOpenSettings: () => void;
}

/**
 * Masaüstü HUD üst çubuğu ayarlar çekmecesi açma butonu.
 */
export function HeaderSettingsButton({ onOpenSettings }: HeaderSettingsButtonProps) {
  return (
    <Button
      variant="secondary"
      size="sm"
      icon={<SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />}
      onClick={onOpenSettings}
    >
      Ayarlar
    </Button>
  );
}
