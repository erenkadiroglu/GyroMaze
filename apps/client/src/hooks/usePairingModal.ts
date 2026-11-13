'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { soundEngine } from '@/utils/soundEngine';
import {
  resolveControllerBaseUrl,
  buildControllerUrl,
  formatRoomCodeDisplay,
  resolveCopyButtonLabel,
} from '@/utils/pairingUtils';

/**
 * Mobil kontrolcü eşleştirme penceresi (PairingModal) yaşam döngüsü,
 * pano kopyalama zamanlayıcıları, tarayıcı adresi algılama ve yuva kancası.
 */
export function usePairingModal() {
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
  const displayRoomCode = formatRoomCodeDisplay(roomId);

  const handleCopyLink = useCallback(async () => {
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
      // Pano izni engellenmişse sessizce geç
    }
  }, [controllerUrl]);

  const handleCopyRoomCode = useCallback(async () => {
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
      // Pano izni engellenmişse sessizce geç
    }
  }, [roomId]);

  const handleClose = useCallback(() => {
    setPairingModalOpen(false);
    const currentStatus = useGameStore.getState().gameStatus;
    if (currentStatus === 'waiting' || currentStatus === 'paused') {
      setGameStatus('playing');
    }
  }, [setPairingModalOpen, setGameStatus]);

  const handleStartKeyboardMode = useCallback(() => {
    if (!isSoundMuted) soundEngine.playCalibrate();
    handleClose();
  }, [isSoundMuted, handleClose]);

  const copyLinkLabel = resolveCopyButtonLabel(
    copiedLink,
    'Bağlantıyı kopyala',
    'Bağlantı kopyalandı',
  );

  const copyRoomCodeLabel = resolveCopyButtonLabel(
    copiedRoomCode,
    'Kodu kopyala',
    'Kopyalandı',
  );

  return {
    isPairingModalOpen,
    isMultiplayer,
    pairingSlot,
    setPairingSlot,
    isControllerPaired,
    isSecondControllerPaired,
    controllerUrl,
    routeLabel,
    displayRoomCode,
    copiedLink,
    copiedRoomCode,
    copyLinkLabel,
    copyRoomCodeLabel,
    handleCopyLink,
    handleCopyRoomCode,
    handleClose,
    handleStartKeyboardMode,
  };
}

