'use client';

import { Trophy, AlertCircle } from 'lucide-react';
import { Modal } from '@/components/ui/primitives';
import { useLeaderboardSync } from '@/hooks/useLeaderboardSync';
import { LeaderboardLevelSelector } from './leaderboard/LeaderboardLevelSelector';
import { LeaderboardSearchInput } from './leaderboard/LeaderboardSearchInput';
import { LeaderboardList } from './leaderboard/LeaderboardList';

export interface LeaderboardModalProps {
  open: boolean;
  onClose: () => void;
  initialLevel?: number;
}

/**
 * Küresel ve bölüm bazlı en hızlı rekor sürelerini listeleyen, REST senkronizasyonlu
 * ve arama filtreli liderlik tablosu modalı.
 */
export function LeaderboardModal({
  open,
  onClose,
  initialLevel = 1,
}: LeaderboardModalProps) {
  const {
    selectedLevel,
    setSelectedLevel,
    searchQuery,
    setSearchQuery,
    isRefreshing,
    fetchError,
    syncLeaderboard,
    filteredEntries,
    activeLevelNumber,
  } = useLeaderboardSync({
    open,
    initialLevel,
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title="Skor tablosu"
      description="Bölümlerde kaydedilen en hızlı tamamlama süreleri"
      icon={<Trophy className="h-4 w-4" aria-hidden="true" />}
    >
      <div className="space-y-3">
        {/* Üst Sekme ve Bölüm Seçici Çubuğu */}
        <LeaderboardLevelSelector
          selectedLevel={selectedLevel}
          onSelectLevel={setSelectedLevel}
          activeLevelNumber={activeLevelNumber}
          isRefreshing={isRefreshing}
          onRefresh={() => void syncLeaderboard()}
        />

        {/* Oyuncu Arama Girişi */}
        <LeaderboardSearchInput
          value={searchQuery}
          onChange={setSearchQuery}
        />

        {fetchError && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-xl border border-warn/30 bg-warn/10 px-3 py-2 text-[11px] text-warn"
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{fetchError}</span>
          </div>
        )}

        {/* Skor Kayıtları Listesi */}
        <LeaderboardList
          entries={filteredEntries}
          selectedLevel={selectedLevel}
          searchQuery={searchQuery}
        />
      </div>
    </Modal>
  );
}
