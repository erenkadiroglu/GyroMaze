'use client';

import { useEffect } from 'react';
import { CUSTOM_MAP_URL_PARAM } from '@/components/scene/mazeLevels';
import { useGameStore } from '@/store/useGameStore';
import { soundEngine } from '@/utils/soundEngine';
import {
  resolveEffectiveColorScheme,
  resolveEffectiveSoundVolume,
  resolveCustomMapImport,
  stripUrlParam,
} from '@/utils/settingsDrawerUtils';

/**
 * Kalıcı kullanıcı tercihlerini istemcide geri yükler ve uygulama geneline uygular:
 * - `localStorage` üzerindeki ayarları depoya aktarır,
 * - URL `?map=` parametresi varsa paylaşılan özel haritayı güvenle çözer ve yükler,
 * - `<html data-scheme>` özniteliğini temaya göre günceller,
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

    const encodedMap = new URL(window.location.href).searchParams.get(
      CUSTOM_MAP_URL_PARAM,
    );
    if (encodedMap) {
      const { level, notification } = resolveCustomMapImport(encodedMap);
      if (level) {
        store.setCustomLevel(level);
      }
      if (notification) {
        store.showHudNotification(notification.message, notification.tone);
      }
      const nextUrl = stripUrlParam(window.location.href, CUSTOM_MAP_URL_PARAM);
      window.history.replaceState(null, '', nextUrl);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.scheme = resolveEffectiveColorScheme(
      colorScheme,
      boardTheme,
    );
  }, [colorScheme, boardTheme]);

  useEffect(() => {
    soundEngine.setVolume(
      resolveEffectiveSoundVolume(isSoundMuted, soundVolume),
    );
  }, [isSoundMuted, soundVolume]);
}
