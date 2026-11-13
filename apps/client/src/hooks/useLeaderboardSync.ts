'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import type { LeaderboardEntry } from '@gyromaze/shared';
import { useGameStore } from '@/store/useGameStore';
import {
  filterLeaderboardEntries,
  fetchLeaderboardFromRest,
} from '@/utils/leaderboardUtils';

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

  const [selectedLevel, setSelectedLevel] = useState<number | 'all'>(
    initialLevel === 99 ? 1 : Math.max(1, initialLevel),
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
      setFetchError(
        'Sunucu skorları yenilenemedi; mevcut kayıtlar gösteriliyor.',
      );
    } finally {
      setIsRefreshing(false);
    }
  }, [setLeaderboard]);

  // Modal her açıldığında varsayılan bölümü güncelle ve REST üzerinden tazele
  useEffect(() => {
    if (open) {
      if (initialLevel !== 99 && initialLevel > 0) {
        setSelectedLevel(initialLevel);
      }
      setSearchQuery('');
      setFetchError(null);
      void syncLeaderboard();
    }
  }, [open, initialLevel, syncLeaderboard]);

  const filteredEntries = filterLeaderboardEntries(leaderboard, {
    levelId: selectedLevel,
    searchQuery,
  });

  const activeLevelNumber =
    typeof selectedLevel === 'number' ? selectedLevel : 1;

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

