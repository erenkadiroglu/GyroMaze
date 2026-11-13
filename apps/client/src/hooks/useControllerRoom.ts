'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { cleanRoomCode, validateRoomCode } from '@/utils/controllerUtils';

export interface UseControllerRoomOptions {
  isSocketConnected: boolean;
  isControllerPaired: boolean;
  joinRoomByCode: (code: string) => void;
  setErrorMessage: (msg: string | null) => void;
}

/**
 * Mobil kontrolcü oda kodu durumu, URL parametreleri ve oda bağlantı formu kancası.
 */
export function useControllerRoom({
  isSocketConnected,
  isControllerPaired,
  joinRoomByCode,
  setErrorMessage,
}: UseControllerRoomOptions) {
  const searchParams = useSearchParams();
  const initialRoomParam = cleanRoomCode(searchParams.get('room') ?? '');
  const initialSlotParam = searchParams.get('slot') === '2' ? 2 : 1;

  const [manualRoomInput, setManualRoomInput] = useState(initialRoomParam);
  const [activeRoomCode, setActiveRoomCode] = useState(initialRoomParam);
  const [playerSlot, setPlayerSlot] = useState<1 | 2>(initialSlotParam);
  const playerSlotRef = useRef<1 | 2>(initialSlotParam);
  playerSlotRef.current = playerSlot;
  const [isRoomEditorOpen, setIsRoomEditorOpen] = useState(!initialRoomParam);
  const [roomFormError, setRoomFormError] = useState<string | null>(null);

  useEffect(() => {
    setPlayerSlot(initialSlotParam);
    if (initialRoomParam) {
      setActiveRoomCode(initialRoomParam);
      setManualRoomInput(initialRoomParam);
      setIsRoomEditorOpen(false);
    }
  }, [initialRoomParam, initialSlotParam]);

  useEffect(() => {
    if (isControllerPaired) {
      setIsRoomEditorOpen(false);
    }
  }, [isControllerPaired]);

  const openRoomEditor = useCallback(() => {
    setManualRoomInput(activeRoomCode);
    setRoomFormError(null);
    setIsRoomEditorOpen(true);
  }, [activeRoomCode]);

  const closeRoomEditor = useCallback(() => {
    setRoomFormError(null);
    setIsRoomEditorOpen(false);
  }, []);

  const handleManualConnect = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const validation = validateRoomCode(manualRoomInput);
      if (!validation.valid) {
        setRoomFormError(validation.error);
        return;
      }
      const cleaned = validation.cleanCode;
      if (cleaned === activeRoomCode) {
        if (!isSocketConnected) {
          setRoomFormError(
            'Sunucu bağlantısı bekleniyor; bağlantı kurulunca tekrar deneyin.',
          );
          return;
        }
        setRoomFormError(null);
        setErrorMessage(null);
        joinRoomByCode(cleaned);
      } else {
        setRoomFormError(null);
        setErrorMessage(null);
        setActiveRoomCode(cleaned);
      }
      setIsRoomEditorOpen(false);
    },
    [
      manualRoomInput,
      activeRoomCode,
      isSocketConnected,
      setErrorMessage,
      joinRoomByCode,
    ],
  );

  return {
    activeRoomCode,
    manualRoomInput,
    setManualRoomInput,
    playerSlot,
    setPlayerSlot,
    playerSlotRef,
    isRoomEditorOpen,
    roomFormError,
    setRoomFormError,
    openRoomEditor,
    closeRoomEditor,
    handleManualConnect,
  };
}

