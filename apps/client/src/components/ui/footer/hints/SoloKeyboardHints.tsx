'use client';

import React from 'react';
import { KeyboardHintItem } from './KeyboardHintItem';
import { getSoloKeyboardHintItems } from '@/utils/footerKeyboardHintUtils';

export function SoloKeyboardHints() {
  const items = getSoloKeyboardHintItems();

  return (
    <>
      {items.map((item, index) => (
        <React.Fragment key={item.key}>
          {index > 0 && (
            <span className="text-line" aria-hidden="true">
              ·
            </span>
          )}
          <KeyboardHintItem keyLabel={item.key} actionLabel={item.label} />
        </React.Fragment>
      ))}
    </>
  );
}

