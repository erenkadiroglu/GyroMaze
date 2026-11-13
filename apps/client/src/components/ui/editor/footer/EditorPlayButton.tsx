'use client';

import { Play } from 'lucide-react';
import { Button } from '../../primitives';

interface EditorPlayButtonProps {
  onPlayCustomLevel: () => void;
}

/**
 * Harita editörü birincil "Bu haritayı oyna" başlatma butonu
 */
export function EditorPlayButton({
  onPlayCustomLevel,
}: EditorPlayButtonProps) {
  return (
    <Button
      variant="primary"
      size="sm"
      icon={<Play className="h-3.5 w-3.5" aria-hidden="true" />}
      onClick={onPlayCustomLevel}
    >
      Bu haritayı oyna
    </Button>
  );
}
