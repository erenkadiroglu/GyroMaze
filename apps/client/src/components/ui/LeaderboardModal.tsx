'use client';

import { Trophy } from 'lucide-react';
import { Modal } from '@/components/ui/primitives';
import { useLeaderboardSync } from '@/hooks/useLeaderboardSync';
import {
  getLeaderboardModalTitle,
  getLeaderboardModalDescription,
} from '@/utils/leaderboardModalViewUtils';
import {
  LeaderboardLevelSelector,
  LeaderboardSearchInput,
  LeaderboardList,
  LeaderboardErrorBanner,
} from './leaderboard';

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

  const title = getLeaderboardModalTitle();
  const description = getLeaderboardModalDescription();

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title={title}
      description={description}
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

        {/* Hata Bildirim Çubuğu */}
        <LeaderboardErrorBanner message={fetchError} />

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
