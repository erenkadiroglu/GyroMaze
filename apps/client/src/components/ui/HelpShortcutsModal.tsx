'use client';

import { useGameStore } from '@/store/useGameStore';
import { Modal } from './primitives';
import {
  SHORTCUT_GUIDE_GROUPS,
  MOBILE_GUIDE_FEATURES,
} from '@/utils/keyboardShortcuts';
import {
  getHelpModalTitle,
  getHelpModalDescription,
} from '@/utils/helpModalUtils';
import {
  ShortcutsSection,
  MobileFeaturesSection,
  HelpModalFooter,
} from './help';

/**
 * Kullanıcıya masaüstü klavye kısayollarını, kamera modlarını ve
 * mobil kontrolcü özelliklerini açıklayan modüler yardım modalı.
 */
export function HelpShortcutsModal() {
  const isHelpOpen = useGameStore((s) => s.isHelpOpen);
  const setHelpOpen = useGameStore((s) => s.setHelpOpen);

  const title = getHelpModalTitle();
  const description = getHelpModalDescription();

  return (
    <Modal
      open={isHelpOpen}
      onClose={() => setHelpOpen(false)}
      size="lg"
      title={title}
      description={description}
      footer={<HelpModalFooter onDismiss={() => setHelpOpen(false)} />}
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
