'use client';

import { Smartphone, Compass, Keyboard } from 'lucide-react';
import type { MobileGuideFeature } from '@/utils/keyboardShortcuts';

export interface MobileFeaturesSectionProps {
  features: MobileGuideFeature[];
}

/**
 * Mobil kontrolcü jiroskop, dokunmatik gimbal ve çok oyunculu yarış
 * özelliklerini listeleyen bilgi kartı.
 */
export function MobileFeaturesSection({
  features,
}: MobileFeaturesSectionProps) {
  const renderIcon = (feature: MobileGuideFeature) => {
    switch (feature.icon) {
      case 'gyro':
        return (
          <Compass
            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brass"
            aria-hidden="true"
          />
        );
      case 'touch':
        return (
          <Keyboard
            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal"
            aria-hidden="true"
          />
        );
      case 'multiplayer':
      default:
        return (
          <span className="mt-0.5 inline-block h-3.5 w-3.5 text-center text-xs font-bold text-ok">
            {feature.badge ?? '2P'}
          </span>
        );
    }
  };

  return (
    <section className="rounded-2xl border border-line bg-surface p-4">
      <header className="mb-2 flex items-center gap-2 border-b border-line pb-2 font-medium text-fg">
        <Smartphone className="h-4 w-4 text-warn" aria-hidden="true" />
        <h3 className="text-sm">Mobil Kontrolcü Özellikleri</h3>
      </header>
      <ul className="space-y-2 text-xs text-muted">
        {features.map((f) => (
          <li key={f.id} className="flex items-start gap-2">
            {renderIcon(f)}
            <span>
              <strong className="text-fg">{f.title}:</strong> {f.description}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

