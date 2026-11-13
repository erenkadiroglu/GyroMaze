'use client';

import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/primitives';
import { getDefeatActionsConfig } from '@/utils/defeatModalUtils';

interface DefeatModalFooterProps {
  onSwitchMode: () => void;
  onReset: () => void;
}

export function DefeatModalFooter({
  onSwitchMode,
  onReset,
}: DefeatModalFooterProps) {
  const { switchModeLabel, retryLabel } = getDefeatActionsConfig();

  return (
    <>
      <Button variant="secondary" onClick={onSwitchMode}>
        {switchModeLabel}
      </Button>
      <Button
        variant="primary"
        icon={<RotateCcw className="h-4 w-4" aria-hidden="true" />}
        onClick={onReset}
      >
        {retryLabel}
      </Button>
    </>
  );
}

