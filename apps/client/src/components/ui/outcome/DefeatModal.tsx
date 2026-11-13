'use client';

import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Modal, Button } from '@/components/ui/primitives';

export interface DefeatModalProps {
  open: boolean;
  timeAttackLimit: number;
  crystalSummary: string;
  onSwitchMode: () => void;
  onReset: () => void;
}

/**
 * Süreye Karşı (Time Attack) modunda süre dolduğunda açılan modal:
 * - Süre sınırı uyarısı ve kalan/toplanan kristal özeti
 * - Ayarlar penceresinden oyun modunu değiştirme kısayolu
 * - Hızlı tekrar başlama aksiyonu
 */
export function DefeatModal({
  open,
  timeAttackLimit,
  crystalSummary,
  onSwitchMode,
  onReset,
}: DefeatModalProps) {
  return (
    <Modal
      open={open}
      onClose={onReset}
      hideClose
      size="sm"
      title="Süre doldu"
      description={`${timeAttackLimit} saniyelik süre içinde portala ulaşılamadı.`}
      icon={<AlertTriangle className="h-5 w-5 text-danger" aria-hidden="true" />}
      footer={
        <>
          <Button variant="secondary" onClick={onSwitchMode}>
            Modu değiştir
          </Button>
          <Button
            variant="primary"
            icon={<RotateCcw className="h-4 w-4" aria-hidden="true" />}
            onClick={onReset}
          >
            Tekrar dene
          </Button>
        </>
      }
    >
      <p className="text-xs leading-relaxed text-muted">
        Toplanan kristal:{' '}
        <strong className="gm-num font-semibold text-fg">
          {crystalSummary}
        </strong>
        . Daha hızlı bir başlangıç için bilyeyi sıfırlayıp yeniden dene.
      </p>
    </Modal>
  );
}

