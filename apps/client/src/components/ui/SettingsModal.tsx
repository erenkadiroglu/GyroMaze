'use client';

import { Wrench, Medal } from 'lucide-react';
import {
  BallSkin,
  BoardTheme,
  CameraMode,
  ColorScheme,
  GameMode,
} from '@gyromaze/shared';
import { useGameStore } from '@/store/useGameStore';
import { soundEngine } from '@/utils/soundEngine';
import {
  Drawer,
  SettingsSection,
  FieldLabel,
  Segmented,
  SwitchRow,
  Button,
  handleRadioGroupKeyDown,
} from './primitives';

const BALL_SKIN_SWATCHES: Array<{
  value: BallSkin;
  label: string;
  swatchClass: string;
}> = [
  { value: 'chrome', label: 'Krom', swatchClass: 'bg-zinc-200' },
  { value: 'emerald', label: 'Zümrüt', swatchClass: 'bg-emerald-500' },
  { value: 'plasma', label: 'Plazma', swatchClass: 'bg-purple-500' },
  { value: 'crimson', label: 'Kızıl', swatchClass: 'bg-rose-500' },
];

/**
 * Sağdan açılan birleşik Ayarlar Paneli.
 * Oyun modu, görünüm/kamera/bilye stili, fizik ivmesi, ses ve katman tercihlerini
 * tek bir düzenli yüzeyde toplar.
 */
