'use client';

import { LevelEditorModal } from '../../LevelEditorModal';
import { SettingsModal } from '../../SettingsModal';
import { HelpShortcutsModal } from '../../HelpShortcutsModal';

/**
 * Masaüstü sahnesindeki yardımcı araç ve yapılandırma modallarını gruplar:
 * - Özel harita editörü (LevelEditorModal)
 * - Genel ayarlar çekmecesi (SettingsModal)
 * - Klavye kısayolları ve yardım penceresi (HelpShortcutsModal)
 */
export function UtilityModalsGroup() {
  return (
    <>
      <LevelEditorModal />
      <SettingsModal />
      <HelpShortcutsModal />
    </>
  );
}

