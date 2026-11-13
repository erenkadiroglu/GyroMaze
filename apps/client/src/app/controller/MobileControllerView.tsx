'use client';

import { useMobileControllerView } from '@/hooks/useMobileControllerView';
import { ControllerHeader } from './ControllerHeader';
import { ControllerStatusBanners } from './ControllerStatusBanners';
import { ControllerCenterStage } from './ControllerCenterStage';
import { ControllerFooter } from './ControllerFooter';

/**
 * Mobil cihazın HTML5 jiroskop sensörlerini ve dokunmatik (touch) sanal gimbal
 * hareketlerini sıfır DOM reflow ve <10ms WebSocket gecikmesiyle masaüstü 3B
 * sahnesine ileten modüler kontrolcü görünüm orkestratörü.
 */
export function MobileControllerView() {
  const {
    containerProps,
    headerProps,
    bannersProps,
    centerStageProps,
    footerProps,
  } = useMobileControllerView();

  return (
    <main {...containerProps}>
      {/* ÜST DURUM ÇUBUĞU */}
      <ControllerHeader {...headerProps} />

      {/* DURUM, BÖLÜM VE BİLDİRİM ŞERİTLERİ */}
      <ControllerStatusBanners {...bannersProps} />

      {/* ORTA ALAN: ODA KODU / İZİN / CANLI GİMBAL MERKEZ SAHNESİ */}
      <ControllerCenterStage {...centerStageProps} />

      {/* ALT EYLEMLER */}
      <ControllerFooter {...footerProps} />
    </main>
  );
}
