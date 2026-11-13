'use client';

import { useMemo } from 'react';
import {
  resolveMazeStageBoardBaseState,
  type MazeStageBoardBaseOptions,
  type ResolvedMazeStageBoardBaseState,
} from '@/utils/mazeStageBoardBaseOrchestrationUtils';

/**
 * 3B Labirent Tahta Tabanı ve Izgarası (MazeStageBoardBase) Orkestrasyon Kancası.
 * Tahta boyutu ve tema durumuna göre zemin kutusu boyutlarını ve ızgara konfigürasyonunu
 * useMemo ile önbellekleyerek MazeStageBoardBase bileşenine saf motor çıktısı sağlar.
 */
export function useMazeStageBoardBase({
  boardSize,
  isLightBoard,
}: MazeStageBoardBaseOptions): ResolvedMazeStageBoardBaseState {
  return useMemo(() => {
    return resolveMazeStageBoardBaseState({ boardSize, isLightBoard });
  }, [boardSize, isLightBoard]);
}

