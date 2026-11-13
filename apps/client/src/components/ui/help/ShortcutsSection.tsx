'use client';

import { Gamepad2, Eye, Sliders } from 'lucide-react';
import { cx } from '@/components/ui/primitives';
import {
  resolveShortcutGroupIconColor,
  type ShortcutGuideGroup,
} from '@/utils/keyboardShortcuts';
import { ShortcutRow } from './ShortcutRow';

export interface ShortcutsSectionProps {
  group: ShortcutGuideGroup;
}

/**
 * Belirli bir klavye kısayol kategorisini (Hareket, Kamera, Menüler)
 * listeleyen görsel kart bileşeni.
 */
export function ShortcutsSection({ group }: ShortcutsSectionProps) {
  const iconColor = resolveShortcutGroupIconColor(group.icon);

  const renderIcon = () => {
    switch (group.icon) {
      case 'movement':
        return <Gamepad2 className={cx('h-4 w-4', iconColor)} aria-hidden="true" />;
      case 'camera':
        return <Eye className={cx('h-4 w-4', iconColor)} aria-hidden="true" />;
      case 'menu':
      default:
        return <Sliders className={cx('h-4 w-4', iconColor)} aria-hidden="true" />;
    }
  };

  return (
    <section className="rounded-2xl border border-line bg-surface p-4">
      <header className="mb-2 flex items-center gap-2 border-b border-line pb-2 font-medium text-fg">
        {renderIcon()}
        <h3 className="text-sm">{group.title}</h3>
      </header>
      <div className="divide-y divide-line/40">
        {group.items.map((item) => (
          <ShortcutRow
            key={item.description}
            keys={item.keys}
            description={item.description}
          />
        ))}
      </div>
    </section>
  );
}

