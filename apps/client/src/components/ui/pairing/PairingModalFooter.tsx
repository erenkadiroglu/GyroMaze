'use client';

import { Copy, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/primitives';
import {
  getPairingProceedLabel,
  resolveCopyIconState,
} from '@/utils/pairingModalViewUtils';

interface PairingModalFooterProps {
  copiedLink: boolean;
  copyLinkLabel: string;
  onCopyLink: () => void;
  onStartKeyboardMode: () => void;
}

export function PairingModalFooter({
  copiedLink,
  copyLinkLabel,
  onCopyLink,
  onStartKeyboardMode,
}: PairingModalFooterProps) {
  const proceedLabel = getPairingProceedLabel();
  const { iconName, iconClass } = resolveCopyIconState(copiedLink);

  return (
    <>
      <Button
        variant="secondary"
        icon={
          iconName === 'check' ? (
            <Check className={iconClass} aria-hidden="true" />
          ) : (
            <Copy className={iconClass} aria-hidden="true" />
          )
        }
        onClick={onCopyLink}
      >
        {copyLinkLabel}
      </Button>
      <Button
        variant="primary"
        icon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
        onClick={onStartKeyboardMode}
      >
        {proceedLabel}
      </Button>
    </>
  );
}

