'use client';

import {
  Gamepad2,
  Eye,
  Sliders,
  Smartphone,
  Keyboard,
  Compass,
} from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { Modal, Button } from './primitives';

interface ShortcutRowProps {
  keys: string[];
  description: string;
}

function ShortcutRow({ keys, description }: ShortcutRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 text-xs">
      <span className="text-muted">{description}</span>
      <div className="flex items-center gap-1">
        {keys.map((k) => (
          <kbd
            key={k}
            className="inline-flex min-h-[22px] min-w-[22px] items-center justify-center rounded-md border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-brass shadow-xs"
          >
            {k}
          </kbd>
        ))}
      </div>
    </div>
  );
}

/**
 * Kullanıcıya masaüstü klavye kısayollarını, kamera modlarını ve
 * mobil kontrolcü özelliklerini açıklayan yardım modalı.
 */
export function HelpShortcutsModal() {
  const isHelpOpen = useGameStore((s) => s.isHelpOpen);
  const setHelpOpen = useGameStore((s) => s.setHelpOpen);

  return (
    <Modal
      open={isHelpOpen}
      onClose={() => setHelpOpen(false)}
      size="lg"
      title="Klavye Kısayolları ve Kontrol Rehberi"
      description="GyroMaze masaüstü kontrolleri, kamera modları ve mobil eşleştirme rehberi."
      footer={
        <div className="flex w-full items-center justify-between">
          <span className="text-xs text-muted">
            İpucu: Oyun esnasında <kbd className="font-mono text-fg">H</kbd> veya{' '}
            <kbd className="font-mono text-fg">?</kbd> tuşuna basarak bu pencereyi açabilirsiniz.
          </span>
          <Button variant="primary" size="sm" onClick={() => setHelpOpen(false)}>
            Anladım
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Fizik ve Top Yönlendirme */}
        <section className="rounded-2xl border border-line bg-surface p-4">
          <header className="mb-2 flex items-center gap-2 border-b border-line pb-2 font-medium text-fg">
            <Gamepad2 className="h-4 w-4 text-brass" aria-hidden="true" />
            <h3 className="text-sm">Bilye Hareketi ve Fizik</h3>
          </header>
          <div className="divide-y divide-line/40">
            <ShortcutRow
              keys={['W', 'A', 'S', 'D']}
              description="Bilyeyi yönlendir (Sanal eğim)"
            />
            <ShortcutRow
              keys={['↑', '←', '↓', '→']}
              description="Alternatif yön tuşları"
            />
            <ShortcutRow
              keys={['Space']}
              description="Merkezi kalibre et / duraklat"
            />
            <ShortcutRow
              keys={['R']}
              description="Topu başlangıç noktasına sıfırla"
            />
          </div>
        </section>

        {/* Görünüm ve Atmosfer */}
        <section className="rounded-2xl border border-line bg-surface p-4">
          <header className="mb-2 flex items-center gap-2 border-b border-line pb-2 font-medium text-fg">
            <Eye className="h-4 w-4 text-signal" aria-hidden="true" />
            <h3 className="text-sm">Kamera ve Görsel Tema</h3>
          </header>
          <div className="divide-y divide-line/40">
            <ShortcutRow
              keys={['C']}
              description="Kamera modu (İzometrik / Üstten / Takip)"
            />
            <ShortcutRow
              keys={['L']}
              description="Aydınlık / Karanlık renk paleti"
            />
            <ShortcutRow
              keys={['M']}
              description="Ses efektlerini aç / kapat"
            />
            <ShortcutRow
              keys={['Esc']}
              description="Açık menü ve pencereleri kapat"
            />
          </div>
        </section>

        {/* Hızlı Menüler ve Modlar */}
        <section className="rounded-2xl border border-line bg-surface p-4">
          <header className="mb-2 flex items-center gap-2 border-b border-line pb-2 font-medium text-fg">
            <Sliders className="h-4 w-4 text-ok" aria-hidden="true" />
            <h3 className="text-sm">Hızlı Erişim ve Menüler</h3>
          </header>
          <div className="divide-y divide-line/40">
            <ShortcutRow
              keys={['1', '—', '5']}
              description="Standart bölümlere doğrudan geç"
            />
            <ShortcutRow
              keys={['E']}
              description="Harita Editörünü aç (Portal, Lazer, Rampa)"
            />
            <ShortcutRow
              keys={['K']}
              description="Küresel Skor Tablosu"
            />
            <ShortcutRow
              keys={['P']}
              description="Telefon Eşleştirme QR penceresi"
            />
          </div>
        </section>

        {/* Mobil Cihaz İpuçları */}
        <section className="rounded-2xl border border-line bg-surface p-4">
          <header className="mb-2 flex items-center gap-2 border-b border-line pb-2 font-medium text-fg">
            <Smartphone className="h-4 w-4 text-warn" aria-hidden="true" />
            <h3 className="text-sm">Mobil Kontrolcü Özellikleri</h3>
          </header>
          <ul className="space-y-2 text-xs text-muted">
            <li className="flex items-start gap-2">
              <Compass className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brass" aria-hidden="true" />
              <span>
                <strong>Jiroskop:</strong> Telefonunuzu elinizde eğerek labirenti üç boyutta sıfır gecikmeyle kontrol edin.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Keyboard className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal" aria-hidden="true" />
              <span>
                <strong>Dokunmatik Gimbal:</strong> Sensör izni verilmeyen veya HTTP ortamlarında ekrana dokunup sürükleyerek yönlendirin.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 inline-block h-3.5 w-3.5 text-center text-xs font-bold text-ok">2P</span>
              <span>
                <strong>Çok Oyunculu:</strong> İki telefon bağlayarak 1. ve 2. oyuncu bilyeleriyle eşzamanlı yarışın.
              </span>
            </li>
          </ul>
        </section>
      </div>
    </Modal>
  );
}

