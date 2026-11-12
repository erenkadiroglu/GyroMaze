'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Smartphone,
  Copy,
  Check,
  ArrowRight,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useGameStore } from '@/store/useGameStore';
import { soundEngine } from '@/utils/soundEngine';
import {
  resolveControllerBaseUrl,
  buildControllerUrl,
} from '@/utils/pairingUtils';
import {
  Modal,
  Button,
  cx,
  handleRadioGroupKeyDown,
} from '@/components/ui/primitives';

/**
 * Mobil kontrolcü eşleştirme penceresi:
 * QR kod, tünel / LAN rota algılama, 6 haneli oda kodu kopyalama ve
 * çok oyunculu yuva seçimi içerir.
 */
export function PairingModal() {
  const isPairingModalOpen = useGameStore((s) => s.isPairingModalOpen);
  const setPairingModalOpen = useGameStore((s) => s.setPairingModalOpen);
  const setGameStatus = useGameStore((s) => s.setGameStatus);
  const roomId = useGameStore((s) => s.roomId);
  const lanIp = useGameStore((s) => s.lanIp);
  const tunnelUrl = useGameStore((s) => s.tunnelUrl);
  const isMultiplayer = useGameStore((s) => s.isMultiplayer);
  const isControllerPaired = useGameStore((s) => s.isControllerPaired);
  const isSecondControllerPaired = useGameStore(
    (s) => s.isSecondControllerPaired,
  );
  const isSoundMuted = useGameStore((s) => s.isSoundMuted);

  const [pairingSlot, setPairingSlot] = useState<1 | 2>(1);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedRoomCode, setCopiedRoomCode] = useState(false);
  const [browserLocation, setBrowserLocation] = useState({
    origin: 'http://localhost:3000',
    hostname: 'localhost',
    port: '3000',
  });

  const copiedLinkTimerRef = useRef<number | null>(null);
  const copiedRoomCodeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBrowserLocation({
        origin: window.location.origin,
        hostname: window.location.hostname,
        port: window.location.port,
      });
    }
  }, []);

  useEffect(() => {
    return () => {
      if (copiedLinkTimerRef.current !== null) {
        window.clearTimeout(copiedLinkTimerRef.current);
      }
      if (copiedRoomCodeTimerRef.current !== null) {
        window.clearTimeout(copiedRoomCodeTimerRef.current);
      }
    };
  }, []);

  const { activeBaseUrl, routeLabel } = resolveControllerBaseUrl({
    tunnelUrl,
    lanIp,
    location: browserLocation,
  });

  const controllerUrl = buildControllerUrl(activeBaseUrl, roomId, pairingSlot);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(controllerUrl);
      setCopiedLink(true);
      if (copiedLinkTimerRef.current !== null) {
        window.clearTimeout(copiedLinkTimerRef.current);
      }
      copiedLinkTimerRef.current = window.setTimeout(() => {
        setCopiedLink(false);
        copiedLinkTimerRef.current = null;
      }, 2000);
    } catch {
      // Pano izni yoksa sessizce geç
    }
  };

  const handleCopyRoomCode = async () => {
    if (!roomId) return;
    try {
      await navigator.clipboard.writeText(roomId);
      setCopiedRoomCode(true);
      if (copiedRoomCodeTimerRef.current !== null) {
        window.clearTimeout(copiedRoomCodeTimerRef.current);
      }
      copiedRoomCodeTimerRef.current = window.setTimeout(() => {
        setCopiedRoomCode(false);
        copiedRoomCodeTimerRef.current = null;
      }, 2000);
    } catch {
      // Pano izni yoksa sessizce geç
    }
  };

  const handleClose = () => {
    setPairingModalOpen(false);
    const currentStatus = useGameStore.getState().gameStatus;
    if (currentStatus === 'waiting' || currentStatus === 'paused') {
      setGameStatus('playing');
    }
  };

  const handleStartKeyboardMode = () => {
    if (!isSoundMuted) soundEngine.playCalibrate();
    handleClose();
  };

  return (
    <Modal
      open={isPairingModalOpen}
      onClose={handleClose}
      size="md"
      title="Telefonunu bağla"
      description="QR kodu okut veya 6 haneli oda kodunu kontrolcüye gir."
      icon={<Smartphone className="h-4 w-4" aria-hidden="true" />}
      footer={
        <>
          <Button
            variant="secondary"
            icon={
              copiedLink ? (
                <Check className="h-4 w-4 text-ok" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )
            }
            onClick={handleCopyLink}
          >
            {copiedLink ? 'Bağlantı kopyalandı' : 'Bağlantıyı kopyala'}
          </Button>
          <Button
            variant="primary"
            icon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
            onClick={handleStartKeyboardMode}
          >
            Sahneye geç
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {isMultiplayer && (
          <div
            role="radiogroup"
            aria-label="Eşleştirilecek oyuncu"
            className="grid grid-cols-2 gap-1 rounded-xl border border-line bg-surface-2 p-1"
          >
            {([1, 2] as const).map((slot, idx) => {
              const active = pairingSlot === slot;
              const paired =
                slot === 1 ? isControllerPaired : isSecondControllerPaired;
              return (
                <button
                  key={slot}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  tabIndex={active ? 0 : -1}
                  onClick={() => setPairingSlot(slot)}
                  onKeyDown={(e) =>
                    handleRadioGroupKeyDown(e, idx, 2, (nextIdx) =>
                      setPairingSlot(nextIdx === 0 ? 1 : 2),
                    )
                  }
                  className={cx(
                    'h-9 cursor-pointer rounded-lg text-xs font-semibold transition-colors',
                    active ? 'bg-surface text-fg shadow-sm' : 'text-muted',
                  )}
                >
                  {slot}. Oyuncu QR ({paired ? 'Bağlı' : 'Bekliyor'})
                </button>
              );
            })}
          </div>
        )}

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
                {roomId ?? '......'}
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
              onClick={handleCopyRoomCode}
            >
              {copiedRoomCode ? 'Kopyalandı' : 'Kodu kopyala'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

