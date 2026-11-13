'use client';

import { ArrowRight } from 'lucide-react';

export function RoomConnectButton() {
  return (
    <button
      type="submit"
      className="flex min-h-[48px] w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-brass text-sm font-semibold text-brass-fg transition-all active:scale-[0.98]"
    >
      <span>Odaya bağlan</span>
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}

