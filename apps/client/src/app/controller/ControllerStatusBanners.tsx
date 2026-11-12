'use client';

import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Gem,
  Trophy,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import {
  formatControllerLevelLabel,
  formatCrystalRatio,
} from '@/utils/controllerUtils';

interface ControllerStatusBannersProps {
  errorMessage: string | null;
  onOpenRoomEditor: () => void;
  isControllerPaired: boolean;
  isRoomEditorOpen: boolean;
  level: number;
  remoteCrystalsCollected: number;
  remoteCrystalsTotal: number;
  gameStatus: string;
  onChangeLevel: (direction: 'next' | 'prev') => void;
  onResetBall: () => void;
}

export function ControllerStatusBanners({
  errorMessage,
  onOpenRoomEditor,
  isControllerPaired,
  isRoomEditorOpen,
  level,
  remoteCrystalsCollected,
  remoteCrystalsTotal,
  gameStatus,
  onChangeLevel,
  onResetBall,
}: ControllerStatusBannersProps) {
  const levelLabel = formatControllerLevelLabel(level);
  const crystalRatio = formatCrystalRatio(
    remoteCrystalsCollected,
    remoteCrystalsTotal,
  );

  return (
    <>
      {/* HATA BİLDİRİMİ */}
      {errorMessage && (
        <div
          role="alert"
          className="mt-2.5 flex items-center justify-between gap-2 rounded-2xl border border-danger/40 bg-surface px-3.5 py-2.5 text-xs text-danger"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={onOpenRoomEditor}
            className="min-h-[34px] shrink-0 rounded-lg border border-danger/40 bg-danger/10 px-2.5 text-xs font-semibold text-danger"
          >
            Yeni kod
          </button>
        </div>
      )}

      {/* BÖLÜM & KRİSTAL ÇUBUĞU (Eşleştiğinde aktif) */}
      {isControllerPaired && !isRoomEditorOpen && (
        <div className="mt-2.5 flex items-center justify-between rounded-2xl border border-line bg-surface px-2.5 py-2">
          <button
            type="button"
            disabled={level <= 1}
            onClick={() => onChangeLevel('prev')}
            className="flex min-h-[40px] cursor-pointer items-center gap-1 rounded-xl border border-line bg-surface-2 px-3 text-xs font-medium text-fg active:scale-95 disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            <span>Önceki</span>
          </button>

          <div className="flex items-center gap-2.5 text-sm">
            <span className="gm-num font-semibold text-brass">{levelLabel}</span>
            <span className="text-line" aria-hidden="true">
              ·
            </span>
            <span className="gm-num flex items-center gap-1 font-semibold text-signal">
              <Gem className="h-3.5 w-3.5" aria-hidden="true" />
              {crystalRatio}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onChangeLevel('next')}
            className="flex min-h-[40px] cursor-pointer items-center gap-1 rounded-xl border border-line bg-surface-2 px-3 text-xs font-medium text-fg active:scale-95"
          >
            <span>Sonraki</span>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* ZAFER KARTI */}
      {isControllerPaired && gameStatus === 'won' && !isRoomEditorOpen && (
        <div className="mt-2.5 flex items-center justify-between gap-3 rounded-2xl border border-ok/40 bg-surface px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Trophy className="h-5 w-5 shrink-0 text-brass" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-ok">Bölüm tamamlandı</p>
              <p className="text-xs text-muted">
                Telefondan sıradaki bölüme geçebilirsin
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onChangeLevel('next')}
            className="flex min-h-[44px] shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-brass px-3.5 text-xs font-semibold text-brass-fg active:scale-95"
          >
            <span>Sonraki bölüm</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* SÜRE DOLDU KARTI (Süreye Karşı Modu) */}
      {isControllerPaired && gameStatus === 'lost' && !isRoomEditorOpen && (
        <div className="mt-2.5 flex items-center justify-between gap-3 rounded-2xl border border-danger/40 bg-surface px-4 py-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle
              className="h-5 w-5 shrink-0 text-danger"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-semibold text-danger">Süre doldu</p>
              <p className="text-xs text-muted">
                Yeniden denemek için bilyeyi başa alabilirsin
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onResetBall}
            className="flex min-h-[44px] shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-brass px-3.5 text-xs font-semibold text-brass-fg active:scale-95"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Tekrar dene</span>
          </button>
        </div>
      )}
    </>
  );
}
