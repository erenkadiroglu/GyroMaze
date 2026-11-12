'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { soundEngine } from '@/utils/soundEngine';

/**
 * Kalıcı kullanıcı tercihlerini istemcide geri yükler ve uygulama geneline uygular:
 * - `localStorage` üzerindeki ayarları (tema, fizik, ses, katmanlar) depoya aktarır,
 * - `<html data-scheme>` özniteliğini aydınlık/karanlık moda göre günceller,
 * - Web Audio ses seviyesini senkronize eder.
 */
export function useAppPreferences() {
  const colorScheme = useGameStore((s) => s.colorScheme);
  const boardTheme = useGameStore((s) => s.boardTheme);
  const soundVolume = useGameStore((s) => s.soundVolume);

  useEffect(() => {
    void useGameStore.persist.rehydrate();
    useGameStore.getState().hydrateLocalRecords();
  }, []);

  useEffect(() => {
    const scheme =
      colorScheme === 'light' || boardTheme === 'daylight' ? 'light' : 'dark';
    document.documentElement.dataset.scheme = scheme;
  }, [colorScheme, boardTheme]);

  useEffect(() => {
    soundEngine.setVolume(soundVolume);
  }, [soundVolume]);
}

