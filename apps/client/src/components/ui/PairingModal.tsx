'use client';

import { Smartphone } from 'lucide-react';
import { Modal } from '@/components/ui/primitives';
import { usePairingModal } from '@/hooks/usePairingModal';
import {
  getPairingModalTitle,
  getPairingModalDescription,
} from '@/utils/pairingModalViewUtils';
import {
  PairingSlotSelector,
  PairingQRCodeCard,
  PairingModalFooter,
} from './pairing';

/**
 * Mobil kontrolcü eşleştirme penceresi:
 * QR kod, tünel / LAN rota algılama, 6 haneli oda kodu kopyalama ve
 * çok oyunculu yuva seçimini koordine eden orkestratör bileşen.
 */
export function PairingModal() {
  const {
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
  } = usePairingModal();

  const title = getPairingModalTitle();
  const description = getPairingModalDescription();

  return (
    <Modal
      open={isPairingModalOpen}
      onClose={handleClose}
      size="md"
      title={title}
      description={description}
      icon={<Smartphone className="h-4 w-4" aria-hidden="true" />}
      footer={
        <PairingModalFooter
          copiedLink={copiedLink}
          copyLinkLabel={copyLinkLabel}
          onCopyLink={handleCopyLink}
          onStartKeyboardMode={handleStartKeyboardMode}
        />
      }
    >
      <div className="space-y-4">
        {/* Çok Oyunculu Yuva Seçimi */}
        {isMultiplayer && (
          <PairingSlotSelector
            pairingSlot={pairingSlot}
            onSelectSlot={setPairingSlot}
            isControllerPaired={isControllerPaired}
            isSecondControllerPaired={isSecondControllerPaired}
          />
        )}

        {/* QR Kod ve Oda Kodu Kartı */}
        <PairingQRCodeCard
          controllerUrl={controllerUrl}
          routeLabel={routeLabel}
          displayRoomCode={displayRoomCode}
          copiedRoomCode={copiedRoomCode}
          copyRoomCodeLabel={copyRoomCodeLabel}
          onCopyRoomCode={handleCopyRoomCode}
        />
      </div>
    </Modal>
  );
}
