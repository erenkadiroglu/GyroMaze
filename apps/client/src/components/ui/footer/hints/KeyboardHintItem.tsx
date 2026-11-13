'use client';

import { Kbd } from '../../primitives';

interface KeyboardHintItemProps {
  keyLabel: string;
  actionLabel: string;
}

export function KeyboardHintItem({
  keyLabel,
  actionLabel,
}: KeyboardHintItemProps) {
  return (
    <>
      <Kbd>{keyLabel}</Kbd>
      <span>{actionLabel}</span>
    </>
  );
}