export function SettingsModal() {
  const isSettingsOpen = useGameStore((s) => s.isSettingsOpen);
  const setSettingsOpen = useGameStore((s) => s.setSettingsOpen);
  const isMultiplayer = useGameStore((s) => s.isMultiplayer);
  const toggleMultiplayer = useGameStore((s) => s.toggleMultiplayer);
  const gameMode = useGameStore((s) => s.gameMode);
  const setGameMode = useGameStore((s) => s.setGameMode);
  const colorScheme = useGameStore((s) => s.colorScheme);
  const setColorScheme = useGameStore((s) => s.setColorScheme);
  const boardTheme = useGameStore((s) => s.boardTheme);
  const setBoardTheme = useGameStore((s) => s.setBoardTheme);
  const cameraMode = useGameStore((s) => s.cameraMode);
  const setCameraMode = useGameStore((s) => s.setCameraMode);
  const ballSkin = useGameStore((s) => s.ballSkin);
  const setBallSkin = useGameStore((s) => s.setBallSkin);
  const gravityScale = useGameStore((s) => s.gravityScale);
  const tiltResponsiveness = useGameStore((s) => s.tiltResponsiveness);
  const soundVolume = useGameStore((s) => s.soundVolume);
  const isSoundMuted = useGameStore((s) => s.isSoundMuted);
  const toggleSoundMuted = useGameStore((s) => s.toggleSoundMuted);
  const showTrail = useGameStore((s) => s.showTrail);
  const showGhost = useGameStore((s) => s.showGhost);
  const showMiniMap = useGameStore((s) => s.showMiniMap);
  const isHapticEnabled = useGameStore((s) => s.isHapticEnabled);
  const updateSettings = useGameStore((s) => s.updateSettings);
  const setEditorOpen = useGameStore((s) => s.setEditorOpen);
  const setLeaderboardOpen = useGameStore((s) => s.setLeaderboardOpen);

  const handleVolumeChange = (nextVol: number) => {
    if (nextVol === 0) {
      if (!isSoundMuted) toggleSoundMuted();
      return;
    }
    soundEngine.setVolume(nextVol);
    updateSettings({ soundVolume: nextVol });
    if (isSoundMuted) toggleSoundMuted();
    soundEngine.playCalibrate();
  };

  const activeVolumeKey = isSoundMuted ? 0 : soundVolume;

  return (
    <Drawer
      open={isSettingsOpen}
      onClose={() => setSettingsOpen(false)}
      title="Ayarlar"
      footer={
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<Wrench className="h-3.5 w-3.5" aria-hidden="true" />}
            onClick={() => {
              setSettingsOpen(false);
              setEditorOpen(true);
            }}
          >
            Harita editörü
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Medal className="h-3.5 w-3.5" aria-hidden="true" />}
            onClick={() => {
              setSettingsOpen(false);
              setLeaderboardOpen(true);
            }}
          >
            Skor tablosu
          </Button>
        </div>
      }
    >
      <SettingsSection title="Oyun modu">
        <div>
          <FieldLabel>Oyuncu sayısı</FieldLabel>
          <Segmented<'solo' | 'duo'>
            label="Oyuncu sayısı"
            value={isMultiplayer ? 'duo' : 'solo'}
            options={[
              { value: 'solo', label: '1 Oyuncu' },
              { value: 'duo', label: '2 Oyuncu (1v1)' },
            ]}
            onChange={(val) => {
              if ((val === 'duo') !== isMultiplayer) toggleMultiplayer();
            }}
          />
          {isMultiplayer && (
            <p className="mt-2 text-xs leading-relaxed text-muted">
              2. oyuncu aynı oda koduna katılıp telefonundan{' '}
              <strong className="text-fg">Oyuncu 2</strong> yuvasını seçebilir ya
              da masaüstünde <strong className="text-fg">Yön Tuşları</strong>{' '}
              ile oynayabilir.
            </p>
          )}
        </div>

        <div>
          <FieldLabel>Süre kuralı</FieldLabel>
          <Segmented<GameMode>
            label="Süre kuralı"
            value={gameMode}
            options={[
              { value: 'standard', label: 'Standart' },
              {
                value: 'time_attack',
                label: 'Süreye karşı',
                hint: 'Bölüm süresi dolmadan kristalleri toplayıp çıkışı bul',
              },
            ]}
            onChange={setGameMode}
          />
        </div>
      </SettingsSection>

      <SettingsSection title="Görünüm ve sahne">
        <div>
          <FieldLabel>Renk şeması</FieldLabel>
          <Segmented<ColorScheme>
            label="Renk şeması"
            value={colorScheme}
            options={[
              { value: 'dark', label: 'Gece' },
              { value: 'light', label: 'Gündüz' },
            ]}
            onChange={setColorScheme}
          />
        </div>

        <div>
          <FieldLabel>3B sahne atmosferi</FieldLabel>
          <Segmented<BoardTheme>
            label="Sahne atmosferi"
            value={boardTheme}
            options={[
              { value: 'emerald', label: 'Zümrüt' },
              { value: 'cyberpunk', label: 'Siberpunk' },
              { value: 'crimson', label: 'Kızıl Kor' },
              { value: 'daylight', label: 'Gün Işığı' },
            ]}
            onChange={setBoardTheme}
          />
        </div>

        <div>
          <FieldLabel>Kamera açısı</FieldLabel>
          <Segmented<CameraMode>
            label="Kamera açısı"
            value={cameraMode}
            options={[
              { value: 'isometric', label: 'İzometrik' },
              { value: 'topdown', label: 'Üstten' },
              { value: 'follow', label: 'Takip' },
            ]}
            onChange={setCameraMode}
          />
        </div>

        <div>
          <FieldLabel>Bilye görünümü</FieldLabel>
          <div
            role="radiogroup"
            aria-label="Bilye görünümü"
            className="grid grid-cols-4 gap-1.5"
          >
            {BALL_SKIN_SWATCHES.map((skin, idx) => {
              const active = ballSkin === skin.value;
              return (
                <button
                  key={skin.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  tabIndex={active ? 0 : -1}
                  onClick={() => setBallSkin(skin.value)}
                  onKeyDown={(e) =>
                    handleRadioGroupKeyDown(
                      e,
                      idx,
                      BALL_SKIN_SWATCHES.length,
                      (nextIdx) =>
                        setBallSkin(BALL_SKIN_SWATCHES[nextIdx].value),
                    )
                  }
                  className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border py-2 text-xs font-medium transition-colors ${
                    active
                      ? 'border-brass bg-surface-2 text-fg'
                      : 'border-line bg-surface-2/40 text-muted hover:text-fg'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`h-4 w-4 rounded-full ring-1 ring-line ${skin.swatchClass}`}
                  />
                  <span>{skin.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Fizik ve kontrol">
        <div>
          <FieldLabel>Bilye ivmesi</FieldLabel>
          <Segmented<number>
            label="Bilye ivmesi"
            value={gravityScale}
            options={[
              { value: 28, label: 'Yavaş' },
              { value: 36, label: 'Standart' },
              { value: 46, label: 'Turbo' },
            ]}
            onChange={(val) => updateSettings({ gravityScale: val })}
          />
        </div>

        <div>
          <FieldLabel>Eğim tepki hızı</FieldLabel>
          <Segmented<number>
            label="Eğim tepki hızı"
            value={tiltResponsiveness}
            options={[
              { value: 18, label: 'Yumuşak' },
              { value: 32, label: 'Standart' },
              { value: 48, label: 'Anında' },
            ]}
            onChange={(val) => updateSettings({ tiltResponsiveness: val })}
          />
        </div>
      </SettingsSection>

      <SettingsSection title="Ses ve ekran katmanları">
        <div>
          <FieldLabel
            value={
              isSoundMuted ? 'Sessiz' : `%${Math.round(soundVolume * 100)}`
            }
          >
            Ses şiddeti
          </FieldLabel>
          <Segmented<number>
            label="Ses şiddeti"
            value={activeVolumeKey}
            options={[
              { value: 0, label: 'Sessiz' },
              { value: 0.25, label: '%25' },
              { value: 0.5, label: '%50' },
              { value: 0.75, label: '%75' },
              { value: 1, label: '%100' },
            ]}
            onChange={handleVolumeChange}
          />
        </div>

        <div className="divide-y divide-line pt-1">
          <SwitchRow
            label="Neon hareket izi"
            description="Bilyenin arkasındaki parlak iz halkaları"
            checked={showTrail}
            onChange={(checked) => updateSettings({ showTrail: checked })}
          />
          <SwitchRow
            label="3B hayalet yarışçı"
            description="Bölümdeki en iyi turunun canlı hologramı"
            checked={showGhost}
            onChange={(checked) => updateSettings({ showGhost: checked })}
          />
          <SwitchRow
            label="2B canlı radar"
            description="Sol alt göstergede üstten harita konumu"
            checked={showMiniMap}
            onChange={(checked) => updateSettings({ showMiniMap: checked })}
          />
          <SwitchRow
            label="Mobil titreşim (Haptik)"
            description="Çarpma, lazer ve portallarda telefon titreşimi"
            checked={isHapticEnabled}
            onChange={(checked) => updateSettings({ isHapticEnabled: checked })}
          />
        </div>
      </SettingsSection>
    </Drawer>
  );
}
