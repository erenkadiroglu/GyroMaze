'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sliders,
  Users,
  Gauge,
  Volume2,
  Eye,
  Sparkles,
} from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { soundEngine } from '@/utils/soundEngine';

/**
 * Fizik ivmesi, eğim tepkiselliği, ses seviyesi, görsel katmanlar ve
 * Çok Oyunculu (2 Oyuncu - 1v1 / Co-op) modu yapılandıran Ayarlar Modalı.
 */
export function SettingsModal() {
  const isSettingsOpen = useGameStore((s) => s.isSettingsOpen);
  const setSettingsOpen = useGameStore((s) => s.setSettingsOpen);
  const isMultiplayer = useGameStore((s) => s.isMultiplayer);
  const toggleMultiplayer = useGameStore((s) => s.toggleMultiplayer);
  const gravityScale = useGameStore((s) => s.gravityScale);
  const tiltResponsiveness = useGameStore((s) => s.tiltResponsiveness);
  const soundVolume = useGameStore((s) => s.soundVolume);
  const isSoundMuted = useGameStore((s) => s.isSoundMuted);
  const toggleSoundMuted = useGameStore((s) => s.toggleSoundMuted);
  const showTrail = useGameStore((s) => s.showTrail);
  const showGhost = useGameStore((s) => s.showGhost);
  const showMiniMap = useGameStore((s) => s.showMiniMap);
  const updateSettings = useGameStore((s) => s.updateSettings);

  const handleVolumeSelect = (vol: number) => {
    soundEngine.setVolume(vol);
    updateSettings({ soundVolume: vol });
    if (isSoundMuted && vol > 0) {
      toggleSoundMuted();
    }
    soundEngine.playCalibrate();
  };

  return (
    <AnimatePresence>
      {isSettingsOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-auto fixed inset-0 z-40 flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 12 }}
            className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-900/95 p-6 text-zinc-100 shadow-2xl"
          >
            {/* Başlık */}
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                  <Sliders className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold tracking-wider text-emerald-400 uppercase">
                    Fizik, Ses ve Çok Oyunculu
                  </span>
                  <h2 className="text-lg font-semibold text-zinc-100">
                    Oyun Ayarları
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="cursor-pointer rounded-xl border border-zinc-800 bg-zinc-800/60 p-2 text-zinc-400 transition hover:text-zinc-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* 1. Çok Oyunculu (1v1 / Co-op) Mod Seçimi */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">
                <div className="mb-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-amber-400" />
                    <span className="text-xs font-semibold text-zinc-100">
                      Oyun Modu (Tek / Çok Oyunculu)
                    </span>
                  </div>
                  <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                    {isMultiplayer ? '2 OYUNCU AKTİF' : 'SOLO MOD'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (isMultiplayer) toggleMultiplayer();
                    }}
                    className={`cursor-pointer rounded-xl py-2.5 text-xs font-semibold transition ${
                      !isMultiplayer
                        ? 'bg-emerald-500 text-zinc-950'
                        : 'border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    1 Oyuncu (Solo)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!isMultiplayer) toggleMultiplayer();
                    }}
                    className={`cursor-pointer rounded-xl py-2.5 text-xs font-semibold transition ${
                      isMultiplayer
                        ? 'bg-amber-500 text-zinc-950'
                        : 'border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    2 Oyuncu (1v1 & Co-op)
                  </button>
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-zinc-400">
                  2 Oyunculu modda sahneye <strong className="text-amber-300">Altın Bilye</strong> eklenir. 2. oyuncu telefonundan aynı oda koduna girip <strong className="text-amber-300">Oyuncu 2</strong> yuvasını seçebilir veya masaüstünde <strong className="text-zinc-200">Yön Tuşları</strong> ile oynayabilir.
                </p>
              </div>

              {/* 2. Fizik İvmesi (Yerçekimi Ölçeği) ve Eğim Tepkiselliği */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3.5">
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
                    <Gauge className="h-3.5 w-3.5 text-sky-400" />
                    <span>Bilye İvme Hızı</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { val: 28, label: 'Yavaş' },
                      { val: 36, label: 'Standart' },
                      { val: 46, label: 'Turbo' },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() =>
                          updateSettings({ gravityScale: opt.val })
                        }
                        className={`cursor-pointer rounded-lg py-1.5 text-[11px] font-semibold transition ${
                          gravityScale === opt.val
                            ? 'bg-sky-500 text-zinc-950'
                            : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3.5">
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
                    <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                    <span>Eğim Tepki Hızı</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { val: 18, label: 'Yumuşak' },
                      { val: 32, label: 'Standart' },
                      { val: 48, label: 'Anında' },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() =>
                          updateSettings({ tiltResponsiveness: opt.val })
                        }
                        className={`cursor-pointer rounded-lg py-1.5 text-[11px] font-semibold transition ${
                          tiltResponsiveness === opt.val
                            ? 'bg-purple-500 text-zinc-950'
                            : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Ses Şiddeti Seçici */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3.5">
                <div className="mb-2 flex items-center justify-between text-xs font-semibold text-zinc-200">
                  <div className="flex items-center gap-1.5">
                    <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Ses Efekt Şiddeti</span>
                  </div>
                  <span className="font-mono text-[11px] text-emerald-400">
                    {isSoundMuted ? 'Sessiz' : `%${Math.round(soundVolume * 100)}`}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { val: 0.25, label: '%25' },
                    { val: 0.5, label: '%50' },
                    { val: 0.75, label: '%75' },
                    { val: 1, label: '%100' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => handleVolumeSelect(opt.val)}
                      className={`cursor-pointer rounded-lg py-1.5 font-mono text-xs font-semibold transition ${
                        !isSoundMuted && soundVolume === opt.val
                          ? 'bg-emerald-500 text-zinc-950'
                          : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Görsel Katman Anahtarları */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3.5">
                <div className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
                  <Eye className="h-3.5 w-3.5 text-amber-400" />
                  <span>Görsel Sahne ve HUD Katmanları</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => updateSettings({ showTrail: !showTrail })}
                    className={`cursor-pointer rounded-xl border py-2 text-xs font-medium transition ${
                      showTrail
                        ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-500'
                    }`}
                  >
                    Neon İz: {showTrail ? 'Açık' : 'Kapalı'}
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSettings({ showGhost: !showGhost })}
                    className={`cursor-pointer rounded-xl border py-2 text-xs font-medium transition ${
                      showGhost
                        ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-500'
                    }`}
                  >
                    Hayalet Küre: {showGhost ? 'Açık' : 'Kapalı'}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateSettings({ showMiniMap: !showMiniMap })
                    }
                    className={`cursor-pointer rounded-xl border py-2 text-xs font-medium transition ${
                      showMiniMap
                        ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-500'
                    }`}
                  >
                    2B Radar: {showMiniMap ? 'Açık' : 'Kapalı'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

