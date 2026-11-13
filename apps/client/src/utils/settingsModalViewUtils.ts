/**
 * Ayarlar Modalı/Çekmecesi (SettingsModal) görünüm, başlık, erişilebilirlik ve özet yardımcı fonksiyonları.
 */

export interface ActivePreferencesSummaryParams {
  isMultiplayer?: boolean;
  gameMode?: string;
  colorScheme?: string;
  soundVolume?: number;
  isMuted?: boolean;
}

/**
 * Ayarlar çekmecesi standart başlığını döner.
 */
export function getSettingsModalTitle(): string {
  return 'Ayarlar';
}

/**
 * Ayarlar çekmecesi standart açıklama metnini döner.
 */
export function getSettingsModalDescription(): string {
  return 'Oyun modu, görünüm, fizik, ses ve arayüz katmanı tercihlerini yapılandırın';
}

/**
 * Ayarlar çekmecesi ana bölgesi için erişilebilir etiket metnini döner.
 */
export function getSettingsContainerAriaLabel(): string {
  return 'Oyun ve Arayüz Ayarları';
}

/**
 * Ayarlar modalının açık olup olmadığını boolean olarak doğrular.
 */
export function isSettingsModalOpen(isOpen?: boolean | null): boolean {
  return Boolean(isOpen);
}

/**
 * Ayarlar alt bölümü için erişilebilir başlık/bölge etiketini formatlar.
 */
export function formatSettingsSectionAriaLabel(sectionName: string): string {
  const safeName = (sectionName ?? '').trim();
  return safeName ? `${safeName} Ayarları` : 'Genel Ayarlar';
}

/**
 * Aktif kullanıcı ayarlarını tek satırlık özet telemetri metnine dönüştürür.
 */
export function formatActivePreferencesSummary(
  params: ActivePreferencesSummaryParams,
): string {
  const playerMode = params.isMultiplayer ? '2P Çok Oyunculu' : '1P Solo';
  const mode = params.gameMode === 'time-attack' ? 'Zamana Karşı' : 'Klasik';
  const scheme = params.colorScheme === 'neon' ? 'Neon' : params.colorScheme === 'cyberpunk' ? 'Cyberpunk' : 'Karanlık';
  
  let volumeText = 'Sessiz';
  if (!params.isMuted && typeof params.soundVolume === 'number' && params.soundVolume > 0) {
    const pct = Math.round(Math.min(1, Math.max(0, params.soundVolume)) * 100);
    volumeText = `%${pct}`;
  }

  return `${playerMode} | ${mode} | ${scheme} | Ses: ${volumeText}`;
}

