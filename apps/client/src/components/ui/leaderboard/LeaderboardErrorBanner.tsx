'use client';

import { AlertCircle } from 'lucide-react';
import { isErrorBannerVisible } from '@/utils/leaderboardModalViewUtils';

interface LeaderboardErrorBannerProps {
  message: string | null;
}

export function LeaderboardErrorBanner({ message }: LeaderboardErrorBannerProps) {
  if (!isErrorBannerVisible(message)) return null;

  return (
    <div
      role="alert"
      className="flex items-center gap-2 rounded-xl border border-warn/30 bg-warn/10 px-3 py-2 text-[11px] text-warn"
    >
      <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

