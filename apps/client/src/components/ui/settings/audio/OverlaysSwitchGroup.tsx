'use client';

import { SwitchRow } from '../../primitives';
import { getOverlaySwitchConfig } from '@/utils/audioOverlaysUtils';

interface OverlaysSwitchGroupProps {
  showTrail: boolean;
  onSetShowTrail: (show: boolean) => void;
  showGhost: boolean;
  onSetShowGhost: (show: boolean) => void;
  showMiniMap: boolean;
  onSetShowMiniMap: (show: boolean) => void;
  isHapticEnabled: boolean;
  onSetHapticEnabled: (enabled: boolean) => void;
}

/**
 * Ayarlar modalı ekran katmanları (neon iz, hayalet, radar, haptik) açma/kapatma anahtarları listesi.
 */
export function OverlaysSwitchGroup({
  showTrail,
  onSetShowTrail,
  showGhost,
  onSetShowGhost,
  showMiniMap,
  onSetShowMiniMap,
  isHapticEnabled,
  onSetHapticEnabled,
}: OverlaysSwitchGroupProps) {
  const trailCfg = getOverlaySwitchConfig('trail');
  const ghostCfg = getOverlaySwitchConfig('ghost');
  const miniMapCfg = getOverlaySwitchConfig('miniMap');
  const hapticCfg = getOverlaySwitchConfig('haptic');

  return (
    <div className="divide-y divide-line pt-1">
      <SwitchRow
        label={trailCfg?.label ?? 'Neon hareket izi'}
        description={trailCfg?.description ?? 'Bilyenin arkasındaki parlak iz halkaları'}
        checked={showTrail}
        onChange={onSetShowTrail}
      />
      <SwitchRow
        label={ghostCfg?.label ?? '3B hayalet yarışçı'}
        description={ghostCfg?.description ?? 'Bölümdeki en iyi turunun canlı hologramı'}
        checked={showGhost}
        onChange={onSetShowGhost}
      />
      <SwitchRow
        label={miniMapCfg?.label ?? '2B canlı radar'}
        description={miniMapCfg?.description ?? 'Sol alt göstergede üstten harita konumu'}
        checked={showMiniMap}
        onChange={onSetShowMiniMap}
      />
      <SwitchRow
        label={hapticCfg?.label ?? 'Mobil titreşim (Haptik)'}
        description={hapticCfg?.description ?? 'Çarpma, lazer ve portallarda telefon titreşimi'}
        checked={isHapticEnabled}
        onChange={onSetHapticEnabled}
      />
    </div>
  );
}
