'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import {
  Trophy,
  Medal,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  Layers,
  X,
  AlertCircle,
} from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { Modal, IconButton, cx } from '@/components/ui/primitives';
import {
  formatRecordTime,
  formatRecordDate,
  filterLeaderboardEntries,
  fetchLeaderboardFromRest,
} from '@/utils/leaderboardUtils';

interface LeaderboardModalProps {
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
  const leaderboard = useGameStore((s) => s.leaderboard);
  const setLeaderboard = useGameStore((s) => s.setLeaderboard);

  const [selectedLevel, setSelectedLevel] = useState<number | 'all'>(
    initialLevel === 99 ? 1 : Math.max(1, initialLevel),
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

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
  }, [open, initialLevel]);

  const syncLeaderboard = useCallback(async () => {
    setIsRefreshing(true);
    setFetchError(null);
    try {
      const records = await fetchLeaderboardFromRest();
      startTransition(() => {
        setLeaderboard(records);
      });
    } catch {
      setFetchError('Sunucu skorları yenilenemedi; mevcut kayıtlar gösteriliyor.');
    } finally {
      setIsRefreshing(false);
    }
  }, [setLeaderboard]);

  const filteredEntries = filterLeaderboardEntries(leaderboard, {
    levelId: selectedLevel,
    searchQuery,
  });

  const activeLevelNumber =
    typeof selectedLevel === 'number' ? selectedLevel : 1;

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
        <div className="flex items-center gap-1.5 rounded-2xl border border-line bg-surface-2/70 p-1.5">
          <button
            type="button"
            onClick={() => setSelectedLevel('all')}
            className={cx(
              'flex h-8 cursor-pointer items-center gap-1.5 rounded-xl px-2.5 text-xs font-semibold transition-colors',
              selectedLevel === 'all'
                ? 'bg-brass text-brass-fg shadow-sm'
                : 'text-muted hover:text-fg',
            )}
          >
            <Layers className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Tümü</span>
          </button>

          <div className="h-4 w-px bg-line/80" aria-hidden="true" />

          <IconButton
            size="sm"
            label="Önceki bölüm skorları"
            onClick={() =>
              setSelectedLevel(Math.max(1, activeLevelNumber - 1))
            }
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </IconButton>

          <div className="grid flex-1 grid-cols-5 gap-1">
            {[0, 1, 2, 3, 4].map((offset) => {
              const startLvl = Math.max(1, activeLevelNumber - 2);
              const tabLvl = startLvl + offset;
              const active = selectedLevel === tabLvl;
              return (
                <button
                  key={tabLvl}
                  type="button"
                  onClick={() => setSelectedLevel(tabLvl)}
                  className={cx(
                    'gm-num h-8 cursor-pointer rounded-xl text-xs font-semibold transition-colors',
                    active
                      ? 'bg-brass text-brass-fg shadow-sm'
                      : 'text-muted hover:text-fg',
                  )}
                >
                  {tabLvl < 10 ? `0${tabLvl}` : tabLvl}
                </button>
              );
            })}
          </div>

          <IconButton
            size="sm"
            label="Sonraki bölüm skorları"
            onClick={() => setSelectedLevel(activeLevelNumber + 1)}
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </IconButton>

          <div className="h-4 w-px bg-line/80" aria-hidden="true" />

          <IconButton
            size="sm"
            label={isRefreshing ? 'Yenileniyor...' : 'Skorları yenile'}
            onClick={() => void syncLeaderboard()}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={cx(
                'h-3.5 w-3.5 transition-transform',
                isRefreshing && 'animate-spin text-brass',
              )}
              aria-hidden="true"
            />
          </IconButton>
        </div>

        {/* Oyuncu Arama Girişi */}
        <div className="relative flex items-center">
          <Search
            className="pointer-events-none absolute left-3.5 h-3.5 w-3.5 text-muted"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Oyuncu adına göre filtrele..."
            aria-label="Oyuncu ara"
            className="h-9 w-full rounded-xl border border-line bg-surface-2/60 pr-9 pl-9 text-xs font-medium text-fg placeholder:text-muted/60 outline-none focus:border-brass/70 focus:ring-1 focus:ring-brass/40"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Aramayı temizle"
              className="absolute right-2.5 flex h-5 w-5 cursor-pointer items-center justify-center rounded-md text-muted hover:text-fg"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>

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
        <div className="gm-scroll max-h-80 space-y-2 overflow-y-auto pr-0.5">
          {filteredEntries.length === 0 ? (
            <div className="rounded-2xl border border-line bg-surface-2/40 py-10 text-center text-xs text-muted">
              {searchQuery ? (
                <>
                  <p className="font-medium text-fg">Eşleşen kayıt bulunamadı</p>
                  <p className="mt-1 text-[11px]">
                    &quot;{searchQuery}&quot; için arama kriterini değiştirip tekrar deneyin.
                  </p>
                </>
              ) : selectedLevel === 'all' ? (
                <p>Henüz kayıtlı hiçbir skor bulunmuyor.</p>
              ) : (
                <p>
                  Bölüm {selectedLevel} için henüz kayıtlı bir skor yok. İlk rekoru sen kır!
                </p>
              )}
            </div>
          ) : (
            filteredEntries.map((item, idx) => {
              const isFirst = idx === 0;
              const isSecond = idx === 1;
              const isThird = idx === 2;

              return (
                <div
                  key={item.id}
                  className={cx(
                    'flex items-center justify-between rounded-2xl border px-3.5 py-2.5 transition-colors',
                    isFirst
                      ? 'border-brass/40 bg-brass/10 ring-1 ring-brass/20'
                      : isSecond
                        ? 'border-slate-400/30 bg-surface-2/80'
                        : isThird
                          ? 'border-amber-700/30 bg-surface-2/60'
                          : 'border-line bg-surface-2/40',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cx(
                        'gm-num flex h-7 w-7 items-center justify-center rounded-xl text-xs font-semibold',
                        isFirst
                          ? 'bg-brass text-brass-fg shadow-sm'
                          : isSecond
                            ? 'bg-slate-300 text-slate-900'
                            : isThird
                              ? 'bg-amber-600 text-white'
                              : 'bg-surface text-muted',
                      )}
                    >
                      {isFirst ? (
                        <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : isSecond || isThird ? (
                        <Medal className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        idx + 1
                      )}
                    </span>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-fg">
                          {item.playerName}
                        </span>
                        {selectedLevel === 'all' && (
                          <span className="gm-num rounded-md border border-line bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-brass">
                            Böl. {item.levelId < 10 ? `0${item.levelId}` : item.levelId}
                          </span>
                        )}
                      </div>

                      {item.createdAt > 0 && (
                        <span className="flex items-center gap-1 text-[10px] text-muted">
                          <Clock className="h-2.5 w-2.5" aria-hidden="true" />
                          <span>{formatRecordDate(item.createdAt)}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={cx(
                        'gm-num text-sm font-semibold',
                        isFirst ? 'text-brass' : 'text-ok',
                      )}
                    >
                      {formatRecordTime(item.timeSeconds)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
}

