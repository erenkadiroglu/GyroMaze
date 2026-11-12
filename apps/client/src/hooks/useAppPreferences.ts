'use client';

import { useEffect } from 'react';
import {
  CUSTOM_MAP_URL_PARAM,
  decodeCustomMazeLevelFromUrl,
} from '@/components/scene/mazeLevels';
import { useGameStore } from '@/store/useGameStore';
import { soundEngine } from '@/utils/soundEngine';

/**
 * Kalıcı kullanıcı tercihlerini istemcide geri yükler ve uygulama geneline uygular:
 * - `localStorage` üzerindeki ayarları (tema, fizik, ses, katmanlar) depoya aktarır,
 * - URL `?map=` parametresi varsa paylaşılan özel haritayı otomatik yükler,
 * - `<html data-scheme>` özniteliğini aydınlık/karanlık moda göre günceller,
 * - Web Audio ses seviyesini senkronize eder.
 */
export function useAppPreferences() {
  const colorScheme = useGameStore((s) => s.colorScheme);
  const boardTheme = useGameStore((s) => s.boardTheme);
  const soundVolume = useGameStore((s) => s.soundVolume);
  const isSoundMuted = useGameStore((s) => s.isSoundMuted);

  useEffect(() => {
    void useGameStore.persist.rehydrate();
    const store = useGameStore.getState();
    store.hydrateLocalRecords();

    const url = new URL(window.location.href);
    const encodedMap = url.searchParams.get(CUSTOM_MAP_URL_PARAM);
    if (encodedMap) {
      const imported = decodeCustomMazeLevelFromUrl(encodedMap);
      if (imported) {
        store.setCustomLevel(imported);
        store.showHudNotification(
          `“${imported.title}” paylaşılan bağlantıdan yüklendi.`,
          'success',
        );
      } else {
        store.showHudNotification(
          'Paylaşılan özel harita bağlantısı geçersiz veya bozuk.',
          'warn',
        );
      }
      url.searchParams.delete(CUSTOM_MAP_URL_PARAM);
      const nextUrl = `${url.pathname}${url.search}${url.hash}`;
      window.history.replaceState(null, '', nextUrl);
    }
  }, []);

  useEffect(() => {
    const scheme =
      colorScheme === 'light' || boardTheme === 'daylight' ? 'light' : 'dark';
    document.documentElement.dataset.scheme = scheme;
  }, [colorScheme, boardTheme]);

  useEffect(() => {
    soundEngine.setVolume(isSoundMuted ? 0 : soundVolume);
  }, [isSoundMuted, soundVolume]);
}

