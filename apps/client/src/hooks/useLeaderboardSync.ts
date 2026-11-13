'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import type { LeaderboardEntry } from '@gyromaze/shared';
import { useGameStore } from '@/store/useGameStore';
import {
  filterLeaderboardEntries,
  fetchLeaderboardFromRest,
} from '@/utils/leaderboardUtils';
import {
  DEFAULT_SYNC_ERROR_MESSAGE,
  resolveInitialSelectedLevel,
  resolveActiveLevelNumber,
  resolveEffectiveSelectedLevelOnOpen,
} from '@/utils/leaderboardSyncUtils';

export interface UseLeaderboardSyncOptions {
  open: boolean;
  initialLevel?: number;
}

export interface UseLeaderboardSyncReturn {
  selectedLevel: number | 'all';
  setSelectedLevel: (level: number | 'all') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isRefreshing: boolean;
  fetchError: string | null;
  syncLeaderboard: () => Promise<void>;
  filteredEntries: LeaderboardEntry[];
  activeLevelNumber: number;
}

/**
 * Liderlik tablosu REST veri senkronizasyonu, bölüm filtrelemesi,
 * arama sorgusu ve yenileme durumu yaşam döngüsü kancası.
 */
export function useLeaderboardSync({
  open,
  initialLevel = 1,
}: UseLeaderboardSyncOptions): UseLeaderboardSyncReturn {
  const leaderboard = useGameStore((s) => s.leaderboard);
  const setLeaderboard = useGameStore((s) => s.setLeaderboard);

  const [selectedLevel, setSelectedLevel] = useState<number | 'all'>(() =>
    resolveInitialSelectedLevel(initialLevel),
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const syncLeaderboard = useCallback(async () => {
    setIsRefreshing(true);
    setFetchError(null);
    try {
      const records = await fetchLeaderboardFromRest();
      startTransition(() => {
        setLeaderboard(records);
      });
    } catch {
      setFetchError(DEFAULT_SYNC_ERROR_MESSAGE);
    } finally {
      setIsRefreshing(false);
    }
  }, [setLeaderboard]);

  // Modal her açıldığında varsayılan bölümü güncelle ve REST üzerinden tazele
  useEffect(() => {
    if (open) {
      setSelectedLevel((prev) =>
        resolveEffectiveSelectedLevelOnOpen(initialLevel, prev),
      );
      setSearchQuery('');
      setFetchError(null);
      void syncLeaderboard();
    }
  }, [open, initialLevel, syncLeaderboard]);

  const filteredEntries = filterLeaderboardEntries(leaderboard, {
    levelId: selectedLevel,
    searchQuery,
  });

  const activeLevelNumber = resolveActiveLevelNumber(selectedLevel);

  return {
    selectedLevel,
    setSelectedLevel,
    searchQuery,
    setSearchQuery,
    isRefreshing,
    fetchError,
    syncLeaderboard,
    filteredEntries,
    activeLevelNumber,
  };
}

