'use client';

import { Button } from '../primitives';
import { getHelpModalDismissLabel } from '@/utils/helpModalUtils';

interface HelpModalFooterProps {
  onDismiss: () => void;
}

export function HelpModalFooter({ onDismiss }: HelpModalFooterProps) {
  const dismissLabel = getHelpModalDismissLabel();

  return (
    <div className="flex w-full items-center justify-between">
      <span className="text-xs text-muted">
        İpucu: Oyun esnasında <kbd className="font-mono text-fg">H</kbd> veya{' '}
        <kbd className="font-mono text-fg">?</kbd> tuşuna basarak bu pencereyi açabilirsiniz.
      </span>
      <Button variant="primary" size="sm" onClick={onDismiss}>
        {dismissLabel}
      </Button>
    </div>
  );
}

