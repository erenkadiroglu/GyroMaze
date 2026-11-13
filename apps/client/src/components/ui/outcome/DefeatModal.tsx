'use client';

import { AlertTriangle } from 'lucide-react';
import { Modal } from '@/components/ui/primitives';
import {
  getDefeatModalTitle,
  formatDefeatModalDescription,
} from '@/utils/defeatModalUtils';
import { DefeatModalBody, DefeatModalFooter } from './defeat';

export interface DefeatModalProps {
  open: boolean;
  timeAttackLimit: number;
  crystalSummary: string;
  onSwitchMode: () => void;
  onReset: () => void;
}

/**
 * Süreye Karşı (Time Attack) modunda süre dolduğunda açılan modal:
 * - Süre sınırı uyarısı ve kalan/toplanan kristal özeti (DefeatModalBody)
 * - Ayarlar penceresinden oyun modunu değiştirme ve hızlı tekrar başlama aksiyonları (DefeatModalFooter)
 */
export function DefeatModal({
  open,
  timeAttackLimit,
  crystalSummary,
  onSwitchMode,
  onReset,
}: DefeatModalProps) {
  const title = getDefeatModalTitle();
  const description = formatDefeatModalDescription(timeAttackLimit);

  return (
    <Modal
      open={open}
      onClose={onReset}
      hideClose
      size="sm"
      title={title}
      description={description}
      icon={<AlertTriangle className="h-5 w-5 text-danger" aria-hidden="true" />}
      footer={
        <DefeatModalFooter
          onSwitchMode={onSwitchMode}
          onReset={onReset}
        />
      }
    >
      <DefeatModalBody crystalSummary={crystalSummary} />
    </Modal>
  );
}
