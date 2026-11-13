'use client';

import { Copy, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/primitives';

export interface PairingQRCodeCardProps {
  controllerUrl: string;
  routeLabel: string;
  displayRoomCode: string;
  copiedRoomCode: boolean;
  copyRoomCodeLabel: string;
  onCopyRoomCode: () => void;
}

/**
 * Mobil kontrolcü eşleşmesi için dinamik QR kod görseli, aktif ağ rotası
 * bilgisi ve 6 haneli oda kodu panoya kopyalama kartı.
 */
export function PairingQRCodeCard({
  controllerUrl,
  routeLabel,
  displayRoomCode,
  copiedRoomCode,
  copyRoomCodeLabel,
  onCopyRoomCode,
}: PairingQRCodeCardProps) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-line bg-surface-2/60 p-5">
      <div className="rounded-2xl bg-white p-3 shadow-sm">
        <QRCodeSVG
          value={controllerUrl}
          size={164}
          bgColor="#ffffff"
          fgColor="#0f1a2b"
          level="M"
        />
      </div>

      <p className="mt-3 text-center text-[11px] font-medium text-muted">
        {routeLabel}
      </p>

      <div className="mt-3 flex w-full items-center justify-between rounded-xl border border-line bg-surface px-4 py-2.5">
        <div>
          <span className="block text-xs text-muted">Oda kodu</span>
          <span className="gm-num text-xl font-semibold tracking-[0.2em] text-brass">
            {displayRoomCode}
          </span>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={
            copiedRoomCode ? (
              <Check className="h-3.5 w-3.5 text-ok" aria-hidden="true" />
            ) : (
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            )
          }
          onClick={onCopyRoomCode}
        >
          {copyRoomCodeLabel}
        </Button>
      </div>
    </div>
  );
}

