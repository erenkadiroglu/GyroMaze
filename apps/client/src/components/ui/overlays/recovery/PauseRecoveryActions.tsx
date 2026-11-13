'use client';

import { Smartphone, ArrowRight } from 'lucide-react';
import { Button } from '../../primitives';
import { getPauseRecoveryActionsConfig } from '@/utils/overlayBarUtils';

interface PauseRecoveryActionsProps {
  onPairClick: () => void;
  onResumeClick: () => void;
}

export function PauseRecoveryActions({
  onPairClick,
  onResumeClick,
}: PauseRecoveryActionsProps) {
  const { pairLabel, resumeLabel } = getPauseRecoveryActionsConfig();

  return (
    <div className="flex items-center gap-1.5">
      <Button
        variant="secondary"
        size="sm"
        icon={<Smartphone className="h-3.5 w-3.5" aria-hidden="true" />}
        onClick={onPairClick}
      >
        {pairLabel}
      </Button>
      <Button
        variant="primary"
        size="sm"
        icon={<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />}
        onClick={onResumeClick}
      >
        {resumeLabel}
      </Button>
    </div>
  );
}

