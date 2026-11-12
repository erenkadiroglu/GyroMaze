'use client';

import { RefObject } from 'react';
import { Smartphone, Hand } from 'lucide-react';
import { cx, handleRadioGroupKeyDown } from '@/components/ui/primitives';

interface ControllerGimbalPadProps {
  gimbalPadRef: RefObject<HTMLDivElement | null>;
  gimbalDotRef: RefObject<HTMLDivElement | null>;
  pitchValueRef: RefObject<HTMLSpanElement | null>;
  rollValueRef: RefObject<HTMLSpanElement | null>;
  playerSlot: 1 | 2;
  onSelectSlot: (slot: 1 | 2) => void;
  controllerTouchOverride: boolean;
  onToggleTouchOverride: (touch: boolean) => void;
  controllerSensitivity: 0.75 | 1 | 1.35;
  onSelectSensitivity: (mult: 0.75 | 1 | 1.35) => void;
  isControllerPaired: boolean;
  errorMessage: string | null;
  sensorSignalTimedOut: boolean;
  hasSensorSignal: boolean;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerEnd: (e: React.PointerEvent<HTMLDivElement>) => void;
}

export function ControllerGimbalPad({
  gimbalPadRef,
  gimbalDotRef,
  pitchValueRef,
  rollValueRef,
  playerSlot,
  onSelectSlot,
  controllerTouchOverride,
  onToggleTouchOverride,
  controllerSensitivity,
  onSelectSensitivity,
  isControllerPaired,
  errorMessage,
  sensorSignalTimedOut,
  hasSensorSignal,
  onPointerDown,
  onPointerMove,
  onPointerEnd,
}: ControllerGimbalPadProps) {
  return (
    <div className="flex flex-col items-center">
      {/* Canlı 2B Ufuk Pad */}
      <div
        ref={gimbalPadRef}
        role="application"
        aria-label="Dokunmatik sanal eğim tablası; parmağını sürükleyerek bilyeyi yönlendirebilirsin"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onLostPointerCapture={onPointerEnd}
        className="relative flex h-60 w-60 touch-none items-center justify-center rounded-full border-2 border-line bg-surface shadow-inner"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute h-40 w-40 rounded-full border border-dashed border-line"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute h-20 w-20 rounded-full border border-line"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute h-px w-full bg-line/70"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute h-full w-px bg-line/70"
        />

        <div
          ref={gimbalDotRef}
          className={cx(
            'pointer-events-none relative flex h-11 w-11 items-center justify-center rounded-full border will-change-transform',
            playerSlot === 2
              ? 'border-warn bg-warn/20'
              : 'border-brass bg-brass/20',
          )}
        >
          <div
            className={cx(
              'h-3.5 w-3.5 rounded-full',
              playerSlot === 2 ? 'bg-warn' : 'bg-brass',
            )}
          />
        </div>
      </div>

      <p className="mt-2.5 text-center text-xs text-muted">
        {controllerTouchOverride
          ? 'Dairedeki küreyi parmağınla sürükleyerek yönlendir'
          : 'Telefonu eğ veya dairedeki küreyi parmağınla sürükle'}
      </p>

      {!isControllerPaired && !errorMessage && (
        <p
          role="status"
          className="mt-1.5 rounded-xl border border-brass/30 bg-brass/10 px-3 py-1.5 text-center text-[11px] text-brass"
        >
          Masaüstü eşleşmesi bekleniyor — oda kodunu kontrol et
        </p>
      )}

      {sensorSignalTimedOut && !controllerTouchOverride && !hasSensorSignal && (
        <p
          role="status"
          className="mt-1.5 rounded-xl border border-warn/30 bg-warn/10 px-3 py-1.5 text-center text-[11px] text-warn"
        >
          Donanım sensör sinyali alınamadı — daireyi parmağınla sürükleyebilirsin
        </p>
      )}

      {/* Sayısal Açı Göstergeleri (8Hz) */}
      <div className="mt-3 grid w-64 grid-cols-2 gap-2.5">
        <div className="rounded-2xl border border-line bg-surface p-2.5 text-center">
          <span className="block text-xs text-muted">Eğim (Pitch)</span>
          <span
            ref={pitchValueRef}
            className="gm-num mt-0.5 block text-lg font-semibold text-signal"
          >
            +0.0°
          </span>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-2.5 text-center">
          <span className="block text-xs text-muted">Yatış (Roll)</span>
          <span
            ref={rollValueRef}
            className="gm-num mt-0.5 block text-lg font-semibold text-signal"
          >
            +0.0°
          </span>
        </div>
      </div>

      {/* Kontrol Modu Seçici (Jiroskop / Dokunmatik) */}
      <div
        role="radiogroup"
        aria-label="Kontrol modu"
        className="mt-2.5 grid w-64 grid-cols-2 gap-1 rounded-2xl border border-line bg-surface p-1"
      >
        <button
          type="button"
          role="radio"
          aria-checked={!controllerTouchOverride}
          tabIndex={!controllerTouchOverride ? 0 : -1}
          onClick={() => onToggleTouchOverride(false)}
          className={cx(
            'flex min-h-[38px] cursor-pointer items-center justify-center gap-1.5 rounded-xl text-xs font-semibold transition-colors',
            !controllerTouchOverride
              ? 'bg-brass text-brass-fg'
              : 'text-muted hover:text-fg',
          )}
        >
          <Smartphone className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Jiroskop</span>
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={controllerTouchOverride}
          tabIndex={controllerTouchOverride ? 0 : -1}
          onClick={() => onToggleTouchOverride(true)}
          className={cx(
            'flex min-h-[38px] cursor-pointer items-center justify-center gap-1.5 rounded-xl text-xs font-semibold transition-colors',
            controllerTouchOverride
              ? 'bg-brass text-brass-fg'
              : 'text-muted hover:text-fg',
          )}
        >
          <Hand className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Dokunmatik</span>
        </button>
      </div>

      {/* Hassasiyet Seçici */}
      <div
        role="radiogroup"
        aria-label="Jiroskop hassasiyeti"
        className="mt-2 grid w-64 grid-cols-3 gap-1 rounded-2xl border border-line bg-surface p-1"
      >
        {(
          [
            { mult: 0.75, label: 'Hassas' },
            { mult: 1, label: 'Standart' },
            { mult: 1.35, label: 'Hızlı' },
          ] as const
        ).map((item, idx, list) => {
          const active = controllerSensitivity === item.mult;
          return (
            <button
              key={item.mult}
              type="button"
              role="radio"
              aria-checked={active}
              tabIndex={active ? 0 : -1}
              onClick={() => onSelectSensitivity(item.mult)}
              onKeyDown={(e) =>
                handleRadioGroupKeyDown(e, idx, list.length, (nextIdx) =>
                  onSelectSensitivity(list[nextIdx].mult),
                )
              }
              className={cx(
                'min-h-[38px] cursor-pointer rounded-xl text-xs font-semibold transition-colors',
                active
                  ? 'bg-brass text-brass-fg'
                  : 'text-muted hover:text-fg',
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Çok Oyunculu Yuva Seçici */}
      <div
        role="radiogroup"
        aria-label="Oyuncu yuvası"
        className="mt-2 grid w-64 grid-cols-2 gap-1 rounded-2xl border border-line bg-surface p-1"
      >
        {(
          [
            { slot: 1, label: '1. Oyuncu (Ana)' },
            { slot: 2, label: '2. Oyuncu (Altın)' },
          ] as const
        ).map((entry, idx, list) => {
          const active = playerSlot === entry.slot;
          return (
            <button
              key={entry.slot}
              type="button"
              role="radio"
              aria-checked={active}
              tabIndex={active ? 0 : -1}
              onClick={() => onSelectSlot(entry.slot)}
              onKeyDown={(e) =>
                handleRadioGroupKeyDown(e, idx, list.length, (nextIdx) =>
                  onSelectSlot(list[nextIdx].slot),
                )
              }
              className={cx(
                'min-h-[38px] cursor-pointer rounded-xl text-xs font-semibold transition-colors',
                active
                  ? entry.slot === 1
                    ? 'bg-surface-2 text-brass ring-1 ring-brass/60'
                    : 'bg-surface-2 text-warn ring-1 ring-warn/60'
                  : 'text-muted hover:text-fg',
              )}
            >
              {entry.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
