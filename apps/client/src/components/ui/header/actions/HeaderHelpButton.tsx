'use client';

import { HelpCircle } from 'lucide-react';
import { IconButton } from '@/components/ui/primitives';

interface HeaderHelpButtonProps {
  onToggleHelp: () => void;
}

/**
 * Masaüstü HUD üst çubuğu klavye kısayolları ve yardım rehberi butonu (H kısayolu).
 */
export function HeaderHelpButton({ onToggleHelp }: HeaderHelpButtonProps) {
  return (
    <IconButton
      label="Klavye kısayolları ve yardım rehberi"
      shortcut="H"
      onClick={onToggleHelp}
    >
      <HelpCircle className="h-4 w-4 text-brass" aria-hidden="true" />
    </IconButton>
  );
}
