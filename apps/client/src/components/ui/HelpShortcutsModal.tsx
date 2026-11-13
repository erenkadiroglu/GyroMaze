'use client';

import { useGameStore } from '@/store/useGameStore';
import { Modal, Button } from './primitives';
import {
  SHORTCUT_GUIDE_GROUPS,
  MOBILE_GUIDE_FEATURES,
} from '@/utils/keyboardShortcuts';
import { ShortcutsSection } from './help/ShortcutsSection';
import { MobileFeaturesSection } from './help/MobileFeaturesSection';

/**
 * Kullanıcıya masaüstü klavye kısayollarını, kamera modlarını ve
 * mobil kontrolcü özelliklerini açıklayan modüler yardım modalı.
 */
export function HelpShortcutsModal() {
  const isHelpOpen = useGameStore((s) => s.isHelpOpen);
  const setHelpOpen = useGameStore((s) => s.setHelpOpen);

  return (
    <Modal
      open={isHelpOpen}
      onClose={() => setHelpOpen(false)}
      size="lg"
      title="Klavye Kısayolları ve Kontrol Rehberi"
      description="GyroMaze masaüstü kontrolleri, kamera modları ve mobil eşleştirme rehberi."
      footer={
        <div className="flex w-full items-center justify-between">
          <span className="text-xs text-muted">
            İpucu: Oyun esnasında <kbd className="font-mono text-fg">H</kbd> veya{' '}
            <kbd className="font-mono text-fg">?</kbd> tuşuna basarak bu pencereyi açabilirsiniz.
          </span>
          <Button variant="primary" size="sm" onClick={() => setHelpOpen(false)}>
            Anladım
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Klavye Kısayol Grupları: Hareket, Kamera, Menüler */}
        {SHORTCUT_GUIDE_GROUPS.map((group) => (
          <ShortcutsSection key={group.id} group={group} />
        ))}

        {/* Mobil Kontrolcü Özellikleri Kartı */}
        <MobileFeaturesSection features={MOBILE_GUIDE_FEATURES} />
      </div>
    </Modal>
  );
}
