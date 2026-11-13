'use client';

import { Smartphone, Copy, Check, ArrowRight } from 'lucide-react';
import { Modal, Button } from '@/components/ui/primitives';
import { usePairingModal } from '@/hooks/usePairingModal';
import { PairingSlotSelector } from './pairing/PairingSlotSelector';
import { PairingQRCodeCard } from './pairing/PairingQRCodeCard';

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
            {copyLinkLabel}
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
